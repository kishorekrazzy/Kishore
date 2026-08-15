import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import './index.css';
import { MusicProvider } from './MusicContext';
import AboutSection from './AboutSection';
import TubesBackground from './TubesBackground';
import TeamSection from './TeamSection';
import BannerSection from './BannerSection';
import BentoSection from './BentoSection';
// Sub-pages are code-split. They were static imports, which pulled every
// page — and Firebase, which only SkillsPage uses — into the first-load
// bundle. Each now downloads the first time it is opened.
const AboutMePage      = lazy(() => import('./AboutMePage'));
const VideoEditingPage = lazy(() => import('./VideoEditingPage'));
const RoomPage         = lazy(() => import('./RoomPage'));
const AIImagesPage     = lazy(() => import('./AIImagesPage'));
const WebsitePage      = lazy(() => import('./WebsitePage'));
const SkillsPage       = lazy(() => import('./SkillsPage'));
const CertificatesPage = lazy(() => import('./CertificatesPage'));
const GamesHub         = lazy(() => import('./GamesHub'));
const ToolsArsenal     = lazy(() => import('./ToolsArsenal'));
// The admin dashboard pulls in Firebase Auth — it must never land in a
// visitor's bundle.
const AdminDashboard   = lazy(() => import('./admin/AdminDashboard'));
// Only downloaded if somebody actually presses the ⚠ button.
const TimelineCalendar = lazy(() => import('./TimelineCalendar'));
// Three.js + rapier + drei is a heavy graph — it must never be in the
// first-load bundle, only fetched when the logo is actually clicked.
const LanyardOverlay   = lazy(() => import('./LanyardOverlay'));
const AiChat           = lazy(() => import('./AiChat'));
import MacDock from './MacDock';
import { MusicWindowManager }      from './MusicWindow';
import { NotesWindowManager }      from './NotesWindow';
import { TerminalWindowManager }   from './TerminalWindow';
import { CalculatorWindowManager } from './CalculatorWindow';
import WidgetsSection from './WidgetsSection';
import NotesSection from './NotesSection';
import FeatureBanner from './FeatureBanner';
import FeatureGrid from './FeatureGrid';
import PromoBanner from './PromoBanner';
import SiteFooter from './SiteFooter';
import ContactSection from './ContactSection';
import DeckSection from './DeckSection';
import DynamicIsland from './DynamicIsland';
import WarpText from './WarpText';
import ErrorBoundary from './ErrorBoundary';
import AiBotDock from './AiBotDock';
import Spidey from './Spidey';
import { useContent } from './content/store';
import { startAnalytics, trackEvent, trackPage } from './services/analytics';

// ── 4 HERO SECTION DATA ─────────────────────────────────────────────
// Fallback only. The live values come from Firestore via useContent — see
// content/defaults.js, which mirrors this exactly.
const HERO_SECTIONS = [
  {
    id: 'video',
    label: 'Video Editing',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=2400&q=75',
    stat1: { val: '>100', label: 'Projects delivered' },
    stat2: { val: '>5 Yrs', label: 'Experience' },
    cta: 'View My Work',
  },
  {
    id: 'ai',
    label: 'AI Images',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=2400&q=75',
    stat1: { val: '>500+', label: 'AI images generated' },
    stat2: { val: '>10+', label: 'AI tools mastered' },
    cta: 'Explore AI Art',
  },
  {
    id: 'color',
    label: 'Color Grading',
    image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=2400&q=75',
    stat1: { val: '>200+', label: 'Videos graded' },
    stat2: { val: '>8 Yrs', label: 'Color expertise' },
    cta: 'See Color Work',
  },
  {
    id: 'web',
    label: 'Web Design',
    image: 'https://images.unsplash.com/photo-1504509546545-e000b4a62425?auto=format&fit=crop&w=2400&q=75',
    stat1: { val: '>30+', label: 'Sites designed' },
    stat2: { val: '>3 Yrs', label: 'Web development' },
    cta: 'View Web Work',
  },
];


