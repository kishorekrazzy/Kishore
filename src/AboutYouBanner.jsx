import { useState, useMemo, useCallback } from 'react';
import { useContent } from './content/store';
import { readDossier, computeProfile } from './aboutYou';
import AboutYouUnlock from './AboutYouUnlock';
import './AboutYouBanner.css';

/* ══════════════════════════════════════════════════════════════════════
   ABOUT YOU — BANNER

   The wide strip under "See My Work". Same anatomy as the festival
   banner it is modelled on: title with a gold value on the left, an
   awarded emblem dead centre, a white primary and a quiet secondary
   button on the right.

   It is not decoration. The primary button opens the decoder, and once
   someone has been through it the strip stops advertising and starts
   reporting — the title becomes their name and the subtitle their own
   numbers, recomputed on every visit so the day count is right.

   The laurel is drawn rather than fetched: eight leaves stepped along
   an arc, mirrored for the far branch. No image request, no layout
   shift, and it scales to any width without going soft.
   ══════════════════════════════════════════════════════════════════════ */

const LEAF_COUNT = 7;

/* One branch: leaves stepped along a 46r arc from 138° to 226°, which is
   a C hugging the left of the strip. Each leaf is rotated 40° off the
   tangent so it points outward and forward the way a real laurel lies —
   tangent-aligned leaves overlap into a smooth crescent and the whole
   thing reads as a bracket instead of a wreath. Scale peaks mid-branch
   and tapers at both ends. */
const LEAVES = Array.from({ length: LEAF_COUNT }, (_, i) => {
  const t   = i / (LEAF_COUNT - 1);
  const deg = 138 + t * 88;
  const rad = (deg * Math.PI) / 180;
  return {
    x: 100 + Math.cos(rad) * 49,
    y: 62  + Math.sin(rad) * 49,
    r: deg + 130,
    s: 0.62 + Math.sin(t * Math.PI) * 0.42,
    d: (i * 0.11).toFixed(2),
  };
});

const Branch = () => (
  <g className="ayb-branch">
    {/* Control point at 184°/64r puts the quadratic on the same arc the
        leaves sit on, so the stem runs through them rather than beside. */}
    <path className="ayb-stem" d="M63.6 92.8 Q36.3 57.5 66.4 26.1"
          stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    {LEAVES.map((l, i) => (
      <ellipse
        key={i}
        className="ayb-leaf"
        cx="0" cy="0" rx="7.6" ry="3.1"
        style={{ '--d': `${l.d}s` }}
        transform={`translate(${l.x.toFixed(2)} ${l.y.toFixed(2)}) rotate(${l.r.toFixed(1)}) scale(${l.s.toFixed(2)})`}
      />
    ))}
  </g>
);

/* The centrepiece is a strip of film stood on its end — perforations
   down both edges, four frames between them. A plain slab read as a
   barcode; this reads as the thing the site is actually about. */
const PERFS  = Array.from({ length: 9 }, (_, i) => 21 + i * 9.6);
const FRAMES = [39, 61, 83];

const Emblem = () => (
  <svg className="ayb-emblem" viewBox="0 0 200 124" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="aybGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="oklch(94% 0.075 92)" />
        <stop offset="46%"  stopColor="oklch(82% 0.120 84)" />
        <stop offset="100%" stopColor="oklch(58% 0.100 70)" />
      </linearGradient>
      <linearGradient id="aybGate" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stopColor="oklch(92% 0.085 90)" />
        <stop offset="52%"  stopColor="oklch(74% 0.125 80)" />
        <stop offset="100%" stopColor="oklch(48% 0.085 66)" />
      </linearGradient>
      <clipPath id="aybGateClip">
        <rect x="84" y="16" width="32" height="92" rx="4" />
      </clipPath>
    </defs>

    {/* The light the thing is standing in. */}
    <ellipse className="ayb-halo" cx="100" cy="62" rx="52" ry="46" fill="url(#aybGold)" />

    <g clipPath="url(#aybGateClip)">
      <rect x="84" y="16" width="32" height="92" fill="url(#aybGate)" />
      {FRAMES.map((y) => (
        <rect key={y} x="91" y={y} width="18" height="1.4" fill="rgba(0,0,0,0.34)" />
      ))}
      {PERFS.map((y) => (
        <g key={y}>
          <rect x="86.4" y={y} width="3.4" height="4.6" rx="1" fill="rgba(0,0,0,0.42)" />
          <rect x="110.2" y={y} width="3.4" height="4.6" rx="1" fill="rgba(0,0,0,0.42)" />
        </g>
      ))}
      <rect className="ayb-gate-sweep" x="84" y="0" width="32" height="24" fill="#fff" opacity="0.55" />
    </g>
    <rect x="84" y="16" width="32" height="92" rx="4"
          stroke="oklch(94% 0.07 92)" strokeOpacity="0.5" strokeWidth="1" />

    <g className="ayb-laurels" fill="url(#aybGold)" color="oklch(70% 0.105 76)">
      <Branch />
      <g transform="translate(200 0) scale(-1 1)"><Branch /></g>
    </g>
  </svg>
);

