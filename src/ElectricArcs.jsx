import { useRef, useEffect } from 'react';

const TWO_PI = Math.PI * 2;

// Recursive fractal branch — builds a tree of thin crackling segments
function drawBranch(ctx, x1, y1, angle, length, depth, alpha, glowColor) {
  if (depth === 0 || length < 3) return;

  // Jag the path
  const jag = (Math.random() - 0.5) * 0.55;
  const x2 = x1 + Math.cos(angle + jag) * length;
  const y2 = y1 + Math.sin(angle + jag) * length;

  // Glow pass
  ctx.save();
  ctx.globalAlpha = alpha * 0.55;
  ctx.lineWidth = Math.max(0.4, depth * 0.55);
  ctx.strokeStyle = glowColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 10 + depth * 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();

  // White core
  ctx.save();
  ctx.globalAlpha = alpha * 0.9;
  ctx.lineWidth = Math.max(0.3, depth * 0.3);
  ctx.strokeStyle = depth > 3 ? '#ffffff' : glowColor;
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();

  // Continue main trunk
  drawBranch(ctx, x2, y2, angle + (Math.random() - 0.5) * 0.3, length * (0.7 + Math.random() * 0.15), depth - 1, alpha * 0.92, glowColor);

  // Spawn side branches randomly
  if (depth >= 2 && Math.random() < 0.55) {
    const branchAngle = angle + (Math.random() < 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.5);
    drawBranch(ctx, x2, y2, branchAngle, length * (0.45 + Math.random() * 0.25), depth - 2, alpha * 0.65, glowColor);
  }
  if (depth >= 3 && Math.random() < 0.3) {
    const branchAngle = angle + (Math.random() < 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.4);
    drawBranch(ctx, x2, y2, branchAngle, length * (0.35 + Math.random() * 0.2), depth - 3, alpha * 0.45, glowColor);
  }
}

// Origin flare at center
function originFlare(ctx, cx, cy, radius, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  g.addColorStop(0,    'rgba(255,255,255,1)');
  g.addColorStop(0.1,  'rgba(200,220,255,0.85)');
  g.addColorStop(0.35, 'rgba(120,160,255,0.3)');
  g.addColorStop(1,    'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TWO_PI);
  ctx.fill();
  ctx.restore();
}

export default function ElectricArcs({ topics, orbitRadius, active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const boltPoolRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const SIZE = 560;
    const cx = SIZE / 2, cy = SIZE / 2;
    const n = topics.length;
    const SPEED = TWO_PI / (5 * 60);
    let angleBase = -Math.PI / 2;
    let lastHalf = Math.floor(angleBase / Math.PI);

    const spawnAllBolts = () => {
      for (let i = 0; i < n; i++) {
        const angle = angleBase + (i / n) * TWO_PI;
        setTimeout(() => {
          boltPoolRef.current.push({
            angle,                        // direction from center
            length: orbitRadius + 48,     // reach into the orb
            glowColor: topics[i].glowColor,
            life: 1.0,
            decay: 0.02 + Math.random() * 0.015,
            seed: Math.random(),          // unique shape per spawn
          });
        }, i * 50);
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      if (active) {
        angleBase += SPEED;
        const currentHalf = Math.floor(angleBase / Math.PI);
        if (currentHalf !== lastHalf) {
          lastHalf = currentHalf;
          spawnAllBolts();
        }
      } else {
        boltPoolRef.current = [];
      }

      boltPoolRef.current = boltPoolRef.current.filter(b => b.life > 0);

      if (boltPoolRef.current.length > 0) {
        const peak = Math.max(...boltPoolRef.current.map(b => b.life));
        originFlare(ctx, cx, cy, 44 + peak * 28, peak * 0.8);
      }

      for (const b of boltPoolRef.current) {
        // Each frame re-randomises the fractal for crackle flicker
        drawBranch(ctx, cx, cy, b.angle, b.length, 7, b.life, b.glowColor);
        b.life -= b.decay;
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
