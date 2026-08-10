import { useRef, useEffect, useState } from 'react';
import { useContent, withImages } from './content/store';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, LayoutGroup, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { NotificationList } from './NotificationList';
import { LocationMap } from './components/ui/location-map';
import { fmt, useMusicPlayer } from './MusicContext';
import { playTick, playDetent, playGrip, playRelease, primeAudio } from './components/dj-tactile-audio';
import { PngSequenceOverlay } from './components/PngSequenceOverlay';
import './WidgetsSection.css';


// ── MUSIC PLAYER ─────────────────────────────────────────────────────────────

function MusicCard({ onActivate, djMode }) {
  const { song, playing, setPlaying, progress, seek, prev, next, duration } = useMusicPlayer();

  const trackDur  = duration && Number.isFinite(duration) && duration > 0 ? duration : song.duration;
  const elapsed   = Math.floor(progress * trackDur);
  const remaining = Math.max(0, trackDur - elapsed);

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek((e.clientX - rect.left) / rect.width);
  };

  const handleCardClick = (e) => {
    // Don't trigger DJ mode when interacting with controls or seek bar
    if (e.target.closest('button')) return;
    if (e.target.closest('.wg-music-track')) return;
    if (djMode) return;
    onActivate?.();
  };

  return (
    <div
      className={`wg-card wg-card--dark wg-music wg-music--clickable${playing ? ' wg-music--playing' : ''}${djMode ? ' wg-music--dj' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !djMode && onActivate?.()}
      aria-label="Music player — click to open DJ console"
    >
      {/* DJ-mode ambient glow ring */}
      <div className="wg-music-aura" aria-hidden="true" />

      {/* Subtle DJ console hint (visible on hover when not in DJ mode) */}
      <div className="wg-music-djhint" aria-hidden="true">
        <span className="wg-music-djhint-dot" />
        <span>Open DJ Console</span>
      </div>

      {/* Header */}
      <div className="wg-music-hdr">
        <span className="wg-music-eyebrow">Now Playing</span>
        <div className="wg-music-wavebars" aria-hidden="true">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="wg-wvbar" style={{ '--wi': i }} />
          ))}
        </div>
      </div>

      {/* Turntable */}
      <div className="wg-tt-stage">
        <div className="wg-tt">
          <div className="wg-tt-platter" aria-hidden="true" />

          <div className="wg-vinyl" aria-hidden="true">
            <div className="wg-vinyl-label">
              <img
                src={song.art}
                alt=""
                draggable="false"
                className="wg-vinyl-img"
              />
            </div>
            <div className="wg-vinyl-spindle" />
          </div>

          <div className="wg-vinyl-sheen" aria-hidden="true" />

          <div className="wg-arm-pivot" aria-hidden="true">
            <div className="wg-arm">
              <div className="wg-arm-base" />
              <div className="wg-arm-rod" />
              <div className="wg-arm-head" />
              <div className="wg-arm-needle" />
            </div>
          </div>
        </div>
      </div>

      {/* Song info + controls */}
      <div className="wg-music-info">
        <div className="wg-music-meta">
          <h3 className="wg-music-title">{song.title}</h3>
          <p className="wg-music-artist">{song.artist}</p>
        </div>

        {/* Live progress bar */}
        <div className="wg-music-progress">
          <div
            className="wg-music-track"
            onClick={handleSeek}
            role="slider"
            aria-label="Seek"
            aria-valuenow={Math.round(progress * 100)}
          >
            <div className="wg-music-fill" style={{ width: `${progress * 100}%` }} />
            <div className="wg-music-thumb" style={{ left: `${progress * 100}%` }} />
          </div>
          <div className="wg-music-times">
            <span>{fmt(elapsed)}</span>
            <span>−{fmt(remaining)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="wg-music-ctrls">
          <button className="wg-mc-btn" onClick={prev} aria-label="Previous">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
              <path d="M11.5 1.5v11L4 7l7.5-5.5zM2.5 1.5H1v11h1.5z" />
            </svg>
          </button>

          <button
            className="wg-mc-btn wg-mc-btn--play"
            onClick={() => setPlaying(p => !p)}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <rect x="2.5" y="1.5" width="4" height="13" rx="1.5" />
                <rect x="9.5" y="1.5" width="4" height="13" rx="1.5" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M3.5 2.5l10 5.5-10 5.5z" />
              </svg>
            )}
          </button>

          <button className="wg-mc-btn" onClick={next} aria-label="Next">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
              <path d="M2.5 1.5v11L10 7 2.5 1.5zM11.5 1.5H13v11h-1.5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TIC TAC TOE ───────────────────────────────────────────────────────────────

function tttWinner(b) {
  for (const [a, i, c] of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]])
    if (b[a] && b[a] === b[i] && b[a] === b[c]) return { who: b[a], line: [a,i,c] };
  return null;
}

// Minimax — AI plays 'O' (maximiser), player plays 'X' (minimiser).
// Depth penalty ensures the AI wins in the fewest moves possible.
function tttMinimax(b, depth, isMax) {
  const r = tttWinner(b);
  if (r) return r.who === 'O' ? 10 - depth : depth - 10;
  if (b.every(Boolean)) return 0;
  let best = isMax ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      b[i] = isMax ? 'O' : 'X';
      const val = tttMinimax(b, depth + 1, !isMax);
      b[i] = null;
      best = isMax ? Math.max(best, val) : Math.min(best, val);
    }
  }
  return best;
}

function tttBestMove(board) {
  let bestVal = -Infinity, move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const val = tttMinimax(board, 0, false);
      board[i] = null;
      if (val > bestVal) { bestVal = val; move = i; }
    }
  }
  return move;
}

function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerTurn, setPlayerTurn] = useState(true); // true = player (X), false = AI (O)
  const [thinking, setThinking] = useState(false);

  const result   = tttWinner(board);
  const draw     = !result && board.every(Boolean);
  const gameOver = !!(result || draw);

  // Player clicks a cell
  const click = (i) => {
    if (board[i] || !playerTurn || thinking || gameOver) return;
    const next = [...board];
    next[i] = 'X';
    setBoard(next);
    setPlayerTurn(false);
  };

  // AI responds after player's move
  useEffect(() => {
    if (playerTurn || gameOver) return;
    setThinking(true);
    const t = setTimeout(() => {
      setBoard(prev => {
        const r = tttWinner(prev);
        if (r || prev.every(Boolean)) return prev;
        const move = tttBestMove([...prev]);
        if (move === -1) return prev;
        const next = [...prev];
        next[move] = 'O';
        return next;
      });
      setThinking(false);
      setPlayerTurn(true);
    }, 480);
    return () => clearTimeout(t);
  }, [playerTurn, gameOver]);

  const reset = () => {
    setBoard(Array(9).fill(null));
    setPlayerTurn(true);
    setThinking(false);
  };

  let status;
  if (result)        status = result.who === 'X' ? 'You win! 🎉' : 'AI wins 🤖';
  else if (draw)     status = "It's a draw!";
  else if (thinking) status = 'AI thinking…';
  else               status = 'Your turn — play X';

  return (
    <div className="wg-ttt-wrap">
      <p className={`wg-ttt-status${thinking ? ' wg-ttt-status--ai' : ''}`}>{status}</p>
      <div className="wg-ttt-board">
        {board.map((cell, i) => (
          <button
            key={i}
            className={`wg-ttt-cell${result?.line.includes(i) ? ' wg-ttt-cell--win' : ''}${cell === 'X' ? ' wg-ttt-cell--x' : cell === 'O' ? ' wg-ttt-cell--o' : ''}`}
            onClick={() => click(i)}
            disabled={!!board[i] || !playerTurn || !!result || thinking}
            aria-label={`Cell ${i + 1}${cell ? `, ${cell}` : ''}`}
          >
            {cell === 'X' && (
              <svg viewBox="0 0 40 40" fill="none" width="36" height="36">
                <path d="M8 8L32 32M32 8L8 32" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round"/>
              </svg>
            )}
            {cell === 'O' && (
              <svg viewBox="0 0 40 40" fill="none" width="36" height="36">
                <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="4.5"/>
              </svg>
            )}
          </button>
        ))}
      </div>
      <button className="wg-game-action-btn" onClick={reset}>New Game</button>
    </div>
  );
}

// ── SNAKE GAME ────────────────────────────────────────────────────────────────

const SN_GRID = 20;
const SN_CELL = 20;

function snakeRandomFood(snake) {
  let pos;
  do {
    pos = { x: Math.floor(Math.random() * SN_GRID), y: Math.floor(Math.random() * SN_GRID) };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

function SnakeGame() {
  const canvasRef = useRef(null);
  const stateRef  = useRef(null);
  const [ui, setUi] = useState({ score: 0, phase: 'idle' }); // idle | running | over

  const initState = () => {
    const snake = [{ x: 10, y: 10 }];
    return { snake, dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: snakeRandomFood(snake), score: 0 };
  };

  const drawFrame = (s, ctx) => {
    const W = SN_GRID * SN_CELL, H = SN_GRID * SN_CELL;
    ctx.fillStyle = '#0f1117'; ctx.fillRect(0, 0, W, H);

    // subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 0.5;
    for (let i = 0; i <= SN_GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * SN_CELL, 0);    ctx.lineTo(i * SN_CELL, H);    ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * SN_CELL);    ctx.lineTo(W, i * SN_CELL);    ctx.stroke();
    }

    // food (glowing red circle)
    const fx = s.food.x * SN_CELL + SN_CELL / 2, fy = s.food.y * SN_CELL + SN_CELL / 2;
    ctx.save();
    ctx.shadowColor = '#ff453a'; ctx.shadowBlur = 10;
    ctx.fillStyle = '#ff453a';
    ctx.beginPath(); ctx.arc(fx, fy, SN_CELL / 2 - 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // snake segments
    s.snake.forEach((seg, i) => {
      const ratio = 1 - i / (s.snake.length + 1);
      ctx.fillStyle = `rgba(48,209,88,${0.45 + 0.55 * ratio})`;
      ctx.fillRect(seg.x * SN_CELL + 1, seg.y * SN_CELL + 1, SN_CELL - 2, SN_CELL - 2);
    });
  };

  const startGame = () => {
    stateRef.current = initState();
    setUi({ score: 0, phase: 'running' });
  };

  useEffect(() => {
    if (ui.phase !== 'running') return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawFrame(stateRef.current, ctx);

    const tick = () => {
      const s = stateRef.current; if (!s) return;
      s.dir = s.next;
      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
      if (head.x < 0 || head.x >= SN_GRID || head.y < 0 || head.y >= SN_GRID ||
          s.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        setUi(u => ({ ...u, phase: 'over' }));
        return;
      }
      s.snake.unshift(head);
      if (head.x === s.food.x && head.y === s.food.y) {
        s.score++; s.food = snakeRandomFood(s.snake);
        setUi(u => ({ ...u, score: s.score }));
      } else { s.snake.pop(); }
      drawFrame(s, ctx);
    };

    const interval = setInterval(tick, 130);
    const onKey = (e) => {
      const s = stateRef.current; if (!s) return;
      const map = {
        ArrowUp:    s.dir.y !== 1  ? { x: 0, y: -1 } : null,
        ArrowDown:  s.dir.y !== -1 ? { x: 0, y:  1 } : null,
        ArrowLeft:  s.dir.x !== 1  ? { x: -1, y: 0 } : null,
        ArrowRight: s.dir.x !== -1 ? { x:  1, y: 0 } : null,
      };
      const nd = map[e.key];
      if (nd) { s.next = nd; e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { clearInterval(interval); window.removeEventListener('keydown', onKey); };
  }, [ui.phase]);

  const W = SN_GRID * SN_CELL;

  return (
    <div className="wg-game-wrap">
      <div className="wg-game-hdr">
        <span className="wg-game-score-lbl">Score: <strong>{ui.score}</strong></span>
        <button className="wg-game-action-btn" onClick={startGame}>
          {ui.phase === 'idle' ? 'Start' : 'Restart'}
        </button>
      </div>

      <div className="wg-snake-stage">
        <canvas ref={canvasRef} width={W} height={W} className="wg-snake-canvas" />

        {ui.phase === 'idle' && (
          <div className="wg-game-overlay">
            <p className="wg-gol-title">🐍 Snake</p>
            <button className="wg-gol-btn" onClick={startGame}>Start Game</button>
            <p className="wg-gol-hint">Arrow keys to move</p>
          </div>
        )}
        {ui.phase === 'over' && (
          <div className="wg-game-overlay">
            <p className="wg-gol-title">Game Over</p>
            <p className="wg-gol-score">Score: {ui.score}</p>
            <button className="wg-gol-btn" onClick={startGame}>Play Again</button>
          </div>
        )}
      </div>
      {ui.phase === 'running' && <p className="wg-game-kbd-hint">Arrow keys · Avoid walls &amp; yourself</p>}
    </div>
  );
}

// ── FINDER POPUP DATA ────────────────────────────────────────────────────────

const FINDER_FOLDERS = [
  { name: '_Projects',     type: 'folder', color: '#57B5F9' },
  { name: 'CodeResources', type: 'file',   label: 'JS'    },
  { name: 'Info.plist',    type: 'file',   label: 'PLIST' },
  { name: 'Designs',       type: 'folder', color: '#57B5F9' },
  { name: 'Archive',       type: 'folder', color: '#7BC4F9' },
];

const FINDER_APPS = [
  {
    id: 'about', name: 'About Me', action: 'about',
    bg: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
    icon: <svg viewBox="0 0 28 28" fill="none"><circle cx="14" cy="9" r="5" fill="white"/><path d="M4 26c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg>,
  },
  {
    id: 'skills', name: 'Skills', action: 'skills',
    bg: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
    icon: <svg viewBox="0 0 28 28" fill="none"><path d="M14 3L17.5 11H26L19.5 16L22 24L14 19L6 24L8.5 16L2 11H10.5Z" fill="white"/></svg>,
  },
  {
    id: 'gallery', name: 'Gallery', action: 'gallery',
    bg: 'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)',
    icon: <svg viewBox="0 0 28 28" fill="none"><rect x="2" y="2" width="11" height="11" rx="2" fill="white" opacity="0.9"/><rect x="15" y="2" width="11" height="11" rx="2" fill="white"/><rect x="2" y="15" width="11" height="11" rx="2" fill="white"/><rect x="15" y="15" width="11" height="11" rx="2" fill="white" opacity="0.7"/></svg>,
  },
  {
    id: 'cinema', name: 'Cinema', action: 'cinema',
    bg: 'linear-gradient(135deg,#f5576c 0%,#f093fb 100%)',
    icon: <svg viewBox="0 0 28 28" fill="none"><rect x="2" y="6" width="19" height="16" rx="2" fill="white" opacity="0.9"/><path d="M21 11L26 8V20L21 17" fill="white"/><line x1="7" y1="6" x2="7" y2="22" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5"/><line x1="13" y1="6" x2="13" y2="22" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5"/></svg>,
  },
  {
    id: 'music', name: 'Music', action: 'music',
    bg: 'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)',
    icon: <svg viewBox="0 0 28 28" fill="none"><path d="M10 20V6L24 4V18" stroke="white" strokeWidth="2" strokeLinecap="round"/><circle cx="8" cy="20" r="3.5" fill="white"/><circle cx="22" cy="18" r="3.5" fill="white"/></svg>,
  },
  {
    id: 'team', name: 'Team', action: 'team',
    bg: 'linear-gradient(135deg,#f6d365 0%,#fda085 100%)',
    icon: <svg viewBox="0 0 28 28" fill="none"><circle cx="10" cy="10" r="4" fill="white"/><circle cx="20" cy="10" r="4" fill="white" opacity="0.8"/><path d="M2 26c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M18 22c2 0 8 1 8 4" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>,
  },
  {
    id: 'map', name: 'Location', action: 'map',
    bg: 'linear-gradient(135deg,#56ccf2 0%,#2f80ed 100%)',
    icon: <svg viewBox="0 0 28 28" fill="none"><path d="M14 3C10.1 3 7 6.1 7 10c0 6 7 15 7 15s7-9 7-15c0-3.9-3.1-7-7-7z" fill="white"/><circle cx="14" cy="10" r="3" fill="rgba(46,128,237,0.65)"/></svg>,
  },
  {
    id: 'contact', name: 'Contact', action: 'contact',
    bg: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
    icon: <svg viewBox="0 0 28 28" fill="none"><rect x="2" y="6" width="24" height="16" rx="2" fill="white" opacity="0.9"/><path d="M2 8L14 16L26 8" stroke="rgba(79,172,254,0.75)" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
];

const FINDER_GAMES = [
  { id: 'game-tictactoe', name: 'Tic Tac Toe', playable: true,
    bg: 'linear-gradient(135deg,#007aff 0%,#30b0c7 100%)',
    icon: <svg viewBox="0 0 28 28" fill="none"><line x1="10" y1="3" x2="10" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="18" y1="3" x2="18" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="10" x2="25" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="25" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M4.5 4.5L8.5 8.5M8.5 4.5L4.5 8.5" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round"/><circle cx="22" cy="22" r="3" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8"/></svg> },
  { id: 'game-snake', name: 'Snake', playable: true,
    bg: 'linear-gradient(135deg,#30d158 0%,#34c759 100%)',
    icon: <svg viewBox="0 0 28 28" fill="none"><path d="M5 22v-5h5v-5h8v5h5v5H5z" fill="white"/><circle cx="21" cy="7" r="3.5" fill="white"/><circle cx="23" cy="6" r="1" fill="rgba(48,209,88,0.8)"/></svg> },
  { id: null, name: 'Chess',  playable: false, bg: 'linear-gradient(135deg,#434343 0%,#000 100%)',
    icon: <svg viewBox="0 0 28 28" fill="white"><circle cx="14" cy="7" r="4"/><rect x="10" y="11" width="8" height="6" rx="1"/><rect x="7" y="17" width="14" height="4" rx="1"/></svg> },
  { id: null, name: 'Puzzle', playable: false, bg: 'linear-gradient(135deg,#f6d365 0%,#fda085 100%)',
    icon: <svg viewBox="0 0 28 28" fill="white"><path d="M4 4h8v2.5a2.5 2.5 0 0 0 5 0V4h7v8h-2.5a2.5 2.5 0 0 0 0 5H24v7h-7v-2.5a2.5 2.5 0 0 1-5 0V24H4v-7h2.5a2.5 2.5 0 0 0 0-5H4V4z"/></svg> },
  { id: null, name: 'Sudoku', playable: false, bg: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
    icon: <svg viewBox="0 0 28 28" fill="none"><rect x="3" y="3" width="6" height="6" rx="1" fill="white" opacity="0.9"/><rect x="11" y="3" width="6" height="6" rx="1" fill="white" opacity="0.5"/><rect x="19" y="3" width="6" height="6" rx="1" fill="white" opacity="0.9"/><rect x="3" y="11" width="6" height="6" rx="1" fill="white" opacity="0.5"/><rect x="11" y="11" width="6" height="6" rx="1" fill="white"/><rect x="19" y="11" width="6" height="6" rx="1" fill="white" opacity="0.5"/><rect x="3" y="19" width="6" height="6" rx="1" fill="white" opacity="0.9"/><rect x="11" y="19" width="6" height="6" rx="1" fill="white" opacity="0.5"/><rect x="19" y="19" width="6" height="6" rx="1" fill="white" opacity="0.9"/></svg> },
  { id: null, name: 'Tetris', playable: false, bg: 'linear-gradient(135deg,#fa709a 0%,#fee140 100%)',
    icon: <svg viewBox="0 0 28 28" fill="white"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="11" y="3" width="8" height="8" rx="1" opacity="0.6"/><rect x="3" y="11" width="8" height="8" rx="1" opacity="0.6"/><rect x="11" y="17" width="8" height="8" rx="1"/></svg> },
];

const DEFAULT_WIDGET_PLATES = [
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80',
];

const DEFAULT_FINDER_WORKS = [
  { name: 'Editorial Shoot',  img: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Portrait Series',  img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Visual FX',        img: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Motion Study',     img: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Color Grade',      img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Campaign',         img: 'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?auto=format&fit=crop&w=1600&q=80' },
];

const FOLDER_CONTENTS = {
  '_Projects': [
    { name: 'portfolio-v3', type: 'folder', color: '#57B5F9' },
    { name: 'motion-fx',    type: 'folder', color: '#57B5F9' },
    { name: 'brand-kit',    type: 'folder', color: '#7BC4F9' },
    { name: 'index.jsx',    type: 'file',   label: 'JSX'  },
    { name: 'App.css',      type: 'file',   label: 'CSS'  },
    { name: 'README.md',    type: 'file',   label: 'MD'   },
  ],
  'Designs': [
    { name: 'brand-identity', type: 'folder', color: '#57B5F9' },
    { name: 'mockups',        type: 'folder', color: '#57B5F9' },
    { name: 'logo.svg',       type: 'file',   label: 'SVG'  },
    { name: 'colors.json',    type: 'file',   label: 'JSON' },
    { name: 'typography.pdf', type: 'file',   label: 'PDF'  },
  ],
  'Archive': [
    { name: 'v1.0',       type: 'folder', color: '#7BC4F9' },
    { name: 'v2.0',       type: 'folder', color: '#7BC4F9' },
    { name: 'notes.txt',  type: 'file',   label: 'TXT' },
    { name: 'backup.zip', type: 'file',   label: 'ZIP' },
  ],
  'portfolio-v3': [
    { name: 'src',            type: 'folder', color: '#57B5F9' },
    { name: 'public',         type: 'folder', color: '#57B5F9' },
    { name: 'package.json',   type: 'file',   label: 'JSON' },
    { name: 'vite.config.js', type: 'file',   label: 'JS'   },
  ],
  'motion-fx': [
    { name: 'animations', type: 'folder', color: '#57B5F9' },
    { name: 'renders',    type: 'folder', color: '#7BC4F9' },
    { name: 'main.py',    type: 'file',   label: 'PY' },
  ],
  'brand-kit': [
    { name: 'logos',       type: 'folder', color: '#57B5F9' },
    { name: 'fonts',       type: 'folder', color: '#7BC4F9' },
    { name: 'colors.json', type: 'file',   label: 'JSON' },
  ],
  'brand-identity': [
    { name: 'primary-logo.ai',  type: 'file', label: 'AI'  },
    { name: 'color-palette.pdf',type: 'file', label: 'PDF' },
    { name: 'brand-guide.pdf',  type: 'file', label: 'PDF' },
  ],
  'mockups': [
    { name: 'web.psd',    type: 'file', label: 'PSD' },
    { name: 'mobile.psd', type: 'file', label: 'PSD' },
    { name: 'print.pdf',  type: 'file', label: 'PDF' },
  ],
};

// ── FINDER HELPERS ────────────────────────────────────────────────────────────

function MacFolderIcon({ color = '#57B5F9' }) {
  return (
    <svg viewBox="0 0 80 66" fill="none" className="wg-fn-folder-svg">
      <path d="M3 15C3 12.2 5.2 10 8 10H30L36 16H73C75.8 16 78 18.2 78 21V61C78 63.8 75.8 66 73 66H8C5.2 66 3 63.8 3 61V15Z" fill={color}/>
      <path d="M3 21H78V25C78 25 40 30 3 25V21Z" fill="rgba(255,255,255,0.22)"/>
      <path d="M3 15C3 12.2 5.2 10 8 10H30L36 16H8C5.5 16 3.8 15.6 3 15Z" fill="rgba(255,255,255,0.08)"/>
    </svg>
  );
}

function MacFileIcon({ label = 'FILE' }) {
  return (
    <svg viewBox="0 0 64 80" fill="none" className="wg-fn-folder-svg" style={{ width: 48 }}>
      <path d="M4 5C4 3.3 5.3 2 7 2H41L62 23V75C62 76.7 60.7 78 59 78H7C5.3 78 4 76.7 4 75V5Z" fill="white" stroke="#d0d0d5" strokeWidth="1.5"/>
      <path d="M41 2L62 23H44C42.3 23 41 21.7 41 20V2Z" fill="#e8e8ed" stroke="#d0d0d5" strokeWidth="1.5"/>
      <text x="33" y="54" textAnchor="middle" fontSize="10" fontWeight="700" fill="#8e8e93" fontFamily="system-ui,-apple-system,sans-serif">{label}</text>
    </svg>
  );
}

function SidebarIcon({ id }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      {id === 'folders'      && <path d="M2 7C2 5.9 2.9 5 4 5H10L12 7H20C21.1 7 22 7.9 22 9V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V7Z" fill="#57B5F9"/>}
      {id === 'applications' && <><rect x="2" y="2" width="8.5" height="8.5" rx="2" fill="#007aff"/><rect x="13.5" y="2" width="8.5" height="8.5" rx="2" fill="#ff5f57"/><rect x="2" y="13.5" width="8.5" height="8.5" rx="2" fill="#28c840"/><rect x="13.5" y="13.5" width="8.5" height="8.5" rx="2" fill="#ffbd2e"/></>}
      {id === 'games'        && <><rect x="3" y="9" width="18" height="12" rx="3" stroke="#af52de" strokeWidth="1.8"/><line x1="12" y1="9" x2="12" y2="5" stroke="#af52de" strokeWidth="1.8"/><circle cx="9" cy="15" r="1.5" fill="#af52de"/><circle cx="15" cy="15" r="1.5" fill="#af52de"/></>}
      {id === 'works'        && <path d="M12 2L15 9.5H23L16.5 14L19 21L12 16.5L5 21L7.5 14L1 9.5H9Z" fill="#ff9500"/>}
      {id === 'downloads'    && <><path d="M12 4V16M7 11L12 16L17 11" stroke="#007aff" strokeWidth="1.8" strokeLinecap="round"/><path d="M3 20H21" stroke="#007aff" strokeWidth="1.8" strokeLinecap="round"/></>}
      {id === 'documents'    && <><path d="M4 4C4 2.9 4.9 2 6 2H14L20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4Z" fill="white" stroke="#c0c0c5" strokeWidth="1.5"/><path d="M14 2L20 8H15C14.4 8 14 7.6 14 7V2Z" fill="#e4e4e9" stroke="#c0c0c5" strokeWidth="1.5"/></>}
      {!['folders','applications','games','works','downloads','documents'].includes(id) && <circle cx="12" cy="12" r="6" fill="#ccc"/>}
    </svg>
  );
}

// ── FINDER POPUP ──────────────────────────────────────────────────────────────

const TAB_TITLES = {
  folders: 'Contents', applications: 'Applications',
  games: 'Games', works: 'Works', downloads: 'Downloads', documents: 'Documents',
  'game-tictactoe': 'Tic Tac Toe', 'game-snake': 'Snake',
};

const SIDEBAR_GROUPS = [
  { hd: 'Favourites', items: [
    { id: 'folders',      label: 'Folders'      },
    { id: 'applications', label: 'Applications' },
    { id: 'games',        label: 'Games'        },
    { id: 'works',        label: 'Works'        },
  ]},
  { hd: 'iCloud', items: [
    { id: 'downloads', label: 'Downloads' },
    { id: 'documents', label: 'Documents' },
  ]},
];

function FinderWindow({
  initialView = 'applications',
  initialFolder = null,
  cascadeIndex = 0,
  visible,
  onClose,
  onOpen,
  onBringToFront,
  onAboutClick,
  onSkillsClick,
}) {
  const FINDER_WORKS = withImages(DEFAULT_FINDER_WORKS, useContent('images.finderWorks', null), 'img');
  // Per-window navigation history
  const [nav, setNav] = useState({
    hist: [{ view: initialView, folder: initialFolder }],
    hIdx: 0,
  });
  const AT = nav.hist[nav.hIdx];

  const navTo = (view, folder = null) => setNav(n => {
    const newHist = n.hist.slice(0, n.hIdx + 1).concat({ view, folder });
    return { hist: newHist, hIdx: newHist.length - 1 };
  });
  const goBack = () => setNav(n => n.hIdx <= 0 ? n : { ...n, hIdx: n.hIdx - 1 });
  const goFwd  = () => setNav(n => n.hIdx >= n.hist.length - 1 ? n : { ...n, hIdx: n.hIdx + 1 });

  // Per-window drag state (initial position cascaded)
  const [pos, setPos] = useState({ x: cascadeIndex * 26, y: cascadeIndex * 26 });
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

  const handleAction = (action) => {
    if (action === 'music') {
      window.dispatchEvent(new CustomEvent('macdock:open', { detail: { app: 'music' } }));
      return;
    }
    onClose();
    setTimeout(() => {
      if (action === 'about')  { onAboutClick?.(); return; }
      if (action === 'skills') { onSkillsClick?.(); return; }
      const map = { gallery: '.gs-section', cinema: '.vs-section', team: '.ts-section', map: '.wg-section', contact: 'footer' };
      document.querySelector(map[action] || '')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 260);
  };

  const folderItems = AT.folder ? (FOLDER_CONTENTS[AT.folder] || []) : FINDER_FOLDERS;

  const renderContent = () => {
    if (AT.view === 'folders') return (
      <div className="wg-fn-icon-grid">
        {folderItems.map(f => (
          <div
            key={f.name}
            className={`wg-fn-icon-item${f.type === 'folder' ? ' wg-fn-icon-item--folder' : ''}`}
            onClick={() => f.type === 'folder' && onOpen('folders', f.name)}
            role={f.type === 'folder' ? 'button' : undefined}
            tabIndex={f.type === 'folder' ? 0 : undefined}
            onKeyDown={e => f.type === 'folder' && e.key === 'Enter' && onOpen('folders', f.name)}
          >
            {f.type === 'folder' ? <MacFolderIcon color={f.color} /> : <MacFileIcon label={f.label} />}
            <span className="wg-fn-icon-label">{f.name}</span>
          </div>
        ))}
      </div>
    );

    if (AT.view === 'applications') return (
      <div className="wg-fn-app-grid">
        {FINDER_APPS.map(app => (
          <button key={app.id} className="wg-fn-app-item" onClick={() => handleAction(app.action)} aria-label={`Open ${app.name}`}>
            <div className="wg-fn-app-icon" style={{ background: app.bg }}>{app.icon}</div>
            <span className="wg-fn-icon-label">{app.name}</span>
          </button>
        ))}
      </div>
    );

    if (AT.view === 'games') return (
      <div className="wg-fn-app-grid">
        {FINDER_GAMES.map(g => (
          <div
            key={g.name}
            className={`wg-fn-app-item${g.playable ? ' wg-fn-app-item--playable' : ' wg-fn-app-item--locked'}`}
            onClick={() => g.playable && onOpen(g.id)}
            role={g.playable ? 'button' : undefined}
            tabIndex={g.playable ? 0 : undefined}
            onKeyDown={e => g.playable && e.key === 'Enter' && onOpen(g.id)}
            title={g.playable ? `Play ${g.name}` : `${g.name} — coming soon`}
          >
            <div className="wg-fn-app-icon" style={{ background: g.bg, opacity: g.playable ? 1 : 0.45 }}>{g.icon}</div>
            <span className="wg-fn-icon-label">{g.name}</span>
            {!g.playable && <span className="wg-fn-game-soon">Soon</span>}
          </div>
        ))}
      </div>
    );

    if (AT.view === 'works') return (
      <div className="wg-fn-works-grid">
        {FINDER_WORKS.map(w => (
          <div key={w.name} className="wg-fn-work-item">
            <div className="wg-fn-work-thumb"><img src={w.img} alt={w.name} draggable="false" /></div>
            <span className="wg-fn-icon-label">{w.name}</span>
          </div>
        ))}
      </div>
    );

    if (AT.view === 'game-tictactoe') return <TicTacToe />;
    if (AT.view === 'game-snake')     return <SnakeGame />;

    return (
      <div className="wg-fn-empty">
        <svg width="52" height="52" viewBox="0 0 48 48" fill="none"><rect x="4" y="10" width="40" height="30" rx="4" stroke="#ccc" strokeWidth="2"/><path d="M14 10V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3" stroke="#ccc" strokeWidth="2"/></svg>
        <p>No items</p>
      </div>
    );
  };

  const titleBarLabel = AT.folder || TAB_TITLES[AT.view] || AT.view;

  return createPortal(
    <div
      className={`wg-finder${!visible ? ' wg-finder--hidden' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio Finder"
      style={{
        transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
        zIndex: 9999 + cascadeIndex,
      }}
      onPointerDown={onBringToFront}
    >
      <div className="wg-fn-titlebar" onMouseDown={onTitleDown} style={{ cursor: dragging ? 'grabbing' : 'grab' }}>
        <div className="wg-fn-lights">
          <button className="wg-fn-light wg-fn-red"    onClick={onClose} aria-label="Close" />
          <button className="wg-fn-light wg-fn-yellow" aria-label="Minimize" />
          <button className="wg-fn-light wg-fn-green"  aria-label="Fullscreen" />
        </div>
        <div className="wg-fn-nav-row">
          <button className="wg-fn-nav-btn" onClick={goBack} disabled={nav.hIdx <= 0} aria-label="Back">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
          <button className="wg-fn-nav-btn" onClick={goFwd} disabled={nav.hIdx >= nav.hist.length - 1} aria-label="Forward">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>
        <h2 className="wg-fn-title">{titleBarLabel}</h2>
        <div className="wg-fn-toolbar-right">
          <button className="wg-fn-toolbar-btn" aria-label="Icon view">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.2"/><rect x="9" y="1" width="6" height="6" rx="1.2"/><rect x="1" y="9" width="6" height="6" rx="1.2"/><rect x="9" y="9" width="6" height="6" rx="1.2"/></svg>
          </button>
          <button className="wg-fn-toolbar-btn" aria-label="Search">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M11 11l3 3" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>

      <div className="wg-fn-body">
        <aside className="wg-fn-sidebar">
          {SIDEBAR_GROUPS.map(group => (
            <div key={group.hd}>
              <p className="wg-fn-sidebar-hd">{group.hd}</p>
              {group.items.map(item => (
                <button
                  key={item.id}
                  className={`wg-fn-sidebar-btn${AT.view === item.id && !AT.folder ? ' wg-fn-sidebar-btn--active' : ''}`}
                  onClick={() => navTo(item.id)}
                >
                  <SidebarIcon id={item.id} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
          <p className="wg-fn-sidebar-hd">Tags</p>
          <div className="wg-fn-tags">
            {['#ff5f57','#ffbd2e','#28c840','#007aff','#af52de'].map(c => (
              <span key={c} className="wg-fn-tag-dot" style={{ background: c }} />
            ))}
          </div>
        </aside>
        <main className="wg-fn-content" role="main">
          {renderContent()}
        </main>
      </div>
    </div>,
    document.body
  );
}

// ── FOLDER CARD ──────────────────────────────────────────────────────────────

function FolderCard({ onAboutClick, onSkillsClick }) {
  const plates = useContent('images.widgetPlates', DEFAULT_WIDGET_PLATES);
  const [windows, setWindows] = useState([]);
  const [visible, setVisible] = useState(false);
  const winCounter = useRef(1);

  const openWindow = (view, folder = null) => {
    const id = winCounter.current++;
    setWindows(ws => [...ws, { id, view, folder }]);
    setVisible(true);
  };

  // Notify dock of running state whenever windows change
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('macdock:running', {
      detail: { app: 'finder', running: windows.length > 0 },
    }));
  }, [windows.length]);

  // Respond to dock clicks that target the Finder
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.app !== 'finder') return;
      openWindow(e.detail.view || 'applications', e.detail.folder || null);
    };
    window.addEventListener('macdock:open', handler);
    return () => window.removeEventListener('macdock:open', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeWindow = (id) => {
    setWindows(ws => {
      const rem = ws.filter(w => w.id !== id);
      if (rem.length === 0) setVisible(false);
      return rem;
    });
  };

  // Move clicked window to end of array so it gets the highest z-index
  const bringToFront = (id) => {
    setWindows(ws => {
      const idx = ws.findIndex(w => w.id === id);
      if (idx === -1 || idx === ws.length - 1) return ws;
      const arr = [...ws];
      arr.push(arr.splice(idx, 1)[0]);
      return arr;
    });
  };

  const handleFolderClick = () => {
    if (windows.length === 0) {
      openWindow('applications');
    } else {
      setVisible(true);
    }
  };

  return (
    <>
      <div
        className="wg-folder-wrap"
        aria-label="Visual works — click to open finder"
        role="button"
        tabIndex={0}
        onClick={handleFolderClick}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleFolderClick()}
      >
        <div className="wg-folder-scene">

          {/* Photos fanned behind the folder */}
          <div className="wg-ph wg-ph-1">
            <img src={plates[0]} alt="" draggable="false" />
          </div>
          <div className="wg-ph wg-ph-2">
            <img src={plates[1]} alt="" draggable="false" />
          </div>
          <div className="wg-ph wg-ph-3">
            <img src={plates[2]} alt="" draggable="false" />
          </div>

          {/* Folder front */}
          <div className="wg-fld-body">
            <div className="wg-fld-tab" aria-hidden="true" />

            <div className="wg-sticker wg-stk-cam" aria-hidden="true">
              <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
                <rect x="1" y="1" width="44" height="44" rx="10" fill="white" />
                <rect x="9" y="17" width="28" height="19" rx="4" fill="#1a1a1a" />
                <path d="M18 13h10l2.5 4H15.5z" fill="#1a1a1a" />
                <circle cx="23" cy="26" r="5.8" fill="#2c2c2c" />
                <circle cx="23" cy="26" r="3.4" fill="#484848" />
                <circle cx="23" cy="26" r="1.5" fill="#666" />
                <circle cx="31.5" cy="20" r="2" fill="rgba(255,255,255,0.5)" />
              </svg>
            </div>

            <div className="wg-sticker wg-stk-spark" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="19" fill="white" />
                <path d="M20 5 L22.6 17 L34 20 L22.6 23 L20 35 L17.4 23 L6 20 L17.4 17 Z" fill="#1a1a1a" />
              </svg>
            </div>

            <div className="wg-fld-lines" aria-hidden="true">
              <div className="wg-fld-line" />
              <div className="wg-fld-line" />
            </div>
          </div>
        </div>

        <div className="wg-folder-info">
          <p className="wg-fld-name">Visual Works</p>
          <span className="wg-fld-count">
            {windows.length > 0 && !visible
              ? `${windows.length} window${windows.length > 1 ? 's' : ''} minimized`
              : '31 pieces'}
          </span>
        </div>
      </div>

      {/* Single shared backdrop — click to minimize all windows */}
      {windows.length > 0 && visible && createPortal(
        <div className="wg-finder-bd" onClick={() => setVisible(false)} aria-hidden="true" />,
        document.body
      )}

      {/* One independent window per open entry */}
      {windows.map((w, i) => (
        <FinderWindow
          key={w.id}
          initialView={w.view}
          initialFolder={w.folder}
          cascadeIndex={i}
          visible={visible}
          onClose={() => closeWindow(w.id)}
          onOpen={openWindow}
          onBringToFront={() => bringToFront(w.id)}
          onAboutClick={onAboutClick}
          onSkillsClick={onSkillsClick}
        />
      ))}
    </>
  );
}

// ── PLANE PNG SEQUENCE OVERLAY ───────────────────────────────────────────

const PLANE_FRAME_COUNT = 61;

function planeFrameUrl(frame) {
  const idx = String(frame).padStart(5, '0');
  return encodeURI(`/Plane/Plane _${idx}.png`);
}

function PlaneSequenceOverlay({ playing, onDone }) {
  return (
    <PngSequenceOverlay
      playing={playing}
      frameCount={PLANE_FRAME_COUNT}
      urlBuilder={planeFrameUrl}
      fps={30}
      onDone={onDone}
    />
  );
}

// ── GLOBAL NF FLIP WRAPPER ───────────────────────────────────────────────────

function FlipWidget({ back, children }) {
  return (
    <div className="wg-flip">
      <div className="wg-flip-inner">
        <div className="wg-flip-front">{children}</div>
        <div className="wg-flip-back">{back}</div>
      </div>
    </div>
  );
}

function NfPosterBack({ img, title, sub }) {
  return (
    <div className="wg-nfback">
      <img src={img} alt="" draggable="false" />
      <div className="wg-nfback-overlay" />
      <div className="wg-nfback-content">
        <img className="wg-nfback-n" src="/nLogo.svg" alt="" draggable="false" />
        <p className="wg-nfback-title">{title}</p>
        <p className="wg-nfback-sub">{sub}</p>
      </div>
    </div>
  );
}

// ── MAP AREA (LocationMap + CCTV + Netflix with layout animations) ──────────────

function MapAreaWidgets() {
  const plates = useContent('images.widgetPlates', DEFAULT_WIDGET_PLATES);
  const [expanded, setExpanded] = useState(false);
  const [playingPlane, setPlayingPlane] = useState(false);

  const handleExpandChange = (next) => {
    // Only fire the plane animation when expanding (collapsed → expanded)
    if (next === true && !expanded) setPlayingPlane(true);
    setExpanded(next);
  };

  return (
    <>
      <PlaneSequenceOverlay playing={playingPlane} onDone={() => setPlayingPlane(false)} />
      <LayoutGroup id="map-trio">
        <FlipWidget back={<NfPosterBack img={plates[3]} title="KOLKATA" sub="22.57°N · 88.36°E" />}>
          <LocationMap
            location="Kolkata, West Bengal"
            coordinates="22.5726° N, 88.3639° E"
            isExpanded={expanded}
            onExpandChange={handleExpandChange}
          />
        </FlipWidget>

        <AnimatePresence initial={false}>
          {!expanded && (
            <motion.div
              key="side-widgets"
              className="lm-side-widgets"
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            >
              <FlipWidget back={<NfPosterBack img={plates[4]} title="LIVE FEED" sub="CAM-04 · Main Studio" />}>
                <CCTVCard />
              </FlipWidget>
              <NetflixCard />
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </>
  );
}

// ── CCTV ─────────────────────────────────────────────────────────────────────

function CCTVCard() {
  const [t, setT] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(t.getHours()).padStart(2, '0');
  const mm = String(t.getMinutes()).padStart(2, '0');
  const ss = String(t.getSeconds()).padStart(2, '0');

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('macdock:open', { detail: { app: 'room' } }));
  };

  return (
    <div
      className="cctv-card"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      aria-label="CCTV live feed — open room view"
    >
      <video className="cctv-video" src="/CCtv/room1.mp4" autoPlay muted loop playsInline />
      <div className="cctv-scanlines" aria-hidden="true" />
      <div className="cctv-vignette" aria-hidden="true" />

      <div className="cctv-hud" aria-hidden="true">
        <div className="cctv-top">
          <div>
            <div className="cctv-cam-id">CAM-04 · INDOOR</div>
            <div className="cctv-cam-loc">Main Studio</div>
          </div>
          <div className="cctv-time">{hh}:{mm}:{ss}</div>
        </div>
        <div className="cctv-bottom">
          <div className="cctv-rec-dot" />
          <span className="cctv-rec-label">REC · LIVE</span>
          <span className="cctv-ch">CH-04</span>
        </div>
      </div>
    </div>
  );
}

// ── NETFLIX ───────────────────────────────────────────────────────────────────

// Four images that fill the N-shape quadrants
const DEFAULT_NF_HERO = {
  img:   'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=80',
  title: 'INTERSTELLAR',
  genre: 'Sci-Fi · 4K',
};

// 4 flip-cards: front image → back image + label
const DEFAULT_NF_GRID = [
  { front: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1600&q=80',              back: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',              title: 'DARK',      sub: 'Mystery' },
  { front: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=80',              back: 'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?auto=format&fit=crop&w=1600&q=80',              title: 'INCEPTION', sub: 'Thriller' },
  { front: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1600&q=80',            back: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=1600&q=80',            title: 'SIGNAL',    sub: 'Drama' },
  { front: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80',    back: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80', title: 'MOTION',    sub: 'Series' },
];

function NetflixCard() {
  const nfHeroUrl  = useContent('images.netflixHero', null);
  const NF_HERO    = nfHeroUrl?.[0] ? { ...DEFAULT_NF_HERO, img: nfHeroUrl[0] } : DEFAULT_NF_HERO;
  const nfGridUrls = useContent('images.netflixGrid', null);
  // Stored flat as front, back, front, back … in source order.
  const NF_GRID    = Array.isArray(nfGridUrls)
    ? DEFAULT_NF_GRID.map((c, i) => ({
        ...c,
        front: nfGridUrls[i * 2]     || c.front,
        back:  nfGridUrls[i * 2 + 1] || c.back,
      }))
    : DEFAULT_NF_GRID;
  useEffect(() => {
    return () => document.documentElement.classList.remove('nf-hover');
  }, []);

  return (
    <div
      className="nf-card"
      onMouseEnter={() => document.documentElement.classList.add('nf-hover')}
      onMouseLeave={() => document.documentElement.classList.remove('nf-hover')}
    >

      {/* ── Hero banner — fixed top, does NOT flip ── */}
      <div className="nf-hero">
        <img className="nf-hero-img" src={NF_HERO.img} alt={NF_HERO.title} draggable="false" />
        <div className="nf-hero-grad" />
        <div className="nf-hero-top">
          <img className="nf-mini-n" src="/nLogo.svg" alt="Netflix" draggable="false" />
        </div>
        <div className="nf-hero-btm">
          <p className="nf-hero-title">{NF_HERO.title}</p>
          <div className="nf-hero-meta">
            <span className="nf-play-ico" aria-hidden="true">▶</span>
            <span className="nf-hero-genre">{NF_HERO.genre}</span>
          </div>
        </div>
      </div>

      {/* ── Synchronized flip grid — all 4 cards flip together on hover ── */}
      <div className="nf-flip-grid">

        {NF_GRID.map((m, i) => (
          <div key={i} className="nf-cell">
            <div className="nf-cell-inner">

              {/* Front face */}
              <div className="nf-cell-front">
                <img src={m.front} alt={m.title} draggable="false" />
              </div>

              {/* Back face */}
              <div className="nf-cell-back">
                <img src={m.back} alt={m.title} draggable="false" />
                <div className="nf-cell-info">
                  <span className="nf-cell-title">{m.title}</span>
                  <span className="nf-cell-sub">{m.sub}</span>
                </div>
              </div>

            </div>
          </div>
        ))}

        {/* Centered N overlay — fades in after flip completes */}
        <div className="nf-n-overlay" aria-hidden="true">
          <img src="/nLogo.svg" alt="" draggable="false" />
        </div>

      </div>
    </div>
  );
}

// ── SPY / OPERATIVE CARD ─────────────────────────────────────────────────────

function DetailsCard({ onAboutClick }) {
  return (
    <div
      className="wg-card wg-spy"
      role="button"
      tabIndex={0}
      onClick={onAboutClick}
      aria-label="The Creative Operative — open about page"
    >
      {/* Cinematic background image */}
      <div className="wg-spy-bg" aria-hidden="true" />

      {/* Left-to-right dark gradient overlay */}
      <div className="wg-spy-vignette" aria-hidden="true" />

      {/* Content — left column */}
      <div className="wg-spy-content">

        {/* Top badge */}
        <div className="wg-spy-badge">
          <div className="wg-spy-ping" aria-hidden="true" />
          <span>Active · Field Operative</span>
        </div>

        {/* Main copy */}
        <div className="wg-spy-body">
          <h3 className="wg-spy-title">
            The Creative<br />Operative.
          </h3>
          <p className="wg-spy-sub">
            A ghost in the digital realm.<br />
            Embedded in visual warfare.
          </p>
        </div>

        {/* Footer */}
        <div className="wg-spy-foot">
          <p className="wg-spy-clearance">// CLEARANCE: LEVEL 5 · KISH</p>
          <button className="wg-spy-btn" tabIndex={-1} aria-hidden="true">
            Open Dossier
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M2 9.5L9.5 2M9.5 2H4M9.5 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}

// ── LIVE CLOCK ───────────────────────────────────────────────────────────────

function getIST() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 3_600_000);
}

function ClockCard() {
  const [t, setT] = useState(getIST);

  useEffect(() => {
    const id = setInterval(() => setT(getIST()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = t.getHours();
  const m = t.getMinutes();
  const s = t.getSeconds();
  const pad = n => String(n).padStart(2, '0');

  const secDeg  = s * 6;
  const minDeg  = m * 6 + s * 0.1;
  const hourDeg = (h % 12) * 30 + m * 0.5;

  return (
    <div className="wg-card wg-card--dark wg-clock">
      <div className="wg-clock-hdr">
        <span className="wg-clock-eyebrow">Local Time</span>
        <span className="wg-clock-tz">IST +5:30</span>
      </div>

      {/* Analog face */}
      <div className="wg-clock-face" aria-hidden="true">
        {/* 12 hour ticks */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`wg-tick${i % 3 === 0 ? ' wg-tick--major' : ''}`}
            style={{ transform: `rotate(${i * 30}deg)` }}
          />
        ))}
        {/* Hands */}
        <div className="wg-hand wg-hand--hr"  style={{ transform: `rotate(${hourDeg}deg)` }} />
        <div className="wg-hand wg-hand--min" style={{ transform: `rotate(${minDeg}deg)` }} />
        <div className="wg-hand wg-hand--sec" style={{ transform: `rotate(${secDeg}deg)` }} />
        <div className="wg-clock-hub" />
      </div>

      {/* Digital readout */}
      <div className="wg-clock-digital" aria-live="polite" aria-label={`Time ${pad(h)}:${pad(m)}:${pad(s)}`}>
        <span className="wg-clock-hm">{pad(h)}:{pad(m)}</span>
        <span className="wg-clock-sec">:{pad(s)}</span>
      </div>

      <p className="wg-clock-city">Chennai, India</p>
    </div>
  );
}

// ── DOLLAR PNG SEQUENCE OVERLAY ───────────────────────────────────────────

const DOLLAR_FRAME_COUNT = 420;

function dollarFrameUrl(frame) {
  const idx = String(frame).padStart(5, '0');
  return encodeURI(`/Dallor/Dollar_${idx}.png`);
}

function DallorSequenceOverlay({ playing, onDone }) {
  return (
    <PngSequenceOverlay
      playing={playing}
      frameCount={DOLLAR_FRAME_COUNT}
      urlBuilder={dollarFrameUrl}
      fps={24}
      onDone={onDone}
    />
  );
}

// ── CAT PNG SEQUENCE OVERLAY ──────────────────────────────────────────────

const CAT_FRAME_COUNT = 360;

function catFrameUrl(frame) {
  const idx = String(frame).padStart(5, '0');
  return encodeURI(`/Cat/cat_${idx}.png`);
}

function CatSequenceOverlay({ playing, onDone }) {
  return (
    <PngSequenceOverlay
      playing={playing}
      frameCount={CAT_FRAME_COUNT}
      urlBuilder={catFrameUrl}
      fps={30}
      onDone={onDone}
    />
  );
}

// ── HOBBIES ───────────────────────────────────────────────────────────────────

const HOBBIES = [
  { label: 'Guitar',      color: '#FF9F0A' },
  { label: 'Cinema',      color: '#FF375F' },
  { label: 'Gaming',      color: '#30D158' },
  { label: 'AI Art',      color: '#BF5AF2' },
  { label: 'Photography', color: '#0A84FF' },
  { label: 'Coding',      color: '#64D2FF' },
  { label: 'Music',       color: '#FF6961' },
  { label: 'Travel',      color: '#FFD60A' },
];

function HobbiesCard() {
  const [playingDallor, setPlayingDallor] = useState(false);

  return (
    <>
      <DallorSequenceOverlay
        playing={playingDallor}
        onDone={() => setPlayingDallor(false)}
      />
      <div className="wg-card wg-card--dark wg-hobbies">
        <div className="wg-hobbies-hdr">
          <p className="wg-eyebrow">When not working</p>
          <h3 className="wg-card-ttl">Hobbies</h3>
        </div>

        <div className="wg-hobbies-grid">
          {HOBBIES.map(h =>
            h.label === 'Travel' ? (
              <button
                key={h.label}
                className="wg-chip wg-chip--travel"
                onClick={() => { if (!playingDallor) setPlayingDallor(true); }}
                aria-label="Travel — play animation"
                title="Click to play ✈️"
              >
                <span className="wg-chip-dot" style={{ background: h.color }} aria-hidden="true" />
                <span className="wg-chip-lbl">{h.label}</span>
              </button>
            ) : (
              <div key={h.label} className="wg-chip">
                <span className="wg-chip-dot" style={{ background: h.color }} aria-hidden="true" />
                <span className="wg-chip-lbl">{h.label}</span>
              </div>
            )
          )}
        </div>

        <div className="wg-audio-bars" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="wg-audio-bar" style={{ '--i': i }} />
          ))}
        </div>
      </div>
    </>
  );
}

