import { useState, useRef, useEffect, useCallback } from 'react';
import './ToolsArsenal.css';

/* ══════════════════════════════════════════════════════════════════════
   THE ARSENAL

   The tools card, opened up. Presented as a comic-book weapons locker
   because the card already called itself "Arsenal" and the site already
   runs the Deadpool motif through the contact section — so this is the
   existing joke paid off rather than a new one introduced.

   A dialog over the live page, not a full-screen takeover — the grid is
   still visible behind the scrim, so it reads as opening a drawer on the
   card rather than navigating away from it.

   The interaction it is built around: pick a weapon, it unsheathes with
   an onomatopoeia burst, and a narrator in a yellow caption box has
   something to say about your choice. Inspect all ten and the MAXIMUM
   EFFORT meter fills.

   Everything is CSS and state. No canvas, no physics engine, nothing
   that needs a frame loop — the whole thing idles at zero CPU until you
   touch it.
   ══════════════════════════════════════════════════════════════════════ */

const TOOLS = [
  {
    id: 'premiere', name: 'Premiere Pro', kind: 'THE WORKHORSE', years: 6, mastery: 95,
    sfx: 'KA-CHUNK', hue: 275, glyph: '▶',
    spec: 'Timeline surgery. Multicam. The thing that actually ships.',
    quote: 'Six years together. It has crashed on me more times than I have had hot dinners, and I still open it every single day. That is not a tool, that is a marriage.',
  },
  {
    id: 'resolve', name: 'DaVinci Resolve', kind: 'THE COLOURIST', years: 4, mastery: 88,
    sfx: 'SHNK', hue: 195, glyph: '◐',
    spec: 'Node trees, power windows, and making one camera match another.',
    quote: 'Where the footage stops looking like footage and starts looking like a film. Also where I lose four hours deciding a shot is 2% too warm.',
  },
  {
    id: 'ae', name: 'After Effects', kind: 'THE HEAVY', years: 5, mastery: 82,
    sfx: 'FWOOSH', hue: 240, glyph: '✦',
    spec: 'Motion graphics, cleanup, and the shots that were impossible in camera.',
    quote: 'Slow, expensive, absolutely essential. Like a katana that takes nine minutes to render each swing.',
  },
  {
    id: 'midjourney', name: 'Midjourney', kind: 'THE ORACLE', years: 3, mastery: 90,
    sfx: 'BLOOM', hue: 320, glyph: '❋',
    spec: 'Concept frames, moodboards, and worlds that do not exist yet.',
    quote: 'I describe a thing that has never been photographed and it hands me a photograph of it. Still not over it. Never will be.',
  },
  {
    id: 'comfy', name: 'ComfyUI', kind: 'THE MACHINE SHOP', years: 2, mastery: 76,
    sfx: 'CLANK', hue: 150, glyph: '⬢',
    spec: 'Node-based diffusion. Custom pipelines nobody else is running.',
    quote: 'Looks like a circuit diagram drawn by someone having a bad night. It is, and it is the most powerful thing on this page.',
  },
  {
    id: 'sd', name: 'Stable Diffusion', kind: 'THE LAB', years: 3, mastery: 80,
    sfx: 'ZAP', hue: 100, glyph: '◈',
    spec: 'Local models, LoRAs, and control over every step of the noise.',
    quote: 'Runs on my own machine, which means nobody can retire the model out from under me. Ask me how I learned that lesson.',
  },
  {
    id: 'react', name: 'React', kind: 'THE FRAME', years: 3, mastery: 84,
    sfx: 'SNAP', hue: 195, glyph: '⬡',
    spec: 'The whole site you are standing in. This overlay included.',
    quote: 'You are inside it right now. This caption box is a component. That is either very cool or deeply unsettling and I have decided it is cool.',
  },
  {
    id: 'python', name: 'Python', kind: 'THE FIXER', years: 4, mastery: 78,
    sfx: 'THWIP', hue: 55, glyph: '⟐',
    spec: 'Batch jobs, renaming 2,000 files, and gluing the pipeline together.',
    quote: 'Nobody hires a Python script. Everybody needs one. It is the guy who cleans up after the job and never gets a line in the credits.',
  },
  {
    id: 'gsap', name: 'GSAP', kind: 'THE CHOREOGRAPHER', years: 2, mastery: 74,
    sfx: 'WHIP', hue: 28, glyph: '↯',
    spec: 'Timelines and scroll triggers. Every move on this site that feels deliberate.',
    quote: 'The difference between a thing that animates and a thing that moves. Easing is acting. I will not be taking questions.',
  },
  {
    id: 'three', name: 'Three.js', kind: 'THE DIMENSION', years: 2, mastery: 68,
    sfx: 'WHOOM', hue: 355, glyph: '◉',
    spec: 'Shaders, 3D scenes, and the ID card that swings on a lanyard.',
    quote: 'Every hour I spend in here I understand light a little better, and my laptop fans understand suffering a little better.',
  },
];

