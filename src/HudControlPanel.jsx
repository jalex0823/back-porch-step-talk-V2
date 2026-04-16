import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function HudSlider({ label, val, min, max, set, color, pct }) {
  return (
    <div style={{ marginBottom: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
        <span style={{ fontSize: '0.48rem', color: 'rgba(180,195,210,0.6)', letterSpacing: '0.12em', fontFamily: "'Orbitron',monospace" }}>{label}</span>
        <span style={{ fontSize: '0.48rem', color, fontWeight: 700, fontFamily: "'Orbitron',monospace" }}>{val}</span>
      </div>
      <div style={{ position: 'relative', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${Math.max(0, Math.min(100, pct * 100))}%`, background: `linear-gradient(90deg,${color}55,${color})`, borderRadius: 3, transition: 'width 0.04s', boxShadow: `0 0 6px ${color}66` }} />
        <input type="range" min={min} max={max} value={val} onChange={e => set(Number(e.target.value))}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0 }} />
      </div>
    </div>
  );
}

export default function HudControlPanel({
  orbitOffsetX, setOrbitOffsetX, orbitOffsetY, setOrbitOffsetY, orbitRadius, setOrbitRadius,
  compassX, setCompassX, compassY, setCompassY,
  titleOffsetY, setTitleOffsetY, bottomOffsetX, setBottomOffsetX, bottomOffsetY, setBottomOffsetY,
  starOffsetX, setStarOffsetX, starOffsetY, setStarOffsetY,
  owlX, setOwlX, owlY, setOwlY, owlRotY, setOwlRotY, owlZ, setOwlZ, owlSize, setOwlSize,
  devConfirmed, handleDevSet,
}) {
  const [tab, setTab] = useState('system');
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    setCollapsed(true);
  }, []);

  const sysSliders = [
    { label: 'ORBIT X',  val: orbitOffsetX, min: -500, max: 0,    set: setOrbitOffsetX, color: '#ffe066', pct: (orbitOffsetX + 500) / 500 },
    { label: 'ORBIT Y',  val: orbitOffsetY, min: -200, max: 200,  set: setOrbitOffsetY, color: '#ffe066', pct: (orbitOffsetY + 200) / 400 },
    { label: 'ORBIT R',  val: orbitRadius,  min: 100,  max: 300,  set: setOrbitRadius,  color: '#ffe066', pct: (orbitRadius - 100) / 200 },
    { label: 'COMPASS X',val: compassX,     min: 100,  max: 600,  set: setCompassX,     color: '#4ade80', pct: (compassX - 100) / 500 },
    { label: 'COMPASS Y',val: compassY,     min: 100,  max: 600,  set: setCompassY,     color: '#4ade80', pct: (compassY - 100) / 500 },
    { label: 'TITLE Y',  val: titleOffsetY, min: -100, max: 100,  set: setTitleOffsetY, color: '#38bdf8', pct: (titleOffsetY + 100) / 200 },
    { label: 'BTM X',    val: bottomOffsetX,min: -300, max: 300,  set: setBottomOffsetX,color: '#f87171', pct: (bottomOffsetX + 300) / 600 },
    { label: 'BTM Y',    val: bottomOffsetY,min: -100, max: 300,  set: setBottomOffsetY,color: '#f87171', pct: (bottomOffsetY + 100) / 400 },
    { label: 'STAR X',   val: starOffsetX,  min: -200, max: 200,  set: setStarOffsetX,  color: '#c084fc', pct: (starOffsetX + 200) / 400 },
    { label: 'STAR Y',   val: starOffsetY,  min: -200, max: 200,  set: setStarOffsetY,  color: '#c084fc', pct: (starOffsetY + 200) / 400 },
  ];

  const owlSliders = [
    { label: 'POS X', val: owlX,    min: 0,    max: 920, set: setOwlX,    color: '#fb923c', pct: owlX / 920 },
    { label: 'POS Y', val: owlY,    min: 0,    max: 800, set: setOwlY,    color: '#fb923c', pct: owlY / 800 },
    { label: 'ROT Y', val: owlRotY, min: -180, max: 180, set: setOwlRotY, color: '#fbbf24', pct: (owlRotY + 180) / 360 },
    { label: 'ROT Z', val: owlZ,    min: -180, max: 180, set: setOwlZ,    color: '#e879f9', pct: (owlZ + 180) / 360 },
    { label: 'SIZE',  val: owlSize, min: 80,   max: 400, set: setOwlSize, color: '#34d399', pct: (owlSize - 80) / 320 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.5, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute',
        top: 116,
        right: -18,
        width: collapsed ? 140 : 420,
        zIndex: 50,
        background: 'linear-gradient(160deg, rgba(6,14,26,0.96) 0%, rgba(4,10,20,0.98) 100%)',
        border: '2px solid rgba(255,255,255,0.55)',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 0 24px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.6)',
        transition: 'width 0.3s ease',
        fontFamily: "'Orbitron', monospace",
      }}
    >
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 10px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.42rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em' }}>◈</span>
          <span style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.22em', fontWeight: 700 }}>CONTROL HUD</span>
        </div>
        <button onClick={() => setCollapsed(c => !c)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', padding: '0 2px', lineHeight: 1 }}>
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      <AnimatePresence>
      {!collapsed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {[{ id: 'system', label: '⚙ SYSTEM' }, { id: 'owl', label: '◈ OWL' }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  flex: 1, padding: '4px 0', background: tab === t.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: 'none', borderBottom: tab === t.id ? '2px solid rgba(255,255,255,0.7)' : '2px solid transparent',
                  cursor: 'pointer', fontSize: '0.42rem', letterSpacing: '0.15em',
                  color: tab === t.id ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
                  fontFamily: "'Orbitron', monospace", transition: 'all 0.2s',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Slider body */}
          <div style={{ padding: '8px 12px' }}>
            <AnimatePresence mode="wait">
              {tab === 'system' && (
                <motion.div key="system" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                    {sysSliders.map(s => <HudSlider key={s.label} {...s} />)}
                  </div>
                  <motion.button
                    onClick={handleDevSet}
                    animate={{ background: devConfirmed ? 'rgba(22,163,74,0.4)' : 'rgba(43,164,181,0.12)', borderColor: devConfirmed ? '#16a34a' : 'rgba(43,164,181,0.4)' }}
                    transition={{ duration: 0.3 }}
                    style={{ marginTop: 6, width: '100%', borderWidth: 1, borderStyle: 'solid', borderRadius: 5, padding: '3px 0', fontFamily: "'Orbitron', monospace", fontSize: '0.42rem', cursor: 'pointer', color: devConfirmed ? '#4ade80' : 'rgba(43,164,181,0.85)', letterSpacing: '0.18em', background: 'transparent' }}
                  >
                    {devConfirmed ? '✓  DEFAULTS LOCKED' : '⊙  SET AS DEFAULT'}
                  </motion.button>
                </motion.div>
              )}
              {tab === 'owl' && (
                <motion.div key="owl" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                    {owlSliders.map(s => <HudSlider key={s.label} {...s} />)}
                  </div>
                  <motion.button
                    onClick={handleDevSet}
                    animate={{ background: devConfirmed ? 'rgba(22,163,74,0.4)' : 'rgba(43,164,181,0.12)', borderColor: devConfirmed ? '#16a34a' : 'rgba(43,164,181,0.4)' }}
                    transition={{ duration: 0.3 }}
                    style={{ marginTop: 6, width: '100%', borderWidth: 1, borderStyle: 'solid', borderRadius: 5, padding: '3px 0', fontFamily: "'Orbitron', monospace", fontSize: '0.42rem', cursor: 'pointer', color: devConfirmed ? '#4ade80' : 'rgba(43,164,181,0.85)', letterSpacing: '0.18em', background: 'transparent' }}
                  >
                    {devConfirmed ? '✓  DEFAULTS LOCKED' : '⊙  SET AS DEFAULT'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer scanline */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
