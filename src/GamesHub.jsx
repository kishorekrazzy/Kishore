import { useState, useEffect, useMemo, useCallback } from 'react';
import { useContent, withImages } from './content/store';
import { GAMES, GENRES } from './arcadeIndex';
import { STORE_KEY, loadScores } from './arcadeStore';
import './GamesHub.css';

/* ══════════════════════════════════════════════════════════════════════
   ARCADE — launcher

   Three columns: a nav rail, the library, a column of records. Thirteen
   games behind it, each opening in a dialog over the top.

   Covers are image URLs from the dashboard, one per game, so every
   thumbnail is replaceable without touching this file. The defaults are
   placeholders — they exist so the layout is never empty, not because
   they are the right pictures.
   ══════════════════════════════════════════════════════════════════════ */

const DEFAULT_SHOTS = [
  'photo-1509198397868-475647b2a1e5', 'photo-1550745165-9bc0b252726f',
  'photo-1531525645387-7f14be1bdbbd', 'photo-1553481187-be93c21490a9',
  'photo-1518709268805-4e9042af9f23', 'photo-1550751827-4bd374c3f58b',
  'photo-1611996575749-79a3a250f948', 'photo-1526374965328-7f61d4dc18c5',
  'photo-1485846234645-a62644f84728', 'photo-1502920917128-1aa500764cbd',
  'photo-1516110833967-0b5716ca1387', 'photo-1587202372775-e229f172b9d7',
  'photo-1518895949257-7621c3c786d7',
].map((id) => ({ src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80` }));

const Ic = {
  home:   <path d="M3 9.6 10 4l7 5.6V16a1 1 0 0 1-1 1h-3.4v-4.2H7.4V17H4a1 1 0 0 1-1-1V9.6Z" />,
  grid:   <path d="M3.4 3.4h5.2v5.2H3.4zM11.4 3.4h5.2v5.2h-5.2zM3.4 11.4h5.2v5.2H3.4zM11.4 11.4h5.2v5.2h-5.2z" />,
  chart:  <path d="M4 16v-5m6 5V5m6 11v-8" />,
  medal:  <path d="M10 12.4a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Zm-2.6 1L6 18l4-2 4 2-1.4-4.6" />,
  gear:   <path d="M10 12.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Zm6.4-2.6c0 .5 0 1-.1 1.4l1.5 1.1-1.5 2.6-1.8-.7c-.7.6-1.5 1-2.3 1.3L11.8 18H8.2l-.4-1.9c-.8-.3-1.6-.7-2.3-1.3l-1.8.7L2.2 12.4l1.5-1.1a7.6 7.6 0 0 1 0-2.6L2.2 7.6l1.5-2.6 1.8.7c.7-.6 1.5-1 2.3-1.3L8.2 2h3.6l.4 1.9c.8.3 1.6.7 2.3 1.3l1.8-.7 1.5 2.6-1.5 1.1c.1.5.1 1 .1 1.4Z" />,
  search: <path d="M9 15.4a6.4 6.4 0 1 0 0-12.8 6.4 6.4 0 0 0 0 12.8Zm4.6-1.8L17.4 17.4" />,
  bell:   <path d="M10 3.4a4.6 4.6 0 0 0-4.6 4.6c0 4-1.6 5.2-1.6 5.2h12.4s-1.6-1.2-1.6-5.2A4.6 4.6 0 0 0 10 3.4Zm1.4 12.4a1.6 1.6 0 0 1-2.8 0" />,
  play:   <path d="M6.6 4.4 15.6 10l-9 5.6V4.4Z" />,
  back:   <path d="M16 10H4m6 6-6-6 6-6" />,
  chev:   <path d="M5 8l5 5 5-5" />,
};
const G = ({ d, fill }) => (
  <svg viewBox="0 0 20 20" fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'}
       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

const NAV = [
  { id: 'home',   label: 'Home',         icon: Ic.home, fill: true },
  { id: 'games',  label: 'Library',      icon: Ic.grid, fill: true },
  { id: 'scores', label: 'Records',      icon: Ic.chart },
  { id: 'badges', label: 'Achievements', icon: Ic.medal },
  { id: 'setup',  label: 'Settings',     icon: Ic.gear },
];

/* Earned from what is actually in storage — none of these can be
   unlocked by looking at them. */
const BADGES = [
  { id: 'first', label: 'First contact',   hint: 'Play anything once',        test: (s) => Object.keys(s).length > 0 },
  { id: 'three', label: 'Getting into it', hint: 'Score in three games',      test: (s) => Object.keys(s).length >= 3 },
  { id: 'quick', label: 'Quick draw',      hint: 'React in under 250ms',      test: (s) => s.reaction != null && s.reaction < 250 },
  { id: 'cut',   label: 'On the frame',    hint: 'Frame Perfect streak of 5', test: (s) => (s.frame ?? 0) >= 5 },
  { id: 'long',  label: 'Long snake',      hint: 'Eat 12 in Snake',           test: (s) => (s.snake ?? 0) >= 12 },
  { id: 'wall',  label: 'Wall breaker',    hint: 'Score 200 in Breakout',     test: (s) => (s.breakout ?? 0) >= 200 },
  { id: 'merge', label: 'Merger',          hint: '1,000 points at 2048',      test: (s) => (s.g2048 ?? 0) >= 1000 },
  { id: 'sweep', label: 'Sapper',          hint: 'Clear Minesweeper',         test: (s) => s.mines != null },
  { id: 'echo',  label: 'Good ear',        hint: 'Simon round 6',             test: (s) => (s.simon ?? 0) >= 6 },
  { id: 'all',   label: 'Completionist',   hint: 'Score in every game',       test: (s) => GAMES.every((g) => s[g.id] != null) },
];

const fmt = (g, v) => (v == null ? '—' : `${v}${g.unit}`);

function Cover({ game, shots, big }) {
  const src = shots[game.shot]?.src;
  return (
    <span className={`ar-cover${big ? ' ar-cover--big' : ''}`} style={{ '--h': game.hue }}>
      {src && <img src={src} alt="" loading="lazy" draggable="false"
                   onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />}
      <i className="ar-cover-wash" aria-hidden="true" />
    </span>
  );
}

function Tile({ game, shots, score, active, onPlay }) {
  return (
    <button
      className={`ar-tile${active ? ' is-live' : ''}`}
      style={{ '--h': game.hue, '--cs': game.span[0], '--rs': game.span[1] }}
      onClick={() => onPlay(game)}
    >
      <Cover game={game} shots={shots} big />
      <span className="ar-tile-body">
        <b>{game.title}</b>
        <em>{game.genre}{game.era !== '—' ? ` · ${game.era}` : ''}</em>
        <span className="ar-tile-blurb">{game.blurb}</span>
      </span>
      {score != null && <span className="ar-tile-best">{fmt(game, score)}</span>}
      <span className="ar-tile-go" aria-hidden="true"><G d={Ic.play} fill /></span>
    </button>
  );
}

export default function GamesHub({ onBack }) {
  const [view, setView]       = useState('home');
  const [query, setQuery]     = useState('');
  const [genre, setGenre]     = useState('All');
  const [playing, setPlaying] = useState(null);
  const [scores, setScores]   = useState(loadScores);

  const shots = withImages(DEFAULT_SHOTS, useContent('images.arcade', null), 'src');

  /* Re-read on close: the games write straight to localStorage, so this
     is the moment the launcher learns what happened. */
  const close = useCallback(() => { setPlaying(null); setScores(loadScores()); }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (playing) close(); else onBack?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing, close, onBack]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES.filter((g) =>
      (genre === 'All' || g.genre === genre)
      && (!q || `${g.title} ${g.genre} ${g.era}`.toLowerCase().includes(q)));
  }, [query, genre]);

  const earned = useMemo(() => BADGES.filter((b) => b.test(scores)), [scores]);
  const hero = GAMES[0];
  const searching = query.trim().length > 0;

  const filters = (
    <div className="ar-chips">
      {['All', ...GENRES].map((t) => (
        <button key={t} className={`ar-chip${genre === t ? ' is-on' : ''}`} onClick={() => setGenre(t)}>{t}</button>
      ))}
    </div>
  );

  const dockGame = playing;

  return (
    <div className="ar">
      {/* Ground: two slow blooms, so the glass has something to sit on. */}
      <div className="ar-sky" aria-hidden="true"><i /><i /></div>

      <div className="ar-left">
        <header className="ar-bar">
          <div className="ar-search">
            <G d={Ic.search} />
            <input type="search" value={query} placeholder={`Search ${GAMES.length} games`}
                   onChange={(e) => setQuery(e.target.value)} aria-label="Search games" />
          </div>
          <nav className="ar-nav" aria-label="Arcade sections">
            {NAV.map((n) => (
              <button key={n.id}
                      className={`ar-nav-i${view === n.id && !searching ? ' is-on' : ''}`}
                      onClick={() => { setView(n.id); setQuery(''); }}>{n.label}</button>
            ))}
          </nav>
          <span className="ar-who">{GAMES.length} games · Kishore</span>
          <button className="ar-exit" onClick={onBack} aria-label="Leave the arcade"><G d={Ic.back} /></button>
        </header>

        <div className="ar-scroll">
          {view === 'home' && !searching && (
            <button className="ar-hero" style={{ '--h': hero.hue }} onClick={() => setPlaying(hero)}>
              <img className="ar-hero-bg" src={shots[hero.shot]?.src} alt="" loading="lazy" />
              <span className="ar-hero-veil" aria-hidden="true" />
              <span className="ar-hero-in">
                <em className="ar-hero-tag">FEATURED · {hero.genre}{hero.era !== '—' ? ` · ${hero.era}` : ''}</em>
                <strong>{hero.title}</strong>
                <span className="ar-hero-sub">{hero.blurb}</span>
                <span className="ar-hero-go"><G d={Ic.play} fill /> Play</span>
              </span>
            </button>
          )}

          {(view === 'home' || view === 'games' || searching) && (
            <>
              <div className="ar-h-row">
                <h3 className="ar-h">{searching ? `${list.length} found` : 'Library'}</h3>
                {!searching && filters}
              </div>
              {/* Bento: every tile carries its own span, so the grid packs
                  itself and a new game needs no layout work. */}
              <div className="ar-bento">
                {list.map((g) => (
                  <Tile key={g.id} game={g} shots={shots} score={scores[g.id]}
                        active={dockGame?.id === g.id} onPlay={setPlaying} />
                ))}
              </div>
            </>
          )}

          {view === 'scores' && !searching && (
            <>
              <h3 className="ar-h">Records</h3>
              <ul className="ar-rows">
                {GAMES.map((g) => (
                  <li key={g.id}>
                    <Cover game={g} shots={shots} />
                    <span className="ar-row-txt">
                      <b>{g.title}</b><em>{g.dir === 'low' ? 'Lower is better' : 'Higher is better'}</em>
                    </span>
                    <span className="ar-row-val">{fmt(g, scores[g.id])}</span>
                    <button className="ar-play" onClick={() => setPlaying(g)}>Play</button>
                  </li>
                ))}
              </ul>
              <p className="ar-note">Stored in this browser only — no account, no server.</p>
            </>
          )}

          {view === 'badges' && !searching && (
            <>
              <h3 className="ar-h">Achievements <span className="ar-count">{earned.length}/{BADGES.length}</span></h3>
              <div className="ar-badges">
                {BADGES.map((b) => (
                  <div key={b.id} className={`ar-badge${earned.includes(b) ? ' is-got' : ''}`}>
                    <span className="ar-badge-m"><G d={Ic.medal} /></span>
                    <b>{b.label}</b><em>{b.hint}</em>
                  </div>
                ))}
              </div>
            </>
          )}

          {view === 'setup' && !searching && (
            <>
              <h3 className="ar-h">Settings</h3>
              <div className="ar-set">
                <div><b>Reset every record</b><em>Clears all {GAMES.length} scores and every achievement.</em></div>
                <button className="ar-danger" onClick={() => {
                  if (!window.confirm('Clear every score and achievement?')) return;
                  try { localStorage.removeItem(STORE_KEY); } catch { /* private mode */ }
                  setScores({});
                }}>Reset</button>
              </div>
              <p className="ar-note">Scores live under <code>{STORE_KEY}</code>. Nothing is sent anywhere.</p>
            </>
          )}
        </div>
      </div>

      {/* ── The dock ──
          The game opens here rather than over the top, so the library
          stays on screen and picking another is one click, not a close
          and a re-open. */}
      <aside className={`ar-dock${dockGame ? ' is-playing' : ''}`} style={{ '--h': dockGame?.hue ?? 275 }}>
        {dockGame ? (
          <>
            <header className="ar-dock-bar">
              <Cover game={dockGame} shots={shots} />
              <span className="ar-dock-txt">
                <b>{dockGame.title}</b>
                <em>{dockGame.genre}{dockGame.era !== '—' ? ` · ${dockGame.era}` : ''}</em>
              </span>
              <button className="ar-dock-x" onClick={close} aria-label="Close game">✕</button>
            </header>
            <div className="ar-dock-stage">
              {/* Keyed so switching games remounts rather than handing the
                  next one the last one's state. Only this game is mounted,
                  so there is never more than one frame loop. */}
              <dockGame.Comp key={dockGame.id} />
            </div>
          </>
        ) : (
          <>
            <div className="ar-dock-idle">
              <span className="ar-dock-mark" aria-hidden="true"><G d={Ic.play} fill /></span>
              <b>Pick a game</b>
              <em>It opens here, beside the library.</em>
            </div>
            <section className="ar-r-block">
              <h4>Records</h4>
              <ul className="ar-r-list">
                {GAMES.slice(0, 6).map((g) => (
                  <li key={g.id}>
                    <Cover game={g} shots={shots} />
                    <span className="ar-r-txt">
                      <b>{g.title}</b>
                      <em>{scores[g.id] == null ? 'Not played' : fmt(g, scores[g.id])}</em>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="ar-r-block">
              <h4>Achievements <span className="ar-count">{earned.length}/{BADGES.length}</span></h4>
              <ul className="ar-r-list">
                {BADGES.slice(0, 4).map((b) => (
                  <li key={b.id} className={earned.includes(b) ? 'is-got' : ''}>
                    <span className="ar-r-m"><G d={Ic.medal} /></span>
                    <span className="ar-r-txt"><b>{b.label}</b><em>{earned.includes(b) ? 'Unlocked' : b.hint}</em></span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </aside>
    </div>
  );
}
