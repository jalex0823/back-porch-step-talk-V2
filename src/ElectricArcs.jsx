import { useRef, useEffect } from 'react';

const TWO_PI = Math.PI * 2;

// Recursive midpoint displacement — more aggressive roughness for Tesla-coil look
function displace(pts, roughness, depth) {
  if (depth === 0) return pts;
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const mx = (a.x + b.x) / 2 + (Math.random() - 0.5) * roughness;
    const my = (a.y + b.y) / 2 + (Math.random() - 0.5) * roughness;
    out.push(a, { x: mx, y: my });
  }
  out.push(pts[pts.length - 1]);
  return displace(out, roughness * 0.58, depth - 1);
}

// Draw one crackling strand with heavy glow
function strand(ctx, x1, y1, x2, y2, color, alpha, width, blur, roughness = 55) {
  const pts = displace([{ x: x1, y: y1 }, { x: x2, y: y2 }], roughness, 6);
  ctx.save();
  ctx.globalAlpha = Math.min(alpha, 1);
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.restore();
}

// Corona discharge ball at endpoints
function corona(ctx, x, y, color, alpha, radius) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.15, color);
  g.addColorStop(0.5, color.replace(')', ',0.4)').replace('rgb', 'rgba'));
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TWO_PI);
  ctx.fill();
  ctx.restore();
}

export default function ElectricArcs({ topics, orbitRadius, active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const arcPoolRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const SIZE = 560;
    const cx = SIZE / 2, cy = SIZE / 2;
    const n = topics.length;
    const halfN = Math.floor(n / 2);
    const SPEED = TWO_PI / (120 * 60);
    let angleBase = -Math.PI / 2;
    const pairCooldown = new Array(halfN).fill(0);
    let frameCount = 0;

    const spawnBurst = (iA, iB, intensity) => {
      const baseA = angleBase + (iA / n) * TWO_PI;
      const baseB = angleBase + (iB / n) * TWO_PI;
      const jitter = s => (Math.random() - 0.5) * s;
      const strandCount = intensity > 0.85 ? 5 : intensity > 0.6 ? 3 : 2;
      const x1 = cx + Math.cos(baseA) * orbitRadius;
      const y1 = cy + Math.sin(baseA) * orbitRadius;
      const x2 = cx + Math.cos(baseB) * orbitRadius;
      const y2 = cy + Math.sin(baseB) * orbitRadius;
      for (let k = 0; k < strandCount; k++) {
        arcPoolRef.current.push({
          x1: x1 + jitter(14), y1: y1 + jitter(14),
          x2: x2 + jitter(14), y2: y2 + jitter(14),
          colorA: topics[iA].glowColor,
          colorB: topics[iB].glowColor,
          coreColor: k % 2 === 0 ? '#c8aaff' : '#aaeeff',
          life: 1.0,
          decay: 0.015 + Math.random() * 0.02,
          intensity,
          branchDepth: intensity > 0.7 ? 2 : 1,
          retraceTimer: 0,
          retracePeriod: 2 + Math.floor(Math.random() * 3),
        });
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      frameCount++;

      if (active) {
        angleBase += SPEED;
        // Fire arcs between ALL opposite pairs on a rolling stagger — no alignment gate
        for (let p = 0; p < halfN; p++) {
          if (pairCooldown[p] > 0) { pairCooldown[p]--; continue; }
          // Stagger pairs so they don't all fire at once
          if (frameCount % Math.max(1, Math.floor(8 / halfN)) === p % Math.max(1, Math.floor(8 / halfN))) {
            const intensity = 0.6 + Math.random() * 0.4;
            spawnBurst(p, p + halfN, intensity);
            pairCooldown[p] = 10 + Math.floor(Math.random() * 8);
          }
        }
      } else {
        arcPoolRef.current = [];
      }

      arcPoolRef.current = arcPoolRef.current.filter(a => a.life > 0);

      for (const arc of arcPoolRef.current) {
        const a = arc.life;
        const b = arc.intensity;
        arc.retraceTimer++;

        // Re-randomise path each retracePeriod so bolt crackles/flickers
        const jitterScale = arc.retraceTimer >= arc.retracePeriod ? 1 : 0;
        if (jitterScale) arc.retraceTimer = 0;

        // ── Outer fat colored corona glow ──
        strand(ctx, arc.x1, arc.y1, arc.x2, arc.y2, arc.colorB, Math.min(a * 0.7 * b, 0.8), 18 + b * 14, 32, 70);
        strand(ctx, arc.x1, arc.y1, arc.x2, arc.y2, arc.colorA, Math.min(a * 0.65 * b, 0.75), 13 + b * 11, 26, 65);

        // ── Mid violet/cyan glow ──
        strand(ctx, arc.x1, arc.y1, arc.x2, arc.y2, arc.coreColor, Math.min(a * 0.85, 0.9), 6 + b * 4, 18, 52);

        // ── Hot white-blue core ──
        strand(ctx, arc.x1, arc.y1, arc.x2, arc.y2, '#aaddff', Math.min(a * 0.95, 1), 2.5 + b * 1.2, 10, 48);

        // ── Bright white centre filament ──
        strand(ctx, arc.x1, arc.y1, arc.x2, arc.y2, '#ffffff', 1, 1.2, 5, 44);

        // ── Branches / tendrils ──
        if (arc.branchDepth >= 1) {
          const bx = arc.x1 + (arc.x2 - arc.x1) * (0.3 + Math.random() * 0.4) + (Math.random() - 0.5) * 60;
          const by = arc.y1 + (arc.y2 - arc.y1) * (0.3 + Math.random() * 0.4) + (Math.random() - 0.5) * 60;
          strand(ctx, arc.x1, arc.y1, bx, by, arc.coreColor, a * 0.5, 2.5, 12, 55);
          strand(ctx, arc.x1, arc.y1, bx, by, '#ffffff', a * 0.7, 0.7, 3, 40);
          strand(ctx, arc.x2, arc.y2, bx, by, arc.colorA, a * 0.4, 2.0, 10, 50);
          strand(ctx, arc.x2, arc.y2, bx, by, '#ffffff', a * 0.6, 0.6, 3, 35);
        }
        if (arc.branchDepth >= 2 && a > 0.5) {
          const bx2 = arc.x1 + (arc.x2 - arc.x1) * (0.5 + Math.random() * 0.3) + (Math.random() - 0.5) * 80;
          const by2 = arc.y1 + (arc.y2 - arc.y1) * (0.5 + Math.random() * 0.3) + (Math.random() - 0.5) * 80;
          strand(ctx, arc.x1, arc.y1, bx2, by2, '#c8aaff', a * 0.35, 1.5, 10, 60);
          strand(ctx, arc.x2, arc.y2, bx2, by2, '#aaeeff', a * 0.3, 1.2, 8, 45);
        }

        // ── Corona discharge balls at endpoints ──
        const coronaR = 10 + b * 14 * a;
        corona(ctx, arc.x1, arc.y1, arc.colorA, a * 0.75, coronaR);
        corona(ctx, arc.x2, arc.y2, arc.colorB, a * 0.75, coronaR);
        // Pinpoint white hot centre of corona
        corona(ctx, arc.x1, arc.y1, '#ffffff', a * 0.9, 4);
        corona(ctx, arc.x2, arc.y2, '#ffffff', a * 0.9, 4);

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
      style={{ zIndex: 30 }}
    />
  );
}
