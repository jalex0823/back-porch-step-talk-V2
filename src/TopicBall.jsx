import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sunrise, MessageCircle, Feather, Shuffle } from 'lucide-react';

const AAIcon = ({ size = 24, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M3 18L7 6h1l4 12" /><line x1="4.5" y1="14" x2="10.5" y2="14" />
    <path d="M12 18L16 6h1l4 12" /><line x1="13.5" y1="14" x2="19.5" y2="14" />
  </svg>
);

const ICON_MAP = { BookOpen, Sunrise, MessageCircle, Feather, Shuffle, AAIcon };

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

  if (isEnergize) glowIntensity = 1.2;
  else if (isSpin) glowIntensity = 1.4;
  else if (isShimmer) glowIntensity = 1.2;
  else if (phase === 'reveal') {
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
              opacity: [0.85, 1, 0.85],
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

      {/* Orb base — deep glass body */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 42% 35%,
            ${glowColor}55 0%,
            ${color}99 20%,
            ${color}dd 50%,
            ${color}bb 75%,
            rgba(0,0,0,0.35) 100%)`,
          boxShadow: `0 6px 24px rgba(0,0,0,0.6), inset 0 2px 6px rgba(255,255,255,0.08), inset 0 -4px 12px rgba(0,0,0,0.5), inset 0 0 20px 6px ${shadowColor}`,
          border: `1px solid ${glowColor}55`,
        }}
      />
      {/* Glass refraction layer */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.13) 0%, transparent 55%),
                       radial-gradient(ellipse at 70% 75%, ${glowColor}22 0%, transparent 50%)`,
        }}
      />
      {/* Primary specular — sharp top-left glint */}
      <div className="absolute rounded-full"
        style={{
          top: '7%', left: '12%', width: '44%', height: '28%',
          background: 'radial-gradient(ellipse at 40% 55%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 40%, transparent 70%)',
          filter: 'blur(1px)',
        }}
      />
      {/* Secondary caustic — small bright pinpoint */}
      <div className="absolute rounded-full"
        style={{
          top: '11%', left: '20%', width: '18%', height: '12%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.75) 0%, transparent 70%)',
          filter: 'blur(0.5px)',
        }}
      />
      {/* Bottom reflection — faint underside glow */}
      <div className="absolute rounded-full"
        style={{
          bottom: '8%', left: '20%', width: '60%', height: '18%',
          background: `radial-gradient(ellipse, ${glowColor}33 0%, transparent 70%)`,
          filter: 'blur(3px)',
        }}
      />
      {/* Edge rim — outer ring refraction */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'transparent',
          boxShadow: `inset 0 0 0 1.5px rgba(255,255,255,0.12), inset 0 -2px 4px rgba(255,255,255,0.06)`,
        }}
      />

      {/* Icon + Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1"
        style={{ opacity: dimmed ? 0.2 : 0.95, transition: 'opacity 0.6s ease' }}>
        {Icon && (
          <Icon
            size={24}
            strokeWidth={1.6}
            style={{
              color: '#fff',
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        )}
        <span
          className="text-center font-bold tracking-wide leading-tight px-1"
          style={{
            fontFamily: "'Orbitron', 'Inter', sans-serif",
            fontSize: label.length > 12 ? '0.5rem' : label.length > 8 ? '0.55rem' : '0.62rem',
            color: '#fff',
            textShadow: `0 0 8px ${glowColor}, 0 1px 2px rgba(0,0,0,0.5)`,
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
