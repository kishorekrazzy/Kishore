import { useContent, withImages } from './content/store';
import { findLogo, DEFAULT_MARKS } from './footerLogos';
import './SiteFooter.css';

/* ══════════════════════════════════════════════════════════════════════
   SITE FOOTER

   Full-bleed: the pitch and stats on the left, a collage on the right
   whose two columns crawl in opposite directions and run off the right
   edge of the screen. Under it, a white strip of wordmarks running
   sideways, edge to edge.

   No panel and no nav row — the site's own island already carries the
   navigation, and a card floating inside a section made the footer read
   as one more block rather than the end of the page.

   THE TWO COLUMNS
   Each is its content twice over, translated by exactly -50% (or +50%
   for the one going the other way). At the halfway point the second copy
   sits precisely where the first began, so the loop is seamless with no
   measuring, no resize observer and no JS — the animation never needs to
   know how tall the column is. The same trick drives the wordmark strip
   horizontally.
   ══════════════════════════════════════════════════════════════════════ */

const DEFAULT_SHOTS = [
  { src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80' },
  { src: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80' },
  { src: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80' },
  { src: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80' },
];



/* Which slot each card fills, so the two columns can be built from one
   list and the CMS only has to know about the pieces. */
const CARDS = [
  { kind: 'stat',    col: 0, tone: 'amber' },
  { kind: 'photo',   col: 1, shot: 0 },
  { kind: 'photo',   col: 0, shot: 1 },
  { kind: 'stat',    col: 1, tone: 'mint' },
  { kind: 'photo',   col: 1, shot: 2 },
  { kind: 'photo',   col: 0, shot: 3 },
];

function Card({ card, copy, shots }) {
  if (card.kind === 'photo') {
    return (
      <figure className="ft-card ft-card--photo">
        <img src={shots[card.shot]?.src} alt="" loading="lazy" draggable="false" />
      </figure>
    );
  }
  const isAmber = card.tone === 'amber';
  return (
    <div className={`ft-card ft-card--stat ft-card--${card.tone}`}>
      <span className="ft-stat-kicker">{isAmber ? '' : (copy.cardBKicker || '— Up to')}</span>
      <strong className="ft-stat-value">
        {isAmber ? (copy.cardAValue || '11.17 mins') : (copy.cardBValue || '60%')}
      </strong>
      <span className="ft-stat-label">
        {isAmber ? (copy.cardALabel || 'Average watch time') : (copy.cardBLabel || 'More replies this week')}
      </span>
    </div>
  );
}

export default function SiteFooter({ onOpen }) {
  const copy = useContent('footer', {});
  const shots = withImages(DEFAULT_SHOTS, useContent('images.footer', null), 'src');
  const marks = useContent('footer.marks', null) || DEFAULT_MARKS;

  const t = (k, fallback) => (copy[k] === undefined || copy[k] === '' ? fallback : copy[k]);

  const stats = copy.stats || [
    { cap: 'UP TO', value: '288%', label: 'Uplift in watch time' },
    { cap: 'UP TO', value: '20X',  label: 'Faster turnaround' },
    { cap: 'UP TO', value: '392%', label: 'More engagement' },
  ];

  const colA = CARDS.filter((c) => c.col === 0);
  const colB = CARDS.filter((c) => c.col === 1);

  return (
    <footer className="ft-section" aria-label="Footer">

        <div className="ft-body">
          {/* ── The pitch ── */}
          <div className="ft-pitch">
            <span className="ft-badge">
              <span className="ft-badge-mark" aria-hidden="true">★</span>
              {t('badge', 'Available for freelance work')}
            </span>

            <h2 className="ft-title">
              {t('title1', 'Let’s make something')}<br />
              {t('title2', 'worth watching')}<br />
              <span className="ft-title-mute">{t('title3', 'together')}</span>
            </h2>

            <p className="ft-sub">{t('sub', 'Editing, colour, AI images and the web — one person, one pipeline, no handoffs.')}</p>

            <div className="ft-ctas">
              <a className="ft-btn ft-btn--go" href={t('ctaHref', '#contact')}>{t('cta', 'Start a project')}</a>
              <a className="ft-btn ft-btn--line" href={t('cta2Href', '#work')}>{t('cta2', 'See the work')}</a>
            </div>

            <div className="ft-stats">
              {stats.map((s, i) => (
                <div className="ft-stat" key={i}>
                  <span className="ft-stat-cap">{s.cap}</span>
                  <strong>{s.value}</strong>
                  <span className="ft-stat-sub">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Collage ──
              Two columns crawling past each other. aria-hidden because it
              is decoration and a screen reader announcing a looping list
              of duplicated cards is worse than silence. */}
          <div className="ft-collage" aria-hidden="true">
            {[colA, colB].map((col, ci) => (
              <div className={`ft-col ft-col--${ci === 0 ? 'up' : 'down'}`} key={ci}>
                {/* Rendered twice: the loop is a -50% translate, so the
                    second copy lands exactly where the first started. */}
                <div className="ft-col-run">
                  {[0, 1].map((copyIdx) => (
                    <div className="ft-col-set" key={copyIdx}>
                      {col.map((card, i) => (
                        <Card key={`${copyIdx}-${i}`} card={card} copy={copy} shots={shots} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* ── Wordmark strip ── */}
      <div className="ft-marks">
        <p className="ft-marks-cap">{t('marksLabel', 'Tools I work in every day')}</p>
        <div className="ft-marks-track" aria-hidden="true">
          {[0, 1].map((copyIdx) => (
            <div className="ft-marks-set" key={copyIdx}>
              {marks.map((m, i) => {
                const logo = findLogo(m);
                /* Anything that is not a known brand slug falls back to
                   its own text, so the strip can carry a name that has no
                   logo available without a hole in it. */
                if (!logo) return <span className="ft-mark ft-mark--txt" key={`${copyIdx}-${i}`}>{m}</span>;
                return (
                  <span
                    className="ft-mark"
                    key={`${copyIdx}-${i}`}
                    title={logo.title}
                    style={{ '--brand': `#${logo.hex}` }}
                  >
                    <svg viewBox="0 0 24 24" role="img" aria-label={logo.title}>
                      <path d={logo.path} />
                    </svg>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="ft-base">
        <span>{t('copyright', `© ${new Date().getFullYear()} Kishore. Built from scratch.`)}</span>
        <button type="button" className="ft-top" onClick={() => onOpen?.()}>Back to top ↑</button>
      </div>
    </footer>
  );
}
