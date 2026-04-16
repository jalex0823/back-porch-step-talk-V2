import { useEffect, useRef } from 'react';

const TWO_PI = Math.PI * 2;

// Recursive fractal branch drawn directly to canvas — re-randomised every frame = continuous crackle
function branch(ctx, x1, y1, angle, length, depth, glowColor, alpha) {
  if (depth === 0 || length < 4) return;

  const jag = (Math.random() - 0.5) * 0.55;
  const x2 = x1 + Math.cos(angle + jag) * length;
  const y2 = y1 + Math.sin(angle + jag) * length;

  // Neon glow layer
  ctx.save();
  ctx.globalAlpha = alpha * 0.55;
  ctx.lineWidth = Math.max(0.5, depth * 0.6);
  ctx.strokeStyle = glowColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 10 + depth * 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();

  // White-hot core
  ctx.save();
  ctx.globalAlpha = alpha * 0.95;
  ctx.lineWidth = Math.max(0.3, depth * 0.28);
  ctx.strokeStyle = depth > 3 ? '#ffffff' : '#cceeff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();

  // Continue trunk
  branch(ctx, x2, y2, angle + (Math.random() - 0.5) * 0.3, length * (0.65 + Math.random() * 0.15), depth - 1, glowColor, alpha * 0.93);

  // Dense side branches
  if (depth >= 2 && Math.random() < 0.78) {
    const a1 = angle + (Math.random() < 0.5 ? 1 : -1) * (0.35 + Math.random() * 0.5);
    branch(ctx, x2, y2, a1, length * (0.45 + Math.random() * 0.2), depth - 1, glowColor, alpha * 0.7);
  }
  if (depth >= 2 && Math.random() < 0.5) {
    const a2 = angle + (Math.random() < 0.5 ? 1 : -1) * (0.55 + Math.random() * 0.45);
    branch(ctx, x2, y2, a2, length * (0.35 + Math.random() * 0.18), depth - 2, glowColor, alpha * 0.55);
  }
  if (depth >= 3 && Math.random() < 0.38) {
    const a3 = angle + (Math.random() < 0.5 ? 1 : -1) * (0.7 + Math.random() * 0.35);
    branch(ctx, x2, y2, a3, length * (0.28 + Math.random() * 0.15), depth - 3, glowColor, alpha * 0.4);
  }
}

// Cubic bezier easing matching framer-motion [0.12, 0.6, 0.08, 1]
function cubicBezier(t, p1x, p1y, p2x, p2y) {
  // Newton-Raphson approximation
  const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
  const cy2 = 3 * p1y, by = 3 * (p2y - p1y) - cy2, ay = 1 - cy2 - by;
  const sampleX = u => ((ax * u + bx) * u + cx) * u;
  const sampleY = u => ((ay * u + by) * u + cy2) * u;
  let u = t;
  for (let i = 0; i < 8; i++) {
    const x = sampleX(u) - t;
    const dx = (3 * ax * u + 2 * bx) * u + cx;
    if (Math.abs(dx) < 1e-6) break;
    u -= x / dx;
  }
  return sampleY(Math.max(0, Math.min(1, u)));
}

export default function LightningBurst({ topics, orbitRadius, active, phase }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const baseAngleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const SIZE = 560;
    const cx = SIZE / 2, cy = SIZE / 2;
    const n = topics.length;
    const SPIN_DURATION = 4500; // ms — matches orbit transition duration
    let frame = 0;

    if (active) {
      startTimeRef.current = performance.now();
    }

    const loop = (now) => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      frame++;

      if (active) {
        // Compute rotation angle matching the orbit CSS easing
        const elapsed = now - (startTimeRef.current || now);
        let rotDeg = 0;
        if (phase === 'spin') {
          const t = Math.min(elapsed / SPIN_DURATION, 1);
          const eased = cubicBezier(t, 0.12, 0.6, 0.08, 1);
          rotDeg = eased * 360;
        } else {
          // shimmer — keep at 360 (end of spin)
          rotDeg = 360;
        }
        const rotRad = (rotDeg * Math.PI) / 180;

        // Clip to orbit circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, orbitRadius - 2, 0, TWO_PI);
        ctx.clip();

        // Origin flare
        const flare = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
        flare.addColorStop(0, 'rgba(255,255,255,0.85)');
        flare.addColorStop(0.15, 'rgba(180,220,255,0.45)');
        flare.addColorStop(0.5, 'rgba(100,150,255,0.1)');
        flare.addColorStop(1, 'transparent');
        ctx.fillStyle = flare;
        ctx.beginPath();
        ctx.arc(cx, cy, 50, 0, TWO_PI);
        ctx.fill();

        // Fire all balls at rotated angles
        for (let i = 0; i < n; i++) {
          const baseAngle = -Math.PI / 2 + (i / n) * TWO_PI;
          const angle = baseAngle + rotRad;
          const len = orbitRadius - 10;
          const depth = (frame + i) % 3 === 0 ? 8 : 7;
          branch(ctx, cx, cy, angle, len, depth, topics[i].glowColor, 0.9);
        }

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, orbitRadius, topics, phase]);

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={560}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 4 }}
    />
  );
}
