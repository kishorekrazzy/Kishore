import { useContent, withImages } from './content/store';
import './FeatureGrid.css';

/* ══════════════════════════════════════════════════════════════════════
   FEATURE GRID

   A promo card on the left and a 3x2 grid of entry cards on the right,
   laid out from the reference: the hero takes 36.5% of the width, the
   grid takes the rest in three equal columns over two rows.

   The whole block holds one aspect ratio (1980:300) with type in cqw, so
   it scales as a single composition rather than reflowing — the same
   discipline as the feature banner above it.

   The cards are wired to the sub-pages that already exist, so this is a
   way into the site rather than decoration.
   ══════════════════════════════════════════════════════════════════════ */

const DEFAULT_ART =
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1600&q=80';

/* Inline rather than lucide: eight glyphs at 20px do not justify pulling
   more of an icon set in, and this cannot break on a rename. */
const Icons = {
  bars: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 13v3M10 7v9M16 10v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 4.5h5a2 2 0 0 1 2 2V16a2 2 0 0 0-2-1.6H3V4.5ZM17 4.5h-5a2 2 0 0 0-2 2V16a2 2 0 0 1 2-1.6h5V4.5Z"
            stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="3.5" width="15" height="13" rx="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7" cy="8" r="1.5" fill="currentColor" />
      <path d="M3.5 14 7.5 10l3 2.6 3-2.4 3 2.8" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.8 10h14.4M10 2.8c1.9 2 2.9 4.5 2.9 7.2s-1 5.2-2.9 7.2c-1.9-2-2.9-4.5-2.9-7.2S8.1 4.8 10 2.8Z"
            stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 1.5 11.9 7 17.5 9 11.9 11 10 16.5 8.1 11 2.5 9 8.1 7 10 1.5Z" />
    </svg>
  ),
  film: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.6 3.5v13M13.4 3.5v13M2.5 10h15" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  monitor: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="3.5" width="15" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 17h5M10 14v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
};

/* page: the sub-page each card opens. `null` scrolls to a section
   instead, via href. */
const DEFAULT_CARDS = [
  { icon: 'bars',    title: 'Video Editing',  sub: 'Cuts, grades and rhythm',        page: 'video',  badge: 'SHOWREEL', tone: 'hot',  featured: true },
  { icon: 'book',    title: 'About Me',       sub: 'The long version',               page: 'about',  badge: '',        tone: '' },
  { icon: 'image',   title: 'AI Images',      sub: 'Prompted, curated, printed',     page: 'ai',     badge: 'GALLERY', tone: 'mute' },
  { icon: 'globe',   title: 'Websites',       sub: 'Designed, built and shipped',    page: 'web',    badge: '',        tone: '' },
  { icon: 'spark',   title: 'Skills',         sub: 'Everything in the toolkit',      page: 'skills', badge: '',        tone: '' },
  { icon: 'monitor', title: 'The Room',       sub: 'A CRT and too many ideas',       page: 'room',   badge: 'NEW',     tone: 'lime' },
];

export default function FeatureGrid({ onOpen }) {
  const copy = useContent('grid', {});
  const art = useContent('images.gridHero.0', DEFAULT_ART);
  const cards = withImages(DEFAULT_CARDS, null, 'src');
  const cms = useContent('grid.cards', null);

  const t = (k, fallback) => (copy[k] === undefined || copy[k] === '' ? fallback : copy[k]);

  const items = cards.map((c, i) => ({
    ...c,
    title: cms?.[i]?.title || c.title,
    sub: cms?.[i]?.sub ?? c.sub,
    badge: cms?.[i]?.badge ?? c.badge,
  }));

  return (
    <section className="fg-section" aria-label={t('heroTitle1', 'More to explore')}>
      <div className="fg-wrap">

        {/* ── Hero promo ── */}
        <a
          className="fg-hero"
          href={t('heroHref', '#/games')}
          aria-label={`${t('heroTitle1', '')} ${t('heroTitle2', '')}`.trim()}
        >
          <img className="fg-hero-art" src={art} alt="" loading="lazy" draggable="false" />
          <span className="fg-hero-scrim" aria-hidden="true" />
          <div className="fg-hero-body">
            <h2 className="fg-hero-title">
              <span className="fg-hero-t1">{t('heroTitle1', 'SIX GAMES.')}</span>
              <span className="fg-hero-t2">{t('heroTitle2', 'ONE VERTICAL FEED.')}</span>
            </h2>
            <p className="fg-hero-sub">
              {t('heroSub', 'Spin the wheel, beat your reaction time, and cut on the frame')}
            </p>
            <span className="fg-hero-cta">{t('heroCta', 'Open the arcade')}</span>
          </div>
        </a>

        {/* ── Entry cards ── */}
        <div className="fg-grid">
          {items.map((c, i) => (
            <button
              key={c.title + i}
              className={`fg-card${c.featured ? ' is-featured' : ''}`}
              onClick={() => c.page && onOpen?.(c.page)}
              aria-label={`Open ${c.title}`}
            >
              <span className="fg-card-top">
                <span className="fg-card-icon">{Icons[c.icon] || Icons.spark}</span>
                {c.badge && <span className={`fg-badge fg-badge--${c.tone || 'mute'}`}>{c.badge}</span>}
              </span>
              <span className="fg-card-title">{c.title}</span>
              {c.sub && <span className="fg-card-sub">{c.sub}</span>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
