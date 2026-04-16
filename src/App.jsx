import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopicBall from './TopicBall';
import TopicCard from './TopicCard';
import ParticleReveal from './ParticleReveal';
import ControlPanel from './ControlPanel';
import { TOPICS } from './topics';
import { playDrawSound, playSpinSound, playRevealSound, playSelectSound, playHomeSound, playAgainSound, playCardSound, playSpaceDoorsSound } from './useSound';
import { getRandomCard, getPoolSize } from './topicCards';
import SideWidgets from './SideWidgets';
import CompassModel from './CompassModel';
import OwlSentinel from './OwlSentinel';
import { RECOVERY_SLOGANS } from './slogans';
import HudControlPanel from './HudControlPanel';
import CelebrationOverlay from './CelebrationOverlay';
import CelebrationTrigger from './CelebrationTrigger';
import { Copy, Check } from 'lucide-react';

function SloganCopyBtn({ slogan }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(`${slogan.slogan}\n\n${slogan.meaning}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.55rem] tracking-[0.12em] uppercase"
      style={{ fontFamily: "'Orbitron', sans-serif", background: copied ? 'rgba(61,158,207,0.2)' : 'rgba(255,255,255,0.05)', border: copied ? '1px solid rgba(61,158,207,0.5)' : '1px solid rgba(255,255,255,0.1)', color: copied ? 'rgba(61,158,207,0.95)' : 'rgba(200,210,220,0.5)', cursor: 'pointer', transition: 'all 0.3s ease' }}>
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function App() {
  // idle | energize | spin | shimmer | celebrate | spotlight | reveal | card
  const [phase, setPhase] = useState('idle');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [drawCount, setDrawCount] = useState(0);
  const [homeSparkleKey, setHomeSparkleKey] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [cardNumber, setCardNumber] = useState(0);
  const [activeSlogan, setActiveSlogan] = useState(null);
  const [celebrateVisible, setCelebrateVisible] = useState(false);
  const [celebrateMsgIndex, setCelebrateMsgIndex] = useState(0);
  const spinCountRef = useRef(0);
  const lastCelebratedRef = useRef(-99);
  const timeoutsRef = useRef([]);

  const pickSlogan = useCallback(() => {
    const next = RECOVERY_SLOGANS[Math.floor(Math.random() * RECOVERY_SLOGANS.length)];
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

    // Determine if this spin triggers a celebration
    spinCountRef.current += 1;
    const currentSpin = spinCountRef.current;
    const spinsSinceLast = currentSpin - lastCelebratedRef.current;
    const eligible = spinCountRef.current >= 3 && spinsSinceLast >= 3;
    const willCelebrate = eligible && Math.random() < 0.22;
    if (willCelebrate) {
      lastCelebratedRef.current = currentSpin;
      setCelebrateMsgIndex(Math.floor(Math.random() * 6));
    }

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
        setDrawCount(c => c + 1);
        setCardNumber(c => c + 1);
        if (willCelebrate) {
          setPhase('celebrate');
          setCelebrateVisible(true);
          if (soundEnabled) playRevealSound();
        } else {
          setPhase('spotlight');
          if (soundEnabled) playRevealSound();
        }
      }, 6200);
      // After celebrate window, proceed to spotlight → reveal
      const t3cel = willCelebrate ? setTimeout(() => {
        setCelebrateVisible(false);
        setTimeout(() => setPhase('spotlight'), 300);
      }, 6200 + 3000) : null;
      const t3b = setTimeout(() => {
        setPhase('reveal');
        if (soundEnabled) playSpaceDoorsSound();
      }, willCelebrate ? 6200 + 3000 + 300 + 1400 : 7600);
      const t4 = setTimeout(() => { setPhase('card'); if (soundEnabled) playCardSound(); }, willCelebrate ? 6200 + 3000 + 300 + 1400 + 2600 : 10200);

      const extras = [t1, t2, t3, t3b, t4];
      if (t3cel) extras.push(t3cel);
      timeoutsRef.current.push(...extras);
    }, phase === 'idle' ? 0 : 150);

    timeoutsRef.current.push(t0);
  }, [phase, soundEnabled]);

  // Manual celebration trigger — widget button
  const triggerCelebration = useCallback(() => {
    if (phase !== 'idle' && phase !== 'card') return;
    clearTimeouts();
    setSelectedIndex(null);
    setSelectedCard(null);
    setPhase('idle');
    setCelebrateMsgIndex(Math.floor(Math.random() * 6));

    const t0 = setTimeout(() => {
      if (soundEnabled) playDrawSound();
      setPhase('energize');
      const t1 = setTimeout(() => { setPhase('spin'); if (soundEnabled) playSpinSound(); }, 800);
      const t2 = setTimeout(() => setPhase('shimmer'), 5500);
      const t3 = setTimeout(() => {
        const pick = Math.floor(Math.random() * TOPICS.length);
        setSelectedIndex(pick);
        setSelectedCard(getRandomCard(TOPICS[pick].id));
        setDrawCount(c => c + 1);
        setCardNumber(c => c + 1);
        setPhase('celebrate');
        setCelebrateVisible(true);
        if (soundEnabled) playRevealSound();
      }, 6200);
      const t3cel = setTimeout(() => {
        setCelebrateVisible(false);
        setTimeout(() => setPhase('spotlight'), 300);
      }, 6200 + 3000);
      const t3b = setTimeout(() => { setPhase('reveal'); if (soundEnabled) playSpaceDoorsSound(); }, 6200 + 3000 + 300 + 1400);
      const t4 = setTimeout(() => { setPhase('card'); if (soundEnabled) playCardSound(); }, 6200 + 3000 + 300 + 1400 + 2600);
      timeoutsRef.current.push(t1, t2, t3, t3cel, t3b, t4);
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
    const t = setTimeout(() => { setPhase('card'); if (soundEnabled) playCardSound(); }, 2600);
    timeoutsRef.current.push(t);
  }, [phase, soundEnabled]);

  const [bgKey, setBgKey] = useState(0);

  const resetDraw = useCallback(() => {
    if (soundEnabled) playHomeSound();
    clearTimeouts();
    setPhase('idle');
    setBgKey(k => k + 1);
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
      if (e.key >= '1' && e.key <= '8' && (phase === 'idle' || phase === 'card')) {
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

  // Dev position controls — load from localStorage or use hardcoded defaults
  const D = (() => { try { return JSON.parse(localStorage.getItem('hudDefaults') || '{}'); } catch { return {}; } })();
  const [orbitOffsetX, setOrbitOffsetX] = useState(D.orbitOffsetX ?? -442);
  const [orbitOffsetY, setOrbitOffsetY] = useState(D.orbitOffsetY ?? -60);
  const [orbitRadius, setOrbitRadius] = useState(D.orbitRadius ?? 203);
  const [compassX, setCompassX] = useState(D.compassX ?? 472);
  const [compassY, setCompassY] = useState(D.compassY ?? 464);
  const [titleOffsetY, setTitleOffsetY] = useState(D.titleOffsetY ?? -57);
  const [bottomOffsetY, setBottomOffsetY] = useState(D.bottomOffsetY ?? -23);
  const [bottomOffsetX, setBottomOffsetX] = useState(D.bottomOffsetX ?? 151);
  const [starOffsetX, setStarOffsetX] = useState(D.starOffsetX ?? 51);
  const [starOffsetY, setStarOffsetY] = useState(D.starOffsetY ?? 90);
  const orbitBounced = useRef(false);
  const [owlX, setOwlX] = useState(D.owlX ?? 696);
  const [owlY, setOwlY] = useState(D.owlY ?? 336);
  const [owlZ, setOwlZ] = useState(D.owlZ ?? 0);
  const [owlRotY, setOwlRotY] = useState(D.owlRotY ?? -45);
  const [owlSize, setOwlSize] = useState(D.owlSize ?? 212);
  const [devConfirmed, setDevConfirmed] = useState(false);
  const handleDevSet = () => {
    const vals = { orbitOffsetX, orbitOffsetY, orbitRadius, compassX, compassY, titleOffsetY, bottomOffsetX, bottomOffsetY, starOffsetX, starOffsetY, owlX, owlY, owlZ, owlRotY, owlSize };
    localStorage.setItem('hudDefaults', JSON.stringify(vals));
    setDevConfirmed(true);
    setTimeout(() => setDevConfirmed(false), 2000);
  };

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
        background: '#060a12',
      }}
    >
      {/* Full dark overlay — blocks bg during non-idle phases */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: phase === 'idle' ? 0 : 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{ background: '#060a12', zIndex: 1 }}
      />

      {/* BG image — fade-in entrance only, fixed size/position */}
      <motion.div
        key={bgKey}
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'idle' ? 0.75 : 0 }}
        transition={{ duration: 1.8, ease: 'easeInOut' }}
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: '980px auto',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Neon glow — wide soft bloom */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: phase === 'idle' ? [0.55, 0.9, 0.55] : 0 }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: '980px auto',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(18px) brightness(8) saturate(20) hue-rotate(175deg)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Neon glow — sharp tight pulse (faster, offset phase) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: phase === 'idle' ? [0.0, 0.75, 0.0] : 0 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: '980px auto',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(4px) brightness(14) saturate(30) hue-rotate(180deg)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Dark vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(4,8,14,0.75) 100%)' }} />
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
      >
        <motion.div
          className="glass-panel relative"
          style={{
            width: 'min(920px, 96vw)',
            minHeight: '800px',
          }}
        >
          {/* Animated side widgets — inside card edges */}
          <SideWidgets />

          {/* Slogan overlay — centered inside the panel */}
          <AnimatePresence>
            {activeSlogan && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-[14px] z-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ background: 'rgba(8,12,20,0.82)', backdropFilter: 'blur(6px)' }}
                  onClick={() => setActiveSlogan(null)}
                />
                <motion.div
                  className="absolute z-50 flex flex-col items-center"
                  style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(420px, 80%)' }}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88, y: 12 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                >
                  <div className="relative w-full rounded-2xl px-8 py-8 flex flex-col items-center gap-5"
                    style={{
                      background: 'linear-gradient(145deg, rgba(22,28,38,0.98) 0%, rgba(14,18,28,0.99) 100%)',
                      border: '1px solid rgba(61,158,207,0.3)',
                      boxShadow: '0 0 60px rgba(61,158,207,0.15), 0 20px 40px rgba(0,0,0,0.6)',
                    }}
                  >
                    {/* Glow orb */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
                      <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '80%', background: 'radial-gradient(ellipse, rgba(61,158,207,0.1) 0%, transparent 70%)' }} />
                    </div>
                    {/* Close */}
                    <button onClick={() => setActiveSlogan(null)} className="absolute top-3 right-3 p-1.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(200,210,220,0.4)', cursor: 'pointer' }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><line x1="2" y1="2" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="11" y1="2" x2="2" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                    {/* Label with rules */}
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(61,158,207,0.35))' }} />
                      <p className="text-[0.55rem] tracking-[0.25em] uppercase" style={{ fontFamily: "'Orbitron', sans-serif", color: 'rgba(61,158,207,0.7)', whiteSpace: 'nowrap' }}>AA Slogan</p>
                      <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, transparent, rgba(61,158,207,0.35))' }} />
                    </div>
                    {/* Big quote mark */}
                    <span className="pointer-events-none absolute" style={{ top: 28, left: 24, fontSize: '4.5rem', lineHeight: 1, color: 'rgba(61,158,207,0.08)', fontFamily: 'Georgia, serif', fontWeight: 700, userSelect: 'none' }}>&ldquo;</span>
                    {/* Slogan + meaning */}
                    <motion.div key={activeSlogan.slogan} className="relative flex flex-col items-center gap-3 px-2"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                      <p className="text-center text-base sm:text-lg font-bold tracking-wide" style={{ fontFamily: "'Orbitron', sans-serif", color: 'rgba(61,158,207,0.95)' }}>{activeSlogan.slogan}</p>
                      <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(61,158,207,0.25), transparent)' }} />
                      <p className="text-center text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(210,220,230,0.8)' }}>{activeSlogan.meaning}</p>
                    </motion.div>
                    {/* Buttons */}
                    <div className="flex items-center gap-3">
                      <SloganCopyBtn slogan={activeSlogan} />
                      <button onClick={pickSlogan} className="flex items-center gap-2 px-4 py-2 rounded-full text-[0.6rem] tracking-[0.15em] uppercase"
                        style={{ fontFamily: "'Orbitron', sans-serif", background: 'rgba(61,158,207,0.12)', border: '1px solid rgba(61,158,207,0.3)', color: 'rgba(61,158,207,0.85)', cursor: 'pointer' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                        Another one
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Glass shine overlay — card only */}
          {phase === 'card' && <div className="absolute inset-0 rounded-[14px] glass-shine" />}

          {/* Scanning light beam — card only */}
          {phase === 'card' && <div className="absolute inset-0 rounded-[14px] overflow-hidden pointer-events-none">
            <div className="glass-scan absolute inset-y-0"
              style={{
                width: '60px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
              }}
            />
          </div>}

          {/* Radial gradient edge shadows for depth — card only */}
          {phase === 'card' && <div className="absolute inset-0 rounded-[14px] pointer-events-none"
            style={{
              boxShadow: `
                inset 12px 0 20px -12px rgba(0,0,0,0.25),
                inset -12px 0 20px -12px rgba(0,0,0,0.25),
                inset 0 12px 20px -12px rgba(255,255,255,0.05),
                inset 0 -12px 20px -12px rgba(0,0,0,0.3)
              `,
            }}
          />}

          {/* Metallic edges — card only */}
          {phase === 'card' && <>
          <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(190,195,205,0.4), rgba(140,145,155,0.15), rgba(190,195,205,0.3))' }}
          />
          <div className="absolute right-0 top-3 bottom-3 w-[3px] rounded-full pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(190,195,205,0.3), rgba(140,145,155,0.1), rgba(190,195,205,0.25))' }}
          /></>}

          {/* GLB Compass — anchored to glass panel, z-20 so it floats above content */}
          <CompassModel
            visible={phase === 'idle'}
            onClick={pickSlogan}
            offsetX={compassX}
            offsetY={compassY}
          />

          {/* Owl Sentinel — absolutely positioned, independent of layout */}
          <div style={{ position: 'absolute', left: owlX, top: owlY, width: owlSize, height: owlSize, zIndex: 2, pointerEvents: 'none' }}>
            <OwlSentinel visible={phase === 'idle' || phase === 'celebrate'} phase={phase} rotationZ={owlZ} rotationY={owlRotY} celebrate={phase === 'celebrate'} />
          </div>

          {/* Content area */}
          <div className="relative z-10 px-6 pt-10 pb-2 sm:px-8 sm:pt-12 sm:pb-3 flex flex-col" style={{ minHeight: '800px' }}>

            <AnimatePresence mode="wait">
              {/* ===== DRAW VIEW ===== */}
              {showDraw && (
                <motion.div
                  key="draw-view"
                  className="relative flex flex-col items-center"
                  style={{ flex: 1, minHeight: 0 }}
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

                  {/* Celebration overlay */}
                  <CelebrationOverlay visible={celebrateVisible} messageIndex={celebrateMsgIndex} />
                  {/* Header + subtitle group */}
                  <motion.div
                    className="flex flex-col items-center w-full"
                    animate={{ opacity: phase === 'idle' ? 1 : 0, y: phase === 'idle' ? titleOffsetY : titleOffsetY - 12 }}
                    transition={{ duration: 0.4, ease: 'easeIn' }}
                    style={{ paddingTop: '96px' }}
                  >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="flex gap-[3px]">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-[3px] h-5 rounded-sm"
                          style={{ background: '#3d9ecf', opacity: 0.35, transform: 'rotate(-12deg)' }}
                        />
                      ))}
                    </div>
                    <h1
                      className="text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.12em] uppercase"
                      style={{
                        fontFamily: "'Orbitron', 'Inter', sans-serif",
                        color: 'rgba(255,255,255,0.97)',
                        textShadow: '0 0 18px rgba(255,255,255,0.35), 0 0 40px rgba(61,158,207,0.25), 0 2px 10px rgba(0,0,0,0.6)',
                      }}
                    >
                      AA Picalizer 2K26
                    </h1>
                    <div className="flex gap-[3px]">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-[3px] h-5 rounded-sm"
                          style={{ background: '#3d9ecf', opacity: 0.35, transform: 'rotate(-12deg)' }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Animated line sweep divider */}
                  <div className="w-full h-px mb-2 line-sweep"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(61,158,207,0.2), transparent)' }}
                  />

                  {/* Instructional subtitle */}
                  <p className="text-center mb-2 px-4"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.7rem',
                      color: 'rgba(200, 210, 220, 0.28)',
                      letterSpacing: '0.06em',
                      lineHeight: '1.5',
                    }}
                  >
                    AA Discussion Cards — choose a topic or tap <span style={{ color: '#2ba4b5', fontWeight: 600 }}>Randomizer</span> to draw one
                  </p>
                  </motion.div>{/* end header+subtitle group */}

                  {/* Orbital area — perfect circle */}
                  <motion.div
                    className="relative mb-0"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 12, mass: 1, delay: 0.2 }}
                    style={{ width: '560px', height: '560px', position: 'relative', left: `calc(50% + ${orbitOffsetX}px)`, top: orbitOffsetY }}>

                    {/* Celebration Trigger widget — floats left of orbit, does not affect orbit layout */}
                    <div style={{ position: 'absolute', left: -88, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                      <CelebrationTrigger onTrigger={triggerCelebration} phase={phase} />
                    </div>

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
                            const x = 240 + starOffsetX + Math.cos(spiralAngle) * r;
                            const y = 240 + starOffsetY + Math.sin(spiralAngle) * r;
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

                    {/* Circular orbit path ring — pulsing glow (OrbButton-inspired) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none orbit-ring-pulse"
                      style={{
                        width: '380px', height: '380px',
                        borderWidth: 1, borderStyle: 'solid',
                        borderColor: hoveredIndex !== null && (phase === 'idle' || phase === 'card') ? `${TOPICS[hoveredIndex].glowColor}55` : 'rgba(61,158,207,0.12)',
                        borderRadius: '50%',
                        transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
                        boxShadow: hoveredIndex !== null && (phase === 'idle' || phase === 'card') ? `0 0 28px 4px ${TOPICS[hoveredIndex].glowColor}22` : 'none',
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
                        const radius = orbitRadius;
                        const center = 280;
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
                                left: 280 + Math.cos(trailRad) * orbitRadius - size / 2,
                                top: 280 + Math.sin(trailRad) * orbitRadius - size / 2,
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
                        const radius = orbitRadius; // match bg circle
                        const rad = (angle * Math.PI) / 180;
                        const ballSize = 90; // scaled up ball
                        const half = ballSize / 2;
                        const center = 280; // center of 560px area
                        const cx = center + Math.cos(rad) * radius - half;
                        const cy = center + Math.sin(rad) * radius - half;

                        // During spotlight, fly to left open zone; during reveal, expand to fill
                        const isSpotlight = phase === 'spotlight' && selectedIndex === index;
                        const isRevealed = phase === 'reveal' && selectedIndex === index;
                        const isNotSelected = (phase === 'spotlight' || phase === 'reveal') && selectedIndex !== null && selectedIndex !== index;
                        // Left open zone: approx x=60, y=center inside 560px orbit area
                        const spotlightX = 60 - half;
                        const spotlightY = center - half;
                        // Fill entire area
                        const fillScale = 560 / ballSize;
                        const targetX = isRevealed ? center - half : isSpotlight ? spotlightX : cx;
                        const targetY = isRevealed ? center - half : isSpotlight ? spotlightY : cy;

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
                              scale: isRevealed ? fillScale : isSpotlight ? 1.35 : isNotSelected ? 0.15 : 1,
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
                                : isSpotlight
                                ? {
                                    rotate: { duration: 0 },
                                    default: { duration: 0.9, ease: [0.34, 1.56, 0.64, 1] },
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
                  </motion.div>

                  {/* Bottom area — hint + button with explicit spacing */}
                  <div className="flex flex-col items-center w-full" style={{ gap: 32, paddingTop: 16, paddingBottom: 36, transform: `translate(${bottomOffsetX}px, ${bottomOffsetY}px)`, position: 'relative', left: `calc(50% + ${orbitOffsetX}px)`, width: '560px', alignSelf: 'flex-start' }}>

                  {/* Compass hint — only during idle/card */}
                  <AnimatePresence>
                    {(phase === 'idle' || phase === 'card') && (
                      <motion.p
                        key="compass-hint"
                        className="text-center"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.62rem',
                          color: 'rgba(61,158,207,0.45)',
                          letterSpacing: '0.08em',
                          marginTop: '-12px',
                        }}
                      >
                        ✦ Tap the compass for a random AA slogan ✦
                      </motion.p>
                    )}
                  </AnimatePresence>


                  {/* Button row — centered */}
                  <AnimatePresence>
                    {phase !== 'reveal' && phase !== 'spin' && phase !== 'shimmer' && (
                      <motion.div
                        key="control-panel"
                        className="flex justify-center w-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ControlPanel onDraw={runDraw} disabled={false} phase={phase} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  </div>{/* end bottom-area */}
                </motion.div>
              )}

              {/* ===== CARD VIEW ===== */}
              {phase === 'card' && selectedIndex !== null && (
                <>
                <motion.div
                  className="absolute inset-0 rounded-[14px] pointer-events-none z-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  style={{ background: 'rgba(8,14,24,0.96)', backdropFilter: 'blur(16px)' }}
                />
                <motion.div
                  key="card-view"
                  className="relative z-10"
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
                </>
              )}
            </AnimatePresence>

          </div>

          {/* ===== UNIFIED HUD CONTROL PANEL ===== */}
          <AnimatePresence>
          {phase === 'idle' && (
          <HudControlPanel
            key={bgKey}
            orbitOffsetX={orbitOffsetX} setOrbitOffsetX={setOrbitOffsetX}
            orbitOffsetY={orbitOffsetY} setOrbitOffsetY={setOrbitOffsetY}
            orbitRadius={orbitRadius} setOrbitRadius={setOrbitRadius}
            compassX={compassX} setCompassX={setCompassX}
            compassY={compassY} setCompassY={setCompassY}
            titleOffsetY={titleOffsetY} setTitleOffsetY={setTitleOffsetY}
            bottomOffsetX={bottomOffsetX} setBottomOffsetX={setBottomOffsetX}
            bottomOffsetY={bottomOffsetY} setBottomOffsetY={setBottomOffsetY}
            starOffsetX={starOffsetX} setStarOffsetX={setStarOffsetX}
            starOffsetY={starOffsetY} setStarOffsetY={setStarOffsetY}
            owlX={owlX} setOwlX={setOwlX}
            owlY={owlY} setOwlY={setOwlY}
            owlRotY={owlRotY} setOwlRotY={setOwlRotY}
            owlZ={owlZ} setOwlZ={setOwlZ}
            owlSize={owlSize} setOwlSize={setOwlSize}
            devConfirmed={devConfirmed} handleDevSet={handleDevSet}
          />
          )}
          </AnimatePresence>

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
          borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(160, 155, 145, 0.2)',
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
