import { trackEvent } from './services/analytics';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useContent, withImages } from './content/store';

// ── Shared song library (single source of truth) ──────────────────────────────
//
// Each track maps to a real mp3 file in /public/Muisc/ and an album-art
// image. Placeholder durations are overridden at runtime by the audio
// element's actual `duration` once metadata loads.
//
export const DEFAULT_SONGS = [
  {
    id: 1,
    title: 'I Am The Danger',
    artist: 'Velocity Drive',
    album: 'Cinematic Underground',
    src: '/Muisc/I Am The Danger.mp3',
    art: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&w=1600&q=80',
    duration: 220,
  },
  {
    id: 2,
    title: 'Mobsta',
    artist: 'Heatwave Crew',
    album: 'Streetwave',
    src: '/Muisc/Mobsta.mp3',
    art: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1600&q=80',
    duration: 145,
  },
  {
    id: 3,
    title: 'Power House',
    artist: 'NeonPulse',
    album: 'Voltage Drive',
    src: '/Muisc/Power House.mp3',
    art: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=80',
    duration: 320,
  },
  {
    id: 4,
    title: 'Trance of OMI',
    artist: 'Aurelius Echo',
    album: 'Inner Frequencies',
    src: '/Muisc/Trance of OMI.mp3',
    art: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1600&q=80',
    duration: 240,
  },
  {
    id: 5,
    title: 'Boom Boom (Ringtone)',
    artist: 'Loop Lab',
    album: 'Hooks & Tones',
    src: '/Muisc/Boom Boom (Ringtone).mp3',
    art: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    duration: 35,
  },
  {
    id: 6,
    title: 'Boom Boom',
    artist: 'Loop Lab',
    album: 'Hooks & Tones',
    src: '/Muisc/Boom Boom.mp3',
    art: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80',
    duration: 210,
  },
  {
    id: 7,
    title: 'GlobeTrotter',
    artist: 'Atlas & Vega',
    album: 'Wanderlust Tape',
    src: '/Muisc/GlobeTrotter.mp3',
    art: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&w=1600&q=80',
    duration: 280,
  },
  {
    id: 8,
    title: 'Raga of Revenge',
    artist: 'Sangeet Code',
    album: 'East Meets Edge',
    src: '/Muisc/Raga of Revenge.mp3',
    art: 'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?auto=format&fit=crop&w=1600&q=80',
    duration: 175,
  },
];

export const fmt = (s) => {
  const v = Math.max(0, Number.isFinite(s) ? s : 0);
  return `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}`;
};

// ── Context ───────────────────────────────────────────────────────────────────

const MusicCtx = createContext(null);

export function MusicProvider({ children }) {
  const SONGS = withImages(DEFAULT_SONGS, useContent('images.music', null), 'art');
  // Exposed on the context so MusicWindow and WidgetsSection read the same
  // overlaid list the provider does, rather than the bare defaults.
  const [songIdx, setSongIdx]   = useState(0);
  const [playing, setPlaying]   = useState(false);
  const [progress, setProgress] = useState(0);   // 0 → 1
  const [shuffle, setShuffle]   = useState(false);
  const [repeat,  setRepeat]    = useState(false);
  const [volume,  setVolume]    = useState(0.72);
  const [duration, setDuration] = useState(SONGS[0].duration);

  const audioRef = useRef(null);

  // Refs that track the latest state for use inside long-lived event handlers
  const repeatRef  = useRef(repeat);
  const shuffleRef = useRef(shuffle);
  useEffect(() => { repeatRef.current  = repeat;  }, [repeat]);
  useEffect(() => { shuffleRef.current = shuffle; }, [shuffle]);

  // ── 1. Create a single shared Audio element on mount ──
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume;
    audioRef.current = audio;

    const onMeta = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onTime = () => {
      const d = audio.duration;
      if (Number.isFinite(d) && d > 0) {
        setProgress(audio.currentTime / d);
      }
    };
    const onEnded = () => {
      if (repeatRef.current) {
        try {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        } catch { /* noop */ }
        return;
      }
      setSongIdx(i =>
        shuffleRef.current
          ? Math.floor(Math.random() * SONGS.length)
          : (i + 1) % SONGS.length
      );
    };
    const onError = () => {
      // Could not load / decode this file — stop pretending to play
      setPlaying(false);
    };

    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('durationchange', onMeta);
    audio.addEventListener('timeupdate',     onTime);
    audio.addEventListener('ended',          onEnded);
    audio.addEventListener('error',          onError);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('durationchange', onMeta);
      audio.removeEventListener('timeupdate',     onTime);
      audio.removeEventListener('ended',          onEnded);
      audio.removeEventListener('error',          onError);
      audio.src = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Sync audio source with current song ──
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const song = SONGS[songIdx];
    if (!song) return;

    audio.src = encodeURI(song.src);
    audio.load();
    setProgress(0);
    setDuration(song.duration); // optimistic — replaced by onMeta

    if (playing) {
      audio.play().catch(() => setPlaying(false));
    }
    // We intentionally don't include `playing` in deps — switching tracks
    // should preserve the playing state without re-triggering on its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songIdx]);

  // ── 3. Sync play/pause ──
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => setPlaying(false));
      }
    } else {
      audio.pause();
    }
  }, [playing]);

  // ── 4. Sync volume ──
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = Math.max(0, Math.min(1, volume));
  }, [volume]);

  const song = SONGS[songIdx];

  const prev = () =>
    setSongIdx(i =>
      shuffle
        ? Math.floor(Math.random() * SONGS.length)
        : (i - 1 + SONGS.length) % SONGS.length
    );

  const next = () =>
    setSongIdx(i =>
      shuffle
        ? Math.floor(Math.random() * SONGS.length)
        : (i + 1) % SONGS.length
    );

  const seek = (ratio) => {
    const r = Math.max(0, Math.min(1, ratio));
    const audio = audioRef.current;
    const d = (audio && Number.isFinite(audio.duration) && audio.duration > 0)
      ? audio.duration
      : duration;
    if (audio && d > 0) {
      try { audio.currentTime = r * d; } catch { /* noop */ }
    }
    setProgress(r);
  };

  const playAt = (idx) => {
    trackEvent('musicPlayed');
    setSongIdx(idx);
    setPlaying(true);
  };

  return (
    <MusicCtx.Provider value={{
      SONGS,
      song,
      songIdx,
      setSongIdx,
      playing,
      setPlaying,
      progress,
      seek,
      shuffle,
      setShuffle,
      repeat,
      setRepeat,
      volume,
      setVolume,
      duration,
      prev,
      next,
      playAt,
    }}>
      {children}
    </MusicCtx.Provider>
  );
}

export const useMusicPlayer = () => useContext(MusicCtx);