// ── Icons ────────────────────────────────────────────────────────────
function CatIcon({ id }) {
  if (id === 'video') return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="6,3 20,12 6,21" />
    </svg>
  );
  if (id === 'ai') return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 5.5H19l-4.6 3.4 1.8 5.5L12 13.4l-4.2 3 1.8-5.5L5 7.5h5.2z" />
    </svg>
  );
  if (id === 'color') return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M8 11l2.5 2.5L8 16M13 16h4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 6.5l2.5 2.5L10 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Warped headlines ────────────────────────────────────────────────
   The headline is rasterised into a canvas and pushed through a glass
   shader, so it cannot take a CSS colour — ctx.fillStyle needs a literal.
   This is the computed value of --ink at the hero's amber hue. If that is
   retuned in theme.css, retune it here too. */
const HEADLINE_INK = '#fcf3f1';

/* Shared warp settings. Each layout differs only in its box and type
   scale, which ride on the class — see .hl-warp in index.css. */
function WarpHeadline({ text, variant, ink, fontSize, letterSpacing, textAlign = 'center' }) {
  return (
    <h1 className={`hl-headline hl-headline--${variant}`}>
      <WarpText
        className={`hl-warp hl-warp--${variant}`}
        text={text}
        color={ink}
        fontSize={fontSize}
        fontWeight={900}
        letterSpacing={letterSpacing}
        textAlign={textAlign}
        lineHeight={1}
        warpStrength={0.08}
        warpScale={1.7}
        speed={0.55}
        pointerInfluence={0.42}
        pointerStrength={0.38}
        refraction={0.018}
        ripple
      />
    </h1>
  );
}

/* Copy from the CMS carries real newlines; the layouts want <br />. */
function Lines({ text }) {
  return String(text || '').split('\n').map((line, i, all) => (
    <span key={i}>{line}{i < all.length - 1 && <br />}</span>
  ));
}

