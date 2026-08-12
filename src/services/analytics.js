/* ══════════════════════════════════════════════════════════════════════
   ANALYTICS — collector

   Writes anonymous usage data straight from the browser into Firestore,
   where the dashboard's Analyze tab reads it live. No third-party script,
   no cookie, no personal data: a random id in localStorage so returning
   visits can be told apart, and counters.

   THE COST PROBLEM, AND WHY THIS IS SHAPED THE WAY IT IS
   Firestore bills per write. Sending an event per scroll or per mouse
   move would cost real money for a portfolio and buy nothing, so nothing
   is sent per-event. Everything accumulates in memory and is flushed on a
   timer as one document update built from atomic increments. A ten-minute
   visit costs roughly thirty writes, not thirty thousand, and because
   every field is an increment two visitors flushing at the same moment
   add up instead of overwriting each other.

   Two documents are involved:
     analytics/{YYYY-MM-DD}   one per day, every counter for that day
     analytics_live/{session} one per open tab, deleted when it closes

   SECURITY — READ THIS
   For visitors to write these documents the rules must let anyone write
   them, which also means anyone who reads this file can write nonsense
   into them. That is the standing trade-off of serverless client-side
   analytics. It cannot corrupt the site: the collection is separate from
   site/content and nothing on the public page ever reads it. If the data
   ever needs to be trustworthy rather than indicative, put a Cloud
   Function or App Check in front of it. ADMIN_SETUP.md has the rules.
   ══════════════════════════════════════════════════════════════════════ */

/* Honouring Do Not Track costs a little data and is the right default.
   If your own browser sends it you will see nothing from your own visits —
   the console says so rather than leaving you guessing. Flip this to
   false to collect regardless. */
const RESPECT_DNT = true;

// Heat grid. 32x18 is 576 cells: fine enough to read as a picture, small
// enough that a whole day's map is a few kB and can never grow unbounded.
const GRID_X = 32;
const GRID_Y = 18;

const FLUSH_MS     = 20000;  // how often accumulated counters are written
const HEARTBEAT_MS = 10000;  // how often the live-session doc is refreshed
const TICK_MS      = 1000;   // dwell resolution
const MOVE_MS      = 260;    // cursor sampling interval

/* Which section is on screen is answered by these, in page order. Class
   names rather than ids because most of these sections never needed an id
   for anything else. */
const SECTIONS = [
  ['.hero',           'Hero'],
  ['.abt-section',    'About'],
  ['.ts-section',     'Syndicate'],
  ['.bento-section',  'Work'],
  ['.bn-section',     'Showcase'],
  ['.nt-section',     'Notes'],
  ['.wg-section',     'Personal OS'],
  ['.dk-section',     'Edit Suite'],
  ['.ct-section',     'Contact'],
];

const DURATION_BUCKETS = [
  [10,   '0-10s'],
  [30,   '10-30s'],
  [60,   '30-60s'],
  [180,  '1-3m'],
  [600,  '3-10m'],
  [Infinity, '10m+'],
];

// ── small helpers ────────────────────────────────────────────────────
const today = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

function readDevice() {
  const ua = navigator.userAgent;
  const w  = window.innerWidth;
  const mobile = /Android|iPhone|iPod|Windows Phone/i.test(ua) || w < 640;
  const tablet = /iPad|Tablet/i.test(ua) || (!mobile && w < 1024);
  return mobile ? 'Mobile' : tablet ? 'Tablet' : 'Desktop';
}

