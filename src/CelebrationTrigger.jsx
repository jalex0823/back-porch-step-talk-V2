import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOOLTIP_LINES = [
  'Sober Soldier',
  'Drop a Blessing',
  'Trigger Celebration',
  'Award the Moment',
  'Spark Some Joy',
];

export default function CelebrationTrigger({ onTrigger, phase }) {
  const [hovered, setHovered] = useState(false);
  const [fired, setFired] = useState(false);
  const [tooltipIdx] = useState(() => Math.floor(Math.random() * TOOLTIP_LINES.length));
  const [pulseKey, setPulseKey] = useState(0);
  const idleRef = useRef(null);

  const canFire = phase === 'idle' || phase === 'card';

  // Idle ambient pulse every ~6s
  useEffect(() => {
    idleRef.current = setInterval(() => {
      setPulseKey(k => k + 1);
    }, 6000);
    return () => clearInterval(idleRef.current);
  }, []);

  const handleClick = () => {
    if (!canFire || fired) return;
    setFired(true);
    onTrigger();
    setTimeout(() => setFired(false), 800);
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: canFire ? 1 : 0.3, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: canFire ? 'auto' : 'none' }}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            className="absolute -top-9 whitespace-nowrap px-3 py-1 rounded-full text-[0.5rem] tracking-[0.12em] uppercase pointer-events-none"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              background: 'rgba(10,16,28,0.92)',
              border: '1px solid rgba(58,191,138,0.4)',
              color: '#3abf8a',
              boxShadow: '0 0 12px rgba(58,191,138,0.2)',
            }}
          >
            {TOOLTIP_LINES[tooltipIdx]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center justify-center rounded-full cursor-pointer"
        style={{
          width: 54,
          height: 54,
          background: fired
            ? 'radial-gradient(circle, rgba(58,191,138,0.35) 0%, rgba(10,16,28,0.9) 70%)'
            : 'radial-gradient(circle, rgba(58,191,138,0.12) 0%, rgba(10,16,28,0.85) 70%)',
          border: `1.5px solid ${fired ? 'rgba(58,191,138,0.8)' : 'rgba(58,191,138,0.35)'}`,
          boxShadow: hovered || fired
            ? '0 0 24px rgba(58,191,138,0.4), inset 0 0 12px rgba(58,191,138,0.1)'
            : '0 0 10px rgba(58,191,138,0.15)',
          transition: 'background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
      >
        {/* Ambient idle pulse ring */}
        <motion.div
          key={pulseKey}
          className="absolute inset-0 rounded-full pointer-events-none"
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 2.2 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          style={{ border: '1px solid rgba(58,191,138,0.4)' }}
        />

        {/* Fired burst ring */}
        <AnimatePresence>
          {fired && (
            <motion.div
              key="burst"
              className="absolute inset-0 rounded-full pointer-events-none"
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 2.8 }}
              exit={{}}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ border: '2px solid rgba(58,191,138,0.7)' }}
            />
          )}
        </AnimatePresence>

        {/* Icon — medal / star */}
        <motion.svg
          width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round"
          animate={{ rotate: fired ? [0, -15, 15, -10, 0] : 0 }}
          transition={{ duration: 0.5 }}
          style={{ color: fired ? '#3abf8a' : hovered ? '#5ad4a4' : '#3abf8a99', filter: fired ? 'drop-shadow(0 0 6px #3abf8a)' : 'none' }}
        >
          {/* Medal ribbon top */}
          <path d="M12 2l1.5 4.5H18l-3.75 2.75 1.5 4.5L12 11l-3.75 2.75 1.5-4.5L6 6.5h4.5z" />
          {/* Medal circle */}
          <circle cx="12" cy="17" r="4" />
          <path d="M10 15.5l.8 1.5 1.7.3-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.3z" fill="currentColor" strokeWidth="0" />
        </motion.svg>
      </motion.button>

      {/* Label */}
      <motion.span
        className="text-center leading-tight"
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '0.38rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: hovered ? 'rgba(58,191,138,0.9)' : 'rgba(58,191,138,0.45)',
          transition: 'color 0.3s ease',
          maxWidth: 60,
        }}
      >
        Sober<br />Soldier
      </motion.span>
    </motion.div>
  );
}
