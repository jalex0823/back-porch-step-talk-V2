import { motion } from 'framer-motion';
import { BookOpen, Sunrise, MessageCircle, Feather, Shuffle, BookMarked, CheckCircle2, Home } from 'lucide-react';

const AAIcon = ({ size = 24, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M3 18L7 6h1l4 12" /><line x1="4.5" y1="14" x2="10.5" y2="14" />
    <path d="M12 18L16 6h1l4 12" /><line x1="13.5" y1="14" x2="19.5" y2="14" />
  </svg>
);

const ICON_MAP = { BookOpen, Sunrise, MessageCircle, Feather, Shuffle, AAIcon };

const stagger = (delay) => ({
  initial: { opacity: 0, x: -18 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }, // BackEase-like overshoot
});

export default function TopicCard({ topic, onDrawAgain, onHome, sessionNumber }) {
  const {
    label, icon, color, accentColor, buttonColor, shadowColor, glowColor,
    cardTitle, cardSubtitle, summary, keyPoints, quote, tags, discussionQuestions,
    readings, actionItems,
  } = topic;
  const Icon = ICON_MAP[icon];

  return (
    <div className="relative w-full">
      {/* Square HUD data-matrix widget — right side blank space */}
      <motion.div
        className="absolute pointer-events-none hidden sm:block"
        style={{ right: 80, top: 380, width: 180, height: 180 }}
        initial={{ opacity: 0, scale: 0.7, rotate: -5 }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.03, 0.95], rotate: 0 }}
        transition={{
          opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
          scale: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
          rotate: { duration: 0.9, delay: 0.8, ease: [0.34, 1.56, 0.64, 1] },
        }}
      >
        <svg viewBox="0 0 180 180" fill="none" style={{ width: '100%', height: '100%' }}>
          {/* Outer square frame — color cycling */}
          <motion.rect x="4" y="4" width="172" height="172" rx="3" strokeWidth="0.6" opacity="0.3" strokeDasharray="6 4"
            animate={{ stroke: [glowColor, accentColor, '#3d9ecf', glowColor] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Inner square */}
          <motion.rect x="20" y="20" width="140" height="140" rx="2" strokeWidth="0.4" opacity="0.2"
            animate={{ stroke: [accentColor, glowColor, '#5ab56a', accentColor] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Grid lines — vertical */}
          {[50, 90, 130].map(x => (
            <line key={`v${x}`} x1={x} y1="20" x2={x} y2="160" stroke={glowColor} strokeWidth="0.3" opacity="0.1" />
          ))}
          {/* Grid lines — horizontal */}
          {[50, 90, 130].map(y => (
            <line key={`h${y}`} x1="20" y1={y} x2="160" y2={y} stroke={glowColor} strokeWidth="0.3" opacity="0.1" />
          ))}
          {/* Corner brackets — rotating + color shifting */}
          <motion.g style={{ transformOrigin: '90px 90px' }}
            animate={{ rotate: 90 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}>
            <motion.path d="M 12 28 L 12 12 L 28 12" strokeWidth="1" strokeLinecap="round" opacity="0.5"
              animate={{ stroke: [glowColor, '#c08030', accentColor, glowColor] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.path d="M 152 12 L 168 12 L 168 28" strokeWidth="1" strokeLinecap="round" opacity="0.5"
              animate={{ stroke: [accentColor, glowColor, '#6a4a9a', accentColor] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} />
            <motion.path d="M 168 152 L 168 168 L 152 168" strokeWidth="1" strokeLinecap="round" opacity="0.5"
              animate={{ stroke: [glowColor, '#5ab56a', accentColor, glowColor] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
            <motion.path d="M 28 168 L 12 168 L 12 152" strokeWidth="1" strokeLinecap="round" opacity="0.5"
              animate={{ stroke: ['#3d9ecf', glowColor, '#c08030', '#3d9ecf'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 4.5 }} />
          </motion.g>
          {/* Scanning horizontal line */}
          <motion.line
            x1="22" x2="158" strokeWidth="0.8" strokeLinecap="round" opacity="0.35"
            animate={{ y1: [22, 158, 22], y2: [22, 158, 22], stroke: [glowColor, '#3d9ecf', '#c08030', '#5ab56a', glowColor] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Pulsing grid nodes */}
          {[50, 90, 130].flatMap(x =>
            [50, 90, 130].map(y => (
              <motion.circle key={`n${x}${y}`} cx={x} cy={y} r="1.5"
                animate={{ opacity: [0.1, 0.55, 0.1], r: [1.5, 2.5, 1.5], fill: [glowColor, accentColor, '#3d9ecf', glowColor] }}
                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 2 }}
              />
            ))
          )}
          {/* Center crosshair */}
          <motion.line x1="85" y1="90" x2="95" y2="90" strokeWidth="0.5" opacity="0.3"
            animate={{ stroke: [glowColor, accentColor, glowColor] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.line x1="90" y1="85" x2="90" y2="95" strokeWidth="0.5" opacity="0.3"
            animate={{ stroke: [accentColor, glowColor, accentColor] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
          {/* Data readout lines — bottom */}
          {[0, 1, 2, 3, 4].map(i => (
            <motion.rect key={`d${i}`} x={30 + i * 26} y="164" rx="0.5"
              animate={{ width: [8, 14 + Math.random() * 8, 8], opacity: [0.15, 0.4, 0.15], fill: [glowColor, accentColor, '#3d9ecf', glowColor] }}
              transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
              style={{ height: 2 }}
            />
          ))}
        </svg>
      </motion.div>

    {/* Scroll hint chevron at bottom */}
    <motion.div className="absolute bottom-[56px] left-1/2 -translate-x-1/2 pointer-events-none z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: [0, 3, 0] }}
      transition={{ opacity: { delay: 1.5, duration: 0.5 }, y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } }}
    >
      <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
        <path d="M2 2 L10 8 L18 2" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    </motion.div>

    <div className="flex flex-col w-full max-h-[70vh] overflow-y-auto pr-1"
      style={{ scrollbarWidth: 'thin', scrollbarColor: `${accentColor}44 transparent` }}>

      {/* Header row: compass widget with ball + title */}
      <div className="flex items-center gap-6 mb-2">
        {/* Compass widget with spinning ball centered */}
        <motion.div
          className="flex-shrink-0 relative"
          style={{ width: 120, height: 120 }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <svg viewBox="0 0 120 120" fill="none" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
            <motion.circle cx="60" cy="60" r="57" stroke={glowColor} strokeWidth="1" opacity="0.55"
              strokeDasharray="6 3" />
            <motion.circle cx="60" cy="60" r="46" stroke={glowColor} strokeWidth="1" opacity="0.5"
              strokeDasharray="3 5" />
            <circle cx="60" cy="60" r="35" stroke={glowColor} strokeWidth="0.8" opacity="0.4" />
            <motion.g style={{ transformOrigin: '60px 60px' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}>
              <path d="M 60 3 A 57 57 0 0 1 117 60" stroke={glowColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
            </motion.g>
            <motion.g style={{ transformOrigin: '60px 60px' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
              <path d="M 60 14 A 46 46 0 0 1 106 60" stroke={glowColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            </motion.g>
            <line x1="60" y1="22" x2="60" y2="32" stroke={glowColor} strokeWidth="0.8" opacity="0.5" />
            <line x1="60" y1="88" x2="60" y2="98" stroke={glowColor} strokeWidth="0.8" opacity="0.5" />
            <line x1="22" y1="60" x2="32" y2="60" stroke={glowColor} strokeWidth="0.8" opacity="0.5" />
            <line x1="88" y1="60" x2="98" y2="60" stroke={glowColor} strokeWidth="0.8" opacity="0.5" />
            {[0, 90, 180, 270].map(deg => (
              <motion.line key={deg}
                x1="60" y1="5" x2="60" y2="10"
                stroke={glowColor} strokeWidth="1" opacity="0.55"
                style={{ transformOrigin: '60px 60px', transform: `rotate(${deg}deg)` }}
              />
            ))}
          </svg>
          {/* Glass orb ball — centered */}
          <motion.div
            className="absolute"
            style={{
              width: 76, height: 76,
              top: '50%', left: '50%',
              marginTop: -38, marginLeft: -38,
              perspective: '200px',
            }}
            animate={{ scale: [1, 1.07, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-full" style={{
              boxShadow: `0 0 18px 5px ${shadowColor}99`,
            }} />
            {/* Base body */}
            <div className="absolute inset-0 rounded-full" style={{
              background: `radial-gradient(circle at 42% 35%,
                ${glowColor}55 0%,
                ${color}99 20%,
                ${color}dd 52%,
                ${color}bb 75%,
                rgba(0,0,0,0.4) 100%)`,
              boxShadow: `0 6px 20px rgba(0,0,0,0.65), inset 0 2px 5px rgba(255,255,255,0.08), inset 0 -4px 10px rgba(0,0,0,0.55), inset 0 0 18px 5px ${shadowColor}`,
              border: `1px solid ${glowColor}55`,
            }} />
            {/* Glass refraction */}
            <div className="absolute inset-0 rounded-full" style={{
              background: `radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.14) 0%, transparent 55%),
                           radial-gradient(ellipse at 70% 75%, ${glowColor}22 0%, transparent 50%)`,
            }} />
            {/* Primary specular */}
            <div className="absolute rounded-full" style={{
              top: '7%', left: '12%', width: '44%', height: '28%',
              background: 'radial-gradient(ellipse at 40% 55%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.18) 40%, transparent 70%)',
              filter: 'blur(1px)',
            }} />
            {/* Caustic pinpoint */}
            <div className="absolute rounded-full" style={{
              top: '10%', left: '20%', width: '16%', height: '11%',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.85) 0%, transparent 70%)',
              filter: 'blur(0.5px)',
            }} />
            {/* Bottom underside glow */}
            <div className="absolute rounded-full" style={{
              bottom: '8%', left: '20%', width: '60%', height: '16%',
              background: `radial-gradient(ellipse, ${glowColor}33 0%, transparent 70%)`,
              filter: 'blur(3px)',
            }} />
            {/* Rim refraction */}
            <div className="absolute inset-0 rounded-full" style={{
              boxShadow: `inset 0 0 0 1.5px rgba(255,255,255,0.13), inset 0 -2px 4px rgba(255,255,255,0.06)`,
            }} />
            {/* Icon + Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              {Icon && <Icon size={18} strokeWidth={1.6} style={{ color: '#fff', filter: `drop-shadow(0 0 5px ${glowColor})` }} />}
              <span className="text-center font-bold tracking-wide leading-tight px-0.5"
                style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.42rem', color: '#fff',
                  textShadow: `0 0 6px ${glowColor}, 0 1px 2px rgba(0,0,0,0.5)` }}>
                {label}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Title block */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="flex gap-[3px]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[2.5px] h-4 rounded-sm"
                  style={{ background: accentColor, opacity: 0.6, transform: 'rotate(-12deg)' }} />
              ))}
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-[0.1em] uppercase"
              style={{ fontFamily: "'Orbitron', sans-serif", color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
              {cardTitle}
            </h2>
            <div className="flex gap-[3px]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[2.5px] h-4 rounded-sm"
                  style={{ background: accentColor, opacity: 0.6, transform: 'rotate(-12deg)' }} />
              ))}
            </div>
          </div>
          <p className="text-[0.6rem] tracking-[0.15em] uppercase mt-0.5"
            style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(200, 210, 220, 0.55)' }}>
            {cardSubtitle}
          </p>
        </div>
      </div>

      {/* Animated line sweep divider */}
      <div className="w-full h-px mb-3 line-sweep"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}55, transparent)` }} />

      {/* Summary */}
      <motion.div className="mb-3" {...stagger(0.1)}>
        <p className="text-[0.6rem] tracking-[0.15em] uppercase mb-1"
          style={{ color: accentColor, fontFamily: "'Orbitron', sans-serif", opacity: 0.7 }}>
          Summary
        </p>
        <p className="text-xs sm:text-sm leading-relaxed"
          style={{ color: 'rgba(220, 225, 235, 0.85)', fontFamily: "'Inter', sans-serif" }}>
          {summary}
        </p>
      </motion.div>

      {/* Quote block */}
      <motion.div className="mb-3 px-3 py-2 rounded-lg" {...stagger(0.25)}
        style={{
          background: `linear-gradient(135deg, ${accentColor}12, ${accentColor}08)`,
          borderLeft: `2px solid ${accentColor}66`,
        }}>
        <p className="text-xs italic leading-snug"
          style={{ color: 'rgba(210, 215, 230, 0.75)', fontFamily: "'Inter', sans-serif" }}>
          {quote}
        </p>
      </motion.div>

      {/* Key Points */}
      <motion.div className="mb-3" {...stagger(0.4)}>
        <p className="text-[0.6rem] tracking-[0.15em] uppercase mb-1.5"
          style={{ color: accentColor, fontFamily: "'Orbitron', sans-serif", opacity: 0.7 }}>
          Key Points
        </p>
        <ul className="space-y-1">
          {keyPoints.map((point, i) => (
            <motion.li key={i} className="flex gap-2 items-start"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.45 + i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}>
              <span className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: accentColor, opacity: 0.5 }} />
              <span className="text-xs leading-snug"
                style={{ color: 'rgba(210, 215, 225, 0.8)', fontFamily: "'Inter', sans-serif" }}>
                {point}
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Discussion Questions */}
      <motion.div className="mb-3" {...stagger(0.65)}>
        <p className="text-[0.6rem] tracking-[0.15em] uppercase mb-1.5"
          style={{ color: accentColor, fontFamily: "'Orbitron', sans-serif", opacity: 0.7 }}>
          Discussion Questions
        </p>
        <ol className="space-y-1.5 list-none">
          {discussionQuestions.map((q, i) => (
            <motion.li key={i} className="flex gap-2 items-start"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.7 + i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}>
              <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[0.5rem] font-bold"
                style={{ background: `${accentColor}22`, color: accentColor, fontFamily: "'Orbitron', sans-serif" }}>
                {i + 1}
              </span>
              <span className="text-xs leading-snug"
                style={{ color: 'rgba(210, 215, 225, 0.75)', fontFamily: "'Inter', sans-serif" }}>
                {q}
              </span>
            </motion.li>
          ))}
        </ol>
      </motion.div>

      {/* Suggested Readings */}
      {readings && readings.length > 0 && (
        <motion.div className="mb-3" {...stagger(0.85)}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <BookMarked size={12} style={{ color: accentColor, opacity: 0.7 }} />
            <p className="text-[0.6rem] tracking-[0.15em] uppercase"
              style={{ color: accentColor, fontFamily: "'Orbitron', sans-serif", opacity: 0.7 }}>
              Suggested Readings
            </p>
          </div>
          <ul className="space-y-1">
            {readings.map((r, i) => (
              <motion.li key={i} className="flex gap-2 items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.9 + i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}>
                <span className="mt-[5px] w-1 h-1 rounded-full flex-shrink-0"
                  style={{ background: accentColor, opacity: 0.4 }} />
                <span className="text-xs leading-snug"
                  style={{ color: 'rgba(210, 215, 225, 0.7)', fontFamily: "'Inter', sans-serif" }}>
                  {r}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Action Items */}
      {actionItems && actionItems.length > 0 && (
        <motion.div className="mb-3" {...stagger(1.05)}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 size={12} style={{ color: accentColor, opacity: 0.7 }} />
            <p className="text-[0.6rem] tracking-[0.15em] uppercase"
              style={{ color: accentColor, fontFamily: "'Orbitron', sans-serif", opacity: 0.7 }}>
              Action Items
            </p>
          </div>
          <ul className="space-y-1">
            {actionItems.map((item, i) => (
              <motion.li key={i} className="flex gap-2 items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 1.1 + i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}>
                <span className="flex-shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center"
                  style={{ borderColor: `${accentColor}44` }}>
                  <span className="w-1.5 h-1.5 rounded-sm" style={{ background: `${accentColor}33` }} />
                </span>
                <span className="text-xs leading-snug"
                  style={{ color: 'rgba(210, 215, 225, 0.75)', fontFamily: "'Inter', sans-serif" }}>
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Divider before tags */}
      <div className="w-full h-px mb-3 line-sweep"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}33, transparent)` }} />

      {/* Tags */}
      <motion.div className="flex flex-wrap gap-1.5 mb-4" {...stagger(1.2)}>
        {tags.map((tag, i) => (
          <motion.span key={i} className="px-2 py-0.5 rounded-full text-[0.55rem] tracking-wide uppercase"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.95 + i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              background: `${accentColor}15`,
              color: accentColor,
              border: `1px solid ${accentColor}30`,
              fontFamily: "'Inter', sans-serif",
            }}>
            {tag}
          </motion.span>
        ))}
      </motion.div>

      {/* Session badge */}
      {sessionNumber > 0 && (
        <motion.div className="flex justify-end mb-2" {...stagger(1.3)}>
          <span className="text-[0.5rem] tracking-[0.12em] uppercase px-2 py-0.5 rounded-full"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: 'rgba(200,210,220,0.35)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
            Session #{sessionNumber}
          </span>
        </motion.div>
      )}

      {/* Select Again button */}
      <motion.div className="flex gap-3 flex-shrink-0"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <motion.button
          onClick={onHome}
          className="relative py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold tracking-[0.15em] uppercase flex items-center gap-2 overflow-hidden"
          style={{
            fontFamily: "'Orbitron', 'Inter', sans-serif",
            color: '#fff',
            background: 'linear-gradient(160deg, rgba(90,95,108,0.95) 0%, rgba(60,65,75,0.9) 50%, rgba(40,44,52,1) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.35), inset 0 -2px 6px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.06)',
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 6px 18px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.97 }}
        >
          {/* Specular */}
          <span className="pointer-events-none absolute rounded-full"
            style={{ top: '4%', left: '6%', width: '55%', height: '44%',
              background: 'radial-gradient(ellipse at 40% 60%, rgba(255,255,255,0.18) 0%, transparent 70%)',
              filter: 'blur(1px)' }} />
          {/* Caustic */}
          <span className="pointer-events-none absolute rounded-full"
            style={{ top: '6%', left: '12%', width: '16%', height: '28%',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.45) 0%, transparent 70%)',
              filter: 'blur(0.5px)' }} />
          {/* Bottom reflection */}
          <span className="pointer-events-none absolute rounded-lg"
            style={{ bottom: '0%', left: '10%', width: '80%', height: '30%',
              background: 'radial-gradient(ellipse, rgba(180,190,210,0.1) 0%, transparent 70%)',
              filter: 'blur(3px)' }} />
          <span className="relative z-10 flex items-center gap-2"><Home size={14} /> Home</span>
        </motion.button>

        <motion.button
          onClick={onDrawAgain}
          className="relative flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-2 overflow-hidden"
          style={{
            fontFamily: "'Orbitron', 'Inter', sans-serif",
            color: '#fff',
            background: `linear-gradient(160deg, ${buttonColor}ee 0%, ${buttonColor}cc 45%, ${buttonColor}99 100%)`,
            border: `1px solid ${glowColor}44`,
            cursor: 'pointer',
            textShadow: `0 0 10px ${glowColor}99, 0 1px 2px rgba(0,0,0,0.4)`,
            boxShadow: `0 6px 18px ${shadowColor}88, inset 0 -3px 8px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.08)`,
          }}
          whileHover={{ scale: 1.02, boxShadow: `0 8px 24px ${shadowColor}aa, inset 0 0 0 1px rgba(255,255,255,0.12)` }}
          whileTap={{ scale: 0.97 }}
        >
          {/* Specular */}
          <span className="pointer-events-none absolute rounded-full"
            style={{ top: '4%', left: '6%', width: '55%', height: '44%',
              background: 'radial-gradient(ellipse at 40% 60%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.07) 50%, transparent 75%)',
              filter: 'blur(1px)' }} />
          {/* Caustic */}
          <span className="pointer-events-none absolute rounded-full"
            style={{ top: '6%', left: '14%', width: '14%', height: '26%',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 70%)',
              filter: 'blur(0.5px)' }} />
          {/* Bottom reflection */}
          <span className="pointer-events-none absolute rounded-lg"
            style={{ bottom: '0%', left: '10%', width: '80%', height: '30%',
              background: `radial-gradient(ellipse, ${glowColor}22 0%, transparent 70%)`,
              filter: 'blur(4px)' }} />
          <span className="relative z-10 flex items-center gap-2"><Shuffle size={14} /> Randomizer</span>
        </motion.button>
      </motion.div>
    </div>
    </div>
  );
}