function readBrowser() {
  const ua = navigator.userAgent;
  // Order matters: every one of these also claims to be Safari or Chrome.
  if (/Edg\//.test(ua))                      return 'Edge';
  if (/OPR\/|Opera/.test(ua))                return 'Opera';
  if (/Firefox\//.test(ua))                  return 'Firefox';
  if (/Chrome\//.test(ua))                   return 'Chrome';
  if (/Safari\//.test(ua))                   return 'Safari';
  return 'Other';
}

function readOS() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua))  return 'iOS';
  if (/Android/.test(ua))           return 'Android';
  if (/Mac OS X/.test(ua))          return 'macOS';
  if (/Windows/.test(ua))           return 'Windows';
  if (/Linux/.test(ua))             return 'Linux';
  return 'Other';
}

/* Hostname only, never the full referring URL — a query string can carry
   things that have no business in an analytics store. */
function readReferrer() {
  const r = document.referrer;
  if (!r) return 'Direct';
  try {
    const host = new URL(r).hostname.replace(/^www\./, '');
    return host === location.hostname ? 'Internal' : host;
  } catch { return 'Unknown'; }
}

// ── state ────────────────────────────────────────────────────────────
let started = false;
let sessionId = null;
let visitorId = null;
let startedAt = 0;

/* Everything waiting to be written. Keys are Firestore field paths; values
   are how much to add. Flushing turns each into an increment() and clears
   the buffer, so a failed flush loses one window rather than the session. */
let pending = new Map();
let liveSection = 'Hero';
let maxDepth = 0;
let clickCount = 0;
let rageWindow = [];
let dayKey = today();

const bump = (field, by = 1) => pending.set(field, (pending.get(field) || 0) + by);

/* Public: anything worth counting that is not a scroll or a click.
   Safe to call before start() — it simply does nothing. */
export function trackEvent(name) {
  if (!started || !name) return;
  bump(`events.${String(name).replace(/[.~/[\]*]/g, '_')}`);
}

/* Public: the sub-pages are overlays, not routes, so they produce no
   navigation of their own to observe. */
export function trackPage(name) {
  if (!started || !name) return;
  bump(`pages.${String(name).replace(/[.~/[\]*]/g, '_')}`);
}

// ── the section currently being looked at ────────────────────────────
function activeSection() {
  const mid = window.innerHeight / 2;
  let best = null;
  let bestDist = Infinity;
  for (const [sel, name] of SECTIONS) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) continue;
    // Closest centre to the middle of the viewport wins. Simpler than
    // ranking intersection areas and behaves better with full-height
    // sections, where several are always 100% intersecting.
    const dist = Math.abs((r.top + r.bottom) / 2 - mid);
    if (dist < bestDist) { bestDist = dist; best = name; }
  }
  return best;
}

// ── firestore ────────────────────────────────────────────────────────
let fs = null;   // { db, doc, setDoc, updateDoc, deleteDoc, increment, serverTimestamp }

async function loadFirestore() {
  if (fs) return fs;
  const [m, { db }] = await Promise.all([
    import('firebase/firestore'),
    import('../firebase'),
  ]);
  fs = {
    db,
    doc: m.doc, setDoc: m.setDoc, updateDoc: m.updateDoc,
    deleteDoc: m.deleteDoc, increment: m.increment, serverTimestamp: m.serverTimestamp,
  };
  return fs;
}

async function flush(final = false) {
  if (pending.size === 0 && !final) return;

  const batch = pending;
  pending = new Map();

  try {
    const f = await loadFirestore();
    const ref = f.doc(f.db, 'analytics', dayKey);

    /* The buffer keys are dotted paths, but they have to be expanded into
       real nested objects before they are sent. Only updateDoc interprets
       a dotted string as a path — setDoc takes it literally and would
       create a field whose *name* contains a dot, which no nested read
       could ever find again. Expanding here keeps setDoc, which is what
       lets the first visitor of the day create the document instead of
       failing with not-found. merge:true deep-merges maps, so writing one
       heat cell leaves the other 575 alone. */
    const patch = { date: dayKey, updatedAt: f.serverTimestamp() };
    for (const [field, by] of batch) {
      const parts = field.split('.');
      let node = patch;
      for (let i = 0; i < parts.length - 1; i++) {
        node[parts[i]] = node[parts[i]] || {};
        node = node[parts[i]];
      }
      node[parts.at(-1)] = f.increment(by);
    }

    await f.setDoc(ref, patch, { merge: true });
  } catch (err) {
    // Put the counts back so the next window retries them, and never let
    // an analytics failure surface to the visitor.
    for (const [field, by] of batch) bump(field, by);
    if (import.meta.env.DEV) console.warn('[analytics] flush failed', err?.message);
  }
}

