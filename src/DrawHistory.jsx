import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DrawHistory({ history }) {
  const [open, setOpen] = useState(false);

  if (history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute',
        bottom: 18,
        right: 18,
        zIndex: 30,
        fontFamily: "'Orbitron', monospace",
      }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 12px',
          background: open ? 'rgba(61,158,207,0.14)' : 'rgba(10,16,28,0.85)',
          border: `1px solid ${open ? 'rgba(61,158,207,0.5)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 20,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.25s ease',
        }}
      >
        <span style={{ fontSize: '0.42rem', letterSpacing: '0.18em', color: open ? 'rgba(61,158,207,0.95)' : 'rgba(180,195,215,0.55)' }}>
          ◈ SESSION LOG
        </span>
        <span style={{ fontSize: '0.55rem', color: 'rgba(61,158,207,0.7)', fontWeight: 700 }}>
          {history.length}
        </span>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              bottom: 36,
              right: 0,
              width: 240,
              background: 'linear-gradient(160deg, rgba(6,14,26,0.97) 0%, rgba(4,10,20,0.99) 100%)',
              border: '1px solid rgba(61,158,207,0.25)',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 0 24px rgba(61,158,207,0.08), 0 8px 32px rgba(0,0,0,0.7)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '6px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(61,158,207,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.42rem', letterSpacing: '0.2em', color: 'rgba(61,158,207,0.7)' }}>
                SESSION LOG
              </span>
              <span style={{ fontSize: '0.38rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>
                LAST {history.length}
              </span>
            </div>

            {/* Entries */}
            <div style={{ padding: '6px 0' }}>
              {[...history].reverse().map((entry, i) => (
                <motion.div
                  key={entry.drawNum}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18, delay: i * 0.04 }}
                  style={{
                    padding: '5px 12px',
                    borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  {/* Draw number badge */}
                  <span style={{
                    fontSize: '0.38rem',
                    letterSpacing: '0.1em',
                    color: 'rgba(61,158,207,0.5)',
                    background: 'rgba(61,158,207,0.08)',
                    border: '1px solid rgba(61,158,207,0.2)',
                    borderRadius: 4,
                    padding: '1px 4px',
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    #{entry.drawNum}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Topic */}
                    <div style={{
                      fontSize: '0.44rem',
                      letterSpacing: '0.12em',
                      color: entry.accentColor || 'rgba(200,215,230,0.85)',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {entry.topicLabel}
                    </div>
                    {/* Card title */}
                    {entry.cardTitle && (
                      <div style={{
                        fontSize: '0.38rem',
                        letterSpacing: '0.06em',
                        color: 'rgba(160,175,195,0.5)',
                        marginTop: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {entry.cardTitle}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer scanline */}
            <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(61,158,207,0.3), transparent)' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
