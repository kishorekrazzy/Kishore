import { useState, useEffect, useRef, useCallback } from 'react';
import { useContent } from '../content/store';
import { useSwipe, tap, reducedMotion } from './mobileUtils';
import { Icon, Img } from './ui';

/* ══════════════════════════════════════════════════════════════════════
   HERO — the slate

   The desktop hero is four bespoke layouts, each arranging a headline, a
   paragraph and two statistics differently across a wide plate. None of
   those survive at 390pt: they all collapse to the same single column,
   and the thing that made them interesting — where the type sits in the
   frame — stops existing.

   ── WHAT THIS IS INSTEAD ─────────────────────────────────────────────
   A title card. The page is dressed as the thing the work is made with:
   a slate across the top, a leader rail down the side, a take number
   watermarked into the corner, and the headline set like a card rather
   than like a heading.

   The slate is also the navigation. An earlier version carried both
   story-style progress bars AND a row of discipline chips — two controls
   for one job, costing 46pt of the only screen that matters. They are
   now one object: four segments that name the disciplines, fill as their
   panel plays, and select it when tapped.

   Everything else about the deck is unchanged: swipe to move, hold to
   pause, nine seconds a panel.
   ══════════════════════════════════════════════════════════════════════ */

const PANEL_MS = 9000;

const FALLBACK = [
  { id: 'video', label: 'Video Editing', headline: 'THE BEST\nCREATIVE\nIN THE WORLD',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=2400&q=75',
    eyebrow: 'AI Editor · Visual Storyteller', prose: '', micro: '', cta: 'View My Work',
    stat1: { val: '>100', label: 'Projects delivered' }, stat2: { val: '>5 Yrs', label: 'Experience' } },
];

/* Slate shorthand. A segment is about 80pt wide, which is four or five
   characters — "Video Editing" does not fit and truncating it to "Video
   Edi…" looks like a fault rather than a label. */
const SHORT = { video: 'EDIT', ai: 'AI', color: 'GRADE', web: 'WEB' };

const pad2 = (n) => String(n + 1).padStart(2, '0');

