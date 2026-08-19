import { useState, useRef, useEffect, useCallback } from 'react';
import { tap } from './mobileUtils';
import { Icon, Img } from './ui';
import { REEL, CAMERAS, SITES, GRADES, TOOLKIT } from './workData';

/* ══════════════════════════════════════════════════════════════════════
   WORK — the detail views

   The first version of the phone's Work board opened every item into the
   same thing: a cover, a paragraph and a grid of stills. That is a
   catalogue, not a portfolio — and for the two items whose whole point
   is that they move (the reel, the camera room) it showed no video at
   all, which read as broken because it effectively was.

   So the pieces that have a medium get that medium, in the form the
   phone is best at:

     · the reel      → full-bleed vertical player, swiped like a feed
     · the room      → the surveillance wall, six live feeds
     · colour        → a wipe you drag with your thumb
     · websites      → real projects with real links
   ══════════════════════════════════════════════════════════════════════ */

/* ── 1 · THE REEL ─────────────────────────────────────────────────────
   One clip per full-height page, snapped, swiped vertically. Only the
   clip you are looking at plays: four <video>s decoding at once on a
   phone is how you get a hot device and a dropped frame rate. */
function ReelItem({ item, active, muted, onToggleMute }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  /* The effect only drives the element. Whether it is actually playing
     comes back through the element's own play/pause events — which is
     both what the linter wants and more truthful: a browser can pause a
     video for its own reasons, and a flag set from a promise would go on
     claiming it was playing. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      // play() rejects when autoplay is refused; that is not an error
      // worth surfacing, the visitor just taps the frame.
      v.play().catch(() => {});
    } else {
      v.pause();
      // Rewinding fires timeupdate, which resets the progress bar.
      v.currentTime = 0;
    }
  }, [active]);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    tap();
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  return (
    <article className="mb-reelpage">
      {item.src ? (
        <video
          ref={videoRef}
          className="mb-reelpage-vid"
          src={item.src}
          loop
          muted={muted}
          playsInline
          /* Metadata only until this page is the one on screen — the
             browser then buffers the rest on its own. */
          preload={active ? 'auto' : 'metadata'}
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration) setProgress(v.currentTime / v.duration);
          }}
        />
      ) : (
        <div className="mb-reelpage-still">
          <Img src={item.thumb} alt={item.title} w={760} />
          <span className="mb-reelpage-soon">Clip not online yet</span>
        </div>
      )}

      {/* Tapping the frame pauses. The badge only appears while paused,
          so a playing clip carries no chrome at all. */}
      {item.src && !playing && (
        <button className="mb-reelpage-play" onClick={toggle} aria-label="Play">
          <Icon name="play" size={30} />
        </button>
      )}

      <div className="mb-reelpage-scrim" aria-hidden="true" />

      <div className="mb-reelpage-body">
        <div className="mb-reelpage-meta">
          <span className="mb-reelpage-genre">{item.genre}</span>
          <i />
          <span>{item.year}</span>
          <i />
          <span>{item.duration}</span>
          <span className="mb-reelpage-rating">★ {item.rating}</span>
        </div>
        <h3>{item.title}</h3>
        <p className="mb-reelpage-sub">{item.sub}</p>
        <p className="mb-reelpage-desc">{item.desc}</p>
        <div className="mb-tags">
          {item.badges.map((b) => <span key={b}>{b}</span>)}
        </div>
      </div>

      {item.src && (
        <>
          <button
            className="mb-reelpage-mute"
            onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            <Icon name={muted ? 'muted' : 'sound'} size={18} />
          </button>
          <div className="mb-reelpage-bar" aria-hidden="true">
            <i style={{ transform: `scaleX(${progress})` }} />
          </div>
        </>
      )}
    </article>
  );
}

