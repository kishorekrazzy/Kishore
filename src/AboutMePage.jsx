import { useState, useEffect, useCallback } from 'react';
import './AboutMePage.css';
import { useContent, withImages } from './content/store';

const DEFAULT_GALLERY = [
  { id: 1, label: 'Cinematic Reel',    tag: 'Showreel',   ac: '#3b82f6',
    img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1400&q=78',
    year: '2026', role: 'Edit · Grade · Sound',
    desc: 'The 2026 showreel — two minutes cut from about forty hours of footage. Built around rhythm rather than highlights: every cut lands on the track, and nothing stays on screen longer than it earns.' },
  { id: 2, label: 'AI Portraits',      tag: 'AI Art',     ac: '#a855f7',
    img: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=1400&q=78',
    year: '2026', role: 'Prompting · Compositing',
    desc: 'A portrait series generated, then retouched by hand. The model gets you eighty per cent of the way; the last twenty — skin, eyes, edge light — is still manual work, and it is what separates a render from a photograph.' },
  { id: 3, label: 'Underwater VFX',    tag: 'VFX',        ac: '#06b6d4',
    img: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1400&q=78',
    year: '2025', role: 'Simulation · Comp',
    desc: 'Practical water plates extended with simulated caustics and particulate. The trick was matching the grain and falloff of the real footage so the seam between plate and sim never announces itself.' },
  { id: 4, label: 'Brand Films',       tag: 'Commercial', ac: '#f59e0b',
    img: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1400&q=78',
    year: '2025', role: 'Director · Editor',
    desc: 'Short-form brand work for founders who cannot afford an agency and do not want one. Written, shot and cut in-house, usually inside a week, usually with a crew of two.' },
  { id: 5, label: 'Motion Typography', tag: 'Motion',     ac: '#10b981',
    img: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1400&q=78',
    year: '2026', role: 'After Effects',
    desc: 'Kinetic type built on expressions rather than keyframes, so timing can be retuned to a new track in minutes instead of an afternoon. The rig outlived the project and now ships in the AE pack.' },
  { id: 6, label: 'Color Grading',     tag: 'Colour',     ac: '#8b5cf6',
    img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1400&q=78',
    year: '2026', role: 'DaVinci Resolve',
    desc: 'Node trees, not presets. Balance first — every shot neutral and matched — and only then a look on top. Doing it in that order is why the grade survives being viewed on a phone.' },
  { id: 7, label: 'Short Film',        tag: 'Narrative',  ac: '#ec4899',
    img: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1400&q=78',
    year: '2024', role: 'Edit · Post',
    desc: 'Fourteen minutes, no dialogue for the first four. The edit went through eleven passes; most of the work was deciding what to remove, which is most of the work on any cut.' },
  { id: 8, label: 'Prompt Series',     tag: 'AI Gen',     ac: '#14b8a6',
    img: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1400&q=78',
    year: '2026', role: 'Systems · Evals',
    desc: 'A prompt system rather than a prompt: versioned, evaluated, and documented so it produces the same result next month. The failure catalogue turned out more useful than the prompts.' },
  { id: 9, label: 'Web Experience',    tag: 'Digital',    ac: '#22c55e',
    img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1400&q=78',
    year: '2026', role: 'React · Motion',
    desc: 'Interfaces built the way an edit is: timing first, then texture. Motion carries meaning — what moved, where it went, why — and anything that fails that test gets cut.' },
];