export default function MobileHero({ onCta, onScrollDown }) {
  const sections = useContent('hero.sections', FALLBACK);
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const holdTimer = useRef(null);
  const advanceTimer = useRef(null);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef(null);

  const count = sections.length;
  const sec = sections[i] || sections[0] || FALLBACK[0];

  const go = useCallback((next) => {
    setI((cur) => (((next ?? cur + 1) % count) + count) % count);
  }, [count]);

  /* ── Auto-advance ──
     Cleared and restarted on every change, so tapping to panel 3 gives
     panel 3 a full nine seconds rather than whatever was left of
     panel 1's. Paused while a finger is down and while the hero is
     scrolled off screen — an unseen carousel burning timers and
     cross-fading plates is pure battery cost. */
  useEffect(() => {
    if (held || !visible || reducedMotion() || count < 2) return;
    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => go(), PANEL_MS);
    return () => clearTimeout(advanceTimer.current);
  }, [i, held, visible, go, count]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const swipe = useSwipe({
    onLeft:  () => { tap(); go(i + 1); },
    onRight: () => { tap(); go(i - 1); },
  });

  /* Press and hold pauses, the way a story does — someone reading the
     paragraph should not have it taken away mid-sentence. The 220ms
     delay is what stops an ordinary tap, or the start of a swipe, from
     registering as a hold. */
  const onHoldStart = useCallback(() => {
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setHeld(true), 220);
  }, []);
  const onHoldEnd = useCallback(() => {
    clearTimeout(holdTimer.current);
    setHeld(false);
  }, []);
  useEffect(() => () => { clearTimeout(holdTimer.current); clearTimeout(advanceTimer.current); }, []);

  const lines = String(sec.headline || '').split('\n').filter(Boolean);
  /* The leader rail. Only the first section carries a `micro` in the CMS,
     so the others compose one from what they do have. */
  const rail = sec.micro || `${(SHORT[sec.id] || 'REEL')} · ROLL ${String.fromCharCode(65 + i)} · 24 FPS`;

  return (
    <section
      className={`mb-hero${held ? ' mb-hero--held' : ''}`}
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="What I do"
      data-section="Showreel"
      {...swipe}
      onTouchStartCapture={onHoldStart}
      onTouchEndCapture={onHoldEnd}
      onTouchCancelCapture={onHoldEnd}
    >
      {/* ── Plates ──
          All four are mounted so the cross-fade has something to fade
          to, but only the first loads eagerly: it is the phone's largest
          contentful paint. The rest decode when first shown. */}
      {sections.map((s, n) => (
        <div
          key={n}
          className={`mb-hero-plate${n === i ? ' mb-hero-plate--on' : ''}`}
          data-id={s.id}
          aria-hidden={n === i ? undefined : 'true'}
        >
          <Img
            key={`${n}-${n === i ? i : 'off'}`}
            src={s.image}
            /* Plate 0 is preloaded by index.html at exactly this width. */
            w={n === 0 ? 1080 : 640}
            exact={n === 0}
            eager={n === 0}
            alt=""
          />
        </div>
      ))}

      <div className="mb-hero-tint" aria-hidden="true" />
      <div className="mb-hero-scrim" aria-hidden="true" />

      {/* ══ SLATE ══════════════════════════════════════════════════
          Progress and navigation in one object. The diagonal stripes are
          the clapper; the segments are the reels. */}
      <div className="mb-slate" role="tablist" aria-label="Sections">
        <span className="mb-slate-clap" aria-hidden="true" />
        <div className="mb-slate-reels">
          {sections.map((s, n) => (
            <button
              key={s.id || n}
              role="tab"
              aria-selected={n === i}
              className={`mb-reel-seg${n === i ? ' mb-reel-seg--on' : ''}${n < i ? ' mb-reel-seg--done' : ''}`}
              style={{ '--dur': `${PANEL_MS}ms` }}
              onClick={() => { tap(); setI(n); }}
            >
              {/* Re-keyed so the fill restarts from zero each time this
                  panel becomes the active one. */}
              <i key={`${n}-${i}`} aria-hidden="true" />
              <b>{pad2(n)}</b>
              <em>{SHORT[s.id] || s.label}</em>
            </button>
          ))}
        </div>
      </div>

      {/* Leader rail. Vertical type down the left edge, in the band above
          the copy so the two never meet. */}
      <span className="mb-hero-rail" aria-hidden="true">{rail}</span>

      {/* The take number, watermarked. Keyed so it re-enters with the
          panel rather than silently swapping digits. */}
      <span className="mb-hero-take" key={`take-${i}`} aria-hidden="true">
        {pad2(i)}
      </span>

      {/* ══ COPY ═══════════════════════════════════════════════════
          Keyed on the panel so React replaces the subtree and every
          child replays its entrance. A cross-fade alone did not read as
          a change; the type arriving does. */}
      <div className="mb-hero-body" key={i}>
        {sec.eyebrow && (
          <p className="mb-hero-eyebrow" style={{ '--d': '40ms' }}>
            <span>{sec.eyebrow}</span>
          </p>
        )}

        {/* The headline is set as a title card: every line wipes up from
            behind its own edge, and the second line is drawn as an
            outline so the block reads as designed type rather than as a
            paragraph in a large size. */}
        <h1 className="mb-hero-title" style={{ '--d': '90ms' }}>
          {lines.map((line, n) => (
            <span className="mb-hero-line" key={n} style={{ '--l': n }}>
              <i data-hollow={n === 1 ? 'true' : undefined}>{line}</i>
            </span>
          ))}
        </h1>

        {sec.prose && (
          <p className="mb-hero-prose" style={{ '--d': '260ms' }}>
            {/* Trimmed. The desktop paragraph is three lines wide there
                and eight lines tall here, which is more than a hero
                should ask anybody to read before scrolling. */}
            {String(sec.prose).split('. ').slice(0, 2).join('. ').replace(/\.?$/, '.')}
          </p>
        )}

        {/* Statistics as a technical strip — ruled cells and monospace
            labels, the way a spec sheet lists them. */}
        <div className="mb-hero-specs" style={{ '--d': '320ms' }}>
          {[sec.stat1, sec.stat2].filter(Boolean).map((st, n) => (
            <div className="mb-hero-spec" key={n}>
              <b>{st.val}</b>
              <em>{st.label}</em>
            </div>
          ))}
        </div>

        <div className="mb-hero-cta" style={{ '--d': '380ms' }}>
          <button className="mb-btn mb-btn--fill" onClick={() => onCta?.(sec.id)}>
            {sec.cta || 'View My Work'}
            <Icon name="arrow" size={17} />
          </button>
          <button className="mb-btn mb-btn--ghost mb-btn--sm" onClick={onScrollDown}>
            The story
          </button>
        </div>
      </div>
    </section>
  );
}
