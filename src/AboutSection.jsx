import { useRef, useEffect, useCallback, useState } from 'react';
import './AboutSection.css';
import { useContent } from './content/store';
import { showSpidey, hideSpidey } from './spideyBus';

// ── DATA ────────────────────────────────────────────────────────────────────

const DEFAULT_PARAGRAPHS = [
  "I'm Kish — an AI-driven video editor and visual storyteller who engineers cinematic experiences that leave a lasting imprint on every screen they touch.",
  "Armed with cutting-edge AI tools and a decade of intuition honed in the dark, I bridge the gap between raw human creativity and machine intelligence — frame by frame, pixel by pixel.",
  "From viral short-form content to full cinematic edits, every project I touch becomes a visual signature — precisely crafted, emotionally resonant, and technically flawless.",
];

const DEFAULT_CARDS = [
  { src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80&auto=format&fit=crop', label: 'Identity',  alt: 'Portrait'       },
  { src: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80&auto=format&fit=crop', label: 'Workspace', alt: 'Editing setup'   },
  { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80&auto=format&fit=crop', label: 'Visual',   alt: 'Cinematic frame' },
];

// Two more rows that only exist once the stack has aligned — one above the
// original three, one below. They flicker in rather than sliding, so the
// grid reads as a contact sheet switching on rather than more cards moving.
// row: -1 sits above the original line, +1 below. col indexes across.
const DEFAULT_EXTRA_CARDS = [
  { src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80&auto=format&fit=crop', label: 'Frame',   alt: 'Camera on set',        row: -1, col: 0 },
  { src: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80&auto=format&fit=crop', label: 'Signal',  alt: 'Studio monitor',       row: -1, col: 1 },
  { src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&auto=format&fit=crop', label: 'Machine', alt: 'Circuit detail',       row: -1, col: 2 },
  { src: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80&auto=format&fit=crop', label: 'Grade',   alt: 'Colour-graded still',  row:  1, col: 0 },
  { src: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=600&q=80&auto=format&fit=crop', label: 'Motion',  alt: 'Long-exposure motion', row:  1, col: 1 },
  { src: 'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?w=600&q=80&auto=format&fit=crop', label: 'Archive', alt: 'Film archive',         row:  1, col: 2 },
];

const DEFAULT_STATS = [
  { value: '5+',   label: 'Years Active'       },
  { value: '200+', label: 'Projects Completed'  },
  { value: '1M+',  label: 'Views Generated'     },
];

// Words that show a cursor popup → image src
const POPUP_MAP = {
  'Kish':      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=360&q=80&auto=format&fit=crop',
  'AI-driven': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=360&q=80&auto=format&fit=crop',
  'cinematic': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=360&q=80&auto=format&fit=crop',
};

// Original stacked / spread transforms
const TRANSFORMS = [
  { stack: { x:  8, y:  8, r:  4, s: 0.93 }, spread: { x: -100, y: -30, r: -8, s: 1.00 } },
  { stack: { x:  4, y:  4, r: -2, s: 0.96 }, spread: { x:    0, y:  45, r:  2, s: 1.03 } },
  { stack: { x:  0, y:  0, r:  0, s: 1.00 }, spread: { x:   92, y: -18, r:  8, s: 0.97 } },
];

// Static particles (generated once)
const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id:      i,
  x:       Math.sin(i * 137.5) * 50 + 50,
  y:       Math.cos(i * 137.5) * 50 + 50,
  size:    0.8 + (i % 4) * 0.6,
  dur:     7 + (i % 5) * 2,
  delay:   i * 0.5,
  opacity: 0.12 + (i % 3) * 0.1,
}));

// ── PURE HELPERS ────────────────────────────────────────────────────────────

function cardTransform(i, mx, my, spread) {
  const cfg   = spread ? TRANSFORMS[i].spread : TRANSFORMS[i].stack;
  const depth = (i + 1) * 6;
  return `translate(${cfg.x + mx * depth}px, ${cfg.y + my * depth}px) rotate(${cfg.r}deg) scale(${cfg.s})`;
}

/* Positions for the aligned 3×3 grid.
   Returns a lookup: at(row, col) → transform parts. row 0 is the original
   line, -1 the row above, +1 the row below.

   Sizing note. Fitting three rows of 350px cards strictly inside the
   480px panel forced a 0.41 scale, which came out postage-stamp sized.
   The cards are absolutely positioned, though, so the grid can spill past
   the panel without moving a single thing on the page — the panel's own
   height is what holds the layout, not the cards inside it.

   So both axes are allowed to overrun deliberately:
     height  up to 1.35× the panel, ≈84px above and below at full size
     width   the column plus 60px, borrowed from the 88px gutter beside it

   Neither reaches the bio text on the right or the edge of the section.
   That buys 149×208 cards on desktop instead of 102×143. The 0.60 cap
   stops the grid ballooning when the column goes full-width below 960px. */
const GAP = 12;
const CARD_W = 250;
const CARD_H = 350;
const ROWS = 3;
const MAX_SCALE = 0.60;
const GUTTER_BORROW = 60;
const HEIGHT_OVERRUN = 1.35;

function calcGridTransforms(containerW, containerH) {
  const cols    = DEFAULT_CARDS.length;
  const usableW = Math.min(containerW + GUTTER_BORROW, 620);
  const usableH = Math.max(containerH * HEIGHT_OVERRUN, 240);
  const scale   = Math.min(
    (usableW - (cols - 1) * GAP) / (cols * CARD_W),
    (usableH - (ROWS - 1) * GAP) / (ROWS * CARD_H),
    MAX_SCALE,
  );
  const stepX = CARD_W * scale + GAP;
  const stepY = CARD_H * scale + GAP;
  return (row, col) => ({ x: (col - 1) * stepX, y: row * stepY, r: 0, s: scale });
}

// ── COMPONENT ────────────────────────────────────────────────────────────────

export default function AboutSection() {
  // Content-managed. The consts above are the fallbacks.
  const PARAGRAPHS  = useContent('about.paragraphs', DEFAULT_PARAGRAPHS);
  const CARDS       = useContent('about.cards',      DEFAULT_CARDS);
  const EXTRA_CARDS = useContent('about.extraCards', DEFAULT_EXTRA_CARDS);
  const STATS       = useContent('about.stats',      DEFAULT_STATS);
  const eyebrow     = useContent('about.eyebrow',    '— About Me');
  const heading     = useContent('about.heading',    ['Crafting', 'Visual', 'Realities']);
  const ctaLabel    = useContent('about.cta',        'See My Work');
  const hoverHint   = useContent('about.hoverHint',  'Hover to align');

  const sectionRef  = useRef(null);
  const leftRef     = useRef(null);
  const cardRefs    = useRef([]);
  const extraRefs   = useRef([]);
  const spreadRef   = useRef(false);
  const lineRef     = useRef(false);
  const mouseRef    = useRef({ x: 0, y: 0 });
  const revealedRef = useRef(false);
  const popupRef    = useRef(null);

  /* Which of the nine grid images is selected, as an index into ALL_CARDS
     (the three stack cards then the six reveal cards). null means the
     section shows its own copy. */
  const [activeIdx, setActiveIdx] = useState(null);
  const ALL_CARDS = [...CARDS, ...EXTRA_CARDS];
  const active = activeIdx === null ? null : ALL_CARDS[activeIdx];

  const pickCard = useCallback((i) => {
    // Clicking the selected image again returns to the section copy.
    setActiveIdx((cur) => (cur === i ? null : i));
  }, []);

  const [popupSrc,     setPopupSrc]     = useState('');
  const [popupVisible, setPopupVisible] = useState(false);

  // Initial stacked transforms
  useEffect(() => {
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      card.style.transform = cardTransform(i, 0, 0, false);
    });
    // Extras start collapsed behind the stack, matching where they return
    // to on leave — so the first open looks the same as every one after.
    extraRefs.current.forEach((card) => {
      if (card) card.style.transform = 'translate(0px, 0px) rotate(0deg) scale(0.82)';
    });
  }, []);

  // IntersectionObserver — reveal + spread on scroll into view
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !revealedRef.current) {
            revealedRef.current = true;
            spreadRef.current   = true;
            section.classList.add('abt-revealed');

            const { x: mx, y: my } = mouseRef.current;
            cardRefs.current.forEach((card, i) => {
              if (!card) return;
              setTimeout(() => {
                if (!lineRef.current) {
                  card.style.transform = cardTransform(i, mx, my, true);
                }
              }, i * 160);
            });
          }
        });
      },
      { threshold: 0.12 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* ── Spidey ─────────────────────────────────────────────────────────
     The figure itself is a single page-level element (<Spidey />) shared
     with the bot and the terminal. All this does is measure where he
     should hang for the card under the cursor and publish it; moving
     between cards publishes a new anchor and he glides there.

     He hangs in the gutter to the RIGHT of the grid, never over a
     picture. Only the vertical travel tracks the card you are on.

     The hide is deferred. There is a real gap between the cards, so
     crossing from one to the next fires mouseleave a beat before the
     next mouseenter — hiding on the spot made him start climbing back
     out of frame and then drop in again on every single card. A short
     grace period that any subsequent enter cancels means he only ever
     leaves when you have actually left the grid. */
  const hideTimer = useRef(0);

  const showDangle = useCallback((card) => {
    clearTimeout(hideTimer.current);
    const cardR = card.getBoundingClientRect();
    const textR = document.querySelector('.abt-right')?.getBoundingClientRect();

    /* The true right edge of the artwork is the furthest-right card, not
       the stack's own box — the extra rows are positioned absolutely and
       reach past it, which is how the figure ended up over a picture the
       first time. */
    let gridRight = 0;
    for (const el of document.querySelectorAll('.abt-card')) {
      if (Number(getComputedStyle(el).opacity) < 0.5) continue;
      const b = el.getBoundingClientRect();
      if (b.width > 20) gridRight = Math.max(gridRight, b.right);
    }

    /* Sit in the gap between the artwork and the text, then take 30% on
       top of that. The extra can no longer fit in the gutter, so it is
       spent to the RIGHT only — his left edge stays pinned at the edge
       of the artwork and he leans into the text margin instead. He is
       click-through, so overlapping type costs nothing; overlapping a
       photograph is the one thing that is not allowed. */
    const gapL = gridRight + 14;
    const gapR = textR ? textR.left - 12 : window.innerWidth - 12;
    const room = Math.max(0, gapR - gapL);
    const w    = Math.max(64, Math.min(150, room)) * 1.3;

    const centred = gapL + (room - w) / 2;
    const x = Math.min(Math.max(centred, gapL), window.innerWidth - w - 8);

    showSpidey({ mode: 'card', w, x, drop: Math.max(0, cardR.bottom) });
  }, []);

  const hideDangle = useCallback(() => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(hideSpidey, 260);
  }, []);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  // Individual card hover glow (CSS class only)
  const bindCardHover = (card) => {
    if (!card || card._hoverBound) return;
    card._hoverBound = true;
    card.addEventListener('mouseenter', () => {
      card.classList.add('abt-card--hovered');
      showDangle(card);
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('abt-card--hovered');
      hideDangle();
    });
  };

  // Enter left panel → full 3×3 grid: the original three align into the
  // middle row, and the two extra rows flicker in around them.
  const onLeftEnter = useCallback(() => {
    if (!revealedRef.current || lineRef.current) return;
    lineRef.current = true;

    const panel = leftRef.current;
    const at    = calcGridTransforms(panel ? panel.clientWidth : 500,
                                     panel ? panel.clientHeight : 480);
    const place = (card, { x, y, r, s }) => {
      card.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`;
    };

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      card.style.zIndex = String(i + 1);
      place(card, at(0, i));
    });

    EXTRA_CARDS.forEach(({ row, col }, i) => {
      const card = extraRefs.current[i];
      if (!card) return;
      card.style.zIndex = '1';
      place(card, at(row, col));
    });

    panel?.classList.add('abt-left--line');
  }, [EXTRA_CARDS]);

  // Leave left panel → restore spread layout, extras collapse back into
  // the stack as they fade so they read as going away, not blinking out.
  const onLeftLeave = useCallback(() => {
    if (!revealedRef.current || !lineRef.current) return;
    lineRef.current = false;

    leftRef.current?.classList.remove('abt-left--line');

    const { x: mx, y: my } = mouseRef.current;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      card.style.zIndex    = String(cardRefs.current.length - i);
      card.style.transform = cardTransform(i, mx, my, true);
    });

    extraRefs.current.forEach((card) => {
      if (card) card.style.transform = 'translate(0px, 0px) rotate(0deg) scale(0.82)';
    });
  }, []);

  // Combined handler: popup tracking + card parallax
  const handleSectionMove = useCallback((e) => {
    if (popupRef.current) {
      popupRef.current.style.left = `${e.clientX + 24}px`;
      popupRef.current.style.top  = `${e.clientY - 120}px`;
    }

    if (!spreadRef.current || lineRef.current) return;
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const mx   = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    const my   = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    mouseRef.current = { x: mx, y: my };
    cardRefs.current.forEach((card, i) => {
      if (card) card.style.transform = cardTransform(i, mx, my, true);
    });
  }, []);

  const showPopup = useCallback((src) => { setPopupSrc(src); setPopupVisible(true);  }, []);
  const hidePopup = useCallback(()      => { setPopupVisible(false); },                  []);

  /* Card copy uses the section's own .abt-ch word reveal rather than a
     scroll-triggered split. The original effect is a CSS transition gated
     on .abt-revealed, which cannot replay for content that swaps in after
     the section has already revealed — so .abt-card-copy runs the same
     fade-and-rise as a keyframe animation instead, and the key below
     remounts the spans so it restarts on every pick. */
  const renderWords = (text, step = 0.022, base = 0) =>
    String(text || '').split(' ').map((word, wi, all) => (
      <span key={wi} className="abt-ch" style={{ '--d': `${(base + wi * step).toFixed(3)}s` }}>
        {word}{wi < all.length - 1 ? ' ' : ''}
      </span>
    ));

  // Word renderer — marks popup keywords as special
  const renderBio = (text, pi) => {
    const words = text.split(' ');
    return words.map((word, wi) => {
      const clean = word.replace(/[^a-zA-Z-]/g, '');
      const src   = POPUP_MAP[clean] || POPUP_MAP[word];
      return (
        <span
          key={`${pi}-${wi}`}
          className={`abt-ch${src ? ' abt-word--special' : ''}`}
          aria-hidden="true"
          style={{ '--d': `${0.25 + pi * 0.55 + wi * 0.018}s` }}
          onMouseEnter={src ? () => showPopup(src) : undefined}
          onMouseLeave={src ? hidePopup : undefined}
        >
          {word}{wi < words.length - 1 ? ' ' : ''}
        </span>
      );
    });
  };

  // ── JSX ─────────────────────────────────────────────────────────────────

  return (
    <section
      ref={sectionRef}
      className="abt-section"
      id="about"
      aria-label="About Kish"
      onMouseMove={handleSectionMove}
    >

      {/* ── BG LAYERS ── */}
      <div className="abt-bg"    aria-hidden="true" />
      <div className="abt-noise" aria-hidden="true" />

      {/* ── PARTICLES ── */}
      <div className="abt-particles" aria-hidden="true">
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="abt-particle"
            style={{
              left:              `${p.x}%`,
              top:               `${p.y}%`,
              width:             `${p.size}px`,
              height:            `${p.size}px`,
              opacity:            p.opacity,
              animationDuration: `${p.dur}s`,
              animationDelay:    `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ── HUD GRID ── */}
      <div className="abt-grid" aria-hidden="true" />

      {/* ── CURSOR POPUP ── */}
      <div
        ref={popupRef}
        className={`abt-cursor-popup${popupVisible ? ' abt-cursor-popup--visible' : ''}`}
        aria-hidden="true"
      >
        {popupSrc && <img src={popupSrc} alt="" />}
        <div className="abt-popup-grain" />
      </div>

      {/* ── INNER LAYOUT ── */}
      <div className="abt-inner">

        {/* ════ LEFT: CARD STACK (original animation) ════ */}
        <div
          className="abt-left"
          ref={leftRef}
          aria-hidden="true"
          onMouseEnter={onLeftEnter}
          onMouseLeave={onLeftLeave}
        >
          <div className="abt-hover-hint" aria-hidden="true">
            <span>{hoverHint}</span>
          </div>

          <div className="abt-card-stack">
            {CARDS.map(({ src, label, alt }, i) => (
              <div
                key={label}
                className={`abt-card abt-card-${i}${activeIdx === i ? ' abt-card--picked' : ''}`}
                ref={(el) => { cardRefs.current[i] = el; bindCardHover(el); }}
                style={{ zIndex: CARDS.length - i }}
                onClick={() => pickCard(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickCard(i); } }}
                aria-pressed={activeIdx === i}
                aria-label={`Show notes on ${label}`}
              >
                <div className="abt-card-face">
                  <img src={src} alt={alt} loading="lazy" draggable="false" />
                  <div className="abt-card-overlay" />
                  <span className="abt-card-label">{label}</span>
                  <span className="abt-card-num">0{i + 1}</span>
                </div>
                <div className="abt-card-glow" />
                <div className="abt-card-reflection" />
              </div>
            ))}

            {/* The two extra rows. Present in the DOM from the start so the
                images are already decoded when the grid opens, but held at
                opacity 0 until .abt-left--line runs the flicker on them. */}
            {EXTRA_CARDS.map(({ src, label, alt, row }, i) => (
              <div
                key={label}
                className={`abt-card abt-card--extra abt-card--${row < 0 ? 'above' : 'below'}${activeIdx === CARDS.length + i ? ' abt-card--picked' : ''}`}
                ref={(el) => { extraRefs.current[i] = el; bindCardHover(el); }}
                style={{ '--fd': `${i * 0.075}s` }}
                onClick={() => pickCard(CARDS.length + i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickCard(CARDS.length + i); } }}
                aria-pressed={activeIdx === CARDS.length + i}
                aria-label={`Show notes on ${label}`}
              >
                <div className="abt-card-face">
                  <img src={src} alt={alt} loading="lazy" draggable="false" />
                  <div className="abt-card-overlay" />
                  <span className="abt-card-label">{label}</span>
                  <span className="abt-card-num">0{i + 4}</span>
                </div>
                <div className="abt-card-glow" />
                <div className="abt-card-reflection" />
              </div>
            ))}
          </div>
        </div>

        {/* ════ RIGHT: TEXT ════ */}
        <div className="abt-right">

          <p className="abt-eyebrow" aria-hidden="true">{eyebrow}</p>

          {active ? (
            /* An image is selected. The heading and the copy below it swap
               to that image's notes and reveal word by word, using the same
               .abt-ch treatment the section's own paragraphs use.
 */
            <>
              <h2
                key={`t-${activeIdx}`}
                className="abt-heading abt-heading--card abt-card-copy"
                id="about-heading"
              >
                {renderWords(active.title || active.label, 0.045)}
              </h2>

              <div className="abt-rule" aria-hidden="true" />

              <div className="abt-bio abt-bio--card" aria-label={active.blurb}>
                <div className="abt-streak" aria-hidden="true" />
                <p
                  key={`b-${activeIdx}`}
                  className="abt-para abt-card-copy"
                  aria-hidden="true"
                >
                  {renderWords(active.blurb, 0.018, 0.16)}
                </p>
                <button className="abt-clear" onClick={() => setActiveIdx(null)}>
                  ← Back to about
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="abt-heading" id="about-heading">
                <span className="abt-h-line">{heading[0]}</span>
                <span className="abt-h-line abt-h-outline">{heading[1]}</span>
                <span className="abt-h-line">{heading[2]}</span>
              </h2>

              <div className="abt-rule" aria-hidden="true" />

              <div className="abt-bio" aria-label="Biography">
                <div className="abt-streak" aria-hidden="true" />
                {/* Deliberately NOT ScrollReveal: these paragraphs already
                    stagger in per word, and renderBio wraps the popup
                    keywords ("Kish", "AI-driven", "cinematic") that show a
                    cursor image on hover. ScrollReveal only takes a plain
                    string, so using it here would delete that. */}
                {PARAGRAPHS.map((para, pi) => (
                  <p key={pi} className="abt-para" aria-label={para}>
                    {renderBio(para, pi)}
                  </p>
                ))}
              </div>
            </>
          )}

          <div className="abt-stats" aria-label="Key stats">
            {STATS.map(({ value, label }) => (
              <div key={label} className="abt-stat">
                <span className="abt-stat-val">{value}</span>
                <span className="abt-stat-lbl">{label}</span>
              </div>
            ))}
          </div>

          <a href="#work" className="abt-cta" id="about-see-work">
            <span>{ctaLabel}</span>
            <svg className="abt-cta-icon" viewBox="0 0 32 12" fill="none" aria-hidden="true">
              <line x1="0" y1="6" x2="26" y2="6" stroke="currentColor" strokeWidth="1"/>
              <polyline points="22,2 26,6 22,10" stroke="currentColor" strokeWidth="1" fill="none"/>
            </svg>
          </a>

        </div>
      </div>
    </section>
  );
}
