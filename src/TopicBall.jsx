import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sunrise, MessageCircle, Feather, Shuffle, BookMarked, Sparkles } from 'lucide-react';

const AAIcon = ({ size = 24, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M3 18L7 6h1l4 12" /><line x1="4.5" y1="14" x2="10.5" y2="14" />
    <path d="M12 18L16 6h1l4 12" /><line x1="13.5" y1="14" x2="19.5" y2="14" />
  </svg>
);

const ICON_MAP = { BookOpen, Sunrise, MessageCircle, Feather, Shuffle, AAIcon, BookMarked, Sparkles };

export default function TopicBall({ topic, index, phase, isSelected }) {
  const { label, icon, color, glowColor, shadowColor } = topic;
  const Icon = ICON_MAP[icon];
  const [hovered, setHovered] = useState(false);
  const isClickable = phase === 'idle' || phase === 'card';

  let glowIntensity = 1;
  let dimmed = false;
  const isIdle = phase === 'idle' || phase === 'card';
  const isSpin = phase === 'spin';
  const isEnergize = phase === 'energize';
  const isShimmer = phase === 'shimmer';
  const isSpotlight = phase === 'spotlight';
  const isCelebrate = phase === 'celebrate';

  if (isEnergize) glowIntensity = 1.2;
  else if (isSpin) glowIntensity = 1.4;
  else if (isShimmer) glowIntensity = 1.2;
  else if (isCelebrate) glowIntensity = 2.2;
  else if (isSpotlight) {
    if (isSelected) {
      glowIntensity = 3.0;
    } else {
      glowIntensity = 0.1;
      dimmed = true;
    }
  } else if (phase === 'reveal') {
    if (isSelected) {
      glowIntensity = 2.5;
    } else {
      glowIntensity = 0.15;
      dimmed = true;
    }
  }

  const shimmerDelay = isShimmer
    ? [0.1, 0.3, 0.05, 0.2, 0.35][index]
    : 0;

  // Stagger offset per ball for organic feel
  const staggerOffset = index * 0.12;

  return (
    <motion.div
      className="relative w-[88px] h-[88px] sm:w-[96px] sm:h-[96px] md:w-[105px] md:h-[105px]"
      onMouseEnter={() => isClickable && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => isClickable && setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      animate={
        isIdle
          ? {
              scale: [1, 1.06, 1],
              opacity: [0.97, 1, 0.97],
            }
          : isEnergize
          ? {
              scale: [1, 1.12, 1],
              rotateY: [0, 15, -15, 0],
            }
          : isShimmer
          ? {
              scale: [1, 1.15, 1],
            }
          : { scale: 1, opacity: 1 }
      }
      transition={
        isIdle
          ? {
              duration: 2.5 + index * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.4,
            }
          : isEnergize
          ? {
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1],
              delay: staggerOffset,
            }
          : isShimmer
          ? {
              duration: 0.35,
              delay: shimmerDelay,
              ease: 'easeInOut',
            }
          : { duration: 0.5, ease: 'easeOut' }
      }
      style={{
        filter: dimmed ? 'brightness(0.3) saturate(0.3)' : 'brightness(1)',
        transition: 'filter 0.8s ease',
        perspective: '200px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Spin glow — subtle halo behind ball during spin */}
      {isSpin && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: staggerOffset }}
          style={{
            inset: '-6px',
            background: `radial-gradient(circle, ${glowColor}44 0%, transparent 60%)`,
            filter: 'blur(8px)',
          }}
        />
      )}

      {/* Energize flash ring */}
      {isEnergize && (
        <motion.div
          className="absolute -inset-2 rounded-full pointer-events-none"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.7, 0], scale: [0.6, 1.4, 1.6] }}
          transition={{ duration: 0.6, delay: staggerOffset }}
          style={{
            border: `2px solid ${glowColor}88`,
            boxShadow: `0 0 12px ${glowColor}44`,
          }}
        />
      )}

      {/* Hover glow ring */}
      <AnimatePresence>
        {hovered && isClickable && (
          <motion.div
            className="absolute -inset-3 rounded-full pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            style={{
              border: `1.5px solid ${glowColor}66`,
              boxShadow: `0 0 20px ${glowColor}33, inset 0 0 8px ${glowColor}22`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Celebrate ripple ring — all balls pulse outward */}
      {isCelebrate && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -8,
            border: `2px solid ${glowColor}`,
            boxShadow: `0 0 30px ${glowColor}66`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.9, 0.6, 0], scale: [0.8, 1.6, 2.2, 3.0] }}
          transition={{ duration: 1.6, delay: index * 0.08, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.3 }}
        />
      )}

      {/* Spotlight pulse ring */}
      {isSpotlight && isSelected && (
        <motion.div
          className="absolute -inset-4 rounded-full pointer-events-none"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: [0, 1, 0.6, 1, 0.6], scale: [0.7, 1.4, 1.2, 1.5, 1.3] }}
          transition={{ duration: 1.4, ease: 'easeOut', repeat: Infinity }}
          style={{
            border: `2px solid ${glowColor}`,
            boxShadow: `0 0 40px ${glowColor}88`,
          }}
        />
      )}

      {/* Reveal pulse ring */}
      {phase === 'reveal' && isSelected && (
        <motion.div
          className="absolute -inset-4 rounded-full pointer-events-none"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.6, 1.6, 2.0] }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          style={{
            border: `2px solid ${glowColor}`,
            boxShadow: `0 0 30px ${glowColor}55`,
          }}
        />
      )}

      {/* Shadow underneath */}
      <div
        className="absolute -inset-3 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${shadowColor} 0%, transparent 60%)`,
          opacity: glowIntensity * 0.3,
          filter: 'blur(10px)',
          transition: 'opacity 0.6s ease',
        }}
      />

      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={
          phase === 'shimmer'
            ? {
                boxShadow: [
                  `0 0 14px 4px ${shadowColor}, inset 0 0 12px 3px ${shadowColor}`,
                  `0 0 32px 10px ${shadowColor}, inset 0 0 26px 6px ${shadowColor}`,
                  `0 0 14px 4px ${shadowColor}, inset 0 0 12px 3px ${shadowColor}`,
                ],
              }
            : {}
        }
        transition={
          phase === 'shimmer'
            ? { duration: 0.4, delay: shimmerDelay, ease: 'easeInOut' }
            : {}
        }
        style={{
          boxShadow: `0 0 ${16 * glowIntensity}px ${4 * glowIntensity}px ${shadowColor}`,
          transition: 'box-shadow 0.6s ease',
        }}
      />

      {/* ── Machined steel outer housing ring ── */}
      <div className="absolute rounded-full pointer-events-none" style={{
        inset: -3,
        background: `conic-gradient(from 120deg,
          rgba(55,65,80,0.9) 0deg,
          rgba(90,100,118,0.95) 60deg,
          rgba(130,140,158,0.9) 110deg,
          rgba(75,85,100,0.9) 160deg,
          rgba(42,50,64,0.95) 220deg,
          rgba(100,112,130,0.9) 280deg,
          rgba(55,65,80,0.9) 360deg)`,
        boxShadow: `0 4px 16px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.07)`,
      }} />

      {/* ── Dark glass orb body ── */}
      <div className="absolute inset-0 rounded-full" style={{
        background: `radial-gradient(circle at 42% 35%,
          rgba(22,30,44,0.97) 0%,
          rgba(14,20,32,0.99) 50%,
          rgba(6,10,18,1) 100%)`,
        border: `1px solid rgba(255,255,255,0.06)`,
        boxShadow: `inset 0 2px 8px rgba(0,0,0,0.8), inset 0 -1px 4px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(0,0,0,0.6)`,
      }} />

      {/* ── Inner panel recess ring ── */}
      <div className="absolute rounded-full pointer-events-none" style={{
        inset: '6%',
        boxShadow: `inset 0 2px 6px rgba(0,0,0,0.9), inset 0 -1px 3px rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.04)`,
        borderRadius: '50%',
      }} />

      {/* ── Animated plasma core bloom ── */}
      <motion.div className="absolute inset-0 rounded-full pointer-events-none" style={{ overflow: 'hidden' }}
        animate={{ opacity: isCelebrate ? [0.7, 1, 0.7] : isEnergize || isSpin ? [0.45, 0.7, 0.45] : [0.28, 0.42, 0.28] }}
        transition={{ duration: isCelebrate ? 0.5 : 2.8 + index * 0.25, repeat: Infinity, ease: 'easeInOut', delay: index * 0.18 }}
      >
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: `radial-gradient(circle at 50% 58%, ${glowColor}cc 0%, ${glowColor}55 28%, transparent 62%)`,
          filter: 'blur(3px)',
        }} />
      </motion.div>

      {/* ── Plasma outer halo ring ── */}
      <motion.div className="absolute inset-0 rounded-full pointer-events-none"
        animate={{ opacity: isEnergize || isSpin || isCelebrate ? [0.5, 0.9, 0.5] : [0.2, 0.35, 0.2] }}
        transition={{ duration: 3.2 + index * 0.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.22 }}
        style={{
          boxShadow: `inset 0 0 18px 4px ${glowColor}55`,
          border: `1px solid ${glowColor}33`,
          borderRadius: '50%',
        }}
      />

      {/* ── Hex grid tech overlay ── */}
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='14'%3E%3Cpath d='M6 1l5 3v6l-5 3-5-3V4z' fill='none' stroke='${encodeURIComponent(glowColor)}' stroke-width='0.3' stroke-opacity='0.18'/%3E%3C/svg%3E")`,
        backgroundSize: '12px 14px',
        opacity: 0.7,
        mixBlendMode: 'screen',
        borderRadius: '50%',
        overflow: 'hidden',
      }} />

      {/* ── Chrome hard specular — wide diffuse ── */}
      <div className="absolute rounded-full" style={{
        top: '6%', left: '10%', width: '46%', height: '26%',
        background: 'radial-gradient(ellipse at 38% 52%, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.10) 45%, transparent 75%)',
        filter: 'blur(1px)',
      }} />
      {/* ── Chrome hard specular — sharp hot pinpoint ── */}
      <div className="absolute rounded-full" style={{
        top: '9%', left: '20%', width: '16%', height: '10%',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.4) 40%, transparent 70%)',
        filter: 'blur(0.3px)',
      }} />
      {/* ── Secondary chrome glint — right side ── */}
      <div className="absolute rounded-full" style={{
        top: '18%', right: '14%', width: '10%', height: '7%',
        background: 'radial-gradient(ellipse, rgba(200,215,235,0.55) 0%, transparent 70%)',
        filter: 'blur(0.5px)',
      }} />
      {/* ── Neon equator seam ── */}
      <div className="absolute pointer-events-none" style={{
        top: '46%', left: '4%', right: '4%', height: '1.5px',
        background: `linear-gradient(90deg, transparent 0%, ${glowColor}66 20%, ${glowColor}cc 50%, ${glowColor}66 80%, transparent 100%)`,
        filter: 'blur(0.5px)',
        borderRadius: '2px',
      }} />
      {/* ── Neon equator seam glow halo ── */}
      <div className="absolute pointer-events-none" style={{
        top: '43%', left: '8%', right: '8%', height: '14%',
        background: `linear-gradient(180deg, transparent, ${glowColor}18 40%, ${glowColor}28 50%, ${glowColor}18 60%, transparent)`,
        filter: 'blur(3px)',
      }} />
      {/* ── Bottom underside glow ── */}
      <div className="absolute rounded-full" style={{
        bottom: '5%', left: '16%', width: '68%', height: '14%',
        background: `radial-gradient(ellipse, ${glowColor}55 0%, transparent 70%)`,
        filter: 'blur(4px)',
      }} />
      {/* ── Steel rim inner edge highlight ── */}
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{
        boxShadow: `inset 0 0 0 1.5px rgba(255,255,255,0.11), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.5)`,
      }} />

      {/* Icon + Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5"
        style={{ opacity: dimmed ? 0.2 : 0.95, transition: 'opacity 0.6s ease', padding: '6px' }}>
        {Icon && (
          <Icon
            size={18}
            strokeWidth={1.6}
            style={{
              color: '#fff',
              filter: `drop-shadow(0 0 6px ${glowColor})`,
              flexShrink: 0,
            }}
          />
        )}
        <span
          className="text-center font-bold tracking-wide leading-tight w-full"
          style={{
            fontFamily: "'Orbitron', 'Inter', sans-serif",
            fontSize: label.length > 12 ? '0.42rem' : label.length > 8 ? '0.46rem' : '0.52rem',
            color: '#fff',
            textShadow: `0 0 8px ${glowColor}, 0 1px 2px rgba(0,0,0,0.5)`,
            textAlign: 'center',
          }}
        >
          {label}
        </span>
      </div>
      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && isClickable && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap"
            style={{ bottom: -28, zIndex: 50 }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-[0.55rem] tracking-wider uppercase px-2 py-0.5 rounded"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                color: '#fff',
                background: 'rgba(0,0,0,0.6)',
                border: `1px solid ${glowColor}44`,
                textShadow: `0 0 6px ${glowColor}`,
              }}>
              Tap to select
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
