import { useEffect, useRef, useState, useCallback } from 'react';
import './WarningStack.css';
import { useContent } from './content/store';

/* ══════════════════════════════════════════════════════════════════════
   WARNING STACK

   The ⚠️ button in the island opens this: a stack of overlapping white
   browser windows over a dark scrim, then a macOS alert on top. Pressing OK
   minimises the whole thing — every window shrinks back toward the
   button it came from — and unmounts.

   Layout is authored, not random. Each window has a fixed position,
   rotation and depth so the composition reads the same every time
   instead of occasionally piling up in one corner.
   ══════════════════════════════════════════════════════════════════════ */

// x/y are percentages of the viewport, w is a vmin-based width.
/* Overlapping on purpose — each window sits partly on the one before it,
   the way the reference stacks them, rather than tiling with gaps. */
const WINDOWS = [
  { x: 16, y:  7, w: 38, rot: -4,   z: 2, kind: 'feed'   },
  { x: 30, y:  3, w: 40, rot:  2,   z: 4, kind: 'map'    },
  { x: 44, y: 10, w: 37, rot: -2.5, z: 6, kind: 'poster' },
  { x: 19, y: 31, w: 36, rot:  3,   z: 3, kind: 'plain'  },
  { x: 33, y: 37, w: 39, rot: -1.5, z: 8, kind: 'video'  },
  { x: 47, y: 42, w: 34, rot:  4,   z: 5, kind: 'plain'  },
];

function TrafficLights() {
  return (
    <span className="ws-lights" aria-hidden="true">
      <i className="ws-light ws-light--r" />
      <i className="ws-light ws-light--y" />
      <i className="ws-light ws-light--g" />
    </span>
  );
}

export default function WarningStack({ onClose }) {
  const copy   = useContent('warning', {});
  const tabs   = copy.tabs || [];
  const plates = useContent('images.warning', []);

  const [closing, setClosing] = useState(false);
  const okRef    = useRef(null);
  const closedRef = useRef(false);

  // One exit path, however it is triggered, so a double-press cannot fire
  // the unmount timer twice.
  const dismiss = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    setClosing(true);
    setTimeout(() => onClose?.(), 460);
  }, [onClose]);

  useEffect(() => {
    okRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    // The page behind must not scroll while this is up.
    const scroller = document.getElementById('main-scroll');
    const prev = scroller?.style.overflowY;
    if (scroller) scroller.style.overflowY = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      if (scroller) scroller.style.overflowY = prev || 'auto';
    };
  }, [dismiss]);

  return (
    <div
      className={`ws${closing ? ' ws--closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ws-title"
    >
      <button className="ws-scrim" onClick={dismiss} aria-label="Dismiss" tabIndex={-1} />

      {WINDOWS.map((win, i) => {
        const tab = tabs[i] || {};
        return (
          <div
            key={i}
            className={`ws-win ws-win--${win.kind}`}
            style={{
              left: `${win.x}%`,
              top: `${win.y}%`,
              width: `${win.w}vmin`,
              zIndex: win.z,
              '--rot': `${win.rot}deg`,
              '--i': i,
            }}
            aria-hidden="true"
          >
            <div className="ws-bar">
              <TrafficLights />
              <span className="ws-navs" aria-hidden="true">
                <i className="ws-chev ws-chev--l" />
                <i className="ws-chev ws-chev--r" />
              </span>
              <span className="ws-url">
                <i className="ws-lock" aria-hidden="true" />
                {tab.url || 'about:blank'}
              </span>
              <span className="ws-plus" aria-hidden="true">+</span>
            </div>

            <div className="ws-body">
              {plates[i] && <img src={plates[i]} alt="" loading="lazy" draggable="false" />}
              <span className="ws-scan" />

              {win.kind === 'poster' && <span className="ws-stamp">WANTED</span>}
              {win.kind === 'video'  && <span className="ws-play" />}
              {win.kind === 'map'    && (
                <svg className="ws-route" viewBox="0 0 200 120" fill="none" aria-hidden="true">
                  <path d="M18 104 C 60 96, 52 54, 96 48 S 150 34, 178 16"
                        stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="7 6" />
                  <circle cx="178" cy="16" r="7" fill="currentColor" />
                </svg>
              )}
              {win.kind === 'feed' && (
                <span className="ws-rows">
                  <i /><i /><i /><i />
                </span>
              )}

              {tab.caption && <span className="ws-cap">{tab.caption}</span>}
            </div>
          </div>
        );
      })}

      {/* ── The alert ── */}
      <div className="ws-alert" style={{ '--i': WINDOWS.length }}>
        <div className="ws-alert-mark" aria-hidden="true">⚠️</div>
        <h2 className="ws-alert-title" id="ws-title">
          {copy.dialogTitle || 'Unsecured Connection'}
        </h2>
        <p className="ws-alert-body">
          {copy.dialogBody
            || 'Someone has been reading this portfolio for an unusual length of time.'}
        </p>
        <button ref={okRef} className="ws-ok" onClick={dismiss}>
          {copy.okLabel || 'OK'}
        </button>
      </div>
    </div>
  );
}