const Arrow = () => (
  <svg className="ayb-arrow" viewBox="0 0 24 10" fill="none" aria-hidden="true">
    <path d="M0 5h21M17 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4"
          strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function AboutYouBanner() {
  const copy = useContent('about.dossier', {});
  const t = (key, fallback) => (copy[key] === undefined || copy[key] === '' ? fallback : copy[key]);

  const [open, setOpen]   = useState(false);
  const [more, setMore]   = useState(false);
  // Read once, lazily — the getter runs on the first render only, so a
  // storage hit is not repeated on every keystroke elsewhere in the page.
  const [saved, setSaved] = useState(readDossier);

  // Recomputed from the stored date rather than stored itself, so the day
  // count is right on the day, not on the day it was unlocked.
  const profile = useMemo(() => (saved ? computeProfile(saved) : null), [saved]);

  const onUnlocked = useCallback((prof) => setSaved({ name: prof.name, dob: prof.dob }), []);
  const onReset    = useCallback(() => setSaved(null), []);

  const nf = useMemo(() => new Intl.NumberFormat('en-US'), []);

  return (
    <aside className="ayb-wrap" aria-label={t('aria', 'About you')}>
      <div className="ayb-banner" data-unlocked={!!profile}>
        <span className="ayb-sheen" aria-hidden="true" />
        <span className="ayb-vignette" aria-hidden="true" />

        <div className="ayb-copy">
          <p className="ayb-title">
            {profile ? (
              <>
                {t('titleBack', 'WELCOME BACK')}
                <span className="ayb-mid" aria-hidden="true"> · </span>
                <span className="ayb-value">{profile.name.toUpperCase()}</span>
              </>
            ) : (
              <>
                {t('title', 'PERSONAL DOSSIER')}
                <span className="ayb-mid" aria-hidden="true"> · </span>
                <span className="ayb-value">{t('titleValue', 'SEALED')}</span>
              </>
            )}
          </p>

          <p className="ayb-sub">
            {profile
              ? `${profile.years} years · ${nf.format(profile.days)} days lived · born on a ${profile.weekday}`
              : t('sub', 'Your name and your birthday — I decode the rest in about ten seconds')}
          </p>
        </div>

        <Emblem />

        <div className="ayb-actions">
          <button type="button" className="ayb-cta" onClick={() => setOpen(true)}>
            {profile ? t('ctaBack', 'Open my file') : t('cta', 'About You')}
            <Arrow />
          </button>
          <button
            type="button"
            className="ayb-ghost"
            aria-expanded={more}
            onClick={() => setMore((v) => !v)}
          >
            {t('more', 'Learn more')}
          </button>
        </div>
      </div>

      {/* Drawer. Animated on grid-template-rows so it opens to whatever
          height the copy actually needs — no measured max-height to get
          wrong when the text is edited in the admin. */}
      <div className="ayb-more" data-open={more}>
        <div className="ayb-more-clip">
          <div className="ayb-more-body">
            <div className="ayb-note">
              <h3>What it does</h3>
              <p>Turns two fields into a decoded file — your age to the day, the
                 weekday you were born on, your sign, and your life measured in
                 frames at 24fps.</p>
            </div>
            <div className="ayb-note">
              <h3>Where it goes</h3>
              <p>Nowhere. It is worked out in this browser and stored in this
                 browser. Nothing is sent anywhere, and clearing your site data
                 erases it.</p>
            </div>
            <div className="ayb-note">
              <h3>How long</h3>
              <p>About ten seconds. Hold the dial rather than clicking it — the
                 file assembles while you hold.</p>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <AboutYouUnlock
          initial={saved}
          onClose={() => setOpen(false)}
          onUnlocked={onUnlocked}
          onReset={onReset}
        />
      )}
    </aside>
  );
}
