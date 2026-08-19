import { lazy, Suspense } from 'react'
import { useIsMobile } from './mobile/useIsMobile'

/* ══════════════════════════════════════════════════════════════════════
   ROOT — the fork between the two front-ends

   The site ships two of them: the desktop app in App.jsx and the phone
   app in mobile/. This is where one is chosen.

   ── WHY BOTH SIDES ARE LAZY ──────────────────────────────────────────
   The two trees are large and share almost no components. Importing
   either statically would put it in the entry bundle — every phone
   downloading the desktop's WebGL headline shader, its window managers
   and the three.js graph behind them, roughly a megabyte of code it will
   never execute, or every desktop downloading the phone app.

   Splitting here costs one module fetch after the entry chunk parses and
   saves a phone about 180 KB gzipped, which on a mobile connection is
   not a close call.

   The decision itself is synchronous (see useIsMobile), so the correct
   app is requested on the very first render — there is never a moment
   where the wrong one is mounted and then thrown away.
   ══════════════════════════════════════════════════════════════════════ */
const DesktopApp = lazy(() => import('./App.jsx'))
const MobileApp  = lazy(() => import('./mobile/MobileApp.jsx'))

export default function Root() {
  const mobile = useIsMobile()

  /* No fallback. index.css paints the page ground on <body>, so the gap
     between the entry chunk and the app chunk shows the site's own
     background rather than a spinner that would flash for one frame and
     read as a fault. */
  return (
    <Suspense fallback={null}>
      {mobile ? <MobileApp /> : <DesktopApp />}
    </Suspense>
  )
}