export default function AboutMePage({ onBack }) {
  const GALLERY = withImages(DEFAULT_GALLERY, useContent('images.aboutMe', null), 'img');
  const [openId, setOpenId] = useState(null);
  const open = openId ? GALLERY.find(g => g.id === openId) : null;

  const close = useCallback(() => setOpenId(null), []);

  // Escape closes the detail view, and the page behind it must not scroll
  // while it is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  return (
    <div className="amp-root">

      {/* ── NAV ── */}
      <nav className="amp-nav">
        <button className="amp-back" onClick={onBack}>
          <span className="amp-back-ico">←</span>
          <span>Portfolio</span>
        </button>
        <span className="amp-nav-brand">KishoreditX</span>
        <div className="amp-nav-pad" aria-hidden="true" />
      </nav>

      {/* ── HERO ── */}
      <section className="amp-hero">
        <video
          className="amp-hero-vid"
          autoPlay loop muted playsInline preload="auto"
        >
          <source src="/Glitchvd.mp4" type="video/mp4" />
        </video>

        <div className="amp-ov-top"    aria-hidden="true" />
        <div className="amp-ov-bottom" aria-hidden="true" />
        <div className="amp-ov-left"   aria-hidden="true" />
        <div className="amp-ov-right"  aria-hidden="true" />
        <div className="amp-ov-fog"    aria-hidden="true" />

        <div className="amp-hero-content">
          <p className="amp-hero-sup">KISH &nbsp;·&nbsp; PORTFOLIO</p>
          <h1 className="amp-hero-title">KishoreditX</h1>
          <div className="amp-hero-rating" aria-label="Rating 9.8 out of 10">
            <span className="amp-star">★</span>
            <span className="amp-rval">9.8</span>
            <span className="amp-rdiv">/10</span>
          </div>
          <p className="amp-hero-meta">
            2026 &nbsp;|&nbsp; 5+ Years Active &nbsp;|&nbsp; Language: Visual &nbsp;|&nbsp; By Kish
          </p>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="amp-divider" aria-hidden="true" />

      {/* ── INFO PANEL ── */}
      <section className="amp-info" aria-label="Creator information">

        {/* Poster card */}
        <div className="amp-poster" aria-hidden="true">
          <div className="amp-poster-bg"    />
          <div className="amp-poster-grain" />
          <div className="amp-poster-scan"  />
          <span className="amp-poster-k">K</span>
          <div className="amp-poster-shine" />
          <div className="amp-poster-foot">
            <span className="amp-poster-name">KISH</span>
            <span className="amp-poster-year">2026</span>
          </div>
        </div>

        {/* Detail panel */}
        <div className="amp-details">
          <div className="amp-drow">
            <span className="amp-dl">Created by:</span>
            <span className="amp-dv">Kish</span>
          </div>
          <div className="amp-drow">
            <span className="amp-dl">Specialties:</span>
            <span className="amp-dv">Video Editing, AI Art, Prompt Engineering</span>
          </div>
          <div className="amp-drow">
            <span className="amp-dl">Tools:</span>
            <span className="amp-dv">Premiere Pro, DaVinci Resolve, After Effects, Midjourney</span>
          </div>

          <p className="amp-bio">
            AI-driven video editor and visual storyteller engineering cinematic experiences that leave a
            lasting imprint on every screen they touch. Bridging raw human creativity with machine intelligence
            — frame by frame, pixel by pixel.
          </p>

          <div className="amp-tags" aria-label="Speciality tags">
            {['Video Editing', 'AI Art', 'Motion Design', 'Prompt Eng.', 'Web Dev'].map(t => (
              <span key={t} className="amp-tag">{t}</span>
            ))}
          </div>

          <div className="amp-btns">
            <a href="mailto:krazykishore2004@gmail.com" className="amp-btn-primary">
              Get in Touch
            </a>
            <button className="amp-btn-ghost" onClick={onBack}>← Portfolio</button>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="amp-gallery" aria-label="Work gallery">
        <h2 className="amp-gallery-head">GALLERY</h2>
        <div className="amp-gallery-grid">
          {GALLERY.map(item => (
            <button
              key={item.id}
              type="button"
              className="amp-gi"
              style={{ '--ac': item.ac }}
              onClick={() => setOpenId(item.id)}
              aria-label={`${item.label} — open details`}
            >
              <img className="amp-gi-img" src={item.img} alt="" loading="lazy" draggable="false" />
              <div className="amp-gi-scrim"     aria-hidden="true" />
              <div className="amp-gi-ctl"       aria-hidden="true" />
              <div className="amp-gi-cbr"       aria-hidden="true" />
              <span className="amp-gi-num"      aria-hidden="true">0{item.id}</span>
              <div className="amp-gi-info">
                <span className="amp-gi-tag">{item.tag}</span>
                <span className="amp-gi-label">{item.label}</span>
              </div>
              <span className="amp-gi-open" aria-hidden="true">View</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="amp-quote-sec" aria-label="Signature quote">
        <blockquote className="amp-quote">
          <p>"Crafting visuals that don't just look good — they hit."</p>
          <cite>Kish (KishoreditX, 2026)</cite>
        </blockquote>
      </section>

      {/* ── DETAIL VIEW ── image left, description right ── */}
      {open && (
        <div
          className="amp-lb"
          role="dialog"
          aria-modal="true"
          aria-label={open.label}
          onClick={close}
        >
          {/* stopPropagation so clicking the panel itself doesn't close it */}
          <div className="amp-lb-panel" style={{ '--ac': open.ac }} onClick={(e) => e.stopPropagation()}>
            <figure className="amp-lb-media">
              <img src={open.img} alt={open.label} />
            </figure>

            <div className="amp-lb-body">
              <span className="amp-lb-tag">{open.tag}</span>
              <h3 className="amp-lb-title">{open.label}</h3>
              <div className="amp-lb-rule" aria-hidden="true" />
              <p className="amp-lb-desc">{open.desc}</p>
              <dl className="amp-lb-meta">
                <div><dt>Year</dt><dd>{open.year}</dd></div>
                <div><dt>Role</dt><dd>{open.role}</dd></div>
              </dl>
              <div className="amp-lb-nav">
                <button
                  type="button"
                  onClick={() => setOpenId(GALLERY[(GALLERY.findIndex(g => g.id === open.id) - 1 + GALLERY.length) % GALLERY.length].id)}
                  aria-label="Previous"
                >←</button>
                <span className="amp-lb-count">{String(open.id).padStart(2, '0')} / 09</span>
                <button
                  type="button"
                  onClick={() => setOpenId(GALLERY[(GALLERY.findIndex(g => g.id === open.id) + 1) % GALLERY.length].id)}
                  aria-label="Next"
                >→</button>
              </div>
            </div>

            <button className="amp-lb-close" type="button" onClick={close} aria-label="Close">✕</button>
          </div>
        </div>
      )}

    </div>
  );
}
