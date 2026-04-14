import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopicBall from './TopicBall';
import TopicCard from './TopicCard';
import ParticleReveal from './ParticleReveal';
import ControlPanel from './ControlPanel';
import { TOPICS } from './topics';
import { playDrawSound, playSpinSound, playRevealSound, playSelectSound, playHomeSound, playAgainSound } from './useSound';
import { getRandomCard, getPoolSize } from './topicCards';
import SideWidgets from './SideWidgets';
import CompassModel from './CompassModel';
import OwlSentinel from './OwlSentinel';
import SloganModal from './SloganModal';
import { AA_SLOGANS } from './slogans';

export default function App() {
  // idle | energize | spin | shimmer | reveal | card
  const [phase, setPhase] = useState('idle');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [drawCount, setDrawCount] = useState(0);
  const [homeSparkleKey, setHomeSparkleKey] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [cardNumber, setCardNumber] = useState(0);
  const [activeSlogan, setActiveSlogan] = useState(null);
  const timeoutsRef = useRef([]);

  const pickSlogan = useCallback(() => {
    const next = AA_SLOGANS[Math.floor(Math.random() * AA_SLOGANS.length)];
    setActiveSlogan(next);
  }, []);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  // Cleanup all timeouts on unmount
  useEffect(() => () => clearTimeouts(), []);

  const runDraw = useCallback(() => {
    if (phase !== 'idle' && phase !== 'reveal' && phase !== 'card') return;
    clearTimeouts();
    setSelectedIndex(null);
    setSelectedCard(null);
    setPhase('idle');

    const t0 = setTimeout(() => {
      if (soundEnabled) playDrawSound();
      setPhase('energize');

      const t1 = setTimeout(() => {
        setPhase('spin');
        if (soundEnabled) playSpinSound();
      }, 800);
      const t2 = setTimeout(() => setPhase('shimmer'), 5500);
      const t3 = setTimeout(() => {
        const pick = Math.floor(Math.random() * TOPICS.length);
        setSelectedIndex(pick);
        setSelectedCard(getRandomCard(TOPICS[pick].id));
        setPhase('reveal');
        setDrawCount(c => c + 1);
        setCardNumber(c => c + 1);
        if (soundEnabled) playRevealSound();
      }, 6200);
      const t4 = setTimeout(() => setPhase('card'), 8800);

      timeoutsRef.current.push(t1, t2, t3, t4);
    }, phase === 'idle' ? 0 : 150);

    timeoutsRef.current.push(t0);
  }, [phase, soundEnabled]);

  // Direct ball selection — click a ball to pick that topic
  const selectTopic = useCallback((index) => {
    if (phase !== 'idle' && phase !== 'card') return;
    clearTimeouts();
    setSelectedIndex(index);
    setSelectedCard(getRandomCard(TOPICS[index].id));
    if (soundEnabled) playSelectSound();
    setDrawCount(c => c + 1);
    setCardNumber(c => c + 1);
    setPhase('reveal');
    const t = setTimeout(() => setPhase('card'), 2600);
    timeoutsRef.current.push(t);
  }, [phase, soundEnabled]);

  const resetDraw = useCallback(() => {
    if (soundEnabled) playHomeSound();
    clearTimeouts();
    setPhase('idle');
    setSelectedIndex(null);
    setSelectedCard(null);
    setHomeSparkleKey(k => k + 1);
  }, [soundEnabled]);

  const drawAgain = useCallback(() => {
    if (soundEnabled) playAgainSound();
    runDraw();
  }, [soundEnabled, runDraw]);

  const showDraw = phase !== 'card';

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space' && (phase === 'idle' || phase === 'reveal' || phase === 'card')) {
        e.preventDefault();
        runDraw();
      }
      if (e.key >= '1' && e.key <= '6' && (phase === 'idle' || phase === 'card')) {
        const idx = parseInt(e.key) - 1;
        if (idx < TOPICS.length) selectTopic(idx);
      }
      if (e.code === 'Escape' && phase === 'card') {
        resetDraw();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, runDraw, selectTopic, resetDraw]);

  // Mouse-following parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e) => {
      const cx = (e.clientX / window.innerWidth - 0.5) * 2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x: cx, y: cy });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Ambient floating particles (memoized so they don't regenerate)
  const ambientParticles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${5 + Math.random() * 90}%`,
      bottom: `${-5 - Math.random() * 10}%`,
      size: 2 + Math.random() * 3,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      color: ['rgba(61,158,207,0.4)', 'rgba(180,150,100,0.35)', 'rgba(140,200,180,0.3)'][Math.floor(Math.random() * 3)],
    })), []);

  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(150deg, #3a3028 0%, #2a2520 30%, #1e1c1a 60%, #252220 100%)',
      }}
    >
      {/* Warm ambient light spots — parallax */}
      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{
          x: mousePos.x * 15,
          y: mousePos.y * 15,
        }}
        transition={{ type: 'spring', stiffness: 40, damping: 20 }}
        style={{
          background: `
            radial-gradient(ellipse at 25% 20%, rgba(180, 150, 100, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 75% 80%, rgba(140, 120, 90, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(100, 95, 85, 0.04) 0%, transparent 60%)
          `,
        }}
      />

      {/* Soft vignette — tints to selected topic color */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: selectedIndex !== null && (phase === 'reveal' || phase === 'card') ? 0.12 : 0,
        }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        style={{
          background: selectedIndex !== null
            ? `radial-gradient(ellipse at 50% 40%, ${TOPICS[selectedIndex].accentColor}33, transparent 70%)`
            : 'transparent',
        }}
      />

      {/* Ambient floating particles — color-match selected topic */}
      {ambientParticles.map(p => {
        const particleColor = selectedIndex !== null
          ? `${TOPICS[selectedIndex].accentColor}66`
          : p.color;
        return (
        <div key={p.id} className="ambient-particle"
          style={{
            left: p.left, bottom: p.bottom,
            width: p.size, height: p.size,
            background: particleColor,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 2}px ${particleColor}`,
            transition: 'background 1.5s ease, box-shadow 1.5s ease',
          }}
        />
        );
      })}

      {/* ===== MAIN GLASS PANEL ===== */}
      <div
        className="relative z-10"
        style={{ perspective: '1200px' }}
      >
        <motion.div
          className="glass-panel relative"
          style={{
            transform: 'rotateY(-2deg) rotateX(1deg)',
            width: 'min(860px, 96vw)',
            minHeight: '800px',
          }}
          whileHover={{ rotateY: 0, rotateX: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated side widgets — inside card edges */}
          <SideWidgets />

          {/* Glass shine overlay */}
          <div className="absolute inset-0 rounded-[14px] glass-shine" />

          {/* Scanning light beam (Login-style) */}
          <div className="absolute inset-0 rounded-[14px] overflow-hidden pointer-events-none">
            <div className="glass-scan absolute inset-y-0"
              style={{
                width: '60px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
              }}
            />
          </div>

          {/* Radial gradient edge shadows for depth (Login sample) */}
          <div className="absolute inset-0 rounded-[14px] pointer-events-none"
            style={{
              boxShadow: `
                inset 12px 0 20px -12px rgba(0,0,0,0.25),
                inset -12px 0 20px -12px rgba(0,0,0,0.25),
                inset 0 12px 20px -12px rgba(255,255,255,0.05),
                inset 0 -12px 20px -12px rgba(0,0,0,0.3)
              `,
            }}
          />

          {/* Metallic edge — left */}
          <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(190,195,205,0.4), rgba(140,145,155,0.15), rgba(190,195,205,0.3))' }}
          />
          {/* Metallic edge — right */}
          <div className="absolute right-0 top-3 bottom-3 w-[3px] rounded-full pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(190,195,205,0.3), rgba(140,145,155,0.1), rgba(190,195,205,0.25))' }}
          />

          {/* Content area */}
          <div className="relative z-10 px-6 py-5 sm:px-8 sm:py-6">

            <AnimatePresence mode="wait">
              {/* ===== DRAW VIEW ===== */}
              {showDraw && (
                <motion.div
                  key="draw-view"
                  className="relative flex flex-col items-center"
                  style={{ minHeight: 'inherit' }}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.8 }}
                >
                  {homeSparkleKey > 0 && (
                    <ParticleReveal
                      key={homeSparkleKey}
                      accentColor="#3d9ecf"
                      duration={1.2}
                      sparkleOnly
                    />
                  )}
                  {/* Header with hash marks */}
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="flex gap-[3px]">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-[3px] h-5 rounded-sm"
                          style={{ background: '#3d9ecf', opacity: 0.7, transform: 'rotate(-12deg)' }}
                        />
                      ))}
                    </div>
                    <h1
                      className="text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.12em] uppercase"
                      style={{
                        fontFamily: "'Orbitron', 'Inter', sans-serif",
                        color: '#fff',
                        textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      }}
                    >
                      Step Talk
                    </h1>
                    <div className="flex gap-[3px]">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-[3px] h-5 rounded-sm"
                          style={{ background: '#3d9ecf', opacity: 0.7, transform: 'rotate(-12deg)' }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Animated line sweep divider */}
                  <div className="w-full h-px mb-2 line-sweep"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(61,158,207,0.5), transparent)' }}
                  />

                  {/* Instructional subtitle */}
                  <p className="text-center mb-4 px-4"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.7rem',
                      color: 'rgba(200, 210, 220, 0.5)',
                      letterSpacing: '0.06em',
                      lineHeight: '1.5',
                    }}
                  >
                    AA Discussion Cards — choose a topic or tap <span style={{ color: '#2ba4b5', fontWeight: 600 }}>Randomizer</span> to draw one
                  </p>

                  {/* Orbital area — perfect circle */}
                  <div className="relative mx-auto mb-4" style={{ width: '480px', height: '480px' }}>

                    {/* Center "sun" glow — pulses during spin */}
                    <motion.div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                      animate={{
                        width: (phase === 'spin' || phase === 'shimmer') ? 60 : 32,
                        height: (phase === 'spin' || phase === 'shimmer') ? 60 : 32,
                        opacity: (phase === 'spin' || phase === 'shimmer') ? [0.4, 0.8, 0.4] : 0.5,
                      }}
                      transition={
                        (phase === 'spin' || phase === 'shimmer')
                          ? { opacity: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }, default: { duration: 0.8 } }
                          : { duration: 0.6 }
                      }
                      style={{
                        background: 'radial-gradient(circle, rgba(61,158,207,0.3) 0%, transparent 70%)',
                        filter: 'blur(8px)',
                      }}
                    />

                    {/* Star spiral trail — one rotation during spin, pulse with balls on stop, fade on card */}
                    <AnimatePresence>
                      {(phase === 'spin' || phase === 'shimmer' || phase === 'reveal') && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          initial={{ opacity: 0, rotate: 0, scale: 0.3 }}
                          animate={
                            (phase === 'shimmer' || phase === 'reveal')
                              ? { opacity: [1, 1, 0], rotate: 360, scale: [1, 1.3, 1.5] }
                              : { opacity: 1, rotate: 360, scale: 1 }
                          }
                          exit={{ opacity: 0 }}
                          transition={
                            (phase === 'shimmer' || phase === 'reveal')
                              ? {
                                  opacity: { duration: 2.2, ease: 'easeInOut' },
                                  scale: { duration: 2.2, ease: 'easeOut' },
                                  rotate: { duration: 4.5, ease: [0.12, 0.6, 0.08, 1] },
                                }
                              : {
                                  opacity: { duration: 0.6 },
                                  rotate: { duration: 4.5, ease: [0.12, 0.6, 0.08, 1] },
                                  scale: { duration: 1.0, ease: 'easeOut' },
                                }
                          }
                        >
                          {Array.from({ length: 30 }, (_, i) => {
                            const t = i / 30;
                            const spiralAngle = t * Math.PI * 6;
                            const r = t * 170;
                            const x = 240 + Math.cos(spiralAngle) * r;
                            const y = 240 + Math.sin(spiralAngle) * r;
                            const size = 1.5 + t * 3;
                            const hue = (i * 12) % 360;
                            const baseOpacity = 0.8 - t * 0.3;
                            return (
                              <motion.div
                                key={`star-${i}`}
                                className="absolute rounded-full"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: baseOpacity, scale: 1 }}
                                transition={{ duration: 0.6, delay: t * 1.0, ease: 'easeOut' }}
                                style={{
                                  left: x - size / 2,
                                  top: y - size / 2,
                                  width: size,
                                  height: size,
                                  background: `hsl(${200 + (hue % 40)}, 70%, 70%)`,
                                  boxShadow: `0 0 ${size * 3}px hsl(${200 + (hue % 40)}, 70%, 60%)`,
                                }}
                              />
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* GLB compass — centered, visible idle/card, fades on selection */}
                    <CompassModel
                      visible={phase === 'idle' || phase === 'card'}
                      onClick={pickSlogan}
                    />

                    {/* Circular orbit path ring — pulsing glow (OrbButton-inspired) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none orbit-ring-pulse"
                      style={{
                        width: '380px', height: '380px',
                        border: '1px solid rgba(61, 158, 207, 0.12)',
                        borderRadius: '50%',
                        transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
                        ...(hoveredIndex !== null && (phase === 'idle' || phase === 'card') ? {
                          borderColor: `${TOPICS[hoveredIndex].glowColor}55`,
                          boxShadow: `0 0 28px 4px ${TOPICS[hoveredIndex].glowColor}22`,
                        } : {}),
                      }}
                    />
                    {/* Rotating tick marks — compass bezel */}
                    <motion.div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ width: '390px', height: '390px' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                    >
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="absolute"
                          style={{
                            left: '50%', top: '50%',
                            transform: `rotate(${i * 30}deg) translateY(-195px)`,
                            width: i % 3 === 0 ? 2 : 1,
                            height: i % 3 === 0 ? 8 : 5,
                            background: 'rgba(61,158,207,0.15)',
                            borderRadius: 1,
                            marginLeft: i % 3 === 0 ? -1 : -0.5,
                          }}
                        />
                      ))}
                    </motion.div>

                    {/* Second outer ring — subtle */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{
                        width: '400px', height: '400px',
                        border: '1px solid rgba(160, 170, 185, 0.04)',
                        borderRadius: '50%',
                      }}
                    />

                    {/* Rotating orbit container */}
                    <motion.div
                      className="absolute inset-0"
                      initial={{ rotate: 0 }}
                      animate={
                        phase === 'spin'
                          ? { rotate: 360 }
                          : phase === 'idle' || phase === 'card'
                          ? { rotate: 360 }
                          : { rotate: 0 }
                      }
                      transition={
                        phase === 'spin'
                          ? { duration: 4.5, ease: [0.12, 0.6, 0.08, 1] }
                          : phase === 'idle' || phase === 'card'
                          ? { duration: 120, repeat: Infinity, ease: 'linear' }
                          : { duration: 0 }
                      }
                    >
                      {/* Comet trails — rendered at orbit level so they rotate with the container */}
                      {(phase === 'spin' || phase === 'shimmer') && TOPICS.map((topic, index) => {
                        const angle = (index / TOPICS.length) * 360 - 90;
                        const radius = 185;
                        const center = 240;
                        return [1, 2, 3, 4, 5, 6, 7, 8].map(t => {
                          const trailAngle = angle - t * 8; // offset behind by 8° each
                          const trailRad = (trailAngle * Math.PI) / 180;
                          const size = Math.max(5, 32 - t * 3.2);
                          const opacity = 0.92 - t * 0.1;
                          return (
                            <motion.div
                              key={`trail-${topic.id}-${t}`}
                              className="absolute rounded-full pointer-events-none"
                              initial={{ opacity: 0 }}
                              animate={{ opacity }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.25, delay: t * 0.03 }}
                              style={{
                                left: center + Math.cos(trailRad) * radius - size / 2,
                                top: center + Math.sin(trailRad) * radius - size / 2,
                                width: size,
                                height: size,
                                background: `radial-gradient(circle, ${topic.glowColor}cc, transparent 70%)`,
                                boxShadow: `0 0 ${size * 1.5}px ${topic.glowColor}88`,
                                filter: `blur(${0.5 + t * 0.8}px)`,
                              }}
                            />
                          );
                        });
                      })}

                      {TOPICS.map((topic, index) => {
                        const angle = (index / TOPICS.length) * 360 - 90; // start from top
                        const radius = 185; // perfect circle
                        const rad = (angle * Math.PI) / 180;
                        const ballSize = 105; // scaled up ball
                        const half = ballSize / 2;
                        const center = 240; // center of 480px area
                        const cx = center + Math.cos(rad) * radius - half;
                        const cy = center + Math.sin(rad) * radius - half;

                        // During reveal, selected expands to fill the whole orbit circle
                        const isRevealed = phase === 'reveal' && selectedIndex === index;
                        const isNotSelected = phase === 'reveal' && selectedIndex !== null && selectedIndex !== index;
                        // Fill entire 380px area: 380/88 ≈ 4.32
                        const fillScale = 480 / ballSize;
                        const targetX = isRevealed ? center - half : cx;
                        const targetY = isRevealed ? center - half : cy;

                        return (
                          <motion.div
                            key={topic.id}
                            className={`absolute ${phase === 'idle' || phase === 'card' ? 'cursor-pointer' : 'cursor-default'}`}
                            onClick={() => selectTopic(index)}
                            onMouseEnter={() => (phase === 'idle' || phase === 'card') && setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{
                              left: cx, top: cy,
                              width: `${ballSize}px`, height: `${ballSize}px`,
                            }}
                            animate={{
                              left: targetX,
                              top: targetY,
                              scale: isRevealed ? fillScale : isNotSelected ? 0.15 : 1,
                              opacity: isNotSelected ? 0 : 1,
                              rotateY: isRevealed ? [0, 25, -20, 12, -8, 0] : 0,
                              // Counter-rotate to keep balls upright
                              rotate: phase === 'spin'
                                ? -360
                                : phase === 'idle' || phase === 'card'
                                ? -360
                                : 0,
                            }}
                            transition={
                              phase === 'spin'
                                ? {
                                    rotate: {
                                      duration: 4.5,
                                      ease: [0.12, 0.6, 0.08, 1],
                                    },
                                    default: { duration: 0.6 },
                                  }
                                : phase === 'idle' || phase === 'card'
                                ? {
                                    rotate: { duration: 120, repeat: Infinity, ease: 'linear' },
                                    default: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                                  }
                                : isRevealed
                                ? {
                                    rotate: { duration: 0 },
                                    default: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
                                    rotateY: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
                                  }
                                : isNotSelected
                                ? {
                                    rotate: { duration: 0 },
                                    default: { duration: 1.0, ease: 'easeIn' },
                                  }
                                : {
                                    rotate: { duration: 0 },
                                    default: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                                  }
                            }
                          >
                            <TopicBall
                              topic={topic}
                              index={index}
                              phase={phase}
                              isSelected={selectedIndex === index}
                            />
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </div>

                  {/* Compass hint — only during idle/card */}
                  <AnimatePresence>
                    {(phase === 'idle' || phase === 'card') && (
                      <motion.p
                        key="compass-hint"
                        className="text-center mb-2"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.62rem',
                          color: 'rgba(61,158,207,0.45)',
                          letterSpacing: '0.08em',
                        }}
                      >
                        ✦ Tap the compass for a random AA slogan ✦
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Selected topic label during reveal */}
                  <AnimatePresence>
                    {phase === 'reveal' && selectedIndex !== null && (
                      <motion.div
                        className="mb-3 text-center relative"
                        initial={{ opacity: 0, y: 12, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {/* Glow flash behind topic name */}
                        <motion.div
                          className="absolute inset-0 rounded-lg pointer-events-none"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.5, 2] }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          style={{
                            background: `radial-gradient(circle, ${TOPICS[selectedIndex].accentColor}44, transparent 70%)`,
                            filter: 'blur(20px)',
                          }}
                        />
                        <p className="text-[0.65rem] tracking-[0.2em] uppercase"
                          style={{ fontFamily: "'Orbitron', sans-serif", color: TOPICS[selectedIndex].accentColor }}>
                          Today&rsquo;s Topic
                        </p>
                        <p className="mt-0.5 text-base sm:text-lg font-bold tracking-[0.1em]"
                          style={{
                            fontFamily: "'Orbitron', sans-serif",
                            color: '#fff',
                            textShadow: `0 2px 10px rgba(0,0,0,0.4), 0 0 20px ${TOPICS[selectedIndex].accentColor}44`,
                          }}>
                          {TOPICS[selectedIndex].label}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Control Panel + Owl row — hidden during reveal */}
                  <AnimatePresence>
                    {phase !== 'reveal' && (
                      <motion.div
                        key="control-panel"
                        className="flex items-end justify-center w-full"
                        style={{ paddingRight: '80px' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="pointer-events-none flex-shrink-0" style={{ width: 170, height: 220, marginBottom: -14, marginRight: -8 }}>
                          <OwlSentinel visible={phase === 'idle' || phase === 'card'} />
                        </div>
                        <ControlPanel onDraw={runDraw} disabled={false} phase={phase} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ===== CARD VIEW ===== */}
              {phase === 'card' && selectedIndex !== null && (
                <motion.div
                  key="card-view"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`card-${selectedIndex}-${drawCount}`}
                      initial={{ opacity: 0, x: 20, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ParticleReveal
                        accentColor={TOPICS[selectedIndex].accentColor}
                        duration={1.2}
                      >
                        <TopicCard
                          topic={{ ...TOPICS[selectedIndex], ...(selectedCard || {}) }}
                          onDrawAgain={drawAgain}
                          onHome={resetDraw}
                          sessionNumber={drawCount}
                          cardNumber={cardNumber}
                          totalCards={getPoolSize(TOPICS[selectedIndex].id)}
                        />
                      </ParticleReveal>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Panel shadow on "floor" */}
        <div className="mt-2 mx-auto rounded-full"
          style={{
            width: '80%',
            height: '12px',
            background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.3), transparent 70%)',
            filter: 'blur(6px)',
          }}
        />

        {/* Reflection under panel (Reflections sample) */}
        <div className="mx-auto rounded-[14px] overflow-hidden"
          style={{
            width: '70%',
            height: '40px',
            marginTop: '-2px',
            transform: 'scaleY(-1) scaleX(0.92) perspective(300px) rotateX(25deg)',
            background: 'linear-gradient(180deg, rgba(100,110,125,0.12), transparent)',
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 100%)',
            filter: 'blur(2px)',
          }}
        />
      </div>

      {/* Sound toggle — animated speaker icon */}
      <motion.button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full"
        style={{
          background: 'rgba(60, 55, 48, 0.6)',
          border: '1px solid rgba(160, 155, 145, 0.2)',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
        whileHover={{ scale: 1.1, borderColor: 'rgba(61,158,207,0.4)' }}
        whileTap={{ scale: 0.9 }}
        title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(200,195,185,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="rgba(200,195,185,0.15)" />
          {soundEnabled && (
            <>
              <motion.path d="M15.54 8.46a5 5 0 0 1 0 7.07"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 0.3 }}
              />
              <motion.path d="M19.07 4.93a10 10 0 0 1 0 14.14"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.5 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              />
            </>
          )}
          {!soundEnabled && (
            <motion.line x1="23" y1="9" x2="17" y2="15"
              stroke="rgba(220,100,100,0.7)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </svg>
      </motion.button>

      {/* Slogan modal — triggered by compass click */}
      <SloganModal
        slogan={activeSlogan}
        onClose={() => setActiveSlogan(null)}
        onNew={pickSlogan}
      />

      {/* Session counter — bottom left */}
      {drawCount > 0 && (
        <motion.div
          className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(60, 55, 48, 0.5)',
            border: '1px solid rgba(160, 155, 145, 0.15)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span className="text-[0.55rem] tracking-[0.12em] uppercase"
            style={{ fontFamily: "'Orbitron', sans-serif", color: 'rgba(200,210,220,0.4)' }}>
            Draws
          </span>
          <motion.span
            key={drawCount}
            className="text-xs font-bold inline-block"
            initial={{ scale: 1.6, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ fontFamily: "'Orbitron', sans-serif", color: 'rgba(61,158,207,0.7)' }}>
            {drawCount}
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}
