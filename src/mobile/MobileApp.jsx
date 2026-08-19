import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import './mobile.css';
import { MusicProvider } from '../MusicContext';
import { startAnalytics, trackEvent, trackPage } from '../services/analytics';
import ErrorBoundary from '../ErrorBoundary';
import { tap, reducedMotion } from './mobileUtils';
import { Icon } from './ui';
import { setForcedDesktop } from './useIsMobile';
import Sheet from './Sheet';
import HomeScreen from './HomeScreen';
import WorkScreen from './WorkScreen';
import NotesScreen from './NotesScreen';
import StudioScreen, { TimelineSheet } from './StudioScreen';
import ContactScreen from './ContactScreen';

/* Overlays that most visits never open. Each is fetched the first time
   it is asked for, which keeps the phone's first-load bundle to the five
   screens and the shell. AboutYouUnlock carries a whole lore table; the
   assistant carries a streaming chat client.

   The assistant is the phone's own (AskSheet), not the desktop's AiChat.
   That panel stands a WebGL robot on its floor — three.js and
   react-three-fiber, some 600 KB and a live GL context — to draw a
   mascot, plus a glow that follows a cursor this device does not have. */
const AboutYouUnlock = lazy(() => import('../AboutYouUnlock'));
const AskSheet       = lazy(() => import('./AskSheet'));

/* ══════════════════════════════════════════════════════════════════════
   MOBILE APP — the shell

   The phone build's root. It owns the chrome (status bar, tab bar, the
   assistant button), which of the five screens is showing, and which
   overlay is up.

   ── WHY THE SCREENS STAY MOUNTED ─────────────────────────────────────
   All five render once and are then hidden with [hidden], not
   unmounted. That is what lets each keep its own scroll position, so
   Work → Notes → Work returns you to the tile you were looking at
   rather than to the top — the behaviour a tab bar promises and the
   thing that makes it feel like an app rather than like five pages.

   The cost is five subtrees in memory. content-visibility: auto on the
   inactive ones means the browser skips their layout and paint entirely,
   which is most of what unmounting would have bought.
   ══════════════════════════════════════════════════════════════════════ */

const SCREENS = [
  { id: 'home',    label: 'Home',    icon: 'home',   title: 'KishoreditX' },
  { id: 'work',    label: 'Work',    icon: 'grid',   title: 'The Work' },
  { id: 'notes',   label: 'Notes',   icon: 'note',   title: 'Working Notes' },
  { id: 'studio',  label: 'Studio',  icon: 'studio', title: 'The Studio' },
  { id: 'contact', label: 'Contact', icon: 'mail',   title: 'Get In Touch' },
];

/* Each screen owns a hue, which is what carries the desktop's warm→cool
   journey onto a build that no longer scrolls through it in one go. The
   accent in the chrome — the dot, the tab pill, the assistant button —
   follows whichever screen you are on. */
const SCREEN_HUE = {
  home:    'var(--h-hero)',
  work:    'var(--h-bento)',
  notes:   'var(--h-notes)',
  studio:  'var(--h-mind)',
  contact: 'var(--h-contact)',
};

/* ══ ROUTES ═══════════════════════════════════════════════════════════
   #/m/<screen>            one of the five screens
   #/m/<screen>/<overlay>  that screen with something open over it

   The desktop routes its sub-pages as #/work; the phone uses the #/m/
   prefix so the two builds cannot land each other on a screen that does
   not exist, and so a link shared from a phone opens what was on screen
   when it was shared.

   Overlays are ROUTES, not component state, and that is deliberate. The
   obvious alternative — each overlay pushing a history entry when it
   mounts and popping it when it unmounts — cannot be made correct: under
   StrictMode every effect mounts, cleans up and mounts again, so the
   cleanup pops the entry it just pushed and the overlay closes itself
   the instant it opens. (It did exactly that.) Deriving the open overlay
   from the URL has no such lifecycle to get out of step with, and it
   makes every note and project linkable for free.

   Four overlay names are reserved and mean the same thing on any screen;
   anything else is read by the screen it belongs to — a work item id, or
   a note's index. */
const GLOBAL_OVERLAYS = ['menu', 'ask', 'you', 'record'];

