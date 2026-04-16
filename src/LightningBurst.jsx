import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TWO_PI = Math.PI * 2;

// Generate a jagged fractal path string from (x1,y1) toward (x2,y2)
function fractalPath(x1, y1, x2, y2, roughness, depth, rng) {
  if (depth === 0) return [[x1, y1], [x2, y2]];
  const mx = (x1 + x2) / 2 + (rng() - 0.5) * roughness;
  const my = (y1 + y2) / 2 + (rng() - 0.5) * roughness;
  return [
    ...fractalPath(x1, y1, mx, my, roughness * 0.55, depth - 1, rng).slice(0, -1),
    ...fractalPath(mx, my, x2, y2, roughness * 0.55, depth - 1, rng),
  ];
}

function ptsToD(pts) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
}

// Seeded pseudo-random from a number seed
function makeRng(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Build one bolt: main trunk + recursive side branches
function buildBolt(cx, cy, angle, length, depth, rng, glowColor, paths = []) {
  if (depth === 0 || length < 6) return paths;

  const jag = (rng() - 0.5) * 0.5;
  const ex = cx + Math.cos(angle + jag) * length;
  const ey = cy + Math.sin(angle + jag) * length;

  const pts = fractalPath(cx, cy, ex, ey, length * 0.35, 5, rng);
  paths.push({ d: ptsToD(pts), depth, color: glowColor });

  // Main trunk continues
  buildBolt(ex, ey, angle + (rng() - 0.5) * 0.28, length * (0.62 + rng() * 0.18), depth - 1, rng, glowColor, paths);

  // Side branches
  if (depth >= 2 && rng() < 0.75) {
    const ba = angle + (rng() < 0.5 ? 1 : -1) * (0.4 + rng() * 0.5);
    buildBolt(ex, ey, ba, length * (0.42 + rng() * 0.22), depth - 2, rng, glowColor, paths);
  }
  if (depth >= 2 && rng() < 0.45) {
    const ba2 = angle + (rng() < 0.5 ? 1 : -1) * (0.6 + rng() * 0.45);
    buildBolt(ex, ey, ba2, length * (0.32 + rng() * 0.2), depth - 2, rng, glowColor, paths);
  }
  if (depth >= 3 && rng() < 0.4) {
    const ba3 = angle + (rng() < 0.5 ? 1 : -1) * (0.7 + rng() * 0.4);
    buildBolt(ex, ey, ba3, length * (0.25 + rng() * 0.18), depth - 3, rng, glowColor, paths);
  }

  return paths;
}

function BoltSVG({ cx, cy, angle, length, glowColor, filterId }) {
  const rng = makeRng(Math.random() * 99999);
  const paths = buildBolt(cx, cy, angle, length, 8, rng, glowColor);

  return (
    <>
      {paths.map((p, i) => {
        const isCore = p.depth > 3;
        return (
          <g key={i}>
            {/* Outer neon glow */}
            <path
              d={p.d}
              stroke={glowColor}
              strokeWidth={isCore ? 2.5 : 1.2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.6}
              filter={`url(#${filterId})`}
            />
            {/* White-hot core */}
            <path
              d={p.d}
              stroke={isCore ? '#ffffff' : '#ddeeff'}
              strokeWidth={isCore ? 1.0 : 0.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={isCore ? 0.95 : 0.7}
            />
          </g>
        );
      })}
    </>
  );
}

export default function LightningBurst({ topics, orbitRadius, active }) {
  const [bursts, setBursts] = useState([]);
  const angleRef = useRef(-Math.PI / 2);
  const lastHalfRef = useRef(Math.floor(angleRef.current / Math.PI));
  const rafRef = useRef(null);
  const burstIdRef = useRef(0);

  const SIZE = 560;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const SPEED = TWO_PI / (5 * 60);

  useEffect(() => {
    if (!active) {
      setBursts([]);
      return;
    }

    const tick = () => {
      angleRef.current += SPEED;
      const currentHalf = Math.floor(angleRef.current / Math.PI);
      if (currentHalf !== lastHalfRef.current) {
        lastHalfRef.current = currentHalf;
        const id = burstIdRef.current++;
        const snapshot = topics.map((t, i) => ({
          angle: angleRef.current + (i / topics.length) * TWO_PI,
          glowColor: t.glowColor,
          seed: Math.random() * 99999,
          key: `${id}-${i}`,
        }));
        setBursts(snapshot);
        // Auto-clear after 1100ms
        setTimeout(() => setBursts([]), 1100);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, topics]);

  return (
    <AnimatePresence>
      {bursts.length > 0 && (
        <motion.svg
          key={bursts[0]?.key}
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 4 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.08 }}
        >
          <defs>
            {/* Clip to orbit circle so bolts stay inside */}
            <clipPath id="orbit-clip">
              <circle cx={cx} cy={cy} r={orbitRadius - 4} />
            </clipPath>
            {/* Glow filter */}
            <filter id="bolt-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="flare" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="15%"  stopColor="#aaddff" stopOpacity="0.5" />
              <stop offset="50%"  stopColor="#6699ff" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Origin flare */}
          <circle cx={cx} cy={cy} r={52} fill="url(#flare)" />

          <g clipPath="url(#orbit-clip)">
            {bursts.map((b, i) => (
              <motion.g
                key={b.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.06, delay: i * 0.04 }}
              >
                <BoltSVG
                  cx={cx}
                  cy={cy}
                  angle={b.angle}
                  length={orbitRadius - 8}
                  glowColor={b.glowColor}
                  filterId="bolt-glow"
                />
              </motion.g>
            ))}
          </g>
        </motion.svg>
      )}
    </AnimatePresence>
  );
}
