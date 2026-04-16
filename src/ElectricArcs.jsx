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

    // Track previous y positions to detect horizontal crossing
    const prevY = new Array(n).fill(null);
    // Cooldown per pair so we don't flood
    const pairCooldown = new Array(halfN).fill(0);

    const spawnBurst = (iA, iB, intensity) => {
      const baseA = angleBase + (iA / n) * TWO_PI;
      const baseB = angleBase + (iB / n) * TWO_PI;
      const jitter = (scale) => (Math.random() - 0.5) * scale;
      const count = intensity > 0.85 ? 4 : intensity > 0.6 ? 2 : 1;
      for (let k = 0; k < count; k++) {
        const x1 = cx + Math.cos(baseA) * orbitRadius + jitter(12);
        const y1 = cy + Math.sin(baseA) * orbitRadius + jitter(12);
        const x2 = cx + Math.cos(baseB) * orbitRadius + jitter(12);
        const y2 = cy + Math.sin(baseB) * orbitRadius + jitter(12);
        arcPoolRef.current.push({
          x1, y1, x2, y2,
          colorA: topics[iA].glowColor,
          colorB: topics[iB].glowColor,
          life: 0.7 + intensity * 0.3,
          decay: 0.025 + Math.random() * 0.03,
          branches: intensity > 0.7 && Math.random() < 0.6,
          intensity,
        });
      }
    };

    const HORIZ_TOLERANCE = 0.18; // radians — ~10 degrees from horizontal

    const loop = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      frameRef.current++;

      if (active) {
        angleBase += SPEED;

        // Check each opposite pair for horizontal alignment
        for (let pairIdx = 0; pairIdx < halfN; pairIdx++) {
          if (pairCooldown[pairIdx] > 0) { pairCooldown[pairIdx]--; continue; }

          const iA = pairIdx;
          const angleA = (angleBase + (iA / n) * TWO_PI) % TWO_PI;
          // Normalize to [-PI, PI]
          const norm = ((angleA + Math.PI) % TWO_PI) - Math.PI;
          // How close to horizontal (0 or ±PI)?
          const distToHoriz = Math.min(Math.abs(norm), Math.abs(Math.abs(norm) - Math.PI));

          if (distToHoriz < HORIZ_TOLERANCE) {
            const intensity = 1 - distToHoriz / HORIZ_TOLERANCE;
            spawnBurst(iA, pairIdx + halfN, intensity);
            // Bigger cooldown when near-perfect alignment to avoid spam
            pairCooldown[pairIdx] = intensity > 0.8 ? 8 : 18;
          }
        }
      } else {
        arcPoolRef.current = [];
      }

      arcPoolRef.current = arcPoolRef.current.filter(arc => arc.life > 0);

      for (const arc of arcPoolRef.current) {
        const a = arc.life;
        const boost = arc.intensity || 1;
        // Core bright arc
        drawArc(ctx, arc.x1, arc.y1, arc.x2, arc.y2, '#ffffff', a * 0.9, 1.2 + boost * 0.6);
        // Colored glow — colorA
        drawArc(ctx, arc.x1, arc.y1, arc.x2, arc.y2, arc.colorA, a * 0.6 * boost, 2.5 + boost * 1.5);
        // Colored glow — colorB
        drawArc(ctx, arc.x1, arc.y1, arc.x2, arc.y2, arc.colorB, a * 0.5 * boost, 3.5 + boost * 2.0);
        // Branch arc on high-intensity hits
        if (arc.branches && arc.life > 0.4) {
          const bx = arc.x1 + (arc.x2 - arc.x1) * 0.4 + (Math.random() - 0.5) * 50;
          const by = arc.y1 + (arc.y2 - arc.y1) * 0.4 + (Math.random() - 0.5) * 50;
          drawArc(ctx, arc.x1, arc.y1, bx, by, arc.colorA, a * 0.45, 0.9);
          drawArc(ctx, arc.x2, arc.y2, bx, by, arc.colorB, a * 0.35, 0.7);
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
      style={{ zIndex: 30, mixBlendMode: 'screen' }}
    />
  );
}