const ROUTE_RE = /^#\/m\/([a-z]+)(?:\/([A-Za-z0-9_-]+))?\/?$/;

function readRoute() {
  const m = ROUTE_RE.exec(window.location.hash);
  const screen = m && SCREENS.some((s) => s.id === m[1]) ? m[1] : 'home';
  return { screen, overlay: (m && m[2]) || null };
}

/* Scroll fraction → HH:MM:SS:FF at 24fps over a nominal four-minute
   sequence. Padded so the readout never changes width, which would make
   the status bar jitter as you scroll. */
const TOTAL_FRAMES = 24 * 60 * 4;
const pad = (n) => String(n).padStart(2, '0');

function frames(fraction) {
  const f = Math.round(fraction * TOTAL_FRAMES);
  return `${pad(Math.floor(f / 86400))}:${pad(Math.floor(f / 1440) % 60)}:${pad(Math.floor(f / 24) % 60)}:${pad(f % 24)}`;
}

const routeHash = (screen, overlay) => `#/m/${screen}${overlay ? `/${overlay}` : ''}`;

/* ── Boot ─────────────────────────────────────────────────────────── */
function Boot({ out }) {
  const word = 'KISHORE';
  return (
    <div className={`mb-boot${out ? ' mb-boot--out' : ''}`} aria-hidden={out || undefined}>
      <div className="mb-boot-in">
        <div className="mb-boot-mark" aria-label="Kishore">
          {word.split('').map((c, i) => (
            <span key={i} style={{ '--d': `${i * 55}ms` }}>{c}</span>
          ))}
          <i style={{ '--d': `${word.length * 55}ms` }}>X</i>
        </div>
        <div className="mb-boot-rule"><i /></div>
        <p className="mb-boot-sub">Editor · Colourist · Builder</p>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mb-skel" role="status" aria-label="Loading">
      <i className="w4" /><i className="tall" /><i /><i className="w7" /><i className="w4" />
    </div>
  );
}

