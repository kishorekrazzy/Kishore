import { useState, useRef, useEffect, useCallback } from 'react';
import './DynamicIsland.css';
import ThemeToggle from './ThemeToggle';
import { useContent } from './content/store';

/* ══════════════════════════════════════════════════════════════════════
   DYNAMIC ISLAND NAV

   Collapsed it is a pill: the K mark, a live dot, and the name of the
   section you are currently in. Hover (or focus, or tap on touch) and it
   morphs open into the full nav, then settles back.

   The section name rolls over like a split-flap board whenever scrolling
   moves you into a new section — see RollingText below.
   ══════════════════════════════════════════════════════════════════════ */

// Spy targets, in document order. These are selectors rather than ids on
// purpose: every section already carries one, so the island can name all
// of them without adding markup to eight other files.
const SECTIONS = [
  { sel: '.hue-hero',   label: 'Home',        hue: 'hero'    },
  { sel: '#about',      label: 'About',       hue: 'about'   },
  { sel: '#team',       label: 'Syndicate',   hue: 'team'    },
  { sel: '#work',       label: 'Work',        hue: 'bento'   },
  { sel: '.bn-section', label: 'Showcase',    hue: 'banner'  },
  { sel: '#notes',      label: 'Notes',       hue: 'notes'   },
  { sel: '.wg-section', label: 'Personal OS', hue: 'mind'    },
  { sel: '#contact',    label: 'Contact',     hue: 'contact' },
];

/* The logo that replaced the K. Any GIF (or SVG/PNG) URL drops straight
   in here — remote or something in public/. If it fails to load the mark
   falls back to the letter, so a bad URL never leaves a broken image in
   the nav. */
const DEFAULT_LOGO = '/nLogo.svg';

const DEFAULT_LINKS = [
  { href: '#work',     label: 'Work'     },
  { href: '#projects', label: 'Projects' },
  { href: '#about',    label: 'About'    },
  { href: '#contact',  label: 'Contact'  },
];

// How far down the viewport the "you are here" line sits. A section counts
// as current once its top crosses this, which is what makes the label flip
// as the section header reaches reading position rather than at the very
// moment its first pixel appears.
const SPY_LINE = 0.35;

const ROLL_MS = 900;

/* ── Split-flap label ──────────────────────────────────────────────────
   Each character is a window with a two-cell column behind it: the old
   glyph, then the new one. Rolling is the column sliding up exactly one
   cell, staggered per character so the word turns over left to right.

   When idle both cells hold the same text, so the resting state is just
   the word — no special case needed. */
function RollingText({ text }) {
  const prevRef = useRef(text);
  const idRef   = useRef(0);
  const [roll, setRoll] = useState(null);

  useEffect(() => {
    const from = prevRef.current;
    if (from === text) return;
    prevRef.current = text;
    idRef.current += 1;
    const id = idRef.current;
    setRoll({ from, id });
    // Drop back to the idle single-cell render once the flaps have landed.
    const t = setTimeout(() => setRoll((r) => (r && r.id === id ? null : r)), ROLL_MS);
    return () => clearTimeout(t);
  }, [text]);

  const from = roll ? roll.from : text;
  const len  = Math.max(from.length, text.length);
  const pad  = (s) => s.padEnd(len, ' ');
  const a    = pad(from);
  const b    = pad(text);

  return (
    // Remounting on every roll is what restarts the CSS animation.
    <span
      key={roll ? roll.id : 'idle'}
      className={`di-roll${roll ? ' di-roll--go' : ''}`}
      aria-label={text}
      role="status"
    >
      {Array.from({ length: len }, (_, i) => (
        <span className="di-roll-ch" key={i} style={{ '--i': i }} aria-hidden="true">
          <span className="di-roll-col">
            <span>{a[i]}</span>
            <span>{b[i]}</span>
          </span>
        </span>
      ))}
    </span>
  );
}

