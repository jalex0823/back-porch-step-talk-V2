const audioCtx = typeof window !== 'undefined'
  ? new (window.AudioContext || window.webkitAudioContext)()
  : null;

/* ── helper: create a short digital blip ── */
function blip(freq, startTime, dur, vol, type = 'square') {
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.4, startTime + dur);
  g.gain.setValueAtTime(vol, startTime);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + dur);
}

/* ── DRAW: digital activation blip ── */
export function playDrawSound() {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const t = audioCtx.currentTime;

  // Sharp square-wave "bip-bip"
  blip(1200, t, 0.06, 0.07, 'square');
  blip(1600, t + 0.07, 0.05, 0.06, 'square');

  // Sub-bass thump
  const sub = audioCtx.createOscillator();
  const sg = audioCtx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(80, t);
  sub.frequency.exponentialRampToValueAtTime(30, t + 0.15);
  sg.gain.setValueAtTime(0.1, t);
  sg.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  sub.connect(sg);
  sg.connect(audioCtx.destination);
  sub.start(t);
  sub.stop(t + 0.15);
}

/* ── SPIN: digital ratchet / data-scanning loop ── */
export function playSpinSound() {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const t = audioCtx.currentTime;
  const dur = 4.5;

  // Layer 1: FM synthesis "digital whirr" — carrier + modulator
  const carrier = audioCtx.createOscillator();
  const modulator = audioCtx.createOscillator();
  const modGain = audioCtx.createGain();
  const carGain = audioCtx.createGain();

  modulator.type = 'square';
  modulator.frequency.setValueAtTime(20, t);
  modulator.frequency.linearRampToValueAtTime(120, t + 1.5);
  modulator.frequency.linearRampToValueAtTime(40, t + dur);
  modGain.gain.setValueAtTime(200, t);
  modGain.gain.linearRampToValueAtTime(600, t + 1.5);
  modGain.gain.linearRampToValueAtTime(100, t + dur);

  carrier.type = 'sawtooth';
  carrier.frequency.setValueAtTime(220, t);
  carrier.frequency.linearRampToValueAtTime(440, t + 1.5);
  carrier.frequency.linearRampToValueAtTime(180, t + dur);

  carGain.gain.setValueAtTime(0, t);
  carGain.gain.linearRampToValueAtTime(0.04, t + 0.3);
  carGain.gain.linearRampToValueAtTime(0.055, t + 1.5);
  carGain.gain.linearRampToValueAtTime(0.02, t + 3.8);
  carGain.gain.linearRampToValueAtTime(0.001, t + dur);

  modulator.connect(modGain);
  modGain.connect(carrier.frequency);
  carrier.connect(carGain);

  // Bandpass to make it less harsh
  const bp = audioCtx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(800, t);
  bp.frequency.linearRampToValueAtTime(2000, t + 1.5);
  bp.frequency.linearRampToValueAtTime(600, t + dur);
  bp.Q.setValueAtTime(2, t);

  carGain.connect(bp);
  bp.connect(audioCtx.destination);

  modulator.start(t);
  carrier.start(t);
  modulator.stop(t + dur);
  carrier.stop(t + dur);

  // Layer 2: accelerating then decelerating digital clicks
  const clickCount = 24;
  for (let i = 0; i < clickCount; i++) {
    // Accumulate timing with parabolic spacing (fast in middle, slow at edges)
    let accum = 0.15;
    for (let j = 0; j < i; j++) {
      const n = j / (clickCount - 1);
      const s = 1 - 4 * (n - 0.35) * (n - 0.35);
      accum += 0.08 + (1 - Math.max(0, s)) * 0.25;
    }
    if (accum > dur - 0.3) break;
    const freq = 800 + Math.sin(i * 0.7) * 400;
    const vol = 0.035 * (1 - (accum / dur) * 0.5);
    blip(freq, t + accum, 0.02, Math.max(vol, 0.008), 'square');
  }

  // Layer 3: subtle high-freq data shimmer
  const shimOsc = audioCtx.createOscillator();
  const shimGain = audioCtx.createGain();
  shimOsc.type = 'sine';
  shimOsc.frequency.setValueAtTime(4000, t);
  shimOsc.frequency.linearRampToValueAtTime(6000, t + 1);
  shimOsc.frequency.linearRampToValueAtTime(3000, t + dur);
  shimGain.gain.setValueAtTime(0, t);
  shimGain.gain.linearRampToValueAtTime(0.012, t + 0.5);
  shimGain.gain.linearRampToValueAtTime(0.015, t + 1.5);
  shimGain.gain.linearRampToValueAtTime(0.001, t + dur);
  shimOsc.connect(shimGain);
  shimGain.connect(audioCtx.destination);
  shimOsc.start(t);
  shimOsc.stop(t + dur);
}

