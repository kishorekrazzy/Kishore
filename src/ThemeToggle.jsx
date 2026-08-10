import { useEffect, useState, useCallback } from 'react';
import './ThemeToggle.css';

/* ══════════════════════════════════════════════════════════════════════
   Theme control — dark · light

   Two states, both explicit. data-theme is always set, so the
   prefers-color-scheme blocks in theme.css only ever apply in the moment
   before the boot script in index.html runs.
   ══════════════════════════════════════════════════════════════════════ */

const KEY = 'kish.theme';
const ORDER = ['dark', 'light'];

// Visitors who picked the old 'system' state still have it in storage.
// Resolve it to whichever theme the OS was actually showing them, so the
// control comes back on the colour they were already looking at.
function readMode() {
  const stored = localStorage.getItem(KEY);
  if (ORDER.includes(stored)) return stored;
  if (stored === 'system') return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  return 'dark';
}

export default function ThemeToggle() {
  const [mode, setMode] = useState(readMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem(KEY, mode);
  }, [mode]);

  const cycle = useCallback(() => {
    setMode((m) => {
      const next = ORDER[(ORDER.indexOf(m) + 1) % ORDER.length];
      // View Transitions cross-dissolve the whole document in one GPU
      // pass, instead of ~500 elements each running a colour transition.
      if (document.startViewTransition &&
          !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const vt = document.startViewTransition(() => {
          document.documentElement.setAttribute('data-theme', next);
        });
        // Clicking again mid-dissolve aborts the previous transition and
        // rejects these. Expected, not an error — swallow both so it
        // never surfaces as an unhandled rejection.
        vt.finished.catch(() => {});
        vt.ready.catch(() => {});
      }
      return next;
    });
  }, []);

  const idx = ORDER.indexOf(mode);

  return (
    <button
      className="theme-toggle"
      data-idx={idx}
      onClick={cycle}
      aria-label={`Colour theme: ${mode}. Click to change.`}
      title={`Theme: ${mode}`}
    >
      <span className="tt-knob" aria-hidden="true" />

      <span className="tt-slot" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
             strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a6.8 6.8 0 0 0 11 11Z" />
        </svg>
      </span>

      <span className="tt-slot" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
             strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </span>
    </button>
  );
}
