import { useEffect, useRef } from 'react';

const TWO_PI = Math.PI * 2;
const R = () => Math.random();

// Draw one segment — glow + white core
function seg(ctx, x1, y1, x2, y2, color, alpha, width, blur) {
  ctx.save();
  ctx.globalAlpha = Math.min(alpha, 1);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

// Wild chaotic fractal — high roughness, deviates heavily from base angle
function bolt(ctx, x1, y1, angle, length, depth, color, alpha) {
  if (depth === 0 || length < 3) return;

  // Large random deviation — makes it look wild not directed
  const jag = (R() - 0.5) * 1.4;
  const x2 = x1 + Math.cos(angle + jag) * length;
  const y2 = y1 + Math.sin(angle + jag) * length;

  // Outer glow
  seg(ctx, x1, y1, x2, y2, color, alpha * 0.5, Math.max(0.6, depth * 0.7), 12 + depth * 2);
  // White core
  seg(ctx, x1, y1, x2, y2, depth > 2 ? '#ffffff' : '#bbddff', alpha * 0.9, Math.max(0.3, depth * 0.25), 3);

  // Continue with random direction drift
  bolt(ctx, x2, y2, angle + (R() - 0.5) * 0.7, length * (0.6 + R() * 0.2), depth - 1, color, alpha * 0.92);

  // Aggressive branching — multiple splits
  if (depth >= 2 && R() < 0.82) {
    bolt(ctx, x2, y2, angle + (R() < 0.5 ? 1 : -1) * (0.5 + R() * 0.9), length * (0.4 + R() * 0.25), depth - 1, color, alpha * 0.72);
  }
  if (depth >= 2 && R() < 0.55) {
    bolt(ctx, x2, y2, angle + (R() < 0.5 ? 1 : -1) * (0.8 + R() * 0.8), length * (0.3 + R() * 0.2), depth - 2, color, alpha * 0.55);
  }
  if (depth >= 3 && R() < 0.4) {
    bolt(ctx, x2, y2, angle + (R() - 0.5) * TWO_PI, length * (0.25 + R() * 0.15), depth - 3, color, alpha * 0.4);
  }
}

export default function LightningBurst({ topics, orbitRadius, active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const SIZE = 560;
    const cx = SIZE / 2, cy = SIZE / 2;
    const n = topics.length;
    let frame = 0;

    const loop = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      frame++;

      if (active) {
        // Clip to orbit circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, orbitRadius, 0, TWO_PI);
        ctx.clip();

        // Central white corona
        const flare = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
        flare.addColorStop(0,    'rgba(255,255,255,0.9)');
        flare.addColorStop(0.12, 'rgba(200,225,255,0.5)');
        flare.addColorStop(0.4,  'rgba(120,160,255,0.12)');
        flare.addColorStop(1,    'transparent');
        ctx.fillStyle = flare;
        ctx.beginPath();
        ctx.arc(cx, cy, 55, 0, TWO_PI);
        ctx.fill();

        // Sporadic bolts — each frame randomise count, angle, length, opacity, depth
        const ROOTS = 10 + Math.floor(R() * 10); // 10–19 bolts, different every frame
        for (let i = 0; i < ROOTS; i++) {
          // Fully random angle — no even spacing
          const angle = R() * TWO_PI;
          const color = topics[Math.floor(R() * n)].glowColor;
          // Wild length variation — some short stubs, some reach full radius
          const len = orbitRadius * (0.15 + R() * R() * 0.85);
          // Each bolt gets its own random opacity — flicker effect
          const alpha = 0.3 + R() * 0.7;
          // Depth varies 4–8 so some are thin stubs, some are full trees
          const depth = 4 + Math.floor(R() * 5);
          bolt(ctx, cx, cy, angle, len, depth, color, alpha);
        }

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, orbitRadius, topics]);

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
