/* ─────────────────────────────────────────────────────────────
   DJ Tactile Audio
   Synthesised click / tick / detent / grip / release sounds
   for hardware-feel slider, crossfader, and knob interactions.

   Pure Web Audio (no asset files). Uses short oscillator
   envelopes routed through a high-pass filter for a clean,
   plastic-y tap feel.
   ───────────────────────────────────────────────────────────── */

let sharedCtx = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!sharedCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      sharedCtx = new Ctor();
    } catch {
      return null;
    }
  }
  // Some browsers suspend the context until a user gesture
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

/**
 * Play a single short tonal "click".
 * Internal helper — not exported.
 */
function click({
  freq = 1800,
  dur = 0.035,
  vol = 0.06,
  type = 'square',
  detune = 0,
  hp = 600,
  sweep = 0.6,   // multiplier the freq glides toward over `dur`
} = {}) {
  const ctx = getCtx();
  if (!ctx) return;

  try {
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'highpass';
    filter.frequency.value = hp;

    osc.type = type;
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(freq, t0);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(60, freq * sweep),
      t0 + dur,
    );

    // Snappy attack, exponential decay
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch {
    // swallow — audio is best-effort
  }
}

/** Soft, high tick — for slider step detents. */
export function playTick() {
  click({ freq: 2200, dur: 0.022, vol: 0.05, type: 'square', sweep: 0.55 });
}

/** Slightly chunkier click — for knob detents. */
export function playDetent() {
  click({ freq: 1400, dur: 0.045, vol: 0.08, type: 'triangle', sweep: 0.5 });
}

/** Soft thunk on initial grab. */
export function playGrip() {
  click({ freq: 700, dur: 0.06, vol: 0.07, type: 'sine', sweep: 0.6, hp: 200 });
}

/** Lower, softer thunk on release. */
export function playRelease() {
  click({ freq: 520, dur: 0.05, vol: 0.05, type: 'sine', sweep: 0.7, hp: 200 });
}

/**
 * Optional: lightly "warm up" the audio context.
 * Call from a user gesture handler to ensure subsequent
 * playback isn't blocked by browser autoplay policy.
 */
export function primeAudio() {
  getCtx();
}