/* The narrator. Reacts to what you actually did, so it reads as somebody
   watching rather than a rotating quote list. */
const OPENERS = [
  'Ten tools. One of them is emotionally load-bearing. Pick one and I will tell you which.',
  'Oh good, you clicked the tools card. Everybody scrolls past the tools card.',
  'Welcome to the locker. Nothing in here is sharp, but two of them have made me cry.',
];

const NAGS = [
  'Keep going. There is a meter and I know you can see it.',
  'You are three away. I can count. It is my one non-combat skill.',
  'Halfway. This is the part of the montage where the music changes.',
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function ToolsArsenal({ onBack }) {
  const [picked, setPicked] = useState(null);
  const [seen, setSeen] = useState(() => new Set());
  const [holes, setHoles] = useState([]);
  const [line, setLine] = useState(() => rand(OPENERS));
  const [burst, setBurst] = useState(null);
  const [party, setParty] = useState(false);
  const holeId = useRef(0);
  const shellRef = useRef(null);
  /* A counter rather than Date.now() for the burst key. Both change on
     every pick, but a clock read is an impure call and this is not. */
  const burstId = useRef(0);

  const pct = Math.round((seen.size / TOOLS.length) * 100);

  useEffect(() => {
    /* Escape closes outright. Clearing the selection first was a two-stage
       dismiss, which is a reasonable pattern for a full page and a
       surprising one for a popup — nothing here is a mode you need to back
       out of before you can leave. */
    const onKey = (e) => { if (e.key === 'Escape') onBack?.(); };
    window.addEventListener('keydown', onKey);

    // The page behind must not scroll under the dialog, same as the
    // warning stack.
    const scroller = document.getElementById('main-scroll');
    const prev = scroller?.style.overflowY;
    if (scroller) scroller.style.overflowY = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      if (scroller) scroller.style.overflowY = prev || 'auto';
    };
  }, [onBack]);

  const pick = (tool) => {
    setPicked(tool);
    // Retriggers the burst animation even on the same tool, because the
    // key changes and React remounts the node.
    burstId.current += 1;
    setBurst({ sfx: tool.sfx, hue: tool.hue, k: burstId.current });

    const next = new Set(seen);
    const isNew = !next.has(tool.id);
    next.add(tool.id);
    setSeen(next);

    if (next.size === TOOLS.length && isNew) {
      setParty(true);
      setLine('All ten. You actually did it. I had a speech prepared and now I am too moved to give it.');
      return;
    }
    if (isNew && next.size >= 4 && next.size % 3 === 0) { setLine(rand(NAGS)); return; }
    setLine(tool.quote);
  };

  /* Bullet holes where you click the backdrop. Positioned against the
     dialog rather than the viewport, so they stay inside the panel now
     that this is a popup and not a full-screen page. Capped at twelve
     with the oldest dropped, so a determined clicker cannot fill the
     DOM. */
  const shoot = useCallback((e) => {
    if (e.target.closest('.ta-weapon, .ta-panel, .ta-chrome, .ta-caption')) return;
    const box = shellRef.current?.getBoundingClientRect();
    if (!box) return;
    const id = holeId.current++;
    setHoles((h) => [...h.slice(-11), { id, x: e.clientX - box.left, y: e.clientY - box.top }]);
  }, []);

  return (
    <div className="ta-scrim" role="dialog" aria-modal="true" aria-label="The Arsenal">
      {/* Click-away close. A button so it is reachable without a pointer. */}
      <button className="ta-scrim-hit" onClick={onBack} aria-label="Close" tabIndex={-1} />

      <div className="ta-root" ref={shellRef} onPointerDown={shoot}>
      {/* Comic ground: halftone dots over speed lines. */}
      <div className="ta-halftone" aria-hidden="true" />
      <div className="ta-speed" aria-hidden="true" />

      {holes.map((h) => (
        <span key={h.id} className="ta-hole" style={{ left: h.x, top: h.y }} aria-hidden="true" />
      ))}

      {party && (
        <div className="ta-party" aria-hidden="true">
          {Array.from({ length: 22 }, (_, i) => (
            <span key={i} className="ta-taco" style={{ '--i': i, '--d': `${(i % 7) * 0.28}s` }}>🌮</span>
          ))}
        </div>
      )}

      <header className="ta-chrome">
        <button className="ta-back" onClick={onBack} aria-label="Close the arsenal">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
               strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="ta-title-wrap">
          <span className="ta-kicker">Issue #1 · The Loadout</span>
          <h1 className="ta-title">THE ARSENAL</h1>
        </div>

        {/* The completion meter, which is also the nag. */}
        <div className="ta-meter" aria-label={`Inspected ${seen.size} of ${TOOLS.length}`}>
          <span className="ta-meter-label">MAXIMUM EFFORT</span>
          <span className="ta-meter-track">
            <i style={{ width: `${pct}%` }} className={pct === 100 ? 'is-full' : ''} />
          </span>
          <span className="ta-meter-num">{seen.size}/{TOOLS.length}</span>
        </div>
      </header>

      {/* Fourth-wall caption box, the yellow one from the comics. */}
      <div className="ta-caption" key={line}>
        <span className="ta-caption-tab">NARRATOR</span>
        <p>{line}</p>
      </div>

      <div className="ta-body">
        {/* ── The rack ── */}
        <div className="ta-rack" role="list">
          {TOOLS.map((t, i) => (
            <button
              key={t.id}
              role="listitem"
              className={`ta-weapon${picked?.id === t.id ? ' is-picked' : ''}${seen.has(t.id) ? ' is-seen' : ''}`}
              style={{ '--h': t.hue, '--i': i }}
              onClick={() => pick(t)}
              aria-pressed={picked?.id === t.id}
            >
              <span className="ta-weapon-glyph" aria-hidden="true">{t.glyph}</span>
              <span className="ta-weapon-name">{t.name}</span>
              <span className="ta-weapon-kind">{t.kind}</span>
              <span className="ta-weapon-yrs">{t.years}<em>yr</em></span>
              {seen.has(t.id) && <span className="ta-weapon-tick" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>

        {/* ── The detail panel ── */}
        <aside className={`ta-panel${picked ? ' is-open' : ''}`} style={{ '--h': picked?.hue ?? 355 }}>
          {picked ? (
            <>
              {burst && (
                <span key={burst.k} className="ta-burst" aria-hidden="true">{burst.sfx}!</span>
              )}

              <span className="ta-panel-kind">{picked.kind}</span>
              <h2 className="ta-panel-name">{picked.name}</h2>
              <p className="ta-panel-spec">{picked.spec}</p>

              <div className="ta-stat">
                <span className="ta-stat-row">
                  <span>MASTERY</span><b>{picked.mastery}%</b>
                </span>
                {/* Keyed on the tool so the fill replays on every pick. */}
                <span className="ta-stat-track" key={picked.id}>
                  <i style={{ '--to': `${picked.mastery}%` }} />
                </span>
              </div>

              <div className="ta-stat">
                <span className="ta-stat-row">
                  <span>YEARS WIELDED</span><b>{picked.years}</b>
                </span>
                <span className="ta-pips" aria-hidden="true">
                  {Array.from({ length: 6 }, (_, i) => (
                    <i key={i} className={i < picked.years ? 'is-on' : ''} />
                  ))}
                </span>
              </div>

              <blockquote className="ta-bubble">{picked.quote}</blockquote>
            </>
          ) : (
            <div className="ta-panel-empty">
              <span aria-hidden="true">☜</span>
              <p>Pick something off the rack.</p>
              <small>Or click the background. I put bullet holes in it. You are welcome.</small>
            </div>
          )}
        </aside>
      </div>
      </div>
    </div>
  );
}