// ── DJ CONSOLE: ALBUM DECK RAIL ──────────────────────────────────────────────

function DeckCard({ song, idx, hidden, delay, onPick }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useTransform(my, [-60, 60], [12, -12]);
  const rotateY = useTransform(mx, [-60, 60], [-12, 12]);
  const sx = useSpring(rotateX, { stiffness: 320, damping: 24 });
  const sy = useSpring(rotateY, { stiffness: 320, damping: 24 });
  const liftX = useSpring(useTransform(mx, [-60, 60], [-3, 3]),  { stiffness: 280, damping: 22 });
  const liftY = useSpring(useTransform(my, [-60, 60], [-3, 3]),  { stiffness: 280, damping: 22 });

  const handleMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - (r.left + r.width / 2));
    my.set(e.clientY - (r.top  + r.height / 2));
  };

  const handleLeave = () => { mx.set(0); my.set(0); };

  const handleClick = () => {
    if (hidden) return;
    onPick?.(idx, ref.current);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      className={`wg-deck${hidden ? ' wg-deck--gone' : ''}`}
      style={{
        rotateX: sx,
        rotateY: sy,
        x: liftX,
        y: liftY,
        transformStyle: 'preserve-3d',
        perspective: 800,
      }}
      initial={{ opacity: 0, y: 80, scale: 0.85, rotateZ: -4 }}
      animate={{
        opacity: hidden ? 0 : 1,
        y: 0,
        scale: 1,
        rotateZ: 0,
        transition: {
          delay,
          type: 'spring',
          stiffness: 240,
          damping: 22,
          mass: 0.7,
        },
      }}
      exit={{ opacity: 0, y: 60, scale: 0.85, transition: { duration: 0.32 } }}
      whileHover={{ scale: 1.06, transition: { type: 'spring', stiffness: 320, damping: 20 } }}
      whileTap={{ scale: 0.95 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      aria-label={`Play ${song.title} by ${song.artist}`}
      disabled={hidden}
    >
      {/* Glow halo */}
      <div className="wg-deck-glow" aria-hidden="true" />

      {/* Specular sheen layered on top of art */}
      <div className="wg-deck-sheen" aria-hidden="true" />

      {/* Album art */}
      <div className="wg-deck-art-wrap">
        <img
          src={song.art}
          alt=""
          draggable="false"
          className="wg-deck-art"
        />
        <div className="wg-deck-vinyl-edge" aria-hidden="true" />
      </div>

      {/* Track number */}
      <div className="wg-deck-num" aria-hidden="true">
        {String(idx + 1).padStart(2, '0')}
      </div>

      {/* Meta strip */}
      <div className="wg-deck-meta">
        <span className="wg-deck-title">{song.title}</span>
        <span className="wg-deck-artist">{song.artist}</span>
      </div>

      {/* Hover-only equalizer ticks */}
      <div className="wg-deck-eq" aria-hidden="true">
        {[0, 1, 2, 3].map(i => (
          <span key={i} className="wg-deck-eq-bar" style={{ '--ei': i }} />
        ))}
      </div>
    </motion.button>
  );
}

function AlbumDeckRail({ onPick, hideIdx, onClose }) {
  const { SONGS } = useMusicPlayer();
  return (
    <div className="wg-deckrail" role="region" aria-label="DJ Console — Album decks">
      {/* Scanline / grid backdrop */}
      <div className="wg-deckrail-grid" aria-hidden="true" />
      <div className="wg-deckrail-scan" aria-hidden="true" />

      {/* Header */}
      <div className="wg-deckrail-hdr">
        <div className="wg-deckrail-line" aria-hidden="true" />
        <span className="wg-deckrail-eyebrow">
          <span className="wg-deckrail-pulse" aria-hidden="true" />
          DJ Console · Select Track
        </span>
        <div className="wg-deckrail-line" aria-hidden="true" />
        <button
          className="wg-deckrail-close"
          onClick={onClose}
          aria-label="Exit DJ console"
          type="button"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Decks */}
      <div className="wg-deckrail-tracks">
        {SONGS.map((song, i) => (
          <DeckCard
            key={song.id}
            song={song}
            idx={i}
            hidden={hideIdx === i}
            delay={0.05 + i * 0.055}
            onPick={onPick}
          />
        ))}
      </div>
    </div>
  );
}