function Stat({ val, label }) {
  return (
    <div className="hl-stat">
      <div className="hl-stat-check"><CheckIcon /></div>
      <div className="hl-stat-text">
        <strong>{val}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

// ── 4 UNIQUE HERO LAYOUTS ────────────────────────────────────────────
function HeroLayout({ section, fading }) {
  const fade = fading ? ' hero-content--fade' : '';
  const ink  = HEADLINE_INK;

  // ── VIDEO EDITING: big headline bottom-left, editorial description top-right ──
  if (section.id === 'video') return (
    <div className={`hero-content hero-content--video${fade}`}>
      <div className="hl-v-side">
        <p className="hl-eyebrow">{section.eyebrow}</p>
        <p className="hl-prose"><Lines text={section.prose} /></p>
        <span className="hl-micro">{section.micro}</span>
      </div>
      <div className="hl-v-bottom">
        <WarpHeadline
          variant="xl" ink={ink}
          text={section.headline}
          /* Flush left — .hl-v-bottom is anchored to the bottom-left, so a
             centred headline floated away from the edge it belongs on. */
          textAlign="left"
          fontSize="clamp(3.4rem, 7.2vw, 9rem)" letterSpacing="-0.025em"
        />
        <div className="hl-stats-row">
          <Stat val={section.stat1.val} label={section.stat1.label} />
          <Stat val={section.stat2.val} label={section.stat2.label} />
        </div>
        <a href="#work" className="hero-pill-btn">{section.cta}</a>
      </div>
    </div>
  );

  // ── AI IMAGES: headline centered in video, stats spread bottom corners ──
  if (section.id === 'ai') return (
    <div className={`hero-content hero-content--ai${fade}`}>
      <div className="hl-ai-center">
        <p className="hl-eyebrow hl-eyebrow--center">{section.eyebrow}</p>
        <WarpHeadline
          variant="center" ink={ink}
          text={section.headline}
          fontSize="clamp(4rem, 8.8vw, 11rem)" letterSpacing="-0.03em"
        />
        <div className="hl-center-rule" />
        <p className="hl-center-desc"><Lines text={section.prose} /></p>
      </div>
      <div className="hl-ai-bottom">
        <Stat val={section.stat1.val} label={section.stat1.label} />
        <a href="#work" className="hero-pill-btn">{section.cta}</a>
        <Stat val={section.stat2.val} label={section.stat2.label} />
      </div>
    </div>
  );

  // ── COLOR GRADING: ghost word bg, left column description, right-bottom headline ──
  if (section.id === 'color') return (
    <div className={`hero-content hero-content--color${fade}`}>
      <span className="hl-ghost-word" aria-hidden="true">{String(section.headline || '').split('\n')[1] || ''}</span>
      <div className="hl-c-left">
        <p className="hl-eyebrow">{section.eyebrow}</p>
        <p className="hl-prose"><Lines text={section.prose} /></p>
        <div className="hl-stats-row hl-stats-row--col">
          <Stat val={section.stat1.val} label={section.stat1.label} />
          <Stat val={section.stat2.val} label={section.stat2.label} />
        </div>
        <a href="#work" className="hero-pill-btn">{section.cta}</a>
      </div>
      <div className="hl-c-bottom-right">
        <WarpHeadline
          variant="right" ink={ink}
          text={section.headline}
          fontSize="clamp(3.2rem, 7vw, 8.5rem)" letterSpacing="-0.025em"
        />
      </div>
    </div>
  );

  // ── WEB DESIGN: left description column, right-aligned big headline ──
  return (
    <div className={`hero-content hero-content--web${fade}`}>
      <div className="hl-w-left">
        <p className="hl-eyebrow">{section.eyebrow}</p>
        <p className="hl-prose"><Lines text={section.prose} /></p>
        <div className="hl-stats-row hl-stats-row--col">
          <Stat val={section.stat1.val} label={section.stat1.label} />
          <Stat val={section.stat2.val} label={section.stat2.label} />
        </div>
        <a href="#work" className="hero-pill-btn">{section.cta}</a>
      </div>
      <div className="hl-w-right">
        <WarpHeadline
          variant="right" ink={ink}
          text={section.headline}
          fontSize="clamp(3.2rem, 7vw, 8.5rem)" letterSpacing="-0.025em"
        />
      </div>
    </div>
  );
}

// ── ROUTING ──────────────────────────────────────────────────────────
// Sub-pages are overlays rather than separate documents, so they need to
// put something in the URL themselves; otherwise a refresh always lands
// back on the home page.

const PAGE_IDS = ['about', 'video', 'room', 'ai', 'web', 'skills', 'certs', 'games', 'admin'];

// Routes are namespaced under "#/" on purpose. The nav already uses bare
// anchors (#about, #work, #contact) to jump between sections, so matching
// a bare "#about" here would open the About Me page instead of scrolling
// to the About section.
const ROUTE_RE = /^#\/([a-z]+)$/;

function readPageFromHash() {
  if (typeof window === 'undefined') return null;
  const m = window.location.hash.match(ROUTE_RE);
  return m && PAGE_IDS.includes(m[1]) ? m[1] : null;
}

// Where the home page was left off, so closing a sub-page (or reloading)
// returns you to the same spot instead of the top.
const SCROLL_KEY = 'kish.homeScroll';

/* Shown while a code-split sub-page downloads. Mirrors the shape every
   sub-page shares — back button, title block, content grid — so the
   swap to real content is a fill rather than a re-layout. */
function PageSkeleton() {
  return (
    <div className="pg-skel" role="status" aria-label="Loading page">
      <div className="pg-skel-nav">
        <span className="sk sk-pill" />
        <span className="sk sk-line sk-w6" />
      </div>
      <div className="pg-skel-head">
        <span className="sk sk-line sk-w4" />
        <span className="sk sk-title" />
        <span className="sk sk-title sk-w7" />
        <span className="sk sk-line sk-w9" />
        <span className="sk sk-line sk-w6" />
      </div>
      <div className="pg-skel-grid">
        {Array.from({ length: 6 }, (_, i) => (
          <div className="pg-skel-card" key={i} style={{ '--i': i }}>
            <span className="sk sk-thumb" />
            <span className="sk sk-line sk-w7" />
            <span className="sk sk-line sk-w5" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────
export default function App() {
  // Which sub-page is open, mirrored in the URL hash so a refresh, a
  // bookmark and the browser Back button all behave. Reading the hash in
  // the initialiser means the correct page is mounted on the very first
  // render — no flash of the home page before it corrects itself.
  const [page, setPage] = useState(readPageFromHash);

  const showAboutMe   = page === 'about';
  const showVideoPage = page === 'video';
  const showRoomPage  = page === 'room';
  const showAIImages  = page === 'ai';
  const showWebsite   = page === 'web';
  const showSkills    = page === 'skills';
  const showCerts     = page === 'certs';
  const showGames     = page === 'games';
  const showAdmin     = page === 'admin';

  // Boolean-shaped setters so every existing call site keeps working.
  const openPage  = useCallback((id) => (v) => setPage(v ? id : null), []);
  const setShowAboutMe   = openPage('about');
  const setShowVideoPage = openPage('video');
  const setShowRoomPage  = openPage('room');
  const setShowAIImages  = openPage('ai');
  const setShowWebsite   = openPage('web');
  const setShowSkills    = openPage('skills');
  const setShowCerts     = openPage('certs');
  const setShowGames     = openPage('games');
  const [showWarning, setShowWarning] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const scrollRef = useRef(null);

  const anySubPage = showAboutMe || showVideoPage || showRoomPage || showAIImages || showWebsite || showSkills || showCerts || showGames;
  const heroSections  = useContent('hero.sections', HERO_SECTIONS);
  const activeSection = heroSections[activeIdx] ?? HERO_SECTIONS[activeIdx];

  const handleCatClick = useCallback((idx) => {
    if (idx === activeIdx || fading) return;
    setFading(true);
    setTimeout(() => { setActiveIdx(idx); setFading(false); }, 280);
  }, [activeIdx, fading]);

  /* The hero used to track the cursor: a mousemove listener fed a rAF loop
     that translated the plate wrapper and the hero copy a few pixels each
     frame. Removed on request — every other hero effect is untouched. The
     plate keeps its own scale and Ken Burns drift from CSS. */

  // Dock icon → page navigation
  useEffect(() => {
    const handler = (e) => {
      const { app } = e.detail || {};
      if (app === 'about')  setShowAboutMe(true);
      if (app === 'skills') setShowSkills(true);
      if (app === 'video')  setShowVideoPage(true);
      if (app === 'ai')     setShowAIImages(true);
      if (app === 'web')    setShowWebsite(true);
      if (app === 'room')   setShowRoomPage(true);
    };
    window.addEventListener('macdock:open', handler);
    return () => window.removeEventListener('macdock:open', handler);
  }, []);

  /* The old nav faded its glass in once you scrolled past the hero. The
     island carries its own glass at all times, so that listener is gone. */

  // ── Keep the URL in step with the open page ──────────────────────────
  useEffect(() => {
    if (page) {
      // push, so Back closes the page rather than leaving the site
      if (window.location.hash !== `#/${page}`) window.location.hash = `#/${page}`;
    } else if (ROUTE_RE.test(window.location.hash)) {
      // replace, so closing doesn't leave a dead entry behind. Only our own
      // routes are cleared — a bare section anchor is left alone.
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [page]);

  // The terminal's `warn` command raises the same overlay the island does.
  useEffect(() => {
    const open = () => setShowWarning(true);
    window.addEventListener('kish:warn', open);
    return () => window.removeEventListener('kish:warn', open);
  }, []);

  // Back / forward, and hand-edited URLs.
  useEffect(() => {
    const onHash = () => setPage(readPageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // ── Remember where the home page was left ────────────────────────────
  // Skipped while a sub-page is open: the home container is display:none
  // then, which zeroes its scrollTop and would otherwise overwrite the
  // saved position with 0.
  const subPageRef = useRef(anySubPage);
  useEffect(() => { subPageRef.current = anySubPage; }, [anySubPage]);

  /* ── Analytics ──────────────────────────────────────────────────────
     Started once, off the critical path: it opens a Firestore connection
     and nothing about it should compete with first paint. The collector
     bails out on its own for the admin route, for bots and when Do Not
     Track is set. */
  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
    const id = idle(() => startAnalytics());
    return () => (window.cancelIdleCallback || clearTimeout)(id);
  }, []);

  /* The sub-pages are overlays rather than routes, so they generate no
     navigation of their own for the collector to notice. */
  useEffect(() => {
    if (page && page !== 'admin') trackPage(page);
  }, [page]);

  useEffect(() => { if (showChat)    trackEvent('chatOpened'); }, [showChat]);
  useEffect(() => { if (showProfile) trackEvent('idCardOpened'); }, [showProfile]);
  useEffect(() => { if (showWarning) trackEvent('timelineOpened'); }, [showWarning]);
  useEffect(() => { if (showTools)   trackEvent('arsenalOpened'); }, [showTools]);

  // Latest home scroll position, updated synchronously on every scroll
  // event. Storage writes are debounced, but this is not — so whenever we
  // need to persist (unload, or a sub-page opening) the value is current
  // rather than up to 150ms stale.
  const lastTopRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let timer;

    const save = () => {
      try { sessionStorage.setItem(SCROLL_KEY, String(Math.round(lastTopRef.current))); } catch { /* private mode */ }
    };

    const onScroll = () => {
      if (subPageRef.current) return;
      lastTopRef.current = el.scrollTop;
      // Debounced write so a flick doesn't hammer storage; the ref above
      // is what actually keeps the value honest.
      clearTimeout(timer);
      timer = setTimeout(save, 150);
    };

    // …but reloading inside that 150ms window would lose the position, and
    // a smooth-scroll animation can hold the debounce open for a second or
    // more. So also capture it the moment the page is going away. pagehide
    // covers reload/navigate including bfcache; visibilitychange covers the
    // mobile case where pagehide is unreliable.
    const onHide = () => { clearTimeout(timer); save(); };
    const onVisibility = () => { if (document.hidden) onHide(); };

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onVisibility);
      clearTimeout(timer);
    };
  }, []);

  // ── Put it back ──────────────────────────────────────────────────────
  // Runs on first paint and whenever a sub-page closes. The target may sit
  // below the content height until images have laid out, so it retries on
  // animation frames until the page is tall enough, then gives up rather
  // than looping forever.
  useEffect(() => {
    if (anySubPage) {
      // Opening a page hides the home container, which zeroes its
      // scrollTop. Commit the tracked value now, while it is still true.
      try { sessionStorage.setItem(SCROLL_KEY, String(Math.round(lastTopRef.current))); } catch { /* private mode */ }
      return;
    }
    const el = scrollRef.current;
    if (!el) return;

    let saved = 0;
    try { saved = Number(sessionStorage.getItem(SCROLL_KEY)) || 0; } catch { /* private mode */ }
    if (saved <= 0) return;

    let frame, tries = 0;
    const place = () => {
      const reachable = el.scrollHeight - el.clientHeight;
      if (reachable >= saved || tries > 60) {
        // The container scrolls smoothly by default; restoring must be an
        // instant jump, not a visible animated scroll down the page.
        const prev = el.style.scrollBehavior;
        el.style.scrollBehavior = 'auto';
        el.scrollTop = Math.min(saved, Math.max(reachable, 0));
        el.style.scrollBehavior = prev;
        lastTopRef.current = el.scrollTop;
        return;
      }
      tries += 1;
      frame = requestAnimationFrame(place);
    };
    frame = requestAnimationFrame(place);
    return () => cancelAnimationFrame(frame);
  }, [anySubPage]);

  if (showAdmin) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <AdminDashboard onExit={() => setPage(null)} />
      </Suspense>
    );
  }

  return (
    <MusicProvider>
      <MacDock />
      <MusicWindowManager />
      <NotesWindowManager />
      <TerminalWindowManager />
      <CalculatorWindowManager />

      <div
        id="main-scroll"
        ref={scrollRef}
        /* While a sub-page is open the home page is display:none, which
           already hides it from assistive tech — but `inert` states the
           intent explicitly and also guarantees nothing inside it can be
           focused or found by a crawler as a second <h1>. */
        inert={anySubPage || undefined}
        aria-hidden={anySubPage ? 'true' : undefined}
        style={{
          width: '100vw', height: '100vh',
          overflowY: 'auto', overflowX: 'hidden',
          scrollBehavior: 'smooth',
          display: anySubPage ? 'none' : 'block',
        }}
      >
        {/* ══ HERO ══════════════════════════════════════════════════ */}
        <div className="hue-hero" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

          {/* Stacked video backgrounds — data-section drives per-section CSS filter */}
          <div className="video-bg-wrap" data-section={activeSection.id}>
            {/* Keyed by position, not by URL. The plates are CMS-editable
                now, so two sections can legitimately share an image — and a
                duplicate key makes React omit or duplicate a plate. The list
                is fixed-length and ordered, so the index is the stable id. */}
            {heroSections.map(({ image: src }, i) => (
              <div key={i} className={`video-bg${i === activeIdx ? ' video-bg--active' : ''}`}>
                {/* The first plate is the LCP element, so it loads eagerly at
                    high priority; the other three are lazy and only decode
                    once the visitor switches to them. */}
                <img
                  src={src}
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                  decoding="async"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'low'}
                />
                <div className="video-overlay" />
              </div>
            ))}
          </div>

          <TubesBackground sectionId={activeSection.id} />
          <div className="noise" aria-hidden="true" />
          <div className="edge-top" aria-hidden="true" />
          <div className="edge-bottom" aria-hidden="true" />

          <ErrorBoundary name="Island" silent>
            <DynamicIsland
              onRoomClick={() => setShowRoomPage(true)}
              onWarnClick={() => setShowWarning(true)}
              onProfileClick={() => setShowProfile((v) => !v)}
            />
          </ErrorBoundary>

          {/* Hero text — moves with parallax */}
          <main className="hero" id="home">
            <HeroLayout section={activeSection} fading={fading} />
          </main>

          {/* Category strip — sibling of main.hero, never affected by parallax */}
          <div className="hero-categories" role="tablist" aria-label="Portfolio sections">
            {heroSections.map((sec, i) => (
              <button key={sec.id} role="tab" aria-selected={activeIdx === i}
                className={`hero-cat${activeIdx === i ? ' hero-cat--active' : ''}`}
                onClick={() => handleCatClick(i)}>
                <div className="hero-cat-icon"><CatIcon id={sec.id} /></div>
                <span>{sec.label}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Seamless blend from hero into next section */}
        {/* Hero -> About blend. .seam lets the light theme switch it off;
            the negative margin stays either way, so nothing shifts. */}
        <div className="seam" style={{
          position: 'relative', zIndex: 15, marginTop: '-220px',
          height: '220px', flexShrink: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, transparent 0%, var(--bg) 75%)',
        }} />
        <ErrorBoundary name="About">
          <AboutSection />
        </ErrorBoundary>
        <ErrorBoundary name="Promo banner">
          <PromoBanner />
        </ErrorBoundary>
        <ErrorBoundary name="Syndicate">
          <TeamSection />
        </ErrorBoundary>
        <ErrorBoundary name="Work">
          <BentoSection
            onAboutClick={() => setShowAboutMe(true)}
            onVideoClick={() => setShowVideoPage(true)}
            onAIClick={() => setShowAIImages(true)}
            onWebsiteClick={() => setShowWebsite(true)}
            onSkillsClick={() => setShowSkills(true)}
            onGamesClick={() => setShowGames(true)}
            onToolsClick={() => setShowTools(true)}
          />
        </ErrorBoundary>
        <ErrorBoundary name="Showcase">
          <BannerSection />
        </ErrorBoundary>

        <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: 'var(--bg)', flexShrink: 0 }}>
          <video autoPlay loop muted playsInline preload="auto"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}>
            <source src="/Glitchvd.mp4" type="video/mp4" />
          </video>
          <div className="seam" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '140px', background: 'linear-gradient(to bottom, var(--bg) 0%, transparent 100%)', pointerEvents: 'none' }} />
        </div>
        <ErrorBoundary name="Notes">
          <NotesSection />
        </ErrorBoundary>
        <ErrorBoundary name="Feature banner">
          <FeatureBanner />
        </ErrorBoundary>
        <ErrorBoundary name="Personal OS">
          <WidgetsSection
            onAboutClick={() => setShowAboutMe(true)}
            onSkillsClick={() => setShowSkills(true)}
          />
        </ErrorBoundary>
        <ErrorBoundary name="Feature grid">
          <FeatureGrid onOpen={(id) => setPage(id)} />
        </ErrorBoundary>
        <ErrorBoundary name="Edit Suite">
          <DeckSection />
        </ErrorBoundary>
        <ErrorBoundary name="Contact">
          <ContactSection />
        </ErrorBoundary>
        <ErrorBoundary name="Footer">
          <SiteFooter onOpen={() => document.getElementById('main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })} />
        </ErrorBoundary>
      </div>

      {/* Bottom-right bot. Outside the scroll container so it stays put. */}
      <ErrorBoundary name="Ask bot" silent>
        <AiBotDock onOpen={() => setShowChat(true)} />
        <Spidey />
      </ErrorBoundary>

      {showChat && (
        <ErrorBoundary name="Chat" silent>
          <Suspense fallback={null}>
            <AiChat onClose={() => setShowChat(false)} />
          </Suspense>
        </ErrorBoundary>
      )}

      {showProfile && (
        <ErrorBoundary name="Profile card" silent>
          <Suspense fallback={null}>
            <LanyardOverlay onClose={() => setShowProfile(false)} />
          </Suspense>
        </ErrorBoundary>
      )}

      {showTools && (
        <ErrorBoundary name="Arsenal" silent>
          <Suspense fallback={null}>
            <ToolsArsenal onBack={() => setShowTools(false)} />
          </Suspense>
        </ErrorBoundary>
      )}

      {showWarning && (
        <ErrorBoundary name="Timeline" silent>
          <Suspense fallback={null}>
            <TimelineCalendar onClose={() => setShowWarning(false)} />
          </Suspense>
        </ErrorBoundary>
      )}

      {anySubPage && (
        <ErrorBoundary name="Sub-page">
        <Suspense fallback={<PageSkeleton />}>
          {showAboutMe && <AboutMePage onBack={() => setShowAboutMe(false)} />}
          {showVideoPage && <VideoEditingPage onBack={() => setShowVideoPage(false)} />}
          {showRoomPage && <RoomPage onBack={() => setShowRoomPage(false)} />}
          {showAIImages && <AIImagesPage onBack={() => setShowAIImages(false)} />}
          {showWebsite && <WebsitePage onBack={() => setShowWebsite(false)} />}
          {showSkills  && <SkillsPage  onBack={() => setShowSkills(false)}  />}
          {showCerts   && <CertificatesPage onBack={() => setShowCerts(false)} />}
          {showGames   && <GamesHub    onBack={() => setShowGames(false)}   />}
        </Suspense>
        </ErrorBoundary>
      )}
    </MusicProvider>
  );
}
