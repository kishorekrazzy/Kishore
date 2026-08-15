import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useContent } from './content/store';
import './TimelineCalendar.css';

/* ══════════════════════════════════════════════════════════════════════
   TIMELINE

   Opened by the island's logo button. A real calendar with a scrapbook
   dropped on top of it: eight photographs at three sizes, every one of
   which can be dragged anywhere on the board.

   There is no backdrop image — the page behind is simply blurred, so the
   board reads as glass laid over the site rather than a second scene
   pasted on top of it.

   The calendar itself is the one thing that does not move — you are meant
   to read it. Pick any day and it tells you what happened. Before the
   first entry in the timeline it refuses, in character.

   Dates are handled in local time throughout. Building them from
   `new Date(y, m, d)` rather than parsing an ISO string avoids the UTC
   shift that makes a date land on the previous day west of Greenwich.
   ══════════════════════════════════════════════════════════════════════ */

const EPOCH = { y: 2004, m: 1, d: 4 };          // 4 Feb 2004 — month is 0-based
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const key = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const beforeEpoch = (y, m, d) =>
  new Date(y, m, d) < new Date(EPOCH.y, EPOCH.m, EPOCH.d);

/* Where each photograph starts, how big, and whether it wears a mat.
   Percentages, so the arrangement survives a resize; the drag adds an
   offset on top rather than replacing them. */
const PIECES = [
  { id: 's1', shot: 0, size: 'lg', x: '5%',  y: '17%', rot: -6, ar: '4 / 5', mat: true  },
  { id: 's2', shot: 1, size: 'sm', x: '25%', y: '6%',  rot: 5,  ar: '1 / 1', mat: false },
  { id: 's3', shot: 2, size: 'md', x: '11%', y: '60%', rot: 3,  ar: '1 / 1', mat: true  },
  { id: 's4', shot: 3, size: 'sm', x: '34%', y: '76%', rot: -8, ar: '3 / 4', mat: false },
  { id: 's5', shot: 4, size: 'lg', x: '71%', y: '20%', rot: 6,  ar: '3 / 4', mat: false },
  { id: 's6', shot: 5, size: 'md', x: '78%', y: '58%', rot: -4, ar: '4 / 5', mat: true  },
  { id: 's7', shot: 6, size: 'sm', x: '62%', y: '5%',  rot: -9, ar: '1 / 1', mat: false },
  { id: 's8', shot: 7, size: 'md', x: '55%', y: '76%', rot: 7,  ar: '16 / 10', mat: false },
];

const VOID_LINES = [
  'You are not in this timeline yet. Come back after February 2004.',
  'Nothing here. I had not been invented.',
  'This day predates me. Bold of you to check.',
  'Empty. The universe was still buffering.',
  'No record — I was busy not existing.',
];

/* A sticker holds its own position and reports upward only when grabbed,
   so dragging one does not re-render the other eleven. */
