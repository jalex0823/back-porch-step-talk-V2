import { useRef, useEffect } from 'react';

const TWO_PI = Math.PI * 2;

function midpointDisplace(pts, roughness, depth) {
  if (depth === 0) return pts;
  const result = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const mx = (a.x + b.x) / 2 + (Math.random() - 0.5) * roughness;
    const my = (a.y + b.y) / 2 + (Math.random() - 0.5) * roughness;
    result.push(a, { x: mx, y: my });
  }
  result.push(pts[pts.length - 1]);
  return midpointDisplace(result, roughness * 0.52, depth - 1);
}

function drawArc(ctx, x1, y1, x2, y2, color, alpha, width) {
  const pts = midpointDisplace([{ x: x1, y: y1 }, { x: x2, y: y2 }], 38, 5);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

export default function ElectricArcs({ topics, orbitRadius, active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const arcPoolRef = useRef([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const SIZE = 560;
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const n = topics.length;
    const halfN = Math.floor(n / 2);
    const SPEED = TWO_PI / (120 * 60);
    let angleBase = -Math.PI / 2;

    const spawnArc = () => {
      const pairIdx = Math.floor(Math.random() * halfN);
      const iA = pairIdx;
      const iB = pairIdx + halfN;
      const baseA = angleBase + (iA / n) * TWO_PI;
      const baseB = angleBase + (iB / n) * TWO_PI;
      const jitter = () => (Math.random() - 0.5) * 14;
      const x1 = cx + Math.cos(baseA) * orbitRadius + jitter();
      const y1 = cy + Math.sin(baseA) * orbitRadius + jitter();
      const x2 = cx + Math.cos(baseB) * orbitRadius + jitter();
      const y2 = cy + Math.sin(baseB) * orbitRadius + jitter();
      const colorA = topics[iA].glowColor;
      const colorB = topics[iB].glowColor;
      arcPoolRef.current.push({
        x1, y1, x2, y2,
        colorA, colorB,
        life: 1.0,
        decay: 0.04 + Math.random() * 0.05,
        branches: Math.random() < 0.4,
      });
    };

    let spawnTimer = 0;
    const SPAWN_INTERVAL = 22;

    const loop = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      frameRef.current++;

      if (active) {
        angleBase += SPEED;
        spawnTimer++;
        if (spawnTimer >= SPAWN_INTERVAL) {
          spawnArc();
          if (Math.random() < 0.35) spawnArc();
          spawnTimer = 0;
        }
      } else {
        arcPoolRef.current = [];
      }

      arcPoolRef.current = arcPoolRef.current.filter(arc => arc.life > 0);

      for (const arc of arcPoolRef.current) {
        const a = arc.life;
        // Core bright arc
        drawArc(ctx, arc.x1, arc.y1, arc.x2, arc.y2, '#ffffff', a * 0.85, 1.2);
        // Colored glow — colorA
        drawArc(ctx, arc.x1, arc.y1, arc.x2, arc.y2, arc.colorA, a * 0.55, 2.5);
        // Colored glow — colorB
        drawArc(ctx, arc.x1, arc.y1, arc.x2, arc.y2, arc.colorB, a * 0.45, 3.5);
        // Branch arc at 25% life
        if (arc.branches && arc.life > 0.5) {
          const bx = arc.x1 + (arc.x2 - arc.x1) * 0.4 + (Math.random() - 0.5) * 40;
          const by = arc.y1 + (arc.y2 - arc.y1) * 0.4 + (Math.random() - 0.5) * 40;
          drawArc(ctx, arc.x1, arc.y1, bx, by, arc.colorA, a * 0.35, 0.8);
        }
        arc.life -= arc.decay;
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
      style={{ zIndex: 3, mixBlendMode: 'screen' }}
    />
  );
}
