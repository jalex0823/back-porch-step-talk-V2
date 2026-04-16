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
  const poolRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const SIZE = 560;
    const cx = SIZE / 2, cy = SIZE / 2;
    const n = topics.length;

    // Spawn a new bolt entry
    const spawnBolt = () => ({
      angle: R() * TWO_PI,
      len: orbitRadius * (0.15 + R() * R() * 0.85),
      color: topics[Math.floor(R() * n)].glowColor,
      depth: 4 + Math.floor(R() * 5),
      // Life: 0→1→0 fade cycle
      life: 0,
      maxLife: 0.6 + R() * 0.8,        // how bright it gets
      fadeIn: 0.018 + R() * 0.022,      // speed of fade in
      fadeOut: 0.010 + R() * 0.016,     // speed of fade out
      phase: 'in',                       // 'in' | 'hold' | 'out'
      holdFrames: 3 + Math.floor(R() * 8), // frames to hold at peak
      holdCount: 0,
      // Slow path drift — retrace slightly each frame
      angleVel: (R() - 0.5) * 0.008,
    });

    // Seed the pool
    if (!active) {
      poolRef.current = [];
    } else if (poolRef.current.length === 0) {
      poolRef.current = Array.from({ length: 14 }, spawnBolt);
      // Stagger starting life so they don't all appear at once
      poolRef.current.forEach((b, i) => { b.life = R() * b.maxLife * 0.5; });
    }

    const TARGET_COUNT = 14;

    const loop = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      if (active) {
        // Maintain pool size — add replacements for dead bolts
        while (poolRef.current.length < TARGET_COUNT) {
          poolRef.current.push(spawnBolt());
        }

        // Clip to orbit circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, orbitRadius, 0, TWO_PI);
        ctx.clip();

        // Central corona — intensity proportional to average life
        const avgLife = poolRef.current.reduce((s, b) => s + b.life, 0) / poolRef.current.length;
        const flare = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
        flare.addColorStop(0,    `rgba(255,255,255,${(avgLife * 0.9).toFixed(2)})`);
        flare.addColorStop(0.12, `rgba(200,225,255,${(avgLife * 0.5).toFixed(2)})`);
        flare.addColorStop(0.4,  `rgba(120,160,255,${(avgLife * 0.12).toFixed(2)})`);
        flare.addColorStop(1,    'transparent');
        ctx.fillStyle = flare;
        ctx.beginPath();
        ctx.arc(cx, cy, 55, 0, TWO_PI);
        ctx.fill();

        // Draw and update each bolt
        poolRef.current = poolRef.current.filter(b => {
          bolt(ctx, cx, cy, b.angle, b.len, b.depth, b.color, b.life);

          // Drift angle slowly for organic wavering
          b.angle += b.angleVel;

          // Lifecycle
          if (b.phase === 'in') {
            b.life = Math.min(b.life + b.fadeIn, b.maxLife);
            if (b.life >= b.maxLife) b.phase = 'hold';
          } else if (b.phase === 'hold') {
            // Tiny flicker at peak — ±5% variation
            b.life = b.maxLife * (0.92 + R() * 0.12);
            b.holdCount++;
            if (b.holdCount >= b.holdFrames) b.phase = 'out';
          } else {
            b.life -= b.fadeOut;
          }

          return b.life > 0;
        });

        ctx.restore();
      } else {
        poolRef.current = [];
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
