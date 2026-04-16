import { useRef, useEffect } from 'react';

const TWO_PI = Math.PI * 2;

function displace(pts, roughness, depth) {
  if (depth === 0) return pts;
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    out.push(a, {
      x: (a.x + b.x) / 2 + (Math.random() - 0.5) * roughness,
      y: (a.y + b.y) / 2 + (Math.random() - 0.5) * roughness,
    });
  }
  out.push(pts[pts.length - 1]);
  return displace(out, roughness * 0.55, depth - 1);
}

// Draw a lightning bolt from center outward — white-hot at origin, neon at tip
function bolt(ctx, cx, cy, tx, ty, glowColor, alpha, life) {
  const pts = displace([{ x: cx, y: cy }, { x: tx, y: ty }], 40, 6);

  // Outer wide neon glow
  ctx.save();
  ctx.globalAlpha = Math.min(alpha * 0.5, 0.55);
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = glowColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 28;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.restore();

  // Mid bright neon
  ctx.save();
  ctx.globalAlpha = Math.min(alpha * 0.75, 0.8);
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = glowColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.restore();

  // White-hot core filament
  ctx.save();
  ctx.globalAlpha = Math.min(alpha, 1);
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.restore();

  // Branch tendrils at random mid-points
  if (life > 0.4 && Math.random() < 0.6) {
    const mi = Math.floor(pts.length * (0.4 + Math.random() * 0.3));
    const bx = pts[mi].x + (Math.random() - 0.5) * 55;
    const by = pts[mi].y + (Math.random() - 0.5) * 55;
    const bpts = displace([pts[mi], { x: bx, y: by }], 22, 4);
    ctx.save();
    ctx.globalAlpha = alpha * 0.55;
    ctx.lineWidth = 1.0;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(bpts[0].x, bpts[0].y);
    for (let i = 1; i < bpts.length; i++) ctx.lineTo(bpts[i].x, bpts[i].y);
    ctx.stroke();
    ctx.restore();
  }
}

// Central corona burst — radial gradient from center
function centerBurst(ctx, cx, cy, radius, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.1, 'rgba(200,230,255,0.7)');
  g.addColorStop(0.4, 'rgba(120,160,255,0.2)');
  g.addColorStop(1, 'transparent');
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
        const tx = cx + Math.cos(angle) * orbitRadius;
        const ty = cy + Math.sin(angle) * orbitRadius;
        // Stagger each bolt slightly so they don't all appear same frame
        const delay = i * 55;
        setTimeout(() => {
          // 2–3 strands per ball for thickness
          const strands = 2 + Math.floor(Math.random() * 2);
          for (let s = 0; s < strands; s++) {
            boltPoolRef.current.push({
              tx: tx + (Math.random() - 0.5) * 16,
              ty: ty + (Math.random() - 0.5) * 16,
              glowColor: topics[i].glowColor,
              life: 1.0,
              decay: 0.018 + Math.random() * 0.018,
              retraceTimer: 0,
              retracePeriod: 2 + Math.floor(Math.random() * 2),
            });
          }
        }, delay);
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

      // Center burst glow scales with how many active bolts
      if (boltPoolRef.current.length > 0) {
        const maxLife = Math.max(...boltPoolRef.current.map(b => b.life));
        centerBurst(ctx, cx, cy, 48 + maxLife * 28, maxLife * 0.85);
      }

      for (const b of boltPoolRef.current) {
        b.retraceTimer++;
        if (b.retraceTimer >= b.retracePeriod) b.retraceTimer = 0;
        bolt(ctx, cx, cy, b.tx, b.ty, b.glowColor, b.life, b.life);
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