// ── COMPONENT ────────────────────────────────────────────────────────
export default function DynamicIsland({ onRoomClick }) {
  const LOGO_SRC = useContent('nav.logo',  DEFAULT_LOGO);
  const LINKS    = useContent('nav.links', DEFAULT_LINKS);

  const [section, setSection] = useState(SECTIONS[0]);
  const [badLogo, setBadLogo] = useState(null);
  const logoOk = Boolean(LOGO_SRC) && badLogo !== LOGO_SRC;

  /* Two states, derived rather than stored, so they cannot disagree:

       pinned   clicking the logo — stays open as a plain nav bar
       hover    open for as long as the pointer (or focus) is on it

     With neither true it is the resting pill: mark, live dot, and the
     section you are in. Scrolling does not change the size at all — it
     only rolls the section name over. */
  const [pinned, setPinned] = useState(false);
  const [hover, setHover]   = useState(false);

  const open = pinned || hover;

  // ── Scroll spy ──
  // Reads geometry on a rAF tick rather than per scroll event, and only
  // writes state when the answer actually changes, so a full-page scroll
  // costs a handful of renders rather than hundreds.
  useEffect(() => {
    const scroller = document.getElementById('main-scroll');
    if (!scroller) return;

    let frame = null;

    const measure = () => {
      frame = null;
      const line = window.innerHeight * SPY_LINE;
      let current = SECTIONS[0];
      for (const entry of SECTIONS) {
        const el = document.querySelector(entry.sel);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = entry;
      }
      setSection((s) => (s === current ? s : current));
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };

    measure();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  const enter = useCallback(() => setHover(true), []);
  const leave = useCallback(() => setHover(false), []);

  // Clicking the mark pins it open as an ordinary nav bar. Clicking again
  // releases it. This is also the only way in on touch, which never hovers.
  const togglePin = useCallback(() => setPinned((p) => !p), []);

  // Following a link should always put it away again.
  const dismiss = useCallback(() => { setPinned(false); setHover(false); }, []);

  // Keyboard has to drive the same state, not just the :focus-within CSS —
  // the links are tabIndex={-1} while closed, so without this a keyboard
  // user would open the island by tabbing to the mark and then tab
  // straight past every link inside it.
  const onBlurCapture = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setHover(false);
  }, []);

  return (
    <nav
      className={`di${open ? ' di--open' : ''}${pinned ? ' di--pinned' : ''}`}
      role="navigation"
      aria-label="Primary navigation"
      /* data-hue is what recolours the island: theme.css maps it to --h,
         and lists .di in its hue-scope block so --acc / --acc-ink /
         --acc-glow recompose against the current section instead of
         inheriting the hero's already-resolved amber.

         It is an attribute rather than an inline --h on purpose. An inline
         custom property outranks every selector, so the light theme could
         not override the one section whose hue is theme-dependent. */
      data-hue={section.hue}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={onBlurCapture}
    >
      <div className="di-pill">

        {/* Always visible, both states */}
        <button
          className="di-mark"
          onClick={togglePin}
          aria-expanded={open}
          aria-pressed={pinned}
          aria-label={pinned
            ? 'Unpin navigation'
            : `Current section: ${section.label}. Pin navigation open`}
        >
          {logoOk
            ? <img src={LOGO_SRC} alt="" draggable="false" onError={() => setBadLogo(LOGO_SRC)} />
            : 'K'}
        </button>

        {/* Collapsed face — live dot + rolling section name */}
        <div className="di-now" aria-hidden={open ? 'true' : undefined}>
          <span className="di-dot" aria-hidden="true" />
          <RollingText text={section.label} />
        </div>

        {/* Expanded face — the actual nav */}
        <ul className="di-nav">
          {LINKS.map(({ href, label }) => (
            <li key={label}>
              <a href={href} id={`nav-${label.toLowerCase()}`} onClick={dismiss} tabIndex={open ? 0 : -1}>
                {label}
              </a>
            </li>
          ))}
          <li>
            <button
              className="di-room"
              onClick={() => { dismiss(); onRoomClick?.(); }}
              tabIndex={open ? 0 : -1}
            >
              Room
            </button>
          </li>
          <li className="di-theme"><ThemeToggle /></li>
        </ul>

      </div>
    </nav>
  );
}
