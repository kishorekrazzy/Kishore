import { useEffect, useRef, useState, useCallback } from 'react';

/* ══════════════════════════════════════════════════════════════════════
   MOBILE UTILITIES

   The small shared parts of the phone app: entrance reveals, the icon
   set, touch feedback, and the couple of hooks that make sheets and
   screens behave like a native app rather than like a web page.
   ══════════════════════════════════════════════════════════════════════ */

export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Reveal ───────────────────────────────────────────────────────────
   Elements arrive as they enter the viewport. One observer per element
   is fine here — the phone app has tens of these, not thousands, and a
   shared observer would have to carry its own bookkeeping to know which
   entry belongs to which node.

   It disconnects on first intersection: a reveal that replays every time
   you scroll past reads as a glitch, not as polish. */
export function useReveal(options) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => reducedMotion());

  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setShown(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } },
      /* rootMargin pulls the trigger line up from the bottom edge so the
         movement finishes as the element settles into view rather than
         starting once it is already fully read. */
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px', ...options },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [shown, options]);

  return [ref, shown];
}

/* ── Touch feedback ───────────────────────────────────────────────────
   A phone confirms a tap physically. Where the hardware allows it, so
   does this — 8ms is a tick, not a buzz. Guarded because iOS Safari has
   no Vibration API and Android throws if the page has never been
   interacted with. */
export function tap(ms = 8) {
  try { navigator.vibrate?.(ms); } catch { /* unsupported */ }
}

/* ── Scroll lock ──────────────────────────────────────────────────────
   While a sheet is up, what is behind it must not scroll.

   The usual recipe pins <body> with position:fixed and a negative top.
   That is the right fix for a page that scrolls the document — and this
   app does not: <body> is overflow:hidden (index.css) and the scrolling
   happens inside .mb-screen. Pinning the body here wrote three styles,
   read a scrollY that is always 0, and prevented nothing.

   So lock the element that actually scrolls. A class on the shell,
   because there are five screens and CSS can reach them all at once. */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    const app = document.getElementById('mb-app');
    if (!app) return;
    app.classList.add('mb-app--locked');
    return () => app.classList.remove('mb-app--locked');
  }, [active]);
}

/* ── Horizontal swipe ─────────────────────────────────────────────────
   Returns handlers for a drag that must distinguish itself from a
   vertical page scroll. The first few pixels decide: past a 12px lead in
   one axis the gesture is claimed for that axis and stays there, so a
   flick down the page never nudges the carousel and vice versa. */
export function useSwipe({ onLeft, onRight, onMove, onEnd, threshold = 56 }) {
  const st = useRef(null);

  const start = useCallback((e) => {
    const t = e.touches ? e.touches[0] : e;
    st.current = { x: t.clientX, y: t.clientY, dx: 0, axis: null };
  }, []);

  const move = useCallback((e) => {
    const s = st.current;
    if (!s) return;
    const t = e.touches ? e.touches[0] : e;
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (!s.axis) {
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) s.axis = 'x';
      else if (Math.abs(dy) > 12) s.axis = 'y';
    }
    if (s.axis !== 'x') return;
    s.dx = dx;
    onMove?.(dx);
  }, [onMove]);

  const end = useCallback(() => {
    const s = st.current;
    st.current = null;
    if (!s) return;
    if (s.axis === 'x') {
      if (s.dx <= -threshold) onLeft?.();
      else if (s.dx >= threshold) onRight?.();
    }
    onEnd?.(s.dx);
  }, [onLeft, onRight, onEnd, threshold]);

  return {
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: end,
    onTouchCancel: end,
  };
}

/* ── Images ───────────────────────────────────────────────────────────
   Unsplash serves whatever width the URL asks for. The desktop build
   asks for 1400–2400px plates; on a 390pt screen that is between four
   and six times more pixels than the display can show, paid for on a
   mobile connection. This rewrites the width parameter to something the
   phone can actually use.

   Only Unsplash URLs are touched — anything else is returned untouched,
   so a CMS-uploaded image or a local file is never mangled. */
export function phoneSrc(url, w = 720, exact = false) {
  if (typeof url !== 'string' || !url.includes('images.unsplash.com')) return url;

  /* `exact` asks for a literal width with no density multiplier. It
     exists for the hero plate, which index.html preloads: a preload only
     helps if the URL the app then requests is character-identical, and a
     width derived from devicePixelRatio is different on every handset. A
     fixed 1080 is a good plate for any phone and is a request the
     document can make before the bundle has even parsed. */
  const target = exact
    ? w
    : Math.round(w * Math.min(typeof window === 'undefined' ? 2 : window.devicePixelRatio || 1, 2.5));

  return url
    .replace(/([?&])w=\d+/, `$1w=${target}`)
    .replace(/([?&])q=\d+/, '$1q=72');
}