// ── DJ CONSOLE: FLYING DISC ─────────────────────────────────────────────────

function FlyingDisc({ disc, onLanded }) {
  if (!disc) return null;

  // Curved arc: peak rises 220px above the higher endpoint
  const midX = (disc.fromX + disc.toX) / 2;
  const peakY = Math.min(disc.fromY, disc.toY) - 220;

  return createPortal(
    <motion.div
      className="wg-fly-disc"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 99999,
        pointerEvents: 'none',
        width: disc.startSize,
        height: disc.startSize,
        marginLeft: -disc.startSize / 2,
        marginTop: -disc.startSize / 2,
        borderRadius: '50%',
        willChange: 'transform',
      }}
      initial={{
        x: disc.fromX,
        y: disc.fromY,
        scale: 1,
        rotate: 0,
        opacity: 0.95,
      }}
      animate={{
        x: [disc.fromX, midX, disc.toX],
        y: [disc.fromY, peakY, disc.toY],
        scale: [1, 1.25, disc.endSize / disc.startSize],
        rotate: [0, 540, 1260],
        opacity: [0.95, 1, 1],
      }}
      transition={{
        duration: 1.15,
        ease: [0.55, 0.05, 0.2, 1],
        times: [0, 0.5, 1],
      }}
      onAnimationComplete={onLanded}
      aria-hidden="true"
    >
      {/* Motion blur / energy trail */}
      <div className="wg-fly-trail" />

      {/* Vinyl ring */}
      <div className="wg-fly-ring" />

      {/* Album art center */}
      <img
        src={disc.art}
        alt=""
        draggable="false"
        className="wg-fly-img"
      />

      {/* Glossy sheen */}
      <div className="wg-fly-sheen" />
    </motion.div>,
    document.body
  );
}