/* ── REVEAL: Login.mp3 sound effect ── */
let revealBuffer = null;
if (audioCtx) {
  fetch('/Login.mp3')
    .then(r => r.arrayBuffer())
    .then(buf => audioCtx.decodeAudioData(buf))
    .then(decoded => { revealBuffer = decoded; })
    .catch(() => {});
}

export function playRevealSound() {
  if (!audioCtx || !revealBuffer) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const src = audioCtx.createBufferSource();
  src.buffer = revealBuffer;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.5, audioCtx.currentTime);
  src.connect(g);
  g.connect(audioCtx.destination);
  src.start(0);
}

/* ── SELECT: soft confirmation chime when clicking a ball directly ── */
export function playSelectSound() {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const t = audioCtx.currentTime;

  // Gentle triangle-wave two-tone chime
  const o1 = audioCtx.createOscillator();
  const g1 = audioCtx.createGain();
  o1.type = 'triangle';
  o1.frequency.setValueAtTime(880, t);
  g1.gain.setValueAtTime(0.06, t);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  o1.connect(g1); g1.connect(audioCtx.destination);
  o1.start(t); o1.stop(t + 0.2);

  const o2 = audioCtx.createOscillator();
  const g2 = audioCtx.createGain();
  o2.type = 'triangle';
  o2.frequency.setValueAtTime(1320, t + 0.08);
  g2.gain.setValueAtTime(0.05, t + 0.08);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o2.connect(g2); g2.connect(audioCtx.destination);
  o2.start(t + 0.08); o2.stop(t + 0.3);

  // Tiny sparkle
  blip(2400, t + 0.12, 0.03, 0.02, 'sine');
}

/* ── HOME: gaster-vanish.mp3 ── */
let homeBuffer = null;
if (audioCtx) {
  fetch('/gaster-vanish.mp3')
    .then(r => r.arrayBuffer())
    .then(buf => audioCtx.decodeAudioData(buf))
    .then(decoded => { homeBuffer = decoded; })
    .catch(() => {});
}

export function playHomeSound() {
  if (!audioCtx || !homeBuffer) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const src = audioCtx.createBufferSource();
  src.buffer = homeBuffer;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.6, audioCtx.currentTime);
  src.connect(g);
  g.connect(audioCtx.destination);
  src.start(0);
}

/* ── BONG: bmw-bong.mp3 — orbit appear on load and return to home ── */
let bongBuffer = null;
if (audioCtx) {
  fetch('/bmw-bong.mp3')
    .then(r => r.arrayBuffer())
    .then(buf => audioCtx.decodeAudioData(buf))
    .then(decoded => { bongBuffer = decoded; })
    .catch(() => {});
}

export function playBongSound() {
  if (!audioCtx || !bongBuffer) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const src = audioCtx.createBufferSource();
  src.buffer = bongBuffer;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.7, audioCtx.currentTime);
  src.connect(g);
  g.connect(audioCtx.destination);
  src.start(0);
}

/* ── PARTICLE REVEAL: space_doors.mp3 ── */
let spaceDoorsBuffer = null;
if (audioCtx) {
  fetch('/space_doors.mp3')
    .then(r => r.arrayBuffer())
    .then(buf => audioCtx.decodeAudioData(buf))
    .then(decoded => { spaceDoorsBuffer = decoded; })
    .catch(() => {});
}

export function playSpaceDoorsSound() {
  if (!audioCtx || !spaceDoorsBuffer) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const src = audioCtx.createBufferSource();
  src.buffer = spaceDoorsBuffer;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.65, audioCtx.currentTime);
  src.connect(g);
  g.connect(audioCtx.destination);
  src.start(0);
}

/* ── CARD TRANSITION: chromeos-battery-charging-sound.mp3 ── */
let cardBuffer = null;
if (audioCtx) {
  fetch('/chromeos-battery-charging-sound.mp3')
    .then(r => r.arrayBuffer())
    .then(buf => audioCtx.decodeAudioData(buf))
    .then(decoded => { cardBuffer = decoded; })
    .catch(() => {});
}

export function playCardSound() {
  if (!audioCtx || !cardBuffer) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const src = audioCtx.createBufferSource();
  src.buffer = cardBuffer;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.6, audioCtx.currentTime);
  src.connect(g);
  g.connect(audioCtx.destination);
  src.start(0);
}

/* ── AGAIN: CrossEffect.mp3 sound ── */
let againBuffer = null;
if (audioCtx) {
  fetch('/CrossEffect.mp3')
    .then(r => r.arrayBuffer())
    .then(buf => audioCtx.decodeAudioData(buf))
    .then(decoded => { againBuffer = decoded; })
    .catch(() => {});
}

export function playAgainSound() {
  if (!audioCtx || !againBuffer) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const src = audioCtx.createBufferSource();
  src.buffer = againBuffer;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.5, audioCtx.currentTime);
  src.connect(g);
  g.connect(audioCtx.destination);
  src.start(0);
}
