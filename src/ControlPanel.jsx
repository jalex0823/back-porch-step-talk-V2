import { motion } from 'framer-motion';
import { Shuffle } from 'lucide-react';

export default function ControlPanel({ onDraw, disabled, phase }) {
  const inProgress = phase !== 'idle' && phase !== 'reveal';

  return (
    <div className="flex flex-col items-center w-full mt-6">
      {/* Teal draw button — matches the image's CLOSE button style */}
      <motion.button
        onClick={() => {
          if (!disabled && !inProgress) onDraw();
        }}
        disabled={disabled || inProgress}
        className="w-full max-w-xs py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-bold tracking-[0.18em] uppercase select-none outline-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          fontFamily: "'Orbitron', 'Inter', sans-serif",
          color: inProgress ? 'rgba(255,255,255,0.5)' : '#fff',
          background: inProgress
            ? 'linear-gradient(180deg, rgba(60,65,72,0.8), rgba(50,55,62,0.9))'
            : 'linear-gradient(180deg, #2ba4b5ee, #228a98cc)',
          border: 'none',
          cursor: inProgress ? 'not-allowed' : 'pointer',
          textShadow: '0 1px 3px rgba(0,0,0,0.3)',
          boxShadow: inProgress
            ? '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 4px 15px rgba(43,164,181,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
          transition: 'all 0.2s ease',
        }}
        whileHover={!inProgress ? { scale: 1.03 } : {}}
        whileTap={!inProgress ? { scale: 0.97 } : {}}
      >
        {inProgress ? 'SELECTING...' : <><Shuffle size={16} /> RANDOMIZER</>}
      </motion.button>
    </div>
  );
}
