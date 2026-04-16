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
  return displace(out, roughness * 0.52, depth - 1);
}

// One massive Tesla blast: thick white at origin → neon at tip, drawn with a gradient stroke simulation
function teslaBolt(ctx, cx, cy, tx, ty, glowColor, alpha) {
  const pts = displace([{ x: cx, y: cy }, { x: tx, y: ty }], 36, 7);

  // Layer 1 — massive outer neon aura
  ctx.save();
  ctx.globalAlpha = alpha * 0.45;
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = glowColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 40;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.restore();

  // Layer 2 — mid neon body
  ctx.save();
  ctx.globalAlpha = alpha * 0.7;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = glowColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.restore();

  // Layer 3 — bright white-blue inner core
  ctx.save();
  ctx.globalAlpha = alpha * 0.9;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#cceeff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.restore();

  // Layer 4 — pure white hot filament
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.restore();
}

// Radial white burst at center origin
function originFlare(ctx, cx, cy, radius, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  g.addColorStop(0,   'rgba(255,255,255,1)');
  g.addColorStop(0.08,'rgba(220,240,255,0.9)');
  g.addColorStop(0.25,'rgba(140,200,255,0.4)');
  g.addColorStop(0.6, 'rgba(80,140,255,0.1)');
  g.addColorStop(1,   'transparent');
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
    const BALL_R = 45; // ball radius — bolt reaches into the orb
    const SPEED = TWO_PI / (5 * 60);
    let angleBase = -Math.PI / 2;
    let lastHalf = Math.floor(angleBase / Math.PI);

    const spawnAllBolts = () => {
      for (let i = 0; i < n; i++) {
        const angle = angleBase + (i / n) * TWO_PI;
        // Extend past ball center so tip overlaps into the orb
        const reach = orbitRadius + BALL_R;
        const tx = cx + Math.cos(angle) * reach;
        const ty = cy + Math.sin(angle) * reach;
        setTimeout(() => {
          boltPoolRef.current.push({
            tx, ty,
            glowColor: topics[i].glowColor,
            life: 1.0,
            decay: 0.022 + Math.random() * 0.014,
          });
        }, i * 45);
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
        originFlare(ctx, cx, cy, 55 + peak * 35, peak * 0.9);
      }

      for (const b of boltPoolRef.current) {
        teslaBolt(ctx, cx, cy, b.tx, b.ty, b.glowColor, b.life);
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
