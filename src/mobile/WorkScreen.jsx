import { useState, useMemo } from 'react';
import { useContent } from '../content/store';
import { tap, phoneSrc } from './mobileUtils';
import { Icon, Img, Reveal } from './ui';
import Sheet from './Sheet';
import { ReelPlayer, CameraWall, GradeStudio, SiteList, Toolkit, CertWall } from './WorkPieces';

/* ══════════════════════════════════════════════════════════════════════
   WORK

   The desktop puts this behind eight sub-pages, each a full route. On a
   phone that is a lot of navigation for what is, underneath, one body of
   work — so the board is flat and filterable, and a tap opens the item
   as a sheet over it. You never lose your place, and Back always means
   "close this" rather than "go somewhere".

   What each sheet CONTAINS is deliberately not uniform. An earlier
   version gave every item the same cover-paragraph-grid treatment, which
   made the two items whose whole point is motion — the reel and the
   camera room — look broken, because a page about video that shows no
   video is broken. Each item now opens into the medium it is actually
   made of; see WorkPieces.jsx.
   ══════════════════════════════════════════════════════════════════════ */

const FILTERS = [
  { id: 'all',    label: 'Everything' },
  { id: 'motion', label: 'Motion' },
  { id: 'ai',     label: 'AI' },
  { id: 'web',    label: 'Web' },
  { id: 'play',   label: 'Play' },
  { id: 'about',  label: 'Me' },
];

/* One entry per tile.

   `view` names the detail component; `cat` is the single filter it
   belongs to. Nothing is filed under 'all' — that was a bug, not a
   category: those items matched `cat === 'all'` inside every filter, so
   Certificates and About Me turned up under Motion, AI, Web and Play.

   `gridIndex` points into the CMS's grid.cards array BY POSITION.
   Matching on the first word of the title (the previous approach) made
   "The Toolkit" match the card called "The Room", so the board rendered
   two tiles named The Room and one of them opened the wrong content. */
const ITEMS = [
  {
    id: 'video', cat: 'motion', view: 'reel', wide: true, badge: 'SHOWREEL', gridIndex: 0,
    title: 'Video Editing', sub: 'Cuts, grades and rhythm',
    imageKey: 'videoThumbs', imageIndex: 0,
    lede: 'Long-form, short-form and everything that has to hold attention past four seconds. Swipe the reel — six pieces, newest first.',
  },
  {
    id: 'room', cat: 'play', view: 'room', badge: 'LIVE', gridIndex: 5,
    title: 'The Room', sub: 'Six feeds, one desk',
    imageKey: 'finderWorks', imageIndex: 4,
    lede: 'The place the work actually happens, on the cameras that watch it. Tap any feed to bring it full-frame.',
  },
  {
    id: 'color', cat: 'motion', view: 'grade',
    title: 'Colour Grading', sub: 'Drag to compare',
    imageKey: 'videoThumbs', imageIndex: 1,
    lede: 'Neutralise, match, then grade. A look applied to unbalanced footage falls apart the moment it leaves the suite and gets watched on a phone at a bus stop.',
  },
  {
    id: 'ai', cat: 'ai', view: 'gallery', badge: 'GALLERY', gridIndex: 2,
    title: 'AI Images', sub: 'Prompted, curated, printed',
    imageKey: 'skillPacks', imageIndex: 0, gallery: 'aiGallery',
    lede: 'Prompt systems rather than prompts. The model is the commodity; the harness around it — the inputs, the failure catalogue, the checks — is the part that is mine.',
  },
  {
    id: 'web', cat: 'web', view: 'sites', gridIndex: 3,
    title: 'Websites', sub: 'Designed, built and shipped',
    imageKey: 'bentoCards', imageIndex: 6,
    lede: 'Designed and built by one person, which removes the handoff where most of the intent normally gets lost.',
  },
  {
    id: 'skills', cat: 'web', view: 'kit', gridIndex: 4,
    title: 'The Toolkit', sub: 'Everything in the arsenal',
    imageKey: 'skillPacks', imageIndex: 3,
    lede: 'Software is not a skill, it is a keyboard shortcut. Knowing what a scene needs before opening anything is the part that took the decade.',
  },
  {
    id: 'games', cat: 'play', view: 'games', wide: true, badge: 'ARCADE',
    title: 'Six Games', sub: 'One vertical feed',
    imageKey: 'arcade', imageIndex: 0, gallery: 'arcade',
    lede: 'Spin the wheel, beat your reaction time, cut on the frame. Built because a portfolio nobody plays with is a PDF with extra steps.',
  },
  {
    id: 'certs', cat: 'about', view: 'certs',
    title: 'Certificates', sub: 'Proof of the hours',
    imageKey: 'certs', imageIndex: 0,
  },
  {
    id: 'about', cat: 'about', view: 'gallery', gridIndex: 1,
    title: 'About Me', sub: 'The long version',
    imageKey: 'aboutMe', imageIndex: 0, gallery: 'aboutMe',
  },
];