export function ReelPlayer() {
  const [at, setAt] = useState(0);
  const [muted, setMuted] = useState(true);
  const scrollerRef = useRef(null);

  /* Which page is on screen decides which clip plays. An observer on the
     pages is steadier than reading scrollTop: snap scrolling settles
     asynchronously and a scroll handler fires mid-flight. */
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            setAt(Number(e.target.dataset.i));
          }
        });
      },
      { root, threshold: [0.6] },
    );
    root.querySelectorAll('[data-i]').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="mb-reelfeed" ref={scrollerRef}>
      {REEL.map((item, i) => (
        <div className="mb-reelfeed-page" key={item.id} data-i={i}>
          <ReelItem
            item={item}
            active={i === at}
            muted={muted}
            onToggleMute={() => { tap(); setMuted((m) => !m); }}
          />
        </div>
      ))}
      <p className="mb-reelfeed-hint" aria-hidden="true">
        {at + 1} / {REEL.length} · swipe up
      </p>
    </div>
  );
}

/* ── 2 · THE ROOM ─────────────────────────────────────────────────────
   The desktop's surveillance wall. Six feeds on a phone is genuinely too
   many decoders, so the grid runs them at a small size and the tapped
   one goes full-frame — which is also how a real camera wall behaves. */
function useCctvClock() {
  const [t, setT] = useState('--:--:--');
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function Feed({ cam, big, onClick }) {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.play().catch(() => {});
    /* Each feed starts at a different point in its clip so the wall does
       not look like six copies of one loop. */
    const onMeta = () => { if (v.duration) v.currentTime = (Number(cam.id) * 3.1) % v.duration; };
    v.addEventListener('loadedmetadata', onMeta, { once: true });
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, [cam.id]);

  return (
    <button
      className={`mb-cam${big ? ' mb-cam--big' : ''}${cam.online ? '' : ' mb-cam--off'}`}
      onClick={onClick}
      aria-label={`Camera ${cam.id}, ${cam.loc}`}
    >
      {cam.online && cam.src ? (
        <video ref={ref} src={cam.src} muted loop playsInline preload="metadata" />
      ) : (
        <span className="mb-cam-lost">NO SIGNAL</span>
      )}

      <span className="mb-cam-scan" aria-hidden="true" />
      <span className="mb-cam-top">
        <b>CAM {cam.id}</b>
        {cam.online && <i className="mb-cam-rec" />}
      </span>
      <span className="mb-cam-bottom">
        <b>{cam.loc}</b>
        <span>{cam.zone} · {cam.res} · {cam.fps}FPS</span>
      </span>
    </button>
  );
}

