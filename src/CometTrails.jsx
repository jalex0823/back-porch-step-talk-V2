import { useRef, useEffect } from 'react';

const TWO_PI = Math.PI * 2;
const TRAIL_LENGTH = 18;
const FADE_STEPS = TRAIL_LENGTH;

export default function CometTrails({ topics, orbitRadius, active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const angleRef = useRef(
    topics.map((_, i) => ((i / topics.length) * TWO_PI) - Math.PI / 2)
  );
  const trailsRef = useRef(topics.map(() => []));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const SIZE = 560;
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const SPEED = (TWO_PI) / (120 * 60); // one full orbit per 120s at 60fps

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      if (!active) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      topics.forEach((topic, i) => {
        const angle = angleRef.current[i];
        const x = cx + Math.cos(angle) * orbitRadius;
        const y = cy + Math.sin(angle) * orbitRadius;

        trailsRef.current[i].push({ x, y });
        if (trailsRef.current[i].length > TRAIL_LENGTH) {
          trailsRef.current[i].shift();
        }

        angleRef.current[i] += SPEED;

        const trail = trailsRef.current[i];
        for (let t = 1; t < trail.length; t++) {
          const alpha = (t / FADE_STEPS) * 0.55;
          const width = (t / FADE_STEPS) * 3.5;
          ctx.beginPath();
          ctx.moveTo(trail[t - 1].x, trail[t - 1].y);
          ctx.lineTo(trail[t].x, trail[t].y);
          ctx.strokeStyle = `${topic.glowColor}`;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = width;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, orbitRadius, topics]);

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={560}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1, opacity: 0.65, mixBlendMode: 'screen' }}
    />
  );
}
