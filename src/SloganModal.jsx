import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';

export default function SloganModal({ slogan, onClose, onNew }) {
  return (
    <AnimatePresence>
      {slogan && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed z-50 flex flex-col items-center"
            style={{
              top: '50%', left: '50%',
              width: 'min(420px, 90vw)',
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          >
            <div
              className="relative w-full rounded-2xl px-8 py-8 flex flex-col items-center gap-5"
              style={{
                background: 'linear-gradient(145deg, rgba(22,28,38,0.97) 0%, rgba(16,20,28,0.99) 100%)',
                border: '1px solid rgba(61,158,207,0.25)',
                boxShadow: '0 0 60px rgba(61,158,207,0.12), 0 20px 40px rgba(0,0,0,0.6)',
              }}
            >
              {/* Glow orb behind text */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
                <div style={{
                  position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
                  width: '80%', height: '80%',
                  background: 'radial-gradient(ellipse, rgba(61,158,207,0.08) 0%, transparent 70%)',
                }} />
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(200,210,220,0.4)', cursor: 'pointer' }}>
                <X size={13} />
              </button>

              {/* Label */}
              <p className="text-[0.55rem] tracking-[0.25em] uppercase"
                style={{ fontFamily: "'Orbitron', sans-serif", color: 'rgba(61,158,207,0.7)' }}>
                AA Slogan
              </p>

              {/* Big quote mark */}
              <span className="pointer-events-none absolute"
                style={{ top: 28, left: 24, fontSize: '4.5rem', lineHeight: 1, color: 'rgba(61,158,207,0.08)', fontFamily: 'Georgia, serif', fontWeight: 700, userSelect: 'none' }}>
                &ldquo;
              </span>

              {/* Slogan text */}
              <motion.p
                key={slogan}
                className="relative text-center text-base sm:text-lg font-medium leading-relaxed px-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(225,230,240,0.92)' }}>
                {slogan}
              </motion.p>

              {/* Another one button */}
              <button
                onClick={onNew}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[0.6rem] tracking-[0.15em] uppercase"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  background: 'rgba(61,158,207,0.12)',
                  border: '1px solid rgba(61,158,207,0.3)',
                  color: 'rgba(61,158,207,0.85)',
                  boxShadow: '0 0 12px rgba(61,158,207,0.1)',
                  cursor: 'pointer',
                }}>
                <RefreshCw size={11} />
                Another one
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
