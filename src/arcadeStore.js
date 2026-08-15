import { useState, useEffect, useRef, useCallback } from 'react';

/* ══════════════════════════════════════════════════════════════════════
   ARCADE — storage and loop helpers

   Split out of arcadeGames.jsx because that file may only export
   components: mixing hooks and data into it breaks fast refresh, and the
   linter is right to say so.
   ══════════════════════════════════════════════════════════════════════ */

export const STORE_KEY = 'kish.arcade.scores';

export function loadScores() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
}

/* Knows whether high or low wins, so no scoreboard has to special-case a
   game. */
export function useBest(id, dir = 'high') {
  const [best, setBest] = useState(() => loadScores()[id] ?? null);
  const submit = useCallback((value) => {
    setBest((prev) => {
      const wins = prev == null || (dir === 'high' ? value > prev : value < prev);
      if (!wins) return prev;
      try {
        const all = loadScores();
        all[id] = value;
        localStorage.setItem(STORE_KEY, JSON.stringify(all));
      } catch { /* private mode — the run still counts for this session */ }
      return value;
    });
  }, [id, dir]);
  return [best, submit];
}

/* A frame loop that survives the callback changing identity every render,
   which it does, because every game's tick closes over its own state.
   The ref is written in an effect, not during render — writing it inline
   is a render side effect and React flags it. */
export function useLoop(fn, running) {
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; });
  useEffect(() => {
    if (!running) return undefined;
    let id;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(50, now - last);
      last = now;
      ref.current(dt);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [running]);
}

/* Arrow keys belong to whichever game is open, and the page behind must
   not scroll while they are held. */
export function useKeys(map, active = true) {
  const ref = useRef(map);
  useEffect(() => { ref.current = map; });
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      const fn = ref.current[e.key];
      if (!fn) return;
      e.preventDefault();
      fn();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);
}