/* ── Gallery ──────────────────────────────────────────────────────── */
function Gallery({ pictures, onLightbox }) {
  if (!pictures.length) return null;
  return (
    <>
      <p className="mb-eyebrow" style={{ marginTop: 8 }}>
        {pictures.length} {pictures.length === 1 ? 'frame' : 'frames'}
      </p>
      <div className="mb-detail-grid">
        {pictures.map((p, i) => (
          <button key={i} onClick={() => { tap(); onLightbox(i); }} aria-label={`Open ${p.title}`}>
            <Img src={p.src} alt={p.title} w={i % 3 === 0 ? 640 : 340} />
          </button>
        ))}
      </div>
    </>
  );
}

/* ── Detail ───────────────────────────────────────────────────────── */
function Detail({ item, onClose }) {
  const registry  = useContent('images', {});
  const aiGallery = useContent('aiGallery', []);
  const certs     = useContent('certs', {});
  const about     = useContent('about', {});
  const [lightbox, setLightbox] = useState(null);

  const cover = registry[item.imageKey]?.[item.imageIndex] || registry.bentoCards?.[0];

  const pictures = useMemo(() => {
    if (!item.gallery) return [];
    if (item.gallery === 'aiGallery') {
      return aiGallery.map((g) => ({ src: g.src, title: g.title, note: g.model }));
    }
    return (registry[item.gallery] || []).map((src) => ({ src, title: item.title, note: '' }));
  }, [item, registry, aiGallery]);

  const certRows = (certs.items || []).filter((c) => c.title);
  /* Each fallback is tied to the item it belongs to. A blanket
     `|| about.paragraphs[0]` meant any item without its own copy opened
     with the About Me introduction — which is how Colour Grading came to
     lead with "I'm Kish, an AI-driven video editor". */
  const lede = item.lede
    || (item.id === 'certs' ? certs.intro : null)
    || (item.id === 'about' ? about.paragraphs?.[0] : null);

  /* The reel and the camera wall want the whole screen and bring their
     own furniture, so they skip the cover-and-prose frame entirely. */
  const bare = item.view === 'reel' || item.view === 'room';

  return (
    <>
      <Sheet title={item.title} onClose={onClose} full bare={item.view === 'reel'}>
        {bare ? (
          <div className="mb-detail mb-detail--bare">
            {item.lede && <p className="mb-body mb-detail-lede">{item.lede}</p>}
            {item.view === 'reel' && <ReelPlayer />}
            {item.view === 'room' && <CameraWall />}
          </div>
        ) : (
          <div className="mb-detail">
            <div className="mb-detail-hero">
              <Img src={cover} alt={item.title} w={760} eager />
            </div>

            <div className="mb-detail-body">
              <div>
                <p className="mb-eyebrow">{item.sub}</p>
                <h1 className="mb-h2" style={{ marginTop: 10 }}>{item.title}</h1>
              </div>

              {lede && <p className="mb-body">{lede}</p>}

              {item.view === 'grade' && <GradeStudio />}
              {item.view === 'sites' && <SiteList />}
              {item.view === 'kit'   && <Toolkit />}
              {item.view === 'certs' && <CertWall rows={certRows} />}

              {item.view === 'games' && (
                <a className="mb-btn mb-btn--fill mb-btn--wide" href="#/games">
                  Open the arcade
                  <Icon name="arrow" size={17} />
                </a>
              )}

              {item.view === 'gallery' && <Gallery pictures={pictures} onLightbox={setLightbox} />}
              {item.view === 'games'   && <Gallery pictures={pictures} onLightbox={setLightbox} />}
            </div>
          </div>
        )}
      </Sheet>

      {lightbox != null && (
        <Lightbox
          pictures={pictures}
          at={lightbox}
          onMove={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}

/* ── Lightbox ─────────────────────────────────────────────────────────
   Swipeable, because a gallery you have to close and reopen for every
   picture is a gallery nobody looks through twice. */
function Lightbox({ pictures, at, onMove, onClose }) {
  const pic = pictures[at];
  if (!pic) return null;
  const go = (d) => {
    const n = (at + d + pictures.length) % pictures.length;
    tap();
    onMove(n);
  };
  return (
    <div className="mb-lightbox" role="dialog" aria-modal="true" aria-label={pic.title}>
      <button className="mb-lightbox-back" onClick={onClose} aria-label="Close gallery" />
      <img src={phoneSrc(pic.src, 900)} alt={pic.title} />

      <button className="mb-lightbox-x mb-hit" onClick={onClose} aria-label="Close">
        <Icon name="close" size={20} />
      </button>

      {pictures.length > 1 && (
        <>
          <button className="mb-lightbox-nav mb-lightbox-nav--prev mb-hit" onClick={() => go(-1)} aria-label="Previous">
            <Icon name="back" size={22} />
          </button>
          <button className="mb-lightbox-nav mb-lightbox-nav--next mb-hit" onClick={() => go(1)} aria-label="Next">
            <Icon name="arrow" size={22} />
          </button>
        </>
      )}

      <div className="mb-lightbox-cap">
        <b>{pic.title}</b>
        <span>{pic.note || `${at + 1} of ${pictures.length}`}</span>
      </div>
    </div>
  );
}

/* ── Screen ───────────────────────────────────────────────────────── */
export default function WorkScreen({ open, onOpen }) {
  const registry = useContent('images', {});
  const gridCards = useContent('grid.cards', []);
  const bento = useContent('bento', {});
  const [filter, setFilter] = useState('all');

  /* CMS wording overlays by POSITION — gridIndex — so renaming a card in
     the dashboard cannot make it collide with a different tile. */
  const items = useMemo(() => ITEMS.map((it) => {
    const cms = it.gridIndex != null ? gridCards[it.gridIndex] : null;
    if (!cms || !cms.title) return it;
    return { ...it, title: cms.title, sub: cms.sub || it.sub, badge: cms.badge || it.badge };
  }), [gridCards]);

  const shown = filter === 'all' ? items : items.filter((i) => i.cat === filter);
  const active = items.find((i) => i.id === open);

  /* Full-width tiles are the board's rhythm, but they only work when
     there is enough behind them for `grid-auto-flow: dense` to backfill
     the cell they orphan. A filter that leaves two or three tiles has
     nothing to backfill with, so the wide one strands an empty cell
     beside its neighbour. Below four, everything is the same size and
     the grid stays whole. */
  const allowWide = shown.length >= 4;

  return (
    <>
      <section className="mb-sec mb-work" style={{ paddingTop: 'calc(var(--mb-safe-t) + var(--mb-top) + 12px)' }}>
        <div className="mb-head">
          <Reveal as="p" className="mb-eyebrow">{bento.eyebrow || 'Services & Work'}</Reveal>
          <Reveal as="h1" className="mb-h1" delay={50}>
            {bento.title || 'The Full'} <span className="mb-accent">{bento.titleAccent || 'Stack'}</span>
          </Reveal>
          <Reveal as="p" className="mb-body" delay={90}>
            {bento.sub || 'Everything I create — in one frame.'} Tap anything to open it.
          </Reveal>
        </div>

        <div className="mb-filters" role="tablist" aria-label="Filter work">
          {FILTERS.map((f) => {
            const n = f.id === 'all' ? items.length : items.filter((i) => i.cat === f.id).length;
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                className={`mb-filter${filter === f.id ? ' mb-filter--on' : ''}`}
                onClick={() => { tap(); setFilter(f.id); }}
              >
                {f.label}
                <em>{n}</em>
              </button>
            );
          })}
        </div>

        <div className="mb-tiles">
          {shown.map((it, i) => (
            <Reveal
              key={it.id}
              /* Only the first row is staggered. Delaying a list that is
                 already scrolled past means the last cards animate in
                 long after they were needed. */
              delay={Math.min(i, 3) * 60}
              className={`mb-tile mb-press${it.wide && allowWide ? ' mb-tile--wide' : ''}`}
              as="button"
              onClick={() => { tap(); onOpen(it.id); }}
              aria-label={`Open ${it.title}`}
            >
              <Img src={registry[it.imageKey]?.[it.imageIndex]} alt="" w={it.wide && allowWide ? 720 : 380} />
              {it.badge && <span className="mb-tile-badge">{it.badge}</span>}
              <span className="mb-tile-go"><Icon name="arrow" size={15} /></span>
              <span className="mb-tile-body">
                <h3>{it.title}</h3>
                <p>{it.sub}</p>
              </span>
            </Reveal>
          ))}
        </div>

        {shown.length === 0 && (
          <p className="mb-body" style={{ padding: '30px 0', textAlign: 'center' }}>
            Nothing filed under that yet.
          </p>
        )}
      </section>

      {active && <Detail item={active} onClose={() => onOpen(null)} />}
    </>
  );
}
