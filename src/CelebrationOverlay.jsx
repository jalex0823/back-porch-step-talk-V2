import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  {
    headline: 'Sober Soldier of the Day',
    body: 'You showed up — and that takes real courage. Keep coming back. It works if you work it.',
    emoji: '🎖️',
  },
  {
    headline: "Today's Champion",
    body: 'One more day on the right side of the dirt. You rock — keep going, no matter what.',
    emoji: '🏆',
  },
  {
    headline: 'The Rooms Are Better With You In Them',
    body: 'Your presence matters more than you know. Stay connected, stay sober, keep showing up.',
    emoji: '🌟',
  },
  {
    headline: 'Congratulations, Warrior',
    body: 'Another day, another victory. One day at a time — and today, you absolutely nailed it.',
    emoji: '⚡',
  },
  {
    headline: 'Your Higher Power Is Proud',
    body: 'So are we. Every single day you choose recovery is a miracle. Keep going — you rock.',
    emoji: '🙏',
  },
  {
    headline: 'Progress, Not Perfection',
    body: 'You are not just surviving — you are growing. The miracle is already in motion. Stay the course.',
    emoji: '🔥',
  },
];

function Confetti({ count = 60 }) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const dist = 160 + Math.random() * 220;
    const colors = ['#3abf8a', '#3d9ecf', '#e07830', '#e0a030', '#8a6aba', '#5ab56a'];
    return {
      id: i,
      x: Math.cos(angle) * dist + (Math.random() - 0.5) * 80,
      y: Math.sin(angle) * dist + (Math.random() - 0.5) * 80,
      size: 3 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      rotate: Math.random() * 360,
    };
  }), [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            width: p.size, height: p.size,
            left: '50%', top: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}99`,
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.3, rotate: 0 }}
          animate={{
            x: p.x, y: p.y,
            opacity: [0, 1, 1, 0],
            scale: [0.3, 1.4, 1, 0.2],
            rotate: p.rotate,
          }}
          transition={{ duration: 1.8, delay: p.delay, ease: [0.22, 1, 0.36, 1], times: [0, 0.25, 0.7, 1] }}
        />
      ))}
    </div>
  );
}

export default function CelebrationOverlay({ visible, messageIndex }) {
  const msg = MESSAGES[messageIndex % MESSAGES.length];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="celebration-overlay"
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 50 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Confetti burst */}
          <Confetti count={70} />

          {/* Radial background pulse */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(58,191,138,0.12) 0%, rgba(61,158,207,0.08) 40%, transparent 70%)',
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.4, 1.1], opacity: [0, 0.8, 0.4] }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
          />

          {/* Message card */}
          <motion.div
            className="relative flex flex-col items-center text-center px-8 py-7 rounded-2xl"
            style={{
              background: 'rgba(10,16,28,0.88)',
              border: '1px solid rgba(58,191,138,0.45)',
              boxShadow: '0 0 60px rgba(58,191,138,0.25), 0 0 120px rgba(61,158,207,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
              maxWidth: 380,
              zIndex: 1,
            }}
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.15 }}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
              style={{ width: '60%', background: 'linear-gradient(90deg, transparent, #3abf8a, transparent)' }}
            />

            {/* Emoji */}
            <motion.div
              className="text-4xl mb-3"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: [0, 1.4, 1], rotate: [- 20, 10, 0] }}
              transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.3 }}
            >
              {msg.emoji}
            </motion.div>

            {/* Headline */}
            <motion.h2
              className="font-bold tracking-[0.1em] uppercase mb-2"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '0.85rem',
                color: '#3abf8a',
                textShadow: '0 0 20px rgba(58,191,138,0.6)',
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              {msg.headline}
            </motion.h2>

            {/* Divider */}
            <div className="w-12 h-[1px] mb-3" style={{ background: 'rgba(58,191,138,0.3)' }} />

            {/* Body */}
            <motion.p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                color: 'rgba(200,215,230,0.85)',
                lineHeight: '1.65',
                letterSpacing: '0.02em',
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55 }}
            >
              {msg.body}
            </motion.p>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
              style={{ width: '40%', background: 'linear-gradient(90deg, transparent, rgba(61,158,207,0.5), transparent)' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
