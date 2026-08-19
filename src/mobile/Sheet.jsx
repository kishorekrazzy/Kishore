import { useState, useRef, useCallback, useEffect } from 'react';
import { useScrollLock, tap, reducedMotion } from './mobileUtils';
import { Icon } from './ui';

/* ══════════════════════════════════════════════════════════════════════
   SHEET

   The phone build's only overlay. Everything that is not one of the five
   screens — a note, a project, the menu, the assistant — arrives as one
   of these, which means there is exactly one thing to learn about how
   overlays behave here.

   Three ways out, because a phone user will reach for all three:
     · the close button
     · dragging the sheet down past a third of its height, or flicking it
     · the hardware/gesture Back

   The third one is not handled here. Every overlay is a route (see the
   route table in MobileApp), so Back closes a sheet by changing the URL
   the same way the close button does — there is no history juggling
   inside this component to get out of step with React.
   ══════════════════════════════════════════════════════════════════════ */

/* Past this far down, releasing dismisses. Under it the sheet springs
   back, which is the feedback that tells you the gesture exists. */
const DISMISS_RATIO = 0.32;
/* …or a flick: 0.6px per ms is a deliberate throw, not a slow drag that
   happened to end low. */
const FLICK_VELOCITY = 0.6;

export default function Sheet({
  title,
  onClose,
  children,
  full = false,
  /* A bare body hands the remaining height to one child and does not
     scroll itself — for a view like the reel that is its own scroller
     and must fill the sheet exactly. */
  bare = false,
  height,
  /* Reading sheets show how far through the piece you are. The bar is
     driven from this component because it owns the scrolling element. */
  progress = false,
  headRight = null,
  bodyRef: externalBodyRef = null,
}) {
  const [closing, setClosing] = useState(false);
  const sheetRef = useRef(null);
  const innerBodyRef = useRef(null);
  const bodyRef = externalBodyRef || innerBodyRef;
  const drag = useRef(null);
  const [prog, setProg] = useState(0);

  useScrollLock(true);

  /* One close path for all three exits: play the outward slide, then
     hand back to the caller.

     The guard is a ref, and the work happens outside the state updater.
     It was inside one — `setClosing(was => { …schedule onClose…; return
     true })` — which reads as a neat way to make the guard atomic, but a
     state updater must be pure: StrictMode calls it twice, so onClose
     fired twice, and since closing pops a history entry the phone went
     back two screens instead of one. */
  const closingRef = useRef(false);
  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    tap(6);
    setClosing(true);
    setTimeout(() => onClose?.(), reducedMotion() ? 0 : 280);
  }, [onClose]);

  // Escape, for anyone on a phone with a keyboard attached.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  /* ── Reading progress ──
     Scroll position over scrollable distance. Only wired up when asked
     for, so an ordinary sheet is not running a scroll listener for a bar
     it does not draw. */
  useEffect(() => {
    if (!progress) return;
    const el = bodyRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setProg(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [progress, bodyRef]);

  /* ── Drag ──
     Only from the grab handle and the header. Dragging from the body
     would fight the body's own scrolling, and resolving that fight
     correctly (only drag when already at scrollTop 0, only downward,
     release the claim if the direction reverses) is a great deal of
     state for a gesture the handle already affords clearly. */
  const onDragStart = useCallback((e) => {
    const t = e.touches ? e.touches[0] : e;
    drag.current = { y0: t.clientY, y: t.clientY, t0: performance.now(), moved: false };
    const el = sheetRef.current;
    if (el) el.classList.add('mb-sheet--drag');
  }, []);

  const onDragMove = useCallback((e) => {
    const d = drag.current;
    if (!d) return;
    const t = e.touches ? e.touches[0] : e;
    d.y = t.clientY;
    // Upward drag is resisted rather than blocked — a hard stop feels
    // broken, a rubber band feels like a limit.
    const raw = d.y - d.y0;
    const dy = raw < 0 ? raw * 0.22 : raw;
    if (Math.abs(raw) > 3) d.moved = true;
    const el = sheetRef.current;
    if (el) el.style.transform = `translate3d(0, ${dy}px, 0)`;
  }, []);

  const onDragEnd = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    const el = sheetRef.current;
    if (!d || !el) return;

    el.classList.remove('mb-sheet--drag');
    const dy = d.y - d.y0;
    const dt = Math.max(performance.now() - d.t0, 1);
    const v = dy / dt;
    const far = dy > el.offsetHeight * DISMISS_RATIO;

    if (far || v > FLICK_VELOCITY) {
      // Hand the rest of the journey back to the exit animation, which
      // starts from wherever the finger left it.
      el.style.transform = '';
      close();
      return;
    }
    // Springs home. The class is removed once it has arrived so a
    // subsequent drag is not fighting a transition.
    el.classList.add('mb-sheet--settle');
    el.style.transform = 'translate3d(0, 0, 0)';
    setTimeout(() => {
      el.classList.remove('mb-sheet--settle');
      el.style.transform = '';
    }, 360);
  }, [close]);

  const dragHandlers = {
    onTouchStart: onDragStart,
    onTouchMove: onDragMove,
    onTouchEnd: onDragEnd,
    onTouchCancel: onDragEnd,
  };

  return (
    <>
      <div
        className={`mb-scrim${closing ? ' mb-scrim--out' : ''}`}
        onClick={close}
        aria-hidden="true"
      />
      <section
        ref={sheetRef}
        className={`mb-sheet${full ? ' mb-sheet--full' : ''}${closing ? ' mb-sheet--out' : ''}`}
        style={height ? { '--sheet-h': height } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Panel'}
      >
        {progress && (
          <div className="mb-sheet-prog" aria-hidden="true">
            <i style={{ '--p': prog }} />
          </div>
        )}

        <div className="mb-sheet-grab" {...dragHandlers} aria-hidden="true"><i /></div>

        <header className="mb-sheet-head" {...dragHandlers}>
          <h2>{title}</h2>
          {headRight}
          <button className="mb-icon-btn mb-hit" onClick={close} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className={`mb-sheet-body${bare ? ' mb-sheet-body--bare' : ''}`} ref={bodyRef}>
          {children}
        </div>
      </section>
    </>
  );
}
