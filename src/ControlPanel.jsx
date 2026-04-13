import { motion } from 'framer-motion';
import { Shuffle } from 'lucide-react';

export default function ControlPanel({ onDraw, disabled, phase }) {
  const inProgress = phase !== 'idle' && phase !== 'reveal';

  return (
    <div className="flex flex-col items-center w-full mt-6">
      <motion.button
        onClick={() => { if (!disabled && !inProgress) onDraw(); }}
        disabled={disabled || inProgress}
        className="relative w-full max-w-xs py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-bold tracking-[0.18em] uppercase select-none outline-none disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
        style={{
          fontFamily: "'Orbitron', 'Inter', sans-serif",
          color: inProgress ? 'rgba(255,255,255,0.45)' : '#fff',
          background: inProgress
            ? 'linear-gradient(160deg, rgba(55,60,68,0.95) 0%, rgba(40,45,52,0.98) 60%, rgba(30,33,38,1) 100%)'
            : 'linear-gradient(160deg, #3bc4d6dd 0%, #2ba4b5cc 40%, #1a8090bb 100%)',
          border: inProgress ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(100,220,235,0.35)',
          cursor: inProgress ? 'not-allowed' : 'pointer',
          textShadow: inProgress ? 'none' : '0 0 10px rgba(43,220,235,0.6), 0 1px 3px rgba(0,0,0,0.4)',
          boxShadow: inProgress
            ? '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -2px 6px rgba(0,0,0,0.3)'
            : '0 6px 20px rgba(43,164,181,0.45), 0 2px 6px rgba(0,0,0,0.3), inset 0 -3px 8px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.08)',
          transition: 'all 0.2s ease',
        }}
        whileHover={!inProgress ? { scale: 1.03, boxShadow: '0 8px 28px rgba(43,164,181,0.6), inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.12)' } : {}}
        whileTap={!inProgress ? { scale: 0.97 } : {}}
      >
        {/* Specular highlight */}
        {!inProgress && (
          <span className="pointer-events-none absolute rounded-full"
            style={{
              top: '4%', left: '8%', width: '50%', height: '45%',
              background: 'radial-gradient(ellipse at 40% 60%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 50%, transparent 75%)',
              filter: 'blur(1px)',
            }}
          />
        )}
        {/* Caustic pinpoint */}
        {!inProgress && (
          <span className="pointer-events-none absolute rounded-full"
            style={{
              top: '6%', left: '14%', width: '14%', height: '22%',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%)',
              filter: 'blur(0.5px)',
            }}
          />
        )}
        {/* Bottom reflection */}
        {!inProgress && (
          <span className="pointer-events-none absolute rounded-lg"
            style={{
              bottom: '0%', left: '10%', width: '80%', height: '30%',
              background: 'radial-gradient(ellipse, rgba(43,220,235,0.15) 0%, transparent 70%)',
              filter: 'blur(4px)',
            }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {inProgress ? 'SELECTING...' : <><Shuffle size={16} /> RANDOMIZER</>}
        </span>
      </motion.button>
    </div>
  );
}
