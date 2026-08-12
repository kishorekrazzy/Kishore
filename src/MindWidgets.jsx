import { useState, useEffect, useRef } from 'react';
import { useContent } from './content/store';
import './MindWidgets.css';

/* ══════════════════════════════════════════════════════════════════════
   MIND WIDGETS

   Replacements for the clock and the notification list. Both of those
   were generic desktop furniture — a section called "inside the mind"
   should not be showing you the time and an inbox.

   · Brainwave — a live EEG trace with a cognitive-load reading
   · ThoughtStream — the intrusive-thought ticker, cycling on its own
   ══════════════════════════════════════════════════════════════════════ */

/* ── Brainwave ──────────────────────────────────────────────────────── */
const BANDS = [
  { key: 'focus', label: 'Focus',  v: 0.82 },
  { key: 'noise', label: 'Noise',  v: 0.46 },
  { key: 'drive', label: 'Drive',  v: 0.94 },
];

export function BrainwaveCard() {
  const canvasRef = useRef(null);
  const [load, setLoad] = useState(74);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return undefined;
    const ctx = cv.getContext('2d');
    let raf = 0;
    let t = 0;

    const resize = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.floor(r.width * dpr));
      cv.height = Math.max(1, Math.floor(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    /* Three summed sines with different periods — no randomness, so the
       trace reads as a signal rather than static, and it never repeats
       visibly because the periods are not multiples of each other. */
    const draw = () => {
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      if (w > 0 && h > 0) {
        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const p = (x / w) * Math.PI * 2;
          const y =
            h / 2 +
            Math.sin(p * 3 + t) * h * 0.17 +
            Math.sin(p * 7.3 - t * 1.7) * h * 0.09 +
            Math.sin(p * 13.1 + t * 2.6) * h * 0.045;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(120, 240, 190, 0.9)';
        ctx.lineWidth = 1.6;
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
      t += 0.035;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const pulse = setInterval(() => setLoad((v) => {
      const next = v + (Math.random() * 8 - 4);
      return Math.max(58, Math.min(96, Math.round(next)));
    }), 2200);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); clearInterval(pulse); };
  }, []);

  return (
    <div className="wg-card wg-card--dark mw-wave">
      <div className="mw-hdr">
        <span className="mw-eyebrow">Brainwave</span>
        <span className="mw-live"><i />live</span>
      </div>

      <canvas ref={canvasRef} className="mw-wave-canvas" aria-hidden="true" />

      <div className="mw-wave-load">
        <span className="mw-wave-n">{load}<i>%</i></span>
        <span className="mw-wave-cap">cognitive load</span>
      </div>

      <ul className="mw-bands">
        {BANDS.map((b) => (
          <li key={b.key}>
            <span className="mw-band-label">{b.label}</span>
            <span className="mw-band-rail"><i style={{ transform: `scaleX(${b.v})` }} /></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Thought stream ─────────────────────────────────────────────────── */
const THOUGHTS = [
  { t: 'what if the edit starts on the second beat',        tag: 'idea'   },
  { t: 'that grade is one stop too warm',                   tag: 'note'   },
  { t: 'rebuild the prompt system. again.',                 tag: 'loop'   },
  { t: 'did I eat',                                         tag: 'chaitu' },
  { t: 'the render is fine. stop opening it.',              tag: 'loop'   },
  { t: 'teach this to someone who needs it',                tag: 'idea'   },
  { t: 'ship the version you have',                         tag: 'note'   },
];

export function ThoughtStream() {
  const items = useContent('mind.thoughts', THOUGHTS);
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 3400);
    return () => clearInterval(id);
  }, [items.length]);

  /* Three visible at a time, oldest fading — a stream rather than a list. */
  const window3 = [0, 1, 2].map((k) => items[(i + k) % items.length]);

  return (
    <div className="wg-card wg-card--dark mw-stream">
      <div className="mw-hdr">
        <span className="mw-eyebrow">Thought stream</span>
        <span className="mw-count">{String(items.length).padStart(2, '0')}</span>
      </div>

      <ul className="mw-stream-list">
        {window3.map((th, k) => (
          <li key={`${i}-${k}`} className="mw-thought" style={{ '--k': k }}>
            <span className="mw-thought-tag">{th.tag}</span>
            <span className="mw-thought-t">{th.t}</span>
          </li>
        ))}
      </ul>

      <p className="mw-stream-foot">
        <span aria-hidden="true">∿</span> one doubt becomes five
      </p>
    </div>
  );
}