// ── DJ CONSOLE: EQUALIZER / MIXER PANEL ─────────────────────────────────────

// Vertical slider — drag thumb up/down. Range 0–100. Plays a tick on
// every `step` units of value change while dragging.
function VerticalSlider({ label, value, onChange, step = 5 }) {
  const trackRef = useRef(null);
  const lastStepRef = useRef(Math.floor(value / step));
  const [dragging, setDragging] = useState(false);

  const setFromY = (clientY) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = clientY - rect.top;
    const pct = Math.max(0, Math.min(100, (1 - y / rect.height) * 100));

    const stepIdx = Math.floor(pct / step);
    if (stepIdx !== lastStepRef.current) {
      lastStepRef.current = stepIdx;
      playTick();
    }
    onChange(pct);
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    playGrip();
    setFromY(e.clientY);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    setFromY(e.clientY);
  };

  const handlePointerUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    playRelease();
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onKeyDown = (e) => {
    let next = value;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight')      next = Math.min(100, value + step);
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') next = Math.max(0,   value - step);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End')  next = 100;
    else return;
    e.preventDefault();
    playTick();
    onChange(next);
  };

  return (
    <div className="wg-djeq-ch">
      <div
        ref={trackRef}
        className={`wg-djeq-ch-track wg-djeq-ch-track--interactive${dragging ? ' is-dragging' : ''}`}
        role="slider"
        aria-label={`${label} channel level`}
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={onKeyDown}
      >
        <div className="wg-djeq-ch-fill" style={{ height: `${value}%` }} />
        <div className="wg-djeq-ch-thumb" style={{ bottom: `calc(${value}% - 6px)` }} />
      </div>
      <span className="wg-djeq-ch-lbl">{label}</span>
    </div>
  );
}

