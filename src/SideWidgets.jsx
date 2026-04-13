import { motion } from 'framer-motion';

/* ── Compact vertical rail with traveling pulse + nodes ── */
function VerticalRail({ color, delay = 0 }) {
  return (
    <div className="flex flex-col items-center gap-[3px]" style={{ width: 10 }}>
      {/* Top dot */}
      <motion.div className="rounded-full"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay }}
        style={{ width: 3, height: 3, background: color }}
      />
      {/* Line segment with pulse */}
      <div className="relative" style={{ width: 1.5, height: 60 }}>
        <div className="absolute inset-0 rounded-full" style={{ background: color, opacity: 0.12 }} />
        <motion.div className="absolute rounded-full"
          animate={{ top: ['0%', '85%'], opacity: [0, 0.9, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: delay + 0.2 }}
          style={{ left: 0, width: 1.5, height: '22%', background: `linear-gradient(180deg, transparent, ${color}, transparent)` }}
        />
      </div>
      {/* Node */}
      <motion.div className="rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.5 }}
        style={{ width: 4, height: 4, background: color, boxShadow: `0 0 6px ${color}` }}
      />
      {/* Second line */}
      <div className="relative" style={{ width: 1.5, height: 40 }}>
        <div className="absolute inset-0 rounded-full" style={{ background: color, opacity: 0.08 }} />
        <motion.div className="absolute rounded-full"
          animate={{ top: ['85%', '0%'], opacity: [0, 0.8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear', delay: delay + 1 }}
          style={{ left: 0, width: 1.5, height: '28%', background: `linear-gradient(180deg, transparent, ${color}, transparent)` }}
        />
      </div>
      {/* Tick marks */}
      {[5, 3, 2].map((w, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.15, 0.45, 0.15] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: delay + i * 0.3 }}
          style={{ width: w, height: 1, background: color, borderRadius: 1 }}
        />
      ))}
      {/* Bottom line */}
      <div style={{ width: 1.5, height: 30, background: color, opacity: 0.06, borderRadius: 1 }} />
      {/* Bottom dot */}
      <motion.div className="rounded-full"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: delay + 1.5 }}
        style={{ width: 2, height: 2, background: color }}
      />
    </div>
  );
}

/* ── Mini rotating arc ── */
function MiniArc({ color, delay = 0 }) {
  return (
    <motion.div
      style={{ width: 14, height: 14 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 6, repeat: Infinity, ease: 'linear', delay }}
    >
      <svg viewBox="0 0 14 14" fill="none" style={{ width: '100%', height: '100%' }}>
        <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="0.7" opacity="0.25" />
        <path d="M 7 1.5 A 5.5 5.5 0 0 1 12.5 7" stroke={color} strokeWidth="1" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

/* ── Mini bar chart ── */
function MiniBars({ color, delay = 0 }) {
  return (
    <div className="flex items-end gap-[1px]" style={{ height: 12 }}>
      {[0.4, 0.8, 0.5, 0.9, 0.6].map((h, i) => (
        <motion.div key={i}
          animate={{ height: [`${h * 100}%`, `${(1 - h) * 70 + 30}%`, `${h * 100}%`] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: delay + i * 0.15 }}
          style={{ width: 1.5, background: color, borderRadius: 0.5, minHeight: 1.5 }}
        />
      ))}
    </div>
  );
}

export default function SideWidgets() {
  return (
    <>
      {/* Left rail — inside card, left edge */}
      <div className="absolute left-[6px] top-[16px] bottom-[16px] z-[15] pointer-events-none flex flex-col items-center justify-between py-2">
        <MiniArc color="rgba(61,158,207,0.45)" delay={0} />
        <VerticalRail color="rgba(61,158,207,0.4)" delay={0} />
        <MiniBars color="rgba(61,158,207,0.45)" delay={0.5} />
      </div>

      {/* Right rail — inside card, right edge */}
      <div className="absolute right-[6px] top-[16px] bottom-[16px] z-[15] pointer-events-none flex flex-col items-center justify-between py-2">
        <MiniBars color="rgba(180,150,100,0.45)" delay={0.8} />
        <VerticalRail color="rgba(180,150,100,0.4)" delay={1} />
        <MiniArc color="rgba(180,150,100,0.45)" delay={2} />
      </div>
    </>
  );
}