async function heartbeat() {
  try {
    const f = await loadFirestore();
    await f.setDoc(f.doc(f.db, 'analytics_live', sessionId), {
      id: sessionId,
      startedAt,
      lastSeen: Date.now(),
      section: liveSection,
      device: readDevice(),
      browser: readBrowser(),
      referrer: readReferrer(),
      depth: maxDepth,
      clicks: clickCount,
      ms: Date.now() - startedAt,
      returning: !!visitorId.returning,
    });
  } catch { /* a missing live row costs nothing */ }
}

async function dropLive() {
  try {
    const f = await loadFirestore();
    await f.deleteDoc(f.doc(f.db, 'analytics_live', sessionId));
  } catch { /* the dashboard ages out stale rows anyway */ }
}

// ── start ────────────────────────────────────────────────────────────
export function startAnalytics() {
  if (started || typeof window === 'undefined') return;

  // Never measure the dashboard, and never measure a bot.
  if (location.hash.startsWith('#/admin')) return;
  if (/bot|crawl|spider|headless|lighthouse/i.test(navigator.userAgent)) return;

  if (RESPECT_DNT && (navigator.doNotTrack === '1' || window.doNotTrack === '1')) {
    console.info('[analytics] Do Not Track is on in this browser — nothing is being recorded. Set RESPECT_DNT to false in src/services/analytics.js to collect anyway.');
    return;
  }

  let store = null;
  try { store = window.localStorage; } catch { /* private mode */ }

  // A returning visitor is one who already has an id. Nothing about who
  // they are, only that it is the same browser as before.
  let vid = store?.getItem('kx_vid');
  const isNew = !vid;
  if (!vid) { vid = rid(); try { store?.setItem('kx_vid', vid); } catch { /* ignore */ } }
  visitorId = { id: vid, returning: !isNew };

  sessionId = rid();
  startedAt = Date.now();
  started = true;

  // ── the session's one-off facts ──
  bump('sessions');
  bump(isNew ? 'visitors' : 'returning');
  bump(`devices.${readDevice()}`);
  bump(`browsers.${readBrowser()}`);
  bump(`os.${readOS()}`);
  bump(`referrers.${readReferrer().replace(/[.~/[\]*]/g, '_')}`);
  bump(`hours.${new Date().getHours()}`);
  bump(`langs.${(navigator.language || 'unknown').replace(/[.~/[\]*]/g, '_')}`);
  bump(`themes.${document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'}`);
  bump(`viewports.${window.innerWidth < 640 ? 'sm' : window.innerWidth < 1024 ? 'md' : window.innerWidth < 1600 ? 'lg' : 'xl'}`);

  const scroller = document.getElementById('main-scroll') || document.documentElement;

  // ── dwell ── one tick per second, credited to whatever is on screen.
  const tick = setInterval(() => {
    if (document.hidden) return;
    const name = activeSection();
    if (!name) return;
    liveSection = name;
    const key = name.replace(/[.~/[\]*\s]/g, '_');
    bump(`sections.${key}.ms`, TICK_MS);
    bump('totalMs', TICK_MS);
  }, TICK_MS);

  // ── which sections were seen at all ── separate from dwell, so the
  //    dashboard can divide one by the other and get a stickiness score.
  const seen = new Set();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const hit = SECTIONS.find(([sel]) => e.target.matches(sel));
      if (!hit || seen.has(hit[1])) continue;
      seen.add(hit[1]);
      bump(`sections.${hit[1].replace(/[.~/[\]*\s]/g, '_')}.views`);
    }
  }, { threshold: 0.35 });
  // Sections mount over a couple of frames; look again once they have.
  const observeAll = () => SECTIONS.forEach(([sel]) => {
    const el = document.querySelector(sel);
    if (el) io.observe(el);
  });
  observeAll();
  const observeTimer = setTimeout(observeAll, 2500);

  // ── scroll depth ──
  let depthTimer = 0;
  const onScroll = () => {
    if (depthTimer) return;
    depthTimer = setTimeout(() => {
      depthTimer = 0;
      const max = scroller.scrollHeight - scroller.clientHeight;
      if (max <= 0) return;
      const pct = Math.min(100, Math.round((scroller.scrollTop / max) * 100));
      if (pct > maxDepth) maxDepth = pct;
    }, 200);
  };
  scroller.addEventListener('scroll', onScroll, { passive: true });

  /* ── cursor heat ──
     Sampled on a timer rather than per event: a pointermove fires
     hundreds of times a second and every one of them would land in the
     same cell anyway. Coordinates are normalised to the viewport, so a
     phone and a 5K display contribute to the same picture. */
  let lastMove = 0;
  const onMove = (e) => {
    const now = Date.now();
    if (now - lastMove < MOVE_MS) return;
    lastMove = now;
    const x = Math.min(GRID_X - 1, Math.max(0, Math.floor((e.clientX / window.innerWidth) * GRID_X)));
    const y = Math.min(GRID_Y - 1, Math.max(0, Math.floor((e.clientY / window.innerHeight) * GRID_Y)));
    bump(`heat.${x}_${y}`);
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  // ── clicks, and rage clicks ──
  const onClick = (e) => {
    clickCount += 1;
    const x = Math.min(GRID_X - 1, Math.max(0, Math.floor((e.clientX / window.innerWidth) * GRID_X)));
    const y = Math.min(GRID_Y - 1, Math.max(0, Math.floor((e.clientY / window.innerHeight) * GRID_Y)));
    bump(`clicks.${x}_${y}`);
    bump('clickTotal');

    /* Three clicks inside one cell within a second is the classic rage
       signal: something looks pressable and is not. Worth surfacing,
       because it points at a bug rather than at interest. */
    const now = Date.now();
    rageWindow = rageWindow.filter((r) => now - r.t < 1000 && r.x === x && r.y === y);
    rageWindow.push({ t: now, x, y });
    if (rageWindow.length === 3) {
      bump('rage');
      bump(`rageCells.${x}_${y}`);
      rageWindow = [];
    }
  };
  window.addEventListener('click', onClick, { passive: true, capture: true });

  // ── periodic write-out ──
  const flushTimer = setInterval(() => {
    // A visit that crosses midnight should not credit yesterday.
    const d = today();
    if (d !== dayKey) { flush(); dayKey = d; }
    flush();
  }, FLUSH_MS);

  const beatTimer = setInterval(() => { if (!document.hidden) heartbeat(); }, HEARTBEAT_MS);
  heartbeat();

  // ── end of session ──
  let ended = false;
  const finish = () => {
    if (ended) return;
    ended = true;

    const secs = Math.round((Date.now() - startedAt) / 1000);
    const bucket = DURATION_BUCKETS.find(([max]) => secs < max)[1];
    bump(`durations.${bucket.replace(/[.~/[\]*]/g, '_')}`);
    bump(`depths.${Math.min(100, Math.round(maxDepth / 25) * 25)}`);
    bump('depthSum', maxDepth);
    // Under ten seconds and never past the fold is the only definition of
    // a bounce that means anything on a one-page site.
    if (secs < 10 && maxDepth < 25) bump('bounces');
    // Where they were when they left — the drop-off picture.
    bump(`exits.${liveSection.replace(/[.~/[\]*\s]/g, '_')}`);

    clearInterval(tick);
    clearInterval(flushTimer);
    clearInterval(beatTimer);
    clearTimeout(observeTimer);
    io.disconnect();
    scroller.removeEventListener('scroll', onScroll);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('click', onClick, { capture: true });

    flush(true);
    dropLive();
  };

  /* pagehide is the one that actually fires on iOS and on tab close;
     visibilitychange covers backgrounding, where the browser may kill the
     tab without another event. Both are idempotent. */
  window.addEventListener('pagehide', finish);
  window.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
}