// Horizontal crossfader — drag thumb left/right.
function CrossFader({ value, onChange, step = 5 }) {
  const trackRef = useRef(null);
  const lastStepRef = useRef(Math.floor(value / step));
  const [dragging, setDragging] = useState(false);

  const setFromX = (clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const stepIdx = Math.floor(pct / step);
    if (stepIdx !== lastStepRef.current) {
      lastStepRef.current = stepIdx;
      playTick();
    }
    onChange(pct);
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    playGrip();
    setFromX(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    setFromX(e.clientX);
  };

  const handlePointerUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    playRelease();
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onKeyDown = (e) => {
    let next = value;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   next = Math.min(100, value + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(0, value - step);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End')  next = 100;
    else return;
    e.preventDefault();
    playTick();
    onChange(next);
  };

  return (
    <div className="wg-djeq-cf">
      <span className="wg-djeq-cf-lbl-l">A</span>
      <div
        ref={trackRef}
        className={`wg-djeq-cf-track wg-djeq-cf-track--interactive${dragging ? ' is-dragging' : ''}`}
        role="slider"
        aria-label="Crossfader A/B"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={onKeyDown}
      >
        <div className="wg-djeq-cf-rail" />
        <div className="wg-djeq-cf-thumb" style={{ left: `calc(${value}% - 8px)` }} />
      </div>
      <span className="wg-djeq-cf-lbl-r">B</span>
    </div>
  );
}

// Rotary knob — vertical drag rotates 0–100 (mapped to -135° → +135°).
// Plays a chunkier "detent" sound at every `step` units.
function RotaryKnob({ label, value, onChange, color = 'amber', step = 8 }) {
  const dragRef = useRef({ active: false, startY: 0, startVal: value, lastStep: Math.floor(value / step) });
  const [dragging, setDragging] = useState(false);

  // Map 0–100 to -135° → +135°
  const angle = -135 + (value / 100) * 270;

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      startY: e.clientY,
      startVal: value,
      lastStep: Math.floor(value / step),
    };
    setDragging(true);
    playGrip();
  };

  const handlePointerMove = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    // Up = increase value. 1px ≈ 0.6 units → full sweep over ~166px
    const dy = d.startY - e.clientY;
    const next = Math.max(0, Math.min(100, d.startVal + dy * 0.6));

    const stepIdx = Math.floor(next / step);
    if (stepIdx !== d.lastStep) {
      d.lastStep = stepIdx;
      playDetent();
    }
    onChange(next);
  };

  const handlePointerUp = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    setDragging(false);
    playRelease();
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onKeyDown = (e) => {
    let next = value;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight')        next = Math.min(100, value + step);
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft')  next = Math.max(0,   value - step);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End')  next = 100;
    else return;
    e.preventDefault();
    playDetent();
    onChange(next);
  };

  return (
    <div className="wg-djeq-knob">
      <div
        className={`wg-djeq-knob-dial wg-djeq-knob-dial--${color}${dragging ? ' is-dragging' : ''}`}
        style={{ transform: `rotate(${angle}deg)` }}
        role="slider"
        aria-label={`${label} knob`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={onKeyDown}
      >
        <div className="wg-djeq-knob-mark" />
        <div className="wg-djeq-knob-grip" aria-hidden="true" />
      </div>
      <span className="wg-djeq-knob-lbl">{label}</span>
    </div>
  );
}

