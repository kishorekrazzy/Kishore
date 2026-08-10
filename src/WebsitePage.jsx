import { useState, useEffect, useRef, useCallback } from 'react';
import './WebsitePage.css';

/* ══════════════════════════════════════════════════════════════════════
   WEBSITES — a developer's project index.

   One set of markup, two layouts. The theme does not just recolour this
   page, it rearranges it:

     DARK  · "The Reel"   full-bleed alternating rows, one project at a
                          time, large. Built to be scrolled through like
                          a showreel — immersive, cinematic, unhurried.

     LIGHT · "The Index"  a two-column editorial catalogue. Compact,
                          ruled, systematic. Built to be scanned — you
                          see six projects at once and compare them.

   Both read from the same components; only WebsitePage.css differs. That
   keeps behaviour (links, keyboard, lazy loading) identical between them.
   ══════════════════════════════════════════════════════════════════════ */

const IMG = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=78`;

/* Sample entries — swap the copy and links for real projects. */
const PROJECTS = [
  {
    id: 1,
    title: 'Prompt Paper',
    tagline: 'A living library of production prompts',
    desc: 'Versioned, searchable prompt systems with evaluations attached, so a prompt that worked last month still works today. Built because keeping prompts in a notes app stops scaling around the fiftieth one.',
    url: 'https://promptpaper.buzz/',
    host: 'promptpaper.buzz',
    stack: ['React', 'Vite', 'Firebase'],
    year: '2026',
    role: 'Design · Build',
    status: 'Live',
    shot: IMG('1547658719-da2b51169166'),
  },
  {
    id: 2,
    title: 'Grade Deck',
    tagline: 'Send a look, not a screenshot',
    desc: 'A browser-side LUT previewer for showing clients a grade without shipping a 4GB export. Loads the cube file, applies it on the GPU, and gives you a shareable link.',
    url: null,
    host: 'gradedeck.local',
    stack: ['Three.js', 'GLSL', 'WebGL'],
    year: '2025',
    role: 'Concept · Build',
    status: 'Private beta',
    shot: IMG('1559028012-481c04fa702d'),
  },
  {
    id: 3,
    title: 'Cut Sheet',
    tagline: 'Shot logging that works without signal',
    desc: 'Offline-first logging for solo shoots — write on set, sync when you are back in range. The whole thing is one page and an IndexedDB store, which is the point.',
    url: null,
    host: 'cutsheet.app',
    stack: ['Svelte', 'IndexedDB', 'PWA'],
    year: '2025',
    role: 'Design · Build',
    status: 'In progress',
    shot: IMG('1551650975-87deedd944c3'),
  },
  {
    id: 4,
    title: 'Studio Metrics',
    tagline: 'Where the hours actually went',
    desc: 'A dashboard that reads project timers and turns them into something you can price against. Less about charts, more about answering one question honestly: was that job worth it?',
    url: null,
    host: 'metrics.studio',
    stack: ['React', 'D3', 'Postgres'],
    year: '2025',
    role: 'Build',
    status: 'Internal',
    shot: IMG('1460925895917-afdab827c52f'),
  },
  {
    id: 5,
    title: 'This Portfolio',
    tagline: 'An operating system pretending to be a site',
    desc: 'The page you are inside. A hue-per-section colour system in OKLCH, two independently designed themes, a dock with real windowed apps, and a surveillance room that has no business being here.',
    url: null,
    host: 'kishoreditx.dev',
    stack: ['React 19', 'OKLCH', 'Canvas'],
    year: '2026',
    role: 'Everything',
    status: 'Live',
    shot: IMG('1467232004584-a241de8bcf5d'),
  },
  {
    id: 6,
    title: 'Frame One',
    tagline: 'A landing page that loads before you blink',
    desc: 'Client landing page built to a hard budget: under 100KB on the wire, no framework, no webfont blocking paint. Scores 100 on Lighthouse and looks like it should not.',
    url: null,
    host: 'frameone.co',
    stack: ['Astro', 'Vanilla CSS'],
    year: '2024',
    role: 'Design · Build',
    status: 'Live',
    shot: IMG('1481487196290-c152efe083f5'),
  },
];

const STATS = [
  { v: '06', l: 'Projects shown' },
  { v: '100', l: 'Lighthouse best' },
  { v: '2024', l: 'Since' },
];

/* ── A browser frame. The chrome is what makes a photo read as a site. ── */
function Frame({ p, eager }) {
  return (
    <div className="wp-frame">
      <div className="wp-frame-bar" aria-hidden="true">
        <span className="wp-dot" /><span className="wp-dot" /><span className="wp-dot" />
        <span className="wp-url">{p.host}</span>
      </div>
      <div className="wp-frame-shot">
        <img
          src={p.shot}
          alt={`${p.title} — screenshot`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable="false"
        />
        <span className="wp-frame-glare" aria-hidden="true" />
      </div>
    </div>
  );
}

function Project({ p, i }) {
  const ref = useRef(null);

  // Reveal on scroll; the observer disconnects after firing once, so a
  // long page does not keep six observers alive.
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('is-in'); obs.disconnect(); } },
      // threshold must be 0, not a percentage: a percentage of a tall card
      // is a lot of pixels, so the Index layout's 720px cards would sit
      // above the fold un-revealed while the Reel's 460px rows fired fine.
      // A pixel margin triggers the same way whatever the card height is.
      { threshold: 0, rootMargin: '0px 0px -60px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const live = Boolean(p.url);

  return (
    <li ref={ref} className="wp-item" style={{ '--i': i }}>
      <span className="wp-item-no" aria-hidden="true">{String(p.id).padStart(2, '0')}</span>

      {live ? (
        <a className="wp-frame-link" href={p.url} target="_blank" rel="noopener noreferrer"
           aria-label={`Visit ${p.title}`}>
          <Frame p={p} eager={i === 0} />
        </a>
      ) : (
        <Frame p={p} eager={i === 0} />
      )}

      <div className="wp-meta">
        <div className="wp-meta-head">
          <h3 className="wp-title">{p.title}</h3>
          <span className={`wp-status${live ? ' is-live' : ''}`}>{p.status}</span>
        </div>

        <p className="wp-tagline">{p.tagline}</p>
        <p className="wp-desc">{p.desc}</p>

        <ul className="wp-stack">
          {p.stack.map((t) => <li key={t}>{t}</li>)}
        </ul>

        <dl className="wp-facts">
          <div><dt>Year</dt><dd>{p.year}</dd></div>
          <div><dt>Role</dt><dd>{p.role}</dd></div>
        </dl>

        {live ? (
          <a className="wp-visit" href={p.url} target="_blank" rel="noopener noreferrer">
            Visit site <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <span className="wp-visit is-off">{p.host}</span>
        )}
      </div>
    </li>
  );
}

export default function WebsitePage({ onBack }) {
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef(null);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? el.scrollTop / max : 0);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let frame = null;
    const handler = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = null; onScroll(); });
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => { el.removeEventListener('scroll', handler); if (frame) cancelAnimationFrame(frame); };
  }, [onScroll]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onBack(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  return (
    <div className="mn-root wp-root" ref={scrollRef}>
      <div className="wp-progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${progress})` }} />
      </div>

      <nav className="wp-nav">
        <button className="wp-back" onClick={onBack}>
          <span aria-hidden="true">←</span> Portfolio
        </button>
        <span className="wp-nav-title">Selected Builds</span>
        <span className="wp-nav-count">{PROJECTS.length} projects</span>
      </nav>

      <header className="wp-head">
        <p className="wp-kicker">Web Design &amp; Development</p>
        <h1 className="wp-h1">
          <span>Sites I</span>
          <span className="wp-h1-alt">designed, built</span>
          <span>and shipped.</span>
        </h1>
        <p className="wp-lede">
          Front to back — interface, motion, and the code underneath. Most of
          these started because the tool I wanted did not exist yet.
        </p>
        <dl className="wp-stats">
          {STATS.map((s) => (
            <div key={s.l}><dt>{s.v}</dt><dd>{s.l}</dd></div>
          ))}
        </dl>
      </header>

      <ol className="wp-list">
        {PROJECTS.map((p, i) => <Project key={p.id} p={p} i={i} />)}
      </ol>

      <footer className="wp-foot">
        <h2>Got something to build?</h2>
        <p>Briefs, half-formed ideas and "is this even possible" all welcome.</p>
        <a className="wp-foot-cta" href="mailto:krazykishore2004@gmail.com">
          krazykishore2004@gmail.com <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </div>
  );
}