export function CameraWall() {
  const [full, setFull] = useState(null);
  const clock = useCctvClock();
  const online = CAMERAS.filter((c) => c.online).length;

  return (
    <div className="mb-cctv">
      <div className="mb-cctv-head">
        <span className="mb-cctv-live"><i />LIVE</span>
        <span className="mb-mono">{clock}</span>
        <span className="mb-mono">{online}/{CAMERAS.length} ONLINE</span>
      </div>

      {full ? (
        <>
          <Feed cam={full} big onClick={() => { tap(); setFull(null); }} />
          <p className="mb-small" style={{ textAlign: 'center', marginTop: 10 }}>
            Tap the feed to go back to the wall
          </p>
        </>
      ) : (
        <div className="mb-cctv-grid">
          {CAMERAS.map((cam) => (
            <Feed key={cam.id} cam={cam} onClick={() => { tap(); if (cam.online) setFull(cam); }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 3 · COLOUR ───────────────────────────────────────────────────────
   A wipe between the same frame ungraded and graded. Both layers are the
   same <img>, so there is one download and the halves stay in register;
   the grade is a CSS filter, which is honest about what a grade is —
   a transform of the source, not a different photograph. */
function Wipe({ shot }) {
  const [x, setX] = useState(0.5);
  const boxRef = useRef(null);

  const set = useCallback((clientX) => {
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setX(Math.min(1, Math.max(0, (clientX - r.left) / r.width)));
  }, []);

  const move = useCallback((e) => {
    const t = e.touches ? e.touches[0] : e;
    set(t.clientX);
  }, [set]);

  return (
    <figure className="mb-wipe-fig">
      <div
        className="mb-wipe"
        ref={boxRef}
        /* touch-action:none in CSS — without it the browser claims the
           horizontal drag for a scroll and the handle never moves. */
        onTouchStart={move}
        onTouchMove={move}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); move(e); }}
        onPointerMove={(e) => { if (e.buttons) move(e); }}
        role="slider"
        aria-label={`${shot.title} — graded against ungraded`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(x * 100)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft')  setX((v) => Math.max(0, v - 0.05));
          if (e.key === 'ArrowRight') setX((v) => Math.min(1, v + 0.05));
        }}
      >
        <img className="mb-wipe-base" src={shot.src} alt="" draggable="false" />
        <div className="mb-wipe-top" style={{ clipPath: `inset(0 0 0 ${x * 100}%)` }}>
          <img src={shot.src} alt="" draggable="false" style={{ filter: shot.filter }} />
        </div>
        <span className="mb-wipe-handle" style={{ left: `${x * 100}%` }} aria-hidden="true">
          <i />
        </span>
        <span className="mb-wipe-tag mb-wipe-tag--l">SOURCE</span>
        <span className="mb-wipe-tag mb-wipe-tag--r">GRADED</span>
      </div>
      <figcaption>
        <b>{shot.title}</b>
        <span>{shot.note}</span>
      </figcaption>
    </figure>
  );
}

export function GradeStudio() {
  return (
    <div className="mb-grades">
      <p className="mb-body">
        Drag across any frame. Left of the handle is what came off the camera; right of it
        is the grade. Balance first, look second — that order is why it still reads on a
        phone in daylight.
      </p>
      {GRADES.map((g) => <Wipe key={g.title} shot={g} />)}
    </div>
  );
}

/* ── 4 · WEBSITES ─────────────────────────────────────────────────── */
export function SiteList() {
  return (
    <div className="mb-sites">
      {SITES.map((s) => (
        <article className="mb-site" key={s.title}>
          <Img src={s.shot} alt="" w={620} />
          <div className="mb-site-body">
            <div className="mb-site-top">
              <h3>{s.title}</h3>
              <span className={`mb-site-status mb-site-status--${s.status.split(' ')[0].toLowerCase()}`}>
                {s.status}
              </span>
            </div>
            <p className="mb-site-tag">{s.tagline}</p>
            <p className="mb-body" style={{ fontSize: '0.82rem' }}>{s.desc}</p>
            <div className="mb-tags">
              {s.stack.map((t) => <span key={t}>{t}</span>)}
              <span>{s.year}</span>
            </div>
            {s.url ? (
              <a className="mb-btn mb-btn--ghost mb-btn--sm" href={s.url} target="_blank" rel="noopener noreferrer">
                {s.host}
                <Icon name="arrow" size={14} />
              </a>
            ) : (
              <span className="mb-small">{s.host} · not public</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

/* ── 5 · TOOLKIT ──────────────────────────────────────────────────── */
export function Toolkit() {
  return (
    <div className="mb-kit">
      {TOOLKIT.map((g) => (
        <section key={g.group}>
          <p className="mb-eyebrow">{g.group}</p>
          <div className="mb-tags" style={{ marginTop: 10 }}>
            {g.items.map((t) => <span key={t}>{t}</span>)}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ── 6 · CERTIFICATES ─────────────────────────────────────────────────
   The real artwork out of /public/certs, not a row of text. */
export function CertWall({ rows }) {
  const [open, setOpen] = useState(null);
  return (
    <>
      <div className="mb-certs">
        {rows.map((c, i) => (
          <button className="mb-cert mb-press" key={i} onClick={() => { tap(); setOpen(i); }}>
            <img src={`/certs/cert-${(i % 4) + 1}.svg`} alt="" draggable="false" />
            <span>
              <b>{c.title}</b>
              <em>{c.issuer} · {c.year}</em>
            </span>
          </button>
        ))}
      </div>
      {open != null && (
        <div className="mb-lightbox" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <img src={`/certs/cert-${(open % 4) + 1}.svg`} alt={rows[open].title} />
          <button className="mb-lightbox-x mb-hit" onClick={() => setOpen(null)} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
          <div className="mb-lightbox-cap">
            <b>{rows[open].title}</b>
            <span>{rows[open].issuer} · {rows[open].year}</span>
          </div>
        </div>
      )}
    </>
  );
}