function DJEqualizerPanel({ playing, onClose }) {
  // Prime audio on mount (we got here via a user gesture — clicking the player)
  useEffect(() => { primeAudio(); }, []);

  // Live-ticking BPM counter (still ambient — not user-controlled)
  const [bpm, setBpm] = useState(124);
  useEffect(() => {
    const id = setInterval(() => {
      setBpm(prev => {
        const target = 124 + (Math.random() - 0.5) * 2;
        return Math.round((prev * 0.7 + target * 0.3) * 10) / 10;
      });
    }, 380);
    return () => clearInterval(id);
  }, []);

  // User-driven control state
  const [low, setLow]       = useState(55);
  const [mid, setMid]       = useState(62);
  const [high, setHigh]     = useState(48);
  const [cf, setCf]         = useState(50);
  const [filter, setFilter] = useState(45);
  const [echo, setEcho]     = useState(60);

  return (
    <div className="wg-djeq" role="region" aria-label="DJ equalizer mixer">
      {/* Backdrop layers */}
      <div className="wg-djeq-grid" aria-hidden="true" />
      <div className="wg-djeq-scan" aria-hidden="true" />

      {/* Header */}
      <div className="wg-djeq-hdr">
        <span className="wg-djeq-status">
          <span className="wg-djeq-dot" />
          DJ MIX
        </span>
        <div className="wg-djeq-bpm">
          <span className="wg-djeq-bpm-num">{bpm.toFixed(1)}</span>
          <span className="wg-djeq-bpm-lbl">BPM</span>
        </div>
        <button
          type="button"
          className="wg-djeq-close"
          onClick={onClose}
          aria-label="Exit DJ console"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Rotary knob row */}
      <div className="wg-djeq-knobs">
        <RotaryKnob label="FILTER" value={filter} onChange={setFilter} color="amber" />
        <RotaryKnob label="ECHO"   value={echo}   onChange={setEcho}   color="cyan"  />
      </div>

      {/* Spectrum analyzer (still ambient) */}
      <div className="wg-djeq-spec" aria-hidden="true">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className={`wg-djeq-spec-bar${playing ? ' wg-djeq-spec-bar--live' : ''}`}
            style={{ '--si': i, '--ph': `${(i % 7) * 0.13}s` }}
          />
        ))}
      </div>

      {/* 3-channel vertical EQ sliders (interactive) */}
      <div className="wg-djeq-channels">
        <VerticalSlider label="LOW"  value={low}  onChange={setLow}  />
        <VerticalSlider label="MID"  value={mid}  onChange={setMid}  />
        <VerticalSlider label="HIGH" value={high} onChange={setHigh} />
      </div>

      {/* Crossfader (interactive) */}
      <CrossFader value={cf} onChange={setCf} />

      {/* Footer caption */}
      <div className="wg-djeq-foot">
        <span className="wg-djeq-foot-line" />
        <span className="wg-djeq-foot-txt">CHANNEL · 04</span>
        <span className="wg-djeq-foot-line" />
      </div>
    </div>
  );
}