function Sticker({ id, className, style, z, onGrab, children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [held, setHeld] = useState(false);
  const from = useRef(null);

  const down = (e) => {
    // Let a click through to anything interactive inside the sticker.
    if (e.target.closest('button, a, input')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    from.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    setHeld(true);
    onGrab(id);
  };
  const move = (e) => {
    if (!from.current) return;
    setPos({
      x: from.current.ox + (e.clientX - from.current.sx),
      y: from.current.oy + (e.clientY - from.current.sy),
    });
  };
  const up = (e) => {
    if (!from.current) return;
    from.current = null;
    setHeld(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className={`tl-st ${className}${held ? ' is-held' : ''}`}
      style={{ ...style, zIndex: z, '--dx': `${pos.x}px`, '--dy': `${pos.y}px` }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      {children}
    </div>
  );
}

export default function TimelineCalendar({ onClose }) {
  const copy = useContent('timeline', {});
  const shots = useContent('images.timeline', []);
  const entries = useContent('timeline.entries', []);

  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [picked, setPicked] = useState(null);
  const topZ = useRef(20);
  const [order, setOrder] = useState({});
  /* Which refusal to show is decided when a day is clicked and then held,
     so the line does not change under you on an unrelated re-render. */
  const [voidLine, setVoidLine] = useState(VOID_LINES[0]);
  const spin = useRef(0);

  /* Entries are a list in the CMS but a lookup here, so a day cell can ask
     "is there anything on me?" without scanning it every render. */
  const byDate = useMemo(() => {
    const map = {};
    for (const e of entries) if (e?.date) map[e.date] = e;
    return map;
  }, [entries]);

  const bump = useCallback((id) => {
    topZ.current += 1;
    setOrder((o) => ({ ...o, [id]: topZ.current }));
  }, []);

  const step = useCallback((n) => setView((v) => {
    const d = new Date(v.y, v.m + n, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  }), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose?.(); return; }
      if (e.key === 'ArrowLeft')  step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    // The page behind must not scroll while this is up.
    const sc = document.getElementById('main-scroll');
    const prev = sc?.style.overflowY;
    if (sc) sc.style.overflowY = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      if (sc) sc.style.overflowY = prev || 'auto';
    };
  }, [onClose, step]);

  const grid = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    // getDay() is Sunday-first; this calendar starts on Monday.
    const lead = (first.getDay() + 6) % 7;
    const days = new Date(view.y, view.m + 1, 0).getDate();
    return [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  }, [view]);

  const pick = (d) => {
    if (!d) return;
    const k = key(view.y, view.m, d);
    if (beforeEpoch(view.y, view.m, d)) {
      spin.current += 1;
      setVoidLine(VOID_LINES[spin.current % VOID_LINES.length]);
      setPicked({ k, d, void: true });
      return;
    }
    setPicked({ k, d, entry: byDate[k] });
  };

  const surprise = () => {
    const keys = Object.keys(byDate);
    if (!keys.length) return;
    const k = keys[Math.floor(Math.random() * keys.length)];
    const [y, m, d] = k.split('-').map(Number);
    setView({ y, m: m - 1 });
    setPicked({ k, d, entry: byDate[k] });
  };

  const jumpToday = () => {
    setView({ y: today.getFullYear(), m: today.getMonth() });
    const k = key(today.getFullYear(), today.getMonth(), today.getDate());
    setPicked({ k, d: today.getDate(), entry: byDate[k] });
  };

  const isToday = (d) =>
    d && view.y === today.getFullYear() && view.m === today.getMonth() && d === today.getDate();

  const z = (id, base) => order[id] ?? base;

  return (
    <div className="tl" role="dialog" aria-modal="true" aria-label="Timeline">
      {/* Right-hand close, as asked — the one control that is always in
          the same place whatever you have dragged where. */}
      <button className="tl-x" onClick={onClose} aria-label="Close the timeline">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      <div className="tl-board">
        {/* ── The calendar — the one thing pinned down ── */}
        <div className="tl-cal">
          <header className="tl-cal-top">
            <button className="tl-nav" onClick={() => step(-1)} aria-label="Previous month">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
              {view.y}
            </button>
            <div className="tl-cal-tools">
              <button onClick={jumpToday} title="Jump to today">Today</button>
              <button onClick={surprise} title="Open a random memory">Surprise me</button>
              <button className="tl-nav-r" onClick={() => step(1)} aria-label="Next month">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </header>

          <h2 className="tl-month">{MONTHS[view.m]}</h2>

          <div className="tl-dow" aria-hidden="true">
            {DOW.map((d, i) => <span key={i}>{d}</span>)}
          </div>

          <div className="tl-grid">
            {grid.map((d, i) => {
              if (!d) return <span key={`x${i}`} className="tl-day is-empty" />;
              const k = key(view.y, view.m, d);
              const has = !!byDate[k];
              const gone = beforeEpoch(view.y, view.m, d);
              return (
                <button
                  key={k}
                  className={`tl-day${has ? ' has-note' : ''}${gone ? ' is-void' : ''}${isToday(d) ? ' is-today' : ''}${picked?.k === k ? ' is-picked' : ''}`}
                  onClick={() => pick(d)}
                  aria-label={`${d} ${MONTHS[view.m]} ${view.y}${has ? ' — has a note' : ''}`}
                >
                  {d}
                  {has && <i className="tl-dot" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <footer className="tl-cal-foot">
            <span>{Object.keys(byDate).length} days written</span>
            <span>Since {EPOCH.d} Feb {EPOCH.y}</span>
          </footer>
        </div>

        {/* ── The note for whatever day is picked ── */}
        {picked && (
          <div className={`tl-note${picked.void ? ' is-void' : ''}`} key={picked.k}>
            <button className="tl-note-x" onClick={() => setPicked(null)} aria-label="Close note">✕</button>
            <span className="tl-note-date">{picked.d} {MONTHS[view.m]} {view.y}</span>
            {picked.void ? (
              <>
                <strong>404 — timeline not found</strong>
                <p>{voidLine}</p>
              </>
            ) : picked.entry ? (
              <>
                <strong>{picked.entry.title}</strong>
                <p>{picked.entry.note}</p>
              </>
            ) : (
              <>
                <strong>{copy.blankTitle || 'Nothing written'}</strong>
                <p>{copy.blankNote || 'An ordinary day. Most of them are — that is rather the point.'}</p>
              </>
            )}
          </div>
        )}

        {/* ── The scrapbook. Everything below here drags. ──
            Three sizes, alternating between a bare rounded print and one
            with a white mat, so the board has a hierarchy instead of eight
            identical squares. */}
        {PIECES.map((piece, i) => shots[piece.shot] && (
          <Sticker
            key={piece.id}
            id={piece.id}
            className={`tl-shot tl-shot--${piece.size}${piece.mat ? ' is-mat' : ''}`}
            z={z(piece.id, 6 + i)}
            onGrab={bump}
            style={{ '--x': piece.x, '--y': piece.y, '--rot': `${piece.rot}deg`, '--ar': piece.ar }}
          >
            <img src={shots[piece.shot]} alt="" draggable="false" loading="lazy" />
            {piece.mat && (copy.captions || [])[i] && (
              <span className="tl-shot-cap">{(copy.captions || [])[i]}</span>
            )}
          </Sticker>
        ))}

        <Sticker id="badge" className="tl-badge" z={z('badge', 18)} onGrab={bump}
                 style={{ '--x': '42%', '--y': '13%', '--rot': '-7deg' }}>
          {MONTHS[view.m]}
        </Sticker>
      </div>

      <p className="tl-hint">
        Drag anything except the calendar · ← → to change month · Esc to close
      </p>
    </div>
  );
}
