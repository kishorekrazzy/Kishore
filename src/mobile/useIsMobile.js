import { useState, useEffect } from 'react';

/* ══════════════════════════════════════════════════════════════════════
   MOBILE DETECTION

   The site ships two entirely separate front-ends: the desktop app in
   App.jsx, and the phone app in mobile/. This hook is the only switch
   between them, so the rule lives in exactly one place.

   Width, not user-agent. A narrow window on a laptop gets the phone
   build too, which is what makes the thing testable at all — and a UA
   string has never been a reliable statement about how many pixels are
   actually available.

   860px is the break: above it the desktop grids have the room they were
   designed for; below it they do not, and the phone app takes over.
   ══════════════════════════════════════════════════════════════════════ */
export const MOBILE_MAX = 860;

/* An escape hatch. Someone on a large tablet may genuinely want the
   desktop layout, and the phone app offers it in its menu. Session
   storage, not local: the override lasts for the visit and then the
   device gets its own layout back. */
export const FORCE_DESKTOP_KEY = 'kx:force-desktop';

export function forcedDesktop() {
  try { return sessionStorage.getItem(FORCE_DESKTOP_KEY) === '1'; } catch { return false; }
}

export function setForcedDesktop(on) {
  try {
    if (on) sessionStorage.setItem(FORCE_DESKTOP_KEY, '1');
    else sessionStorage.removeItem(FORCE_DESKTOP_KEY);
  } catch { /* private mode — the toggle simply does not persist */ }
}

const QUERY = `(max-width: ${MOBILE_MAX}px)`;

export function useIsMobile() {
  /* Read synchronously on the first render. Deciding this in an effect
     would mount the desktop tree, tear it down and mount the phone one —
     a full flash of the wrong site, plus every heavy desktop component
     paying its start-up cost for nothing. */
  const [mobile, setMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (forcedDesktop()) return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setMobile(mq.matches && !forcedDesktop());
    // Safari < 14 has no addEventListener on MediaQueryList.
    if (mq.addEventListener) mq.addEventListener('change', update);
    else mq.addListener(update);
    // Rotating a phone changes which query matches; so does the desktop
    // override being switched off from the menu.
    window.addEventListener('orientationchange', update);
    window.addEventListener('kx:layout-pref', update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update);
      else mq.removeListener(update);
      window.removeEventListener('orientationchange', update);
      window.removeEventListener('kx:layout-pref', update);
    };
  }, []);

  return mobile;
}
