import { useContent } from './content/store';
import './FeatureBanner.css';

/* ══════════════════════════════════════════════════════════════════════
   FEATURE BANNER

   One image filling the banner, with the copy laid over the left of it.

   The reference supplies two things only: the shape of the strip —
   1958:355, measured off the banner inside it rather than the whole image
   file — and where the text block sits within that. Everything else in
   the artwork is the image, which is set from the dashboard.

   The type is sized in cqw, so the text block holds its proportions
   against the banner at any width instead of drifting out of the
   composition the artwork was made around.
   ══════════════════════════════════════════════════════════════════════ */

const DEFAULT_ART =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2400&q=80';

const Sparkle = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0.8 9.5 5.4 14 7 9.5 8.6 8 13.2 6.5 8.6 2 7l4.5-1.6L8 .8Z" />
    <path d="M13.2 10.6l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
  </svg>
);

export default function FeatureBanner() {
  const copy = useContent('feature', {});
  const art = useContent('images.feature.0', DEFAULT_ART);

  const t = (k, fallback) => (copy[k] === undefined || copy[k] === '' ? fallback : copy[k]);

  const eyebrow = t('eyebrow', 'NEW FEATURE');
  const title2 = t('title2', 'EVERY WORKFLOW.');
  const sub2 = t('sub2', 'with your team - all on one canvas');
  const cta = t('cta', 'Try Canvas');

  /* A photograph cannot be relied on to be dark where the words go, so a
     scrim sits between them. Its strength is a dashboard value, and 0
     removes it entirely for artwork that already leaves the left clear. */
  const scrim = Number(copy.scrim ?? 0.55);

  return (
    <section className="fb-section" aria-label={t('title1', 'Feature')}>
      <div className="fb-banner">
        <img className="fb-art" src={art} alt="" loading="lazy" draggable="false" />

        {scrim > 0 && (
          <span className="fb-scrim" style={{ '--scrim': scrim }} aria-hidden="true" />
        )}

        <div className="fb-left">
          {eyebrow && <p className="fb-eyebrow">{eyebrow}</p>}

          <h2 className="fb-title">
            {t('title1', 'ONE CANVAS.')}
            {title2 && <><br />{title2}</>}
          </h2>

          {/* The break is hidden on narrow screens, so the halves need a
              real space or they run together as one word. */}
          <p className="fb-sub">
            {t('sub1', 'Moodboard, chain workflows, and share')}
            {sub2 && <><br />{' '}{sub2}</>}
          </p>

          {cta && (
            <a className="fb-cta" href={t('ctaHref', '#work')}>
              <Sparkle />
              {cta}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