export default function MobileApp() {
  /* The route is the source of truth for both which screen is showing
     and what is open over it. Read synchronously so a shared link opens
     the right thing on the first render rather than correcting itself. */
  const [route, setRoute] = useState(readRoute);
  const { screen, overlay } = route;

  const [dir, setDir] = useState('r');
  const [booting, setBooting] = useState(() => !reducedMotion());
  const [bootOut, setBootOut] = useState(false);

  const [topHidden, setTopHidden] = useState(false);
  const [stuck, setStuck] = useState(false);
  /* Scroll position as a timecode. See the note on the status bar. */
  const [tc, setTc] = useState(null);

  const scrollRefs = useRef({});
  const lastY = useRef(0);
  /* How many entries this app has pushed since it loaded. See
     closeOverlay for why that number matters. */
  const depthRef = useRef(0);

  /* Which overlay the route names. The four global ones mean the same
     on every screen; anything else belongs to the screen it is on — a
     work item's id, or a note's index. */
  const isGlobal = overlay && GLOBAL_OVERLAYS.includes(overlay);
  const workOpen = screen === 'work'  && overlay && !isGlobal ? overlay : null;
  const noteRaw  = screen === 'notes' && overlay && !isGlobal ? Number(overlay) : NaN;
  const noteOpen = Number.isInteger(noteRaw) ? noteRaw : null;
  const menu     = overlay === 'menu';
  const chat     = overlay === 'ask';
  const dossier  = overlay === 'you';
  const timeline = overlay === 'record';

  const anyOverlay = Boolean(overlay);
  const idx = SCREENS.findIndex((s) => s.id === screen);
  const meta = SCREENS[idx] || SCREENS[0];

  /* ── Boot ── */
  useEffect(() => {
    if (!booting) return;
    const a = setTimeout(() => setBootOut(true), 1150);
    const b = setTimeout(() => setBooting(false), 1620);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [booting]);

  /* ── Analytics ──
     Off the critical path, exactly as the desktop starts it: it opens a
     Firestore connection and nothing about that should compete with the
     first screen painting. */
  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1400));
    const id = idle(() => startAnalytics());
    return () => (window.cancelIdleCallback || clearTimeout)(id);
  }, []);

  useEffect(() => { trackPage(`m/${screen}`); }, [screen]);
  useEffect(() => { if (chat) trackEvent('chatOpened'); }, [chat]);
  useEffect(() => { if (timeline) trackEvent('timelineOpened'); }, [timeline]);

  /* ── Navigation ───────────────────────────────────────────────────
     Everything moves through the URL. Opening pushes an entry so Back
     undoes it; closing goes back rather than pushing, so opening and
     closing a sheet leaves no debris in the history for Back to walk
     through afterwards. */
  const navigate = useCallback((nextScreen, nextOverlay = null, { replace = false } = {}) => {
    const hash = routeHash(nextScreen, nextOverlay);
    if (window.location.hash === hash) return;
    if (replace) {
      window.history.replaceState(null, '', hash);
      setRoute({ screen: nextScreen, overlay: nextOverlay });
    } else {
      // Assigning the hash pushes; the hashchange listener below is what
      // moves the state, so there is exactly one path into it.
      window.location.hash = hash;
    }
  }, []);

  const go = useCallback((id, arg) => {
    tap();
    if (!SCREENS.some((s) => s.id === id)) return;
    if (id === screen && !overlay) {
      // Tapping the tab you are already on returns that screen to the
      // top, which is what every phone tab bar does.
      scrollRefs.current[id]?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // "View my work" on the hero jumps straight to one tile.
    navigate(id, typeof arg === 'string' ? arg : null);
    setTopHidden(false);
    setTc(null);
    setStuck(false);
  }, [screen, overlay, navigate]);

  const openOverlay = useCallback((id) => { tap(); navigate(screen, id); }, [screen, navigate]);

  /* Closing goes back, so opening and closing a sheet leaves the history
     exactly as it was — no debris for Back to walk through afterwards.

     Unless there is nothing of ours behind it. Someone who opened
     #/m/notes/3 from a shared link has this app's FIRST entry showing an
     overlay; going back from there leaves the site altogether, which is
     not what closing a sheet should ever do. depthRef counts how many
     entries this app has pushed since it loaded, so it knows which case
     it is in: at depth 0 the overlay segment is replaced instead. */
  const closeOverlay = useCallback(() => {
    if (!window.location.hash.startsWith(`#/m/${screen}/`)) return;
    if (depthRef.current > 0) window.history.back();
    else navigate(screen, null, { replace: true });
  }, [screen, navigate]);

  /* ── The URL drives the state ──
     One listener, and it is the only thing that calls setRoute for a
     push. Back, forward, a hand-typed URL and every in-app navigation
     all arrive here, so they cannot disagree. */
  useEffect(() => {
    const onHash = () => {
      /* Assigning location.hash pushes an entry whose state is null;
         Back and forward restore an entry we already stamped. That is
         the whole test — a null state means this navigation was a push
         of ours, anything else is a traversal. */
      const st = window.history.state;
      if (st && typeof st.mbDepth === 'number') {
        depthRef.current = st.mbDepth;
      } else {
        depthRef.current += 1;
        window.history.replaceState({ mbDepth: depthRef.current }, '');
      }

      const next = readRoute();
      setRoute((cur) => {
        if (cur.screen === next.screen && cur.overlay === next.overlay) return cur;
        if (cur.screen !== next.screen) {
          const from = SCREENS.findIndex((s) => s.id === cur.screen);
          const to = SCREENS.findIndex((s) => s.id === next.screen);
          setDir(to > from ? 'r' : 'l');
        }
        return next;
      });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  /* The entry the visitor arrived on is depth 0, whatever it points at.
     A first visit has no hash to read, so the canonical one is stamped
     in place — replace, not push, so Back still leaves the site on the
     first press rather than appearing to do nothing. */
  useEffect(() => {
    const st = window.history.state;
    if (st && typeof st.mbDepth === 'number') { depthRef.current = st.mbDepth; return; }
    const hash = ROUTE_RE.test(window.location.hash)
      ? window.location.hash
      : routeHash(screen, overlay);
    window.history.replaceState({ mbDepth: 0 }, '', hash);
    depthRef.current = 0;
    // Mount only: later entries are stamped by the hashchange handler.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Chrome on scroll ──
     The status bar hides on a downward scroll and returns on an upward
     one. The 8px deadband is what stops it flickering on the tiny
     opposing movements a finger makes while it is settling. */
  const onScroll = useCallback((e) => {
    const el = e.currentTarget;
    const y = el.scrollTop;
    setStuck(y > 10);

    /* ── The timecode ──
       The screen is treated as a sequence and your scroll position as
       the playhead: total travel maps onto a duration, which is then
       printed as HH:MM:SS:FF at 24fps.

       It is decoration, but it is decoration that belongs to this
       portfolio specifically — the one number an editor reads all day —
       and it doubles as an honest progress readout, which a plain bar
       would give more dryly. */
    const max = el.scrollHeight - el.clientHeight;
    setTc(max > 40 ? frames(Math.min(1, y / max)) : null);

    const dy = y - lastY.current;
    if (Math.abs(dy) < 8) return;
    // Never hidden near the top — there is nothing to gain and the bar
    // reappearing as you arrive at the top looks like a fault.
    setTopHidden(dy > 0 && y > 140);
    lastY.current = y;
  }, []);

  const setScrollRef = useCallback((id) => (el) => { scrollRefs.current[id] = el; }, []);

  /* "The story" on the hero jumps to the about block. Reading the ref
     inside the handler — never during render — is what keeps this a
     legal use of one. */
  const scrollToStory = useCallback(() => {
    scrollRefs.current.home
      ?.querySelector('.mb-about')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const chromeHidden = anyOverlay;
  /* The assistant button also stands down on a downward scroll — it
     floats over body copy, and copy you cannot read is worse than a
     button you have to flick up for. */
  const fabHidden = anyOverlay || topHidden;

  return (
    <MusicProvider>
      <div
        id="mb-app"
        /* The hue the chrome composes against. data-screen is what the
           contact screen's yellow correction hangs off — see mobile.css. */
        data-screen={screen}
        /* Sticky bars inside the screens park below the status bar, so
           they need to know when it has slid away — see --mb-sticky-top. */
        data-chrome={topHidden && !anyOverlay ? 'hidden' : 'shown'}
        style={{ '--h': SCREEN_HUE[screen] || 'var(--h-hero)' }}
      >
        {booting && <Boot out={bootOut} />}

        {/* ══ STATUS BAR ══════════════════════════════════════════ */}
        <header className={`mb-top${stuck ? ' mb-top--stuck' : ''}${topHidden && !anyOverlay ? ' mb-top--hide' : ''}`}>
          <button className="mb-top-mark" onClick={() => go('home')} aria-label="Home">
            <i aria-hidden="true" />
            Kish
          </button>
          {/* At the top of a screen the bar names it; once you are into
              the sequence it reads out where you are. One slot, so the
              chrome never grows. */}
          {stuck && tc ? (
            <span className="mb-top-tc" key="tc">
              <i aria-hidden="true" />
              {tc}
            </span>
          ) : (
            <span className="mb-top-title" key={screen}>{meta.title}</span>
          )}
          <div className="mb-top-btns">
            <button
              className={`mb-icon-btn mb-hit${screen === 'contact' ? ' mb-icon-btn--on' : ''}`}
              onClick={() => go('contact')}
              aria-label="Contact"
            >
              <Icon name="mail" size={19} />
            </button>
            <button className="mb-icon-btn mb-hit" onClick={() => openOverlay('menu')} aria-label="Menu">
              <Icon name="menu" size={20} />
            </button>
          </div>
        </header>

        {/* ══ SCREENS ═════════════════════════════════════════════ */}
        <main className="mb-screens">
          {SCREENS.map((s) => {
            const on = s.id === screen;
            return (
              <div
                key={s.id}
                id={`mb-screen-${s.id}`}
                className={`mb-screen${on ? ` mb-screen--enter-${dir}` : ''}`}
                ref={setScrollRef(s.id)}
                onScroll={on ? onScroll : undefined}
                hidden={!on}
                aria-hidden={on ? undefined : 'true'}
              >
                <ErrorBoundary name={`Mobile ${s.label}`}>
                  {s.id === 'home' && (
                    <HomeScreen
                      onGo={go}
                      onOpenDossier={() => openOverlay('you')}
                      onStory={scrollToStory}
                    />
                  )}
                  {s.id === 'work' && <WorkScreen open={workOpen} onOpen={(id) => (id ? openOverlay(id) : closeOverlay())} />}
                  {s.id === 'notes' && <NotesScreen open={noteOpen} onOpen={(n) => (n == null ? closeOverlay() : openOverlay(String(n)))} />}
                  {s.id === 'studio' && (
                    <StudioScreen onGo={go} onOpenTimeline={() => openOverlay('record')} />
                  )}
                  {s.id === 'contact' && <ContactScreen onGo={go} />}
                </ErrorBoundary>
              </div>
            );
          })}
        </main>

        {/* ══ ASSISTANT ═══════════════════════════════════════════ */}
        <button
          className={`mb-fab${fabHidden ? ' mb-fab--hide' : ''}`}
          onClick={() => { tap(12); openOverlay('ask'); }}
          aria-label="Ask about this portfolio"
        >
          <Icon name="spark" size={21} />
        </button>

        {/* ══ TAB BAR ═════════════════════════════════════════════ */}
        <nav
          className={`mb-tabs${chromeHidden ? ' mb-tabs--hide' : ''}`}
          style={{ '--tab-i': idx < 0 ? 0 : idx }}
          aria-label="Sections"
        >
          {SCREENS.map((s) => (
            <button
              key={s.id}
              className={`mb-tab${s.id === screen ? ' mb-tab--on' : ''}`}
              onClick={() => go(s.id)}
              aria-current={s.id === screen ? 'page' : undefined}
            >
              <span className="mb-tab-ic"><Icon name={s.icon} size={21} /></span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="mb-grain" aria-hidden="true" />

        {/* ══ OVERLAYS ════════════════════════════════════════════ */}
        {menu && (
          <Sheet title="Menu" onClose={closeOverlay} height="auto">
            <div className="mb-menu">
              {SCREENS.map((s) => (
                <button
                  className="mb-menu-row"
                  key={s.id}
                  onClick={() => go(s.id)}
                >
                  <Icon name={s.icon} size={19} />
                  <b>{s.label}<small>{s.title}</small></b>
                  <Icon name="chev" size={17} />
                </button>
              ))}
              <button className="mb-menu-row" onClick={() => navigate(screen, 'you', { replace: true })}>
                <Icon name="user" size={19} />
                <b>About You<small>Give me a name and a birthday</small></b>
                <Icon name="chev" size={17} />
              </button>
              <button className="mb-menu-row" onClick={() => navigate(screen, 'record', { replace: true })}>
                <Icon name="clock" size={19} />
                <b>The record<small>Every date that mattered</small></b>
                <Icon name="chev" size={17} />
              </button>
              <button
                className="mb-menu-row"
                onClick={() => {
                  /* The escape hatch. Someone on a big tablet may want
                     the desktop layout; the flag is read on the next
                     render and the event is what tells the hook to
                     re-check without a reload. */
                  setForcedDesktop(true);
                  window.dispatchEvent(new Event('kx:layout-pref'));
                }}
              >
                <Icon name="desktop" size={19} />
                <b>Desktop site<small>The full-width version of this</small></b>
                <Icon name="chev" size={17} />
              </button>
            </div>
            <p className="mb-small" style={{ padding: '18px var(--mb-pad) 6px', textAlign: 'center' }}>
              Built from scratch · no template
            </p>
          </Sheet>
        )}

        {timeline && (
          <ErrorBoundary name="Mobile timeline" silent>
            <TimelineSheet onClose={closeOverlay} />
          </ErrorBoundary>
        )}

        {dossier && (
          <ErrorBoundary name="Mobile dossier" silent>
            <Suspense fallback={null}>
              <AboutYouUnlock onClose={closeOverlay} />
            </Suspense>
          </ErrorBoundary>
        )}

        {chat && (
          <ErrorBoundary name="Mobile chat" silent>
            <Suspense fallback={<Skeleton />}>
              <AskSheet onClose={closeOverlay} />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
    </MusicProvider>
  );
}
