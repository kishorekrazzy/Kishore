import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fmt, useMusicPlayer } from './MusicContext';
import './MusicWindow.css';

// ── Small icons ───────────────────────────────────────────────────────────────

const IcoPrev    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 5.5v13L8.5 12 19 5.5zM5 5h2v14H5z"/></svg>;
const IcoNext    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 5.5v13L15.5 12 5 5.5zM17 5h2v14h-2z"/></svg>;
const IcoPause   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="3" width="4" height="18" rx="2"/><rect x="15" y="3" width="4" height="18" rx="2"/></svg>;
const IcoPlay    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3l14 9-14 9V3z"/></svg>;
const IcoShuffle = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>;
const IcoRepeat  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;
const IcoVol     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
const IcoHeart   = ({ on }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={on ? '#fc3c44' : 'none'} stroke={on ? '#fc3c44' : 'currentColor'} strokeWidth="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;

function SidebarIcon({ tab }) {
  if (tab === 'now-playing') return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>;
  if (tab === 'songs')       return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
  if (tab === 'albums')      return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
  if (tab === 'artists')     return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-8 8-8s8 4 8 8"/></svg>;
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 6h18M3 12h15M3 18h12"/><circle cx="20" cy="17" r="2"/><path d="M22 10v7"/></svg>;
}

// ── MusicWindow ───────────────────────────────────────────────────────────────

function MusicWindow({ visible, onClose }) {
  // ── Shared playback state from context ──
  const { SONGS,
    song, songIdx, setSongIdx,
    playing, setPlaying,
    progress, seek,
    shuffle, setShuffle,
    repeat,  setRepeat,
    volume,  setVolume,
    duration,
    prev, next, playAt,
  } = useMusicPlayer();

  // ── Window-local UI state ──
  const [tab,    setTab]    = useState('now-playing');
  const [liked,  setLiked]  = useState(false);

  // Draggable title bar
  const [pos, setPos] = useState({ x: 30, y: -30 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ active: false, sx: 0, sy: 0, px: 0, py: 0 });

  const onTitleDown = (e) => {
    if (e.target.closest('button')) return;
    drag.current = { active: true, sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
    setDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const move = (e) => {
      if (!drag.current.active) return;
      setPos({ x: drag.current.px + e.clientX - drag.current.sx, y: drag.current.py + e.clientY - drag.current.sy });
    };
    const up = () => { if (drag.current.active) { drag.current.active = false; setDragging(false); } };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, []);

  const trackDur  = duration && Number.isFinite(duration) && duration > 0 ? duration : song.duration;
  const elapsed   = Math.floor(progress * trackDur);
  const remaining = Math.max(0, trackDur - elapsed);

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek((e.clientX - rect.left) / rect.width);
  };

  const SIDEBAR_ITEMS = [
    { id: 'now-playing', label: 'Listening Now' },
    { id: 'songs',       label: 'Songs' },
    { id: 'albums',      label: 'Albums' },
    { id: 'artists',     label: 'Artists' },
    { id: 'playlists',   label: 'Playlists' },
  ];

  const PLAYLISTS = ['Cinematic Vibes', 'Focus Mode', 'Late Night Feels'];

  return createPortal(
    <div
      className={`mw-window${!visible ? ' mw-window--hidden' : ''}`}
      style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
    >
      {/* Title bar */}
      <div
        className="mw-titlebar"
        onMouseDown={onTitleDown}
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      >
        <div className="wg-fn-lights">
          <button className="wg-fn-light wg-fn-red"    onClick={onClose} aria-label="Close" />
          <button className="wg-fn-light wg-fn-yellow" aria-label="Minimise" />
          <button className="wg-fn-light wg-fn-green"  aria-label="Full screen" />
        </div>
        <div className="mw-titlebar-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 18V5l12-2v13" stroke="#fc3c44" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="6" cy="18" r="3" fill="#fc3c44"/>
            <circle cx="18" cy="16" r="3" fill="#fc3c44"/>
          </svg>
          <span className="mw-titlebar-label">Music</span>
        </div>
        <div className="mw-titlebar-end">
          <button className="mw-hdr-btn" aria-label="Mini player">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="1" y="1" width="14" height="5" rx="1.5"/><rect x="1" y="10" width="14" height="5" rx="1.5" opacity=".4"/></svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="mw-body">

        {/* Sidebar */}
        <aside className="mw-sidebar">
          <div className="mw-sidebar-group">
            <p className="mw-sidebar-hd">Library</p>
            {SIDEBAR_ITEMS.map(item => (
              <button
                key={item.id}
                className={`mw-sidebar-btn${tab === item.id ? ' mw-sidebar-btn--active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                <SidebarIcon tab={item.id} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="mw-sidebar-group">
            <p className="mw-sidebar-hd">Playlists</p>
            {PLAYLISTS.map(pl => (
              <button key={pl} className="mw-sidebar-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 6h18M3 12h15M3 18h12"/></svg>
                <span>{pl}</span>
              </button>
            ))}
          </div>
          <div className="mw-sidebar-foot">
            <div className="mw-mini-now">
              <img src={song.art} alt="" className="mw-mini-thumb" draggable={false} />
              <div className="mw-mini-info">
                <p className="mw-mini-title">{song.title}</p>
                <p className="mw-mini-artist">{song.artist}</p>
              </div>
            </div>
            <div className="mw-mini-ctrls">
              <button className="mw-mini-btn" onClick={prev} aria-label="Previous"><IcoPrev /></button>
              <button className="mw-mini-btn mw-mini-btn--play" onClick={() => setPlaying(p => !p)} aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? <IcoPause /> : <IcoPlay />}
              </button>
              <button className="mw-mini-btn" onClick={next} aria-label="Next"><IcoNext /></button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="mw-main">

          {/* ── NOW PLAYING ── */}
          {tab === 'now-playing' && (
            <div className="mw-now-playing">
              <div className="mw-art-wrap">
                <img
                  src={song.art}
                  alt={song.title}
                  className={`mw-art${playing ? ' mw-art--spinning' : ''}`}
                  draggable={false}
                />
                <div className="mw-art-shadow" />
              </div>

              <div className="mw-info-row">
                <div className="mw-info">
                  <h3 className="mw-song-title">{song.title}</h3>
                  <p className="mw-song-sub">{song.artist} · {song.album}</p>
                </div>
                <button className="mw-like-btn" onClick={() => setLiked(l => !l)} aria-label="Like">
                  <IcoHeart on={liked} />
                </button>
              </div>

              {/* Progress */}
              <div className="mw-progress-wrap">
                <div className="mw-progress-track" onClick={handleSeek} role="slider" aria-label="Seek" aria-valuenow={Math.round(progress * 100)}>
                  <div className="mw-progress-fill" style={{ width: `${progress * 100}%` }} />
                  <div className="mw-progress-thumb" style={{ left: `${progress * 100}%` }} />
                </div>
                <div className="mw-progress-times">
                  <span>{fmt(elapsed)}</span>
                  <span>−{fmt(remaining)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="mw-controls">
                <button className={`mw-ctrl mw-ctrl--sm${shuffle ? ' mw-ctrl--on' : ''}`} onClick={() => setShuffle(s => !s)} aria-label="Shuffle">
                  <IcoShuffle />
                </button>
                <button className="mw-ctrl" onClick={prev} aria-label="Previous"><IcoPrev /></button>
                <button className="mw-ctrl mw-ctrl--play" onClick={() => setPlaying(p => !p)} aria-label={playing ? 'Pause' : 'Play'}>
                  {playing ? <IcoPause /> : <IcoPlay />}
                </button>
                <button className="mw-ctrl" onClick={next} aria-label="Next"><IcoNext /></button>
                <button className={`mw-ctrl mw-ctrl--sm${repeat ? ' mw-ctrl--on' : ''}`} onClick={() => setRepeat(r => !r)} aria-label="Repeat">
                  <IcoRepeat />
                </button>
              </div>

              {/* Volume */}
              <div className="mw-volume-row">
                <IcoVol />
                <input
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="mw-vol-slider"
                  aria-label="Volume"
                />
              </div>

              {/* Up next */}
              <div className="mw-queue">
                <p className="mw-queue-hd">Up Next</p>
                {SONGS.slice(songIdx + 1, songIdx + 4).map((s, i) => (
                  <div
                    key={s.id}
                    className="mw-queue-row"
                    onDoubleClick={() => playAt(songIdx + 1 + i)}
                  >
                    <img src={s.art} alt="" className="mw-queue-thumb" draggable={false} />
                    <div className="mw-queue-info">
                      <p className="mw-queue-title">{s.title}</p>
                      <p className="mw-queue-artist">{s.artist}</p>
                    </div>
                    <span className="mw-queue-dur">{fmt(s.duration)}</span>
                  </div>
                ))}
                {songIdx + 1 >= SONGS.length && (
                  <p className="mw-queue-end">End of library</p>
                )}
              </div>
            </div>
          )}

          {/* ── SONGS LIST ── */}
          {tab === 'songs' && (
            <div className="mw-songs-view">
              <div className="mw-songs-hdr">
                <span>#</span>
                <span>Title</span>
                <span>Artist</span>
                <span>Album</span>
                <span>Time</span>
              </div>
              {SONGS.map((s, i) => {
                const active = songIdx === i;
                return (
                  <div
                    key={s.id}
                    className={`mw-song-row${active ? ' mw-song-row--active' : ''}`}
                    onDoubleClick={() => { playAt(i); setTab('now-playing'); }}
                  >
                    <span className="mw-row-num">
                      {active && playing
                        ? <span className="mw-playing-bars">{[0,1,2].map(j => <i key={j} className="mw-pbar" style={{ '--j': j }} />)}</span>
                        : <span>{i + 1}</span>
                      }
                    </span>
                    <span className="mw-row-title">
                      <img src={s.art} alt="" className="mw-row-thumb" draggable={false} />
                      {s.title}
                    </span>
                    <span className="mw-row-artist">{s.artist}</span>
                    <span className="mw-row-album">{s.album}</span>
                    <span className="mw-row-dur">{fmt(s.duration)}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── PLACEHOLDER VIEWS ── */}
          {(tab === 'albums' || tab === 'artists' || tab === 'playlists') && (
            <div className="mw-placeholder">
              <div className="mw-placeholder-icon">
                <SidebarIcon tab={tab} />
              </div>
              <p className="mw-placeholder-text">No {tab} yet</p>
              <p className="mw-placeholder-sub">Your {tab} will appear here</p>
            </div>
          )}

        </main>
      </div>
    </div>,
    document.body
  );
}

// ── Self-contained manager — listens to macdock:open → music ─────────────────

export function MusicWindowManager() {
  const [open,    setOpen]    = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.app !== 'music') return;
      setOpen(true);
      setVisible(true);
      window.dispatchEvent(new CustomEvent('macdock:running', { detail: { app: 'music', running: true } }));
    };
    window.addEventListener('macdock:open', handler);
    return () => window.removeEventListener('macdock:open', handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.dispatchEvent(new CustomEvent('macdock:running', { detail: { app: 'music', running: false } }));
  };

  if (!open) return null;
  return <MusicWindow visible={visible} onClose={handleClose} />;
}