// ── MAIN SECTION ─────────────────────────────────────────────────────────────

export default function WidgetsSection({ onAboutClick, onSkillsClick }) {
  const plates       = useContent('images.widgetPlates', DEFAULT_WIDGET_PLATES);
  const nfGridUrls   = useContent('images.netflixGrid', null);
  // Stored flat as front, back, front, back … in source order.
  const NF_GRID      = Array.isArray(nfGridUrls)
    ? DEFAULT_NF_GRID.map((c, i) => ({
        ...c,
        front: nfGridUrls[i * 2]     || c.front,
        back:  nfGridUrls[i * 2 + 1] || c.back,
      }))
    : DEFAULT_NF_GRID;
  const sectionRef = useRef(null);
  const musicCellRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  // ── DJ Console state ──
  const [djMode, setDjMode] = useState(false);
  const [flying, setFlying] = useState(null);
  const restoreTimerRef = useRef(null);

  // ── Cat sequence overlay (triggered by NotificationList "View all") ──
  const [playingCat, setPlayingCat] = useState(false);

  const { SONGS, setSongIdx, setPlaying, playing } = useMusicPlayer();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Cleanup any pending restore timer on unmount
  useEffect(() => () => {
    if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
  }, []);

  const enterDJ = () => {
    if (djMode) return;
    setDjMode(true);
  };

  const exitDJ = () => {
    setDjMode(false);
    if (restoreTimerRef.current) {
      clearTimeout(restoreTimerRef.current);
      restoreTimerRef.current = null;
    }
  };

  // User picks a deck → fly the disc to the music player
  const handlePickAlbum = (idx, deckEl) => {
    if (flying || !musicCellRef.current || !deckEl) return;

    const deckRect = deckEl.getBoundingClientRect();
    const vinylEl = musicCellRef.current.querySelector('.wg-vinyl-label');
    if (!vinylEl) return;
    const vinylRect = vinylEl.getBoundingClientRect();

    const startSize = Math.min(deckRect.width, deckRect.height) * 0.62;
    const endSize   = vinylRect.width;

    setFlying({
      art: SONGS[idx].art,
      idx,
      fromX: deckRect.left + deckRect.width / 2,
      fromY: deckRect.top  + deckRect.height / 2,
      toX:   vinylRect.left + vinylRect.width / 2,
      toY:   vinylRect.top  + vinylRect.height / 2,
      startSize,
      endSize,
    });
  };

  // Disc has landed in the player → trigger playback + auto-restore
  const handleDiscLanded = () => {
    if (flying) {
      setSongIdx(flying.idx);
      setPlaying(true);
    }
    setFlying(null);
    // Schedule layout restoration shortly after playback starts
    if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
    restoreTimerRef.current = setTimeout(() => {
      setDjMode(false);
      restoreTimerRef.current = null;
    }, 1500);
  };

  return (
    <section
      ref={sectionRef}
      className={`wg-section${revealed ? ' wg-revealed' : ''}${djMode ? ' wg-dj-on' : ''}`}
      aria-label="Personal widgets"
    >
      <div className="wg-bg" aria-hidden="true" />
      <div className="wg-noise" aria-hidden="true" />
      <div className="wg-dj-aura" aria-hidden="true" />

      <div className="wg-header">
        <div className="wg-header-line" aria-hidden="true" />
        <p className="wg-header-eyebrow">Personal OS</p>
        <div className="wg-header-dot" aria-hidden="true" />
        <p className="wg-header-label">Live · 2026</p>
        <div className="wg-header-line" aria-hidden="true" />
      </div>

      <h2 className="wg-heading">
        <span>Inside</span>
        <span className="wg-heading-ghost">the mind.</span>
      </h2>

      <div className={`wg-grid${djMode ? ' wg-grid--dj' : ''}`}>
        <div className="wg-a-music"  style={{ '--d': '0s'    }} ref={musicCellRef}>
          <FlipWidget back={<NfPosterBack img={plates[5]} title="NOW PLAYING" sub="Hans Zimmer · Sci-Fi" />}>
            <MusicCard onActivate={enterDJ} djMode={djMode} />
          </FlipWidget>
        </div>
        <div
          className={`wg-a-snap${djMode ? ' is-djmode-out' : ''}`}
          style={{ '--d': '0.08s', '--djd': '0s' }}
        >
          <FlipWidget back={<NfPosterBack img={plates[6]} title="PROJECTS" sub="Visual Archive" />}>
            <FolderCard onAboutClick={onAboutClick} onSkillsClick={onSkillsClick} />
          </FlipWidget>
        </div>
        <div
          className={`wg-a-wa${djMode ? ' is-djmode-out' : ''}`}
          style={{ '--d': '0.14s', '--djd': '0.04s' }}
        >
          <FlipWidget back={<NfPosterBack img={plates[7]} title="UPDATES" sub="Latest Feed" />}>
            <NotificationList onViewAll={() => { if (!playingCat) setPlayingCat(true); }} />
          </FlipWidget>
        </div>
        <div
          className={`wg-a-map${djMode ? ' is-djmode-out' : ''}`}
          style={{ '--d': '0.20s', '--djd': '0.08s' }}
        >
          <MapAreaWidgets />
        </div>

        {/* Bottom-row widgets — fade & slide out when DJ mode is active */}
        <div
          className={`wg-a-det${djMode ? ' is-djmode-out' : ''}`}
          style={{ '--d': '0.26s', '--djd': '0s' }}
        >
          <FlipWidget back={<NfPosterBack img={plates[8]} title="OPERATIVE" sub="Clearance · Level 5" />}>
            <DetailsCard onAboutClick={onAboutClick} />
          </FlipWidget>
        </div>
        <div
          className={`wg-a-clock${djMode ? ' is-djmode-out' : ''}`}
          style={{ '--d': '0.32s', '--djd': '0.06s' }}
        >
          <FlipWidget back={<NfPosterBack img={plates[9]} title="IST · INDIA" sub="UTC +5:30" />}>
            <ClockCard />
          </FlipWidget>
        </div>
        <div
          className={`wg-a-hob${djMode ? ' is-djmode-out' : ''}`}
          style={{ '--d': '0.38s', '--djd': '0.12s' }}
        >
          <FlipWidget back={<NfPosterBack img={plates[10]} title="INTERESTS" sub="Hobbies & Passions" />}>
            <HobbiesCard />
          </FlipWidget>
        </div>

        {/* DJ Console EQ panel + deck rail — only when active */}
        <AnimatePresence>
          {djMode && (
            <motion.div
              key="dj-eq-panel"
              className="wg-a-eq"
              initial={{ opacity: 0, x: 60, scale: 0.94, filter: 'blur(8px)' }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                filter: 'blur(0px)',
                transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
              }}
              exit={{
                opacity: 0,
                x: 50,
                scale: 0.96,
                filter: 'blur(6px)',
                transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              }}
            >
              <DJEqualizerPanel playing={playing} onClose={exitDJ} />
            </motion.div>
          )}

          {djMode && (
            <motion.div
              key="album-deck-rail"
              className="wg-a-deck"
              initial={{ opacity: 0, y: 80, scale: 0.94, filter: 'blur(8px)' }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.18 },
              }}
              exit={{
                opacity: 0,
                y: 50,
                scale: 0.96,
                filter: 'blur(6px)',
                transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              }}
            >
              <AlbumDeckRail
                onPick={handlePickAlbum}
                hideIdx={flying?.idx}
                onClose={exitDJ}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Flying disc — portal to body, animates from deck → vinyl */}
      <FlyingDisc disc={flying} onLanded={handleDiscLanded} />

      {/* Cat PNG sequence — fired by NotificationList "View all" */}
      <CatSequenceOverlay playing={playingCat} onDone={() => setPlayingCat(false)} />
    </section>
  );
}
