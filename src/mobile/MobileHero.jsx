import { useState, useEffect, useRef, useCallback } from 'react';
import { useContent } from '../content/store';
import { useSwipe, tap, reducedMotion } from './mobileUtils';
import { Icon, Img } from './ui';

/* ══════════════════════════════════════════════════════════════════════
   HERO — the story deck

   The desktop hero is four bespoke layouts, each one arranging a
   headline, a paragraph and two statistics differently across a wide
   plate. None of those arrangements survive at 390pt: they all collapse
   to the same single column, and the thing that made them interesting —
   where the type sits in the frame — stops existing.

   So the phone gets the pattern that IS native to it. Four full-bleed
   panels, advanced by swipe, by tapping a progress bar, or on their own
   after nine seconds. Same four sections, same copy, same statistics —
   in the one interaction every phone user already knows without being
   told.
   ══════════════════════════════════════════════════════════════════════ */

const PANEL_MS = 9000;

const FALLBACK = [
  { id: 'video', label: 'Video Editing', headline: 'THE BEST\nCREATIVE\nIN THE WORLD',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=2400&q=75',
    eyebrow: 'AI Editor · Visual Storyteller', prose: '', micro: '', cta: 'View My Work',
    stat1: { val: '>100', label: 'Projects delivered' }, stat2: { val: '>5 Yrs', label: 'Experience' } },
];

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
    setI((cur) => {
      const n = ((next ?? cur + 1) % count + count) % count;
      return n;
    });
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
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Swipe left/right through the deck. */
  const swipe = useSwipe({
    onLeft:  () => { tap(); go(i + 1); },
    onRight: () => { tap(); go(i - 1); },
  });

  /* Press and hold pauses, the way a story does — someone reading the
     paragraph should not have it taken away mid-sentence. The 220ms
     delay is what stops an ordinary tap or the start of a swipe from
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

  const lines = String(sec.headline || '').split('\n');

  return (
    <section
      className={`mb-hero${held ? ' mb-hero--held' : ''}`}
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="What I do"
      {...swipe}
      onTouchStartCapture={onHoldStart}
      onTouchEndCapture={onHoldEnd}
      onTouchCancelCapture={onHoldEnd}
    >
      {/* ── Plates ──
          All four are mounted so the cross-fade has something to fade
          to, but only the first loads eagerly: it is the largest
          contentful paint on the phone exactly as it is on the desktop.
          The rest are lazy and decode when they are first shown. */}
      {sections.map((s, n) => (
        <div
          key={n}
          className={`mb-hero-plate${n === i ? ' mb-hero-plate--on' : ''}`}
          data-id={s.id}
          aria-hidden={n === i ? undefined : 'true'}
        >
          {/* Keyed on the index so a re-selected panel replays its drift
              rather than sitting at the end of the last one. */}
          <Img
            key={`${n}-${n === i ? i : 'off'}`}
            src={s.image}
            /* Plate 0 is the phone's LCP element and index.html
               preloads it at exactly this width — see phoneSrc. */
            w={n === 0 ? 1080 : 640}
            exact={n === 0}
            eager={n === 0}
            alt=""
          />
        </div>
      ))}

      <div className="mb-hero-tint" aria-hidden="true" />
      <div className="mb-hero-scrim" aria-hidden="true" />

      {/* ── Progress ── */}
      <div className="mb-hero-bars">
        {sections.map((s, n) => (
          <button
            key={n}
            className={`mb-hero-bar${n === i ? ' mb-hero-bar--on' : ''}${n < i ? ' mb-hero-bar--done' : ''}`}
            style={{ '--dur': `${PANEL_MS}ms` }}
            onClick={() => { tap(); setI(n); }}
            aria-label={`Show ${s.label}`}
            aria-current={n === i ? 'true' : undefined}
          >
            {/* Re-keyed so the fill animation restarts from zero each
                time this panel becomes active. */}
            <i key={`${n}-${i}`} />
          </button>
        ))}
      </div>

      {/* ── Copy ──
          Keyed on the panel so React replaces the subtree and every
          child replays its entrance. A cross-fade alone did not read as
          a change; the type arriving does. */}
      <div className="mb-hero-body" key={i}>
        {sec.eyebrow && <p className="mb-hero-eyebrow" style={{ '--d': '40ms' }}>{sec.eyebrow}</p>}

        {/* The four disciplines, doubling as the deck's index. */}
        <div className="mb-hero-chips" style={{ '--d': '70ms' }} role="tablist" aria-label="Sections">
          {sections.map((s, n) => (
            <button
              key={s.id || n}
              role="tab"
              aria-selected={n === i}
              className={`mb-chip${n === i ? ' mb-chip--on' : ''}`}
              onClick={() => { tap(); setI(n); }}
            >
              <Icon name={CHIP_ICON[s.id] || 'spark'} size={14} />
              {s.label}
            </button>
          ))}
        </div>

        <h1 className="mb-hero-title" style={{ '--d': '120ms' }}>
          {lines.map((line, n) => (
            <span key={n} style={{ '--l': n }}>{line}</span>
          ))}
        </h1>

        {sec.prose && (
          <p className="mb-hero-prose" style={{ '--d': '180ms' }}>
            {/* Trimmed for the phone. The desktop paragraph is three
                lines wide there and eight lines tall here, which is more
                than a hero should ask anybody to read before scrolling. */}
            {String(sec.prose).split('. ').slice(0, 2).join('. ').replace(/\.?$/, '.')}
          </p>
        )}

        <div className="mb-hero-stats" style={{ '--d': '240ms' }}>
          {[sec.stat1, sec.stat2].filter(Boolean).map((st, n) => (
            <div className="mb-hero-stat" key={n}>
              <i><Icon name="check" size={11} /></i>
              <div>
                <b>{st.val}</b>
                <em>{st.label}</em>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-hero-cta" style={{ '--d': '300ms' }}>
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

const CHIP_ICON = { video: 'play', ai: 'wand', color: 'colour', web: 'code' };
