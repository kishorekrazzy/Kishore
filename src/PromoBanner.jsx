import { useContent } from './content/store';
import './PromoBanner.css';

/* ══════════════════════════════════════════════════════════════════════
   PROMO BANNER

   Sits between About and Syndicate. One image filling the strip, a
   magenta wash over its left half, and the copy on top of that — badge,
   two-line headline, subtitle, button — with a watermark bottom-right.

   THE COLOUR
   About owns hue 355, Syndicate owns 320. This lands on 335, the midpoint,
   so the section reads as the step between them rather than as something
   dropped in — theme.css already asks every section to sit 33-45° from
   its neighbours. The surrounding background is composed from the same
   hue, which is what ties the strip to the page around it.

   Shape is 1950:370 from the reference, with type in cqw so the block
   scales as one composition.
   ══════════════════════════════════════════════════════════════════════ */

const DEFAULT_ART =
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=2400&q=80';

const TagIcon = () => (
  <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M1.8 6.2V2.4a.6.6 0 0 1 .6-.6h3.8a.6.6 0 0 1 .42.18l5.4 5.4a.6.6 0 0 1 0 .84l-3.8 3.8a.6.6 0 0 1-.84 0l-5.4-5.4a.6.6 0 0 1-.18-.42Z"
          stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <circle cx="4.4" cy="4.4" r="1" fill="currentColor" />
  </svg>
);

export default function PromoBanner() {
  const copy = useContent('promo', {});
  const art = useContent('images.promo.0', DEFAULT_ART);

  const t = (k, fallback) => (copy[k] === undefined || copy[k] === '' ? fallback : copy[k]);

  const badge = t('badge', 'OPEN FOR WORK');
  const line2 = t('title2', 'KISHOREDITX');
  const mark = t('markName', 'KISHOREDITX');
  const cta = t('cta', 'Start a project');

  return (
    <section className="pb-section" aria-label={t('title1', 'Start a project')}>
      <div className="pb-banner">
        <img className="pb-art" src={art} alt="" loading="lazy" draggable="false" />

        {/* The magenta wash. Left-weighted so the right of the artwork is
            left alone, exactly as the reference does it. */}
        <span className="pb-wash" aria-hidden="true" />

        <div className="pb-body">
          {badge && (
            <span className="pb-badge">
              <TagIcon />
              {badge}
            </span>
          )}

          <h2 className="pb-title">
            {t('title1', 'START A PROJECT WITH')}
            {line2 && <><br />{line2}</>}
          </h2>

          <p className="pb-sub">
            {t('sub', 'Video, AI images and the web — one person, one pipeline')}
          </p>

          {cta && (
            <a className="pb-cta" href={t('ctaHref', '#contact')}>{cta}</a>
          )}
        </div>

        {/* Watermark, bottom-right — anchored to the corner rather than
            positioned, so a longer name grows leftward instead of
            overflowing. */}
        {mark && (
          <div className="pb-mark" aria-hidden="true">
            <span className="pb-mark-kicker">{t('markKicker', 'CREATED WITH')}</span>
            <span className="pb-mark-name">{mark}</span>
          </div>
        )}
      </div>
    </section>
  );
}
