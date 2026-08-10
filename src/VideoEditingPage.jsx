import { useState, useRef, useEffect, useCallback } from 'react';
import './VideoEditingPage.css';

const VIDEOS = [
  {
    id: 'v1', src: '/Video1.mp4',
    title: 'Cinematic Reel 2025', subtitle: 'Annual Showreel · KishoreditX',
    genre: 'Showreel', year: '2025', duration: '2:30',
    desc: 'A full-year compilation of cinematic edits, precise colour grades, and visual storytelling. Every frame intentional.',
    creator: 'Kish', rating: '9.8',
    badges: ['HD', 'Dolby Vision', '5.1', 'CC'],
    gl: 'rgba(22,52,130,0.6)', ac: '#3b82f6',
    bg: 'linear-gradient(145deg,#0d1b35,#182d50)',
  },
  {
    id: 'v2', src: '/Glitchvd.mp4',
    title: 'Glitch Art Series', subtitle: 'Experimental · Digital Decay',
    genre: 'Experimental', year: '2025', duration: '1:45',
    desc: 'An experimental visual essay exploring digital corruption, glitch aesthetics, and the strange beauty of broken signals.',
    creator: 'Kish', rating: '9.5',
    badges: ['HD', '5.1', 'CC'],
    gl: 'rgba(100,18,145,0.6)', ac: '#a855f7',
    bg: 'linear-gradient(145deg,#1a0830,#2d0e52)',
  },
  {
    id: 'v3', src: null,
    title: 'Brand Film: Aurora', subtitle: 'Commercial · Identity',
    genre: 'Commercial', year: '2024', duration: '3:15',
    desc: 'A premium brand identity film blending atmospheric fog, volumetric light, and product narrative into a visual poem.',
    creator: 'Kish', rating: '9.2',
    badges: ['4K', 'Dolby Vision', '5.1', 'AD'],
    gl: 'rgba(6,88,130,0.55)', ac: '#06b6d4',
    bg: 'linear-gradient(145deg,#001428,#002a44)',
  },
  {
    id: 'v4', src: null,
    title: 'Motion Type Study', subtitle: 'Typography · Kinetic',
    genre: 'Motion Design', year: '2024', duration: '1:20',
    desc: 'Kinetic typography meets cinematic motion — a study in the relationship between text, rhythm, and visual tension.',
    creator: 'Kish', rating: '9.0',
    badges: ['HD', '5.1'],
    gl: 'rgba(180,98,0,0.5)', ac: '#f59e0b',
    bg: 'linear-gradient(145deg,#1c1200,#352200)',
  },
  {
    id: 'v5', src: null,
    title: 'Fragments', subtitle: 'Short Documentary',
    genre: 'Narrative', year: '2024', duration: '8:40',
    desc: 'Disconnected moments woven into a cohesive emotional arc — the art of invisible editing at its most precise.',
    creator: 'Kish', rating: '9.4',
    badges: ['4K', 'Dolby Vision', '5.1', 'CC', 'AD'],
    gl: 'rgba(10,118,78,0.5)', ac: '#10b981',
    bg: 'linear-gradient(145deg,#001218,#00222e)',
  },
  {
    id: 'v6', src: null,
    title: 'Colour Grade: Noir', subtitle: 'Colour · Grading',
    genre: 'Colour Work', year: '2024', duration: '2:00',
    desc: 'From flat log footage to a noir masterpiece — a deep dive into the craft of cinematic colour grading.',
    creator: 'Kish', rating: '9.6',
    badges: ['HD', 'Dolby Vision', '5.1'],
    gl: 'rgba(78,18,140,0.55)', ac: '#8b5cf6',
    bg: 'linear-gradient(145deg,#100018,#1e0038)',
  },
  {
    id: 'v7', src: null,
    title: 'AI × Live Blend', subtitle: 'AI Art · VFX Hybrid',
    genre: 'AI Hybrid', year: '2025', duration: '2:55',
    desc: 'Seamlessly blending AI-generated imagery with live footage to create impossible worlds with photorealistic fidelity.',
    creator: 'Kish', rating: '9.7',
    badges: ['4K', 'Dolby Vision', '5.1', 'CC'],
    gl: 'rgba(200,18,75,0.5)', ac: '#ec4899',
    bg: 'linear-gradient(145deg,#1a0010,#300020)',
  },
  {
    id: 'v8', src: null,
    title: 'VFX Breakdown', subtitle: 'VFX · Compositing',
    genre: 'VFX', year: '2024', duration: '4:30',
    desc: 'Behind-the-scenes breakdown of complex VFX shots — from raw plate to final composite, step by step.',
    creator: 'Kish', rating: '9.3',
    badges: ['HD', '5.1', 'AD'],
    gl: 'rgba(6,158,175,0.5)', ac: '#14b8a6',
    bg: 'linear-gradient(145deg,#001020,#001e38)',
  },
];

const TABS = ['All Projects', 'Highlights', 'Details'];

// ── SVG ICONS ────────────────────────────────────────────────
function PlayIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21" /></svg>;
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="3" width="5" height="18" rx="1.5" />
      <rect x="14" y="3" width="5" height="18" rx="1.5" />
    </svg>
  );
}
function SkipBackIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor">
      <path d="M20 7V3l-7 6 7 6V11c5.5 0 10 4.5 10 10s-4.5 10-10 10S10 26.5 10 21H7c0 7.2 5.8 13 13 13s13-5.8 13-13S27.2 7 20 7z"/>
      <text x="20" y="25" fontSize="10" fontWeight="900" textAnchor="middle">10</text>
    </svg>
  );
}
function SkipFwdIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor">
      <path d="M20 7V3l7 6-7 6V11C14.5 11 10 15.5 10 21s4.5 10 10 10 10-4.5 10-10h3c0 7.2-5.8 13-13 13S7 28.2 7 21 12.8 7 20 7z"/>
      <text x="20" y="25" fontSize="10" fontWeight="900" textAnchor="middle">10</text>
    </svg>
  );
}
function VolumeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06C17.87 19.78 21 16.18 21 12s-3.13-7.78-7-8.77z"/>
    </svg>
  );
}
function MuteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
    </svg>
  );
}
function FullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
    </svg>
  );
}
function ExitFullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function GroupWatchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function TrailerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polygon points="10 9 15 12 10 15" fill="currentColor" stroke="none" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// ── HELPERS ─────────────────────────────────────────────────
function formatTime(s) {
  if (!s || isNaN(s) || !isFinite(s)) return '0:00';
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ── MAIN COMPONENT ──────────────────────────────────────────
export default function VideoEditingPage({ onBack }) {
  const [idx, setIdx]               = useState(0);
  const [fade, setFade]             = useState(false);
  const [watching, setWatching]     = useState(false);
  const [watchFlash, setFlash]      = useState(false);
  const [activeTab, setActiveTab]   = useState(0);
  const [infoKey, setInfoKey]       = useState(0);

  // Player state
  const [playing, setPlaying]           = useState(false);
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);
  const [volume, setVolume]             = useState(1);
  const [muted, setMuted]               = useState(false);
  const [ctrlVisible, setCtrlVisible]   = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playPulse, setPlayPulse]       = useState(null); // 'play'|'pause'|null

  const videoRef    = useRef(null);
  const flashTimer  = useRef(null);
  const hideTimer   = useRef(null);
  const trackRef    = useRef(null);
  const playerRef   = useRef(null);
  const pulseTimer  = useRef(null);

  const v = VIDEOS[idx];

  // ── show controls + reset hide timer ──
  const showControls = useCallback(() => {
    setCtrlVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setCtrlVisible(false), 3000);
  }, []);

  // ── sync video events when watching ──
  useEffect(() => {
    if (!watching) return;
    const vid = videoRef.current;
    if (!vid) return;

    vid.muted  = false;
    vid.volume = volume;

    // Grab initial state
    setPlaying(!vid.paused);
    setDuration(isFinite(vid.duration) ? vid.duration : 0);
    setCurrentTime(vid.currentTime);

    const onTime     = () => setCurrentTime(vid.currentTime);
    const onDuration = () => setDuration(isFinite(vid.duration) ? vid.duration : 0);
    const onPlay     = () => setPlaying(true);
    const onPause    = () => setPlaying(false);

    vid.addEventListener('timeupdate',      onTime);
    vid.addEventListener('durationchange',  onDuration);
    vid.addEventListener('loadedmetadata',  onDuration);
    vid.addEventListener('play',            onPlay);
    vid.addEventListener('pause',           onPause);

    showControls();

    return () => {
      vid.removeEventListener('timeupdate',     onTime);
      vid.removeEventListener('durationchange', onDuration);
      vid.removeEventListener('loadedmetadata', onDuration);
      vid.removeEventListener('play',           onPlay);
      vid.removeEventListener('pause',          onPause);
      clearTimeout(hideTimer.current);
      vid.muted = true;
    };
  }, [watching]);

  // ── fullscreen change listener ──
  useEffect(() => {
    const fn = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', fn);
    return () => document.removeEventListener('fullscreenchange', fn);
  }, []);

  // ── scroll active card into view ──
  useEffect(() => {
    if (!trackRef.current) return;
    const card = trackRef.current.children[idx];
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [idx]);

  // ── cleanup timers ──
  useEffect(() => () => {
    clearTimeout(flashTimer.current);
    clearTimeout(hideTimer.current);
    clearTimeout(pulseTimer.current);
  }, []);

  // ── enter watch mode ──
  const watchNow = (e) => {
    e?.stopPropagation?.();
    if (!v.src) return;
    clearTimeout(flashTimer.current);
    setWatching(true);
    setFlash(true);
    flashTimer.current = setTimeout(() => setFlash(false), 800);
    // scroll to top so video fills viewport
    document.querySelector('.vep-root')?.scrollTo({ top: 0 });
  };

  // ── exit watch mode ──
  const exitWatch = useCallback(() => {
    setWatching(false);
    setPlaying(false);
    setCurrentTime(0);
    setCtrlVisible(true);
    clearTimeout(hideTimer.current);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
  }, []);

  // ── pick a different video ──
  const pick = useCallback((i) => {
    if (i === idx) return;
    if (videoRef.current) videoRef.current.muted = true;
    clearTimeout(flashTimer.current);
    clearTimeout(hideTimer.current);
    setWatching(false);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setCtrlVisible(true);
    setFlash(false);
    setFade(true);
    setTimeout(() => { setIdx(i); setInfoKey(k => k + 1); setFade(false); }, 400);
  }, [idx]);

  // ── keyboard nav ──
  useEffect(() => {
    const onKey = (e) => {
      if (watching) {
        if (e.key === 'Escape')       exitWatch();
        if (e.key === ' ')            { e.preventDefault(); togglePlay(); }
        if (e.key === 'ArrowLeft')    handleSkip(-10);
        if (e.key === 'ArrowRight')   handleSkip(10);
        if (e.key === 'ArrowUp')      changeVolume(Math.min(1, volume + 0.1));
        if (e.key === 'ArrowDown')    changeVolume(Math.max(0, volume - 0.1));
        showControls();
      } else {
        if (e.key === 'ArrowRight')   pick((idx + 1) % VIDEOS.length);
        if (e.key === 'ArrowLeft')    pick((idx - 1 + VIDEOS.length) % VIDEOS.length);
        if (e.key === 'Escape')       onBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pick, idx, onBack, watching, exitWatch, volume]);

  // ── player controls ──
  const triggerPulse = (type) => {
    setPlayPulse(type);
    clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setPlayPulse(null), 650);
  };

  const togglePlay = (e) => {
    e?.stopPropagation?.();
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) { vid.play().catch(() => {}); triggerPulse('play'); }
    else            { vid.pause();                triggerPulse('pause'); }
    showControls();
  };

  const handleSkip = (secs, e) => {
    e?.stopPropagation?.();
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = Math.max(0, Math.min(duration || Infinity, vid.currentTime + secs));
    setCurrentTime(vid.currentTime);
    showControls();
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const val = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = val;
    setCurrentTime(val);
    showControls();
  };

  const changeVolume = (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    setMuted(clamped === 0);
    if (videoRef.current) {
      videoRef.current.volume = clamped;
      videoRef.current.muted  = clamped === 0;
    }
  };

  const handleVolume = (e) => {
    e.stopPropagation();
    changeVolume(parseFloat(e.target.value));
    showControls();
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const newMuted = !muted;
    setMuted(newMuted);
    if (videoRef.current) {
      videoRef.current.muted  = newMuted;
      videoRef.current.volume = newMuted ? 0 : (volume || 0.7);
    }
    if (newMuted) setVolume(0); else setVolume(v => v === 0 ? 0.7 : v);
    showControls();
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
    showControls();
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const relatedVideos = VIDEOS.filter((_, i) => i !== idx);

  return (
    <div className={`vep-root${watching ? ' vep-root--watching' : ''}`}>

      {/* ── CLOSE BAR ── */}
      <div className="vep-close-bar">
        <button className="vep-icon-btn" onClick={(e) => e.stopPropagation()} aria-label="Share">
          <ShareIcon />
        </button>
        <button className="vep-icon-btn" onClick={(e) => { e.stopPropagation(); onBack(); }} aria-label="Close">
          <CloseIcon />
        </button>
      </div>

      {/* ── HERO ── */}
      <div className="vep-hero" onClick={(e) => e.stopPropagation()}>
        <div className={`vep-bg${fade ? ' vep-bg--out' : ''}`}>
          {v.src
            ? <video key={v.id} ref={videoRef} className="vep-bg-vid" autoPlay loop muted playsInline src={v.src} />
            : <div className="vep-bg-static" style={{ background: v.bg }} />
          }
        </div>
        <div className="vep-hero-grad-top"    aria-hidden="true" />
        <div className="vep-hero-grad-bottom" aria-hidden="true" />
        <div key={infoKey} className={`vep-hero-info${fade ? ' vep-hero-info--out' : ''}`}>
          <h1 className="vep-title">{v.title}</h1>
          <p className="vep-subtitle">{v.subtitle}</p>
          <div className="vep-badges">
            <span className="vep-badge vep-badge--accent">{v.rating}</span>
            {v.badges.map((b) => <span key={b} className="vep-badge">{b}</span>)}
          </div>
          <p className="vep-meta-line">
            <span>{v.year}</span>
            <span className="vep-meta-dot" />
            <span>{v.duration}</span>
            <span className="vep-meta-dot" />
            <span>{v.genre}</span>
          </p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="vep-body" onClick={(e) => e.stopPropagation()}>
        <button
          className={`vep-play-btn${!v.src ? ' vep-play-btn--disabled' : ''}`}
          onClick={watchNow}
          disabled={!v.src}
        >
          <PlayIcon />
          {v.src ? 'Watch Now' : 'Preview Coming Soon'}
        </button>

        <div className="vep-actions">
          <button className="vep-action vep-action--active">
            <div className="vep-action-icon"><CheckIcon /></div>
            <span className="vep-action-label">My List</span>
          </button>
          <button className="vep-action">
            <div className="vep-action-icon"><GroupWatchIcon /></div>
            <span className="vep-action-label">GroupWatch</span>
          </button>
          <button className="vep-action">
            <div className="vep-action-icon"><TrailerIcon /></div>
            <span className="vep-action-label">Trailer</span>
          </button>
          <button className="vep-action">
            <div className="vep-action-icon"><DownloadIcon /></div>
            <span className="vep-action-label">Download</span>
          </button>
        </div>

        <p className="vep-desc">{v.desc}</p>

        <div className="vep-tabs" role="tablist">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`vep-tab${activeTab === i ? ' vep-tab--active' : ''}`}
              onClick={() => setActiveTab(i)}
              role="tab"
              aria-selected={activeTab === i}
            >{tab}</button>
          ))}
        </div>

        {activeTab === 2 ? (
          <div className="vep-details-grid">
            {[
              ['Creator', v.creator], ['Year', v.year], ['Duration', v.duration],
              ['Genre', v.genre], ['Rating', `${v.rating} / 10`], ['Audio', v.badges.join(', ')],
            ].map(([label, value]) => (
              <div key={label} className="vep-detail-item">
                <span className="vep-detail-label">{label}</span>
                <span className="vep-detail-value">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="vep-carousel">
            <div className="vep-carousel-track" ref={trackRef}>
              {(activeTab === 0 ? VIDEOS : relatedVideos).map((item, i) => {
                const realIdx = activeTab === 0 ? i : VIDEOS.indexOf(item);
                return (
                  <div
                    key={item.id}
                    className={`vep-card${realIdx === idx ? ' vep-card--on' : ''}`}
                    style={{ '--ac': item.ac }}
                    onClick={() => pick(realIdx)}
                    onMouseEnter={e => e.currentTarget.querySelector('video')?.play().catch(() => {})}
                    onMouseLeave={e => {
                      const vid = e.currentTarget.querySelector('video');
                      if (vid) { vid.pause(); vid.currentTime = 0; }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Play: ${item.title}`}
                  >
                    <div className="vep-card-bg" style={{ background: item.bg }} />
                    {item.src && <video className="vep-card-vid" muted playsInline preload="none" src={item.src} loop />}
                    <div className="vep-card-grad" aria-hidden="true" />
                    <div className="vep-card-info">
                      <span className="vep-card-genre">{item.genre}</span>
                      <span className="vep-card-name">{item.title}</span>
                      <span className="vep-card-meta">{item.year} · {item.duration}</span>
                    </div>
                    <div className="vep-card-play" aria-hidden="true"><PlayIcon /></div>
                    {realIdx === idx && <div className="vep-card-bar" aria-hidden="true" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── WATCH FLASH ── */}
      {watchFlash && <div className="vep-watch-flash" aria-hidden="true" />}

      {/* ══════════════════════════════════════════════════════
          NETFLIX-STYLE PLAYER — shown only when watching
      ══════════════════════════════════════════════════════ */}
      {watching && (
        <div
          ref={playerRef}
          className="vep-player"
          onMouseMove={showControls}
          style={{ cursor: ctrlVisible ? 'default' : 'none' }}
        >
          {/* Click centre area → toggle play/pause */}
          <div className="vep-player-clickarea" onClick={togglePlay} aria-label="Toggle play/pause" role="button" tabIndex={-1} />

          {/* Play/Pause pulse flash */}
          {playPulse && (
            <div className={`vep-play-pulse vep-play-pulse--${playPulse}`} aria-hidden="true">
              {playPulse === 'play' ? <PlayIcon /> : <PauseIcon />}
            </div>
          )}

          {/* Top bar — title + exit button */}
          <div className={`vep-player-top${ctrlVisible ? ' vep-player-top--vis' : ''}`}>
            <div className="vep-player-top-info">
              <span className="vep-player-top-title">{v.title}</span>
              <span className="vep-player-top-sub">{v.subtitle}</span>
            </div>
            <button
              className="vep-player-exit"
              onClick={(e) => { e.stopPropagation(); exitWatch(); }}
              aria-label="Exit player"
            >
              <CloseIcon /> Exit
            </button>
          </div>

          {/* Bottom controls */}
          <div
            className={`vep-player-controls${ctrlVisible ? ' vep-player-controls--vis' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Seek / progress bar */}
            <div className="vep-seeker-wrap">
              {/* decorative track — red fill + dot */}
              <div className="vep-seeker-track" aria-hidden="true">
                <div className="vep-seeker-fill" style={{ width: `${progress.toFixed(3)}%` }} />
                <div className="vep-seeker-dot"  style={{ left:  `${progress.toFixed(3)}%` }} />
              </div>
              {/* transparent range input on top for interaction */}
              <input
                type="range"
                className="vep-seeker-input"
                min={0}
                max={duration || 100}
                value={currentTime}
                step={0.05}
                onChange={handleSeek}
                aria-label="Video progress"
                aria-valuenow={Math.round(currentTime)}
                aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
              />
            </div>

            {/* Control row */}
            <div className="vep-player-bar">
              <div className="vep-player-bar-left">
                {/* Play / Pause */}
                <button className="vep-pctl vep-pctl--lg" onClick={togglePlay}
                  aria-label={playing ? 'Pause' : 'Play'}>
                  {playing ? <PauseIcon /> : <PlayIcon />}
                </button>

                {/* Skip back 10s */}
                <button className="vep-pctl" onClick={(e) => handleSkip(-10, e)} aria-label="Rewind 10 seconds">
                  <SkipBackIcon />
                </button>

                {/* Skip forward 10s */}
                <button className="vep-pctl" onClick={(e) => handleSkip(10, e)} aria-label="Skip forward 10 seconds">
                  <SkipFwdIcon />
                </button>

                {/* Volume */}
                <div className="vep-vol-group">
                  <button className="vep-pctl" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
                    {(muted || volume === 0) ? <MuteIcon /> : <VolumeIcon />}
                  </button>
                  <input
                    type="range"
                    className="vep-vol-slider"
                    min={0} max={1} step={0.02}
                    value={muted ? 0 : volume}
                    onChange={handleVolume}
                    onClick={e => e.stopPropagation()}
                    aria-label="Volume"
                  />
                </div>

                {/* Time */}
                <span className="vep-time" aria-live="off">
                  {formatTime(currentTime)}
                  <span className="vep-time-sep" aria-hidden="true"> / </span>
                  {formatTime(duration)}
                </span>
              </div>

              <div className="vep-player-bar-right">
                <button className="vep-pctl" onClick={toggleFullscreen}
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
                  {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
