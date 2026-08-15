import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useBest, useLoop, useKeys } from './arcadeStore';
import './arcadeGames.css';

/* ══════════════════════════════════════════════════════════════════════
   ARCADE — the games

   Thirteen of them behind one chrome. Every game renders into the same
   Frame: a HUD of stat chips across the top, a stage in the middle, a
   footer for controls. That is what makes a set of games feel like one
   arcade rather than thirteen separate toys.

   Rules the whole file follows:
     · no emoji as artwork — covers are images, set from the dashboard
     · one frame loop at most, and only while the game is mounted
     · every score goes through useBest, which knows whether high or low
       wins, so the scoreboard never has to special-case a game
     · nothing random on the render path, and no ref read during one —
       the games that move every frame write to the DOM directly
   ══════════════════════════════════════════════════════════════════════ */

// ── Shared chrome ────────────────────────────────────────────────────
function Frame({ stats = [], children, foot, wide }) {
  return (
    <div className={`gm${wide ? ' gm--wide' : ''}`}>
      {stats.length > 0 && (
        <div className="gm-hud">
          {stats.map((s) => (
            <span className="gm-chip" key={s.k}>
              <em>{s.k}</em>
              <b>{s.v}</b>
            </span>
          ))}
        </div>
      )}
      <div className="gm-stage">{children}</div>
      {foot && <div className="gm-foot">{foot}</div>}
    </div>
  );
}

const Btn = ({ children, ...p }) => <button type="button" className="gm-btn" {...p}>{children}</button>;

/* An overlay for "press start" and "you died", so no game has to invent
   its own idle screen. */
function Curtain({ title, sub, action, onAction }) {
  return (
    <div className="gm-curtain">
      <strong>{title}</strong>
      {sub && <span>{sub}</span>}
      <Btn onClick={onAction}>{action}</Btn>
    </div>
  );
}

/* ══ 1 · SNAKE ════════════════════════════════════════════════════════ */
const SN = 17;
export function Snake() {
  const [body, setBody] = useState([{ x: 8, y: 8 }]);
  const [food, setFood] = useState({ x: 12, y: 8 });
  const [state, setState] = useState('idle');
  const [score, setScore] = useState(0);
  const [best, submit] = useBest('snake');
  const acc = useRef(0);
  const turn = useRef({ x: 1, y: 0 });
  const dir = useRef({ x: 1, y: 0 });

  /* The tick reads these rather than state: a setState updater must be
     pure, and React runs it twice in development to prove it. Scoring,
     spawning food and ending the run all used to happen inside one. */
  const bodyRef = useRef(body);
  const foodRef = useRef(food);
  const scoreRef = useRef(0);

  const reset = () => {
    const start = [{ x: 8, y: 8 }];
    bodyRef.current = start; foodRef.current = { x: 12, y: 8 }; scoreRef.current = 0;
    dir.current = { x: 1, y: 0 }; turn.current = { x: 1, y: 0 }; acc.current = 0;
    setBody(start); setFood({ x: 12, y: 8 }); setScore(0); setState('run');
  };

  /* Buffered until the tick: pressing up then left inside one frame would
     otherwise turn the snake back into itself. */
  const steer = (x, y) => {
    const d = dir.current;
    if (d.x !== -x || d.y !== -y) turn.current = { x, y };
  };
  useKeys({
    ArrowUp: () => steer(0, -1), ArrowDown: () => steer(0, 1),
    ArrowLeft: () => steer(-1, 0), ArrowRight: () => steer(1, 0),
    w: () => steer(0, -1), s: () => steer(0, 1), a: () => steer(-1, 0), d: () => steer(1, 0),
  }, state === 'run');

  useLoop((dt) => {
    acc.current += dt;
    if (acc.current < Math.max(72, 135 - scoreRef.current * 3)) return;
    acc.current = 0;

    const d = turn.current;
    dir.current = d;
    const prev = bodyRef.current;
    const head = { x: prev[0].x + d.x, y: prev[0].y + d.y };

    if (head.x < 0 || head.y < 0 || head.x >= SN || head.y >= SN
        || prev.some((seg) => seg.x === head.x && seg.y === head.y)) {
      setState('over');
      submit(scoreRef.current);
      return;
    }

    const ate = head.x === foodRef.current.x && head.y === foodRef.current.y;
    const next = [head, ...(ate ? prev : prev.slice(0, -1))];
    bodyRef.current = next;
    setBody(next);

    if (ate) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      let spot;
      do {
        spot = { x: Math.floor(Math.random() * SN), y: Math.floor(Math.random() * SN) };
      } while (next.some((seg) => seg.x === spot.x && seg.y === spot.y));
      foodRef.current = spot;
      setFood(spot);
    }
  }, state === 'run');

  return (
    <Frame
      stats={[{ k: 'LENGTH', v: body.length }, { k: 'SCORE', v: score }, { k: 'BEST', v: best ?? 0 }]}
      foot={<span className="gm-hint">Arrow keys or WASD</span>}
    >
      <div className="gm-board gm-snake" style={{ '--n': SN }}>
        {state !== 'run' && (
          <Curtain
            title={state === 'over' ? `${score} eaten` : 'Snake'}
            sub={state === 'over' ? 'You ran into yourself' : 'Grow without biting your tail'}
            action={state === 'over' ? 'Again' : 'Start'}
            onAction={reset}
          />
        )}
        <span className="gm-cell gm-food" style={{ '--x': food.x, '--y': food.y }} />
        {body.map((seg, i) => (
          <span key={i} className={`gm-cell gm-snake-seg${i === 0 ? ' is-head' : ''}`}
                style={{ '--x': seg.x, '--y': seg.y, '--i': i }} />
        ))}
      </div>
    </Frame>
  );
}

/* ══ 2 · PONG ═════════════════════════════════════════════════════════ */
export function Pong() {
  const W = 300, H = 190, PAD = 42;
  const [state, setState] = useState('idle');
  const [score, setScore] = useState([0, 0]);
  const [best, submit] = useBest('pong');
  const ball = useRef({ x: W / 2, y: H / 2, vx: 0.17, vy: 0.1 });
  const you = useRef(H / 2);
  const cpu = useRef(H / 2);
  // The running score, so the loop never nests a setState in an updater.
  const tally = useRef([0, 0]);
  /* The moving parts are written straight to the DOM. Routing 60 frames a
     second through state would re-render the whole board for three
     elements, and reading a ref while rendering is a rule violation. */
  const ballEl = useRef(null);
  const youEl = useRef(null);
  const cpuEl = useRef(null);

  const paint = () => {
    const b = ball.current;
    if (ballEl.current) ballEl.current.style.transform =
      `translate(${(b.x / W) * 100}cqw, ${(b.y / H) * 100}cqh) translate(-50%,-50%)`;
    if (youEl.current) youEl.current.style.transform = `translateY(${(you.current / H) * 100}cqh) translateY(-50%)`;
    if (cpuEl.current) cpuEl.current.style.transform = `translateY(${(cpu.current / H) * 100}cqh) translateY(-50%)`;
  };
  useEffect(paint);

  const reset = () => {
    ball.current = { x: W / 2, y: H / 2, vx: 0.17, vy: 0.1 };
    you.current = H / 2; cpu.current = H / 2;
    tally.current = [0, 0];
    setScore([0, 0]); setState('run');
  };

  useKeys({
    ArrowUp: () => { you.current = Math.max(PAD / 2, you.current - 15); paint(); },
    ArrowDown: () => { you.current = Math.min(H - PAD / 2, you.current + 15); paint(); },
  }, state === 'run');

  useLoop((dt) => {
    const b = ball.current;
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.y < 5 || b.y > H - 5) b.vy *= -1;
    // Deliberately imperfect: a paddle that never misses never loses.
    cpu.current += Math.max(-0.085 * dt, Math.min(0.085 * dt, b.y - cpu.current));

    const hit = (py) => b.y > py - PAD / 2 && b.y < py + PAD / 2;
    if (b.x < 16 && b.vx < 0) {
      if (hit(you.current)) { b.vx = Math.abs(b.vx) * 1.04; b.vy += (b.y - you.current) * 0.004; }
      else {
        tally.current = [tally.current[0], tally.current[1] + 1];
        setScore(tally.current);
        b.x = W / 2; b.y = H / 2; b.vx = 0.17;
      }
    }
    if (b.x > W - 16 && b.vx > 0) {
      if (hit(cpu.current)) { b.vx = -Math.abs(b.vx) * 1.04; b.vy += (b.y - cpu.current) * 0.004; }
      else {
        tally.current = [tally.current[0] + 1, tally.current[1]];
        setScore(tally.current);
        if (tally.current[0] >= 7) { setState('over'); submit(tally.current[0] - tally.current[1]); }
        b.x = W / 2; b.y = H / 2; b.vx = -0.17;
      }
    }
    paint();
  }, state === 'run');

  return (
    <Frame
      stats={[{ k: 'YOU', v: score[0] }, { k: 'CPU', v: score[1] }, { k: 'BEST', v: best ?? 0 }]}
      foot={<span className="gm-hint">Arrow keys · first to seven</span>}
    >
      <div className="gm-court">
        {state !== 'run' && (
          <Curtain
            title={state === 'over' ? (score[0] > score[1] ? 'You win' : 'CPU wins') : 'Pong'}
            sub={state === 'over' ? `${score[0]} – ${score[1]}` : 'First to seven'}
            action={state === 'over' ? 'Rematch' : 'Start'}
            onAction={reset}
          />
        )}
        <span className="gm-net" />
        <span ref={youEl} className="gm-paddle gm-paddle--l" />
        <span ref={cpuEl} className="gm-paddle gm-paddle--r" />
        <span ref={ballEl} className="gm-ball" />
      </div>
    </Frame>
  );
}

/* ══ 3 · BREAKOUT ═════════════════════════════════════════════════════ */
const COLS = 8, ROWS = 4;
export function Breakout() {
  const W = 320, H = 220;
  const [state, setState] = useState('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [bricks, setBricks] = useState(() => Array(COLS * ROWS).fill(true));
  const [best, submit] = useBest('breakout');
  const ball = useRef({ x: W / 2, y: H - 40, vx: 0.15, vy: -0.19 });
  const pad = useRef(W / 2);
  const ballEl = useRef(null);
  const padEl = useRef(null);
  // Read by the loop so no setState updater has to do anything but return.
  const wall = useRef(Array(COLS * ROWS).fill(true));
  const pts = useRef(0);
  const lifeRef = useRef(3);

  const paint = () => {
    const b = ball.current;
    if (ballEl.current) ballEl.current.style.transform =
      `translate(${(b.x / W) * 100}cqw, ${(b.y / H) * 100}cqh) translate(-50%,-50%)`;
    if (padEl.current) padEl.current.style.transform = `translateX(${(pad.current / W) * 100}cqw) translateX(-50%)`;
  };
  useEffect(paint);

  const reset = () => {
    wall.current = Array(COLS * ROWS).fill(true);
    pts.current = 0; lifeRef.current = 3;
    setBricks(wall.current); setScore(0); setLives(3);
    ball.current = { x: W / 2, y: H - 40, vx: 0.15, vy: -0.19 };
    pad.current = W / 2; setState('run');
  };

  useKeys({
    ArrowLeft: () => { pad.current = Math.max(32, pad.current - 20); paint(); },
    ArrowRight: () => { pad.current = Math.min(W - 32, pad.current + 20); paint(); },
  }, state === 'run');

  useLoop((dt) => {
    const b = ball.current;
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < 5 || b.x > W - 5) b.vx *= -1;
    if (b.y < 5) b.vy = Math.abs(b.vy);

    if (b.y > H - 20 && b.y < H - 8 && Math.abs(b.x - pad.current) < 34 && b.vy > 0) {
      b.vy = -Math.abs(b.vy);
      b.vx += (b.x - pad.current) * 0.004;
    }
    if (b.y > H) {
      lifeRef.current -= 1;
      setLives(Math.max(0, lifeRef.current));
      if (lifeRef.current <= 0) { setState('over'); submit(pts.current); }
      b.x = W / 2; b.y = H - 40; b.vy = -0.19; b.vx = 0.15;
    }

    const col = Math.floor(b.x / (W / COLS));
    const row = Math.floor((b.y - 16) / 18);
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      const i = row * COLS + col;
      if (wall.current[i]) {
        const next = [...wall.current];
        next[i] = false;
        wall.current = next;
        b.vy *= -1;
        pts.current += 10;
        setBricks(next);
        setScore(pts.current);
        if (next.every((x) => !x)) { setState('over'); submit(pts.current); }
      }
    }
    paint();
  }, state === 'run');

  return (
    <Frame
      stats={[{ k: 'SCORE', v: score }, { k: 'LIVES', v: '●'.repeat(lives) || '—' }, { k: 'BEST', v: best ?? 0 }]}
      foot={<span className="gm-hint">Arrow keys to slide the paddle</span>}
    >
      <div className="gm-court gm-brk">
        {state !== 'run' && (
          <Curtain
            title={state === 'over' ? `${score} points` : 'Breakout'}
            sub={state === 'over' ? (bricks.every((x) => !x) ? 'Wall cleared' : 'Out of lives') : 'Thirty-two bricks, three lives'}
            action={state === 'over' ? 'Again' : 'Start'}
            onAction={reset}
          />
        )}
        {bricks.map((alive, i) => alive && (
          <span key={i} className="gm-brick"
                style={{ '--c': i % COLS, '--r': Math.floor(i / COLS) }} />
        ))}
        <span ref={padEl} className="gm-pad" />
        <span ref={ballEl} className="gm-ball" />
      </div>
    </Frame>
  );
}

/* ══ 4 · 2048 ═════════════════════════════════════════════════════════ */
const emptyGrid = () => Array(16).fill(0);
function spawn(g) {
  const free = g.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  if (!free.length) return g;
  const next = [...g];
  next[free[Math.floor(Math.random() * free.length)]] = Math.random() < 0.9 ? 2 : 4;
  return next;
}
function slide(row) {
  const vals = row.filter(Boolean);
  const out = [];
  let gained = 0;
  for (let i = 0; i < vals.length; i++) {
    if (vals[i] === vals[i + 1]) { out.push(vals[i] * 2); gained += vals[i] * 2; i++; }
    else out.push(vals[i]);
  }
  while (out.length < 4) out.push(0);
  return { row: out, gained };
}
export function Game2048() {
  const [grid, setGrid] = useState(() => spawn(spawn(emptyGrid())));
  const [score, setScore] = useState(0);
  const [best, submit] = useBest('g2048');
  const [dead, setDead] = useState(false);

  /* The move used to run entirely inside a setGrid updater — spawning a
     random tile, scoring and ending the game from a function React runs
     twice in development. It reads refs now and sets state once. */
  const gridRef = useRef(grid);
  const scoreRef = useRef(0);

  const move = useCallback((dir) => {
    const prev = gridRef.current;
    const read = (r, c) => {
      if (dir === 'L') return prev[r * 4 + c];
      if (dir === 'R') return prev[r * 4 + (3 - c)];
      if (dir === 'U') return prev[c * 4 + r];
      return prev[(3 - c) * 4 + r];
    };
    const next = [...prev];
    let gained = 0;
    let moved = false;
    for (let r = 0; r < 4; r++) {
      const line = [0, 1, 2, 3].map((c) => read(r, c));
      const res = slide(line);
      gained += res.gained;
      for (let c = 0; c < 4; c++) {
        if (line[c] !== res.row[c]) moved = true;
        const i = dir === 'L' ? r * 4 + c
          : dir === 'R' ? r * 4 + (3 - c)
          : dir === 'U' ? c * 4 + r
          : (3 - c) * 4 + r;
        next[i] = res.row[c];
      }
    }
    if (!moved) return;

    const grown = spawn(next);
    gridRef.current = grown;
    setGrid(grown);
    if (gained) { scoreRef.current += gained; setScore(scoreRef.current); }

    // Dead when nothing is empty and no neighbour matches.
    const stuck = grown.every(Boolean) && grown.every((v, i) => {
      const r = Math.floor(i / 4), c = i % 4;
      return (c === 3 || grown[i + 1] !== v) && (r === 3 || grown[i + 4] !== v);
    });
    if (stuck) { setDead(true); submit(scoreRef.current); }
  }, [submit]);

  useKeys({
    ArrowLeft: () => move('L'), ArrowRight: () => move('R'),
    ArrowUp: () => move('U'), ArrowDown: () => move('D'),
    a: () => move('L'), d: () => move('R'), w: () => move('U'), s: () => move('D'),
  }, !dead);

  const restart = () => {
    const g = spawn(spawn(emptyGrid()));
    gridRef.current = g; scoreRef.current = 0;
    setGrid(g); setScore(0); setDead(false);
  };

  return (
    <Frame
      stats={[{ k: 'SCORE', v: score }, { k: 'BEST', v: best ?? 0 }]}
      foot={<span className="gm-hint">Arrow keys to slide · merge equal tiles</span>}
    >
      <div className="gm-2048">
        {dead && <Curtain title={`${score} points`} sub="No moves left" action="Again" onAction={restart} />}
        {grid.map((v, i) => (
          <span key={i} className={`gm-tile${v ? ' is-on' : ''}`} data-v={v || ''}>{v || ''}</span>
        ))}
      </div>
    </Frame>
  );
}

/* ══ 5 · MINESWEEPER ══════════════════════════════════════════════════ */
const MS = 9, MINES = 10;

function buildMines(first) {
  const set = new Set();
  while (set.size < MINES) {
    const i = Math.floor(Math.random() * MS * MS);
    if (i !== first) set.add(i);
  }
  return set;
}
const near = (i, m) => {
  const r = Math.floor(i / MS), c = i % MS;
  let n = 0;
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const rr = r + dr, cc = c + dc;
    if (rr < 0 || cc < 0 || rr >= MS || cc >= MS) continue;
    if (m.has(rr * MS + cc)) n++;
  }
  return n;
};
/* Module scope and pure: it builds a new Set from the old one rather
   than mutating anything the component holds, which is both correct and
   what lets the compiler leave it alone. */
function flood(openSet, start, mines) {
  const next = new Set(openSet);
  const stack = [start];
  while (stack.length) {
    const cur = stack.pop();
    if (next.has(cur)) continue;
    next.add(cur);
    if (near(cur, mines) !== 0) continue;
    const r = Math.floor(cur / MS), c = cur % MS;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= MS || cc >= MS) continue;
      stack.push(rr * MS + cc);
    }
  }
  return next;
}

export function Minesweeper() {
  const [mines, setMines] = useState(null);
  const [open, setOpen] = useState(() => new Set());
  const [flags, setFlags] = useState(() => new Set());
  const [state, setState] = useState('idle');
  const [secs, setSecs] = useState(0);
  const [best, submit] = useBest('mines', 'low');

  /* The clock lives entirely in this effect, so nothing reads the wall
     clock from an event handler or the render path. */
  useEffect(() => {
    if (state !== 'run') return undefined;
    const started = Date.now();
    const id = setInterval(() => setSecs(Math.round((Date.now() - started) / 1000)), 400);
    return () => clearInterval(id);
  }, [state]);

  const reveal = (i) => {
    if (state === 'over' || state === 'won' || flags.has(i)) return;
    let m = mines;
    if (!m) { m = buildMines(i); setMines(m); setState('run'); setSecs(0); }
    if (m.has(i)) { setState('over'); setOpen(new Set([...open, i])); return; }
    const next = flood(open, i, m);
    setOpen(next);
    if (next.size === MS * MS - MINES) { setState('won'); submit(secs); }
  };

  const flag = (e, i) => {
    e.preventDefault();
    if (open.has(i) || state === 'over' || state === 'won') return;
    const n = new Set(flags);
    if (n.has(i)) n.delete(i); else n.add(i);
    setFlags(n);
  };

  const restart = () => {
    setMines(null); setOpen(new Set()); setFlags(new Set());
    setState('idle'); setSecs(0);
  };

  return (
    <Frame
      stats={[{ k: 'MINES', v: MINES - flags.size }, { k: 'TIME', v: `${secs}s` }, { k: 'BEST', v: best ? `${best}s` : '—' }]}
      foot={<span className="gm-hint">Click to clear · right-click to flag</span>}
    >
      <div className="gm-mines" style={{ '--n': MS }}>
        {(state === 'over' || state === 'won') && (
          <Curtain
            title={state === 'won' ? `Cleared in ${secs}s` : 'Boom'}
            sub={state === 'won' ? 'Every square accounted for' : 'That one was a mine'}
            action="Again"
            onAction={restart}
          />
        )}
        {Array.from({ length: MS * MS }, (_, i) => {
          const isOpen = open.has(i);
          const n = mines && isOpen ? near(i, mines) : 0;
          const boom = Boolean(mines?.has(i) && isOpen);
          return (
            <button
              key={i}
              className={`gm-ms${isOpen ? ' is-open' : ''}${boom ? ' is-boom' : ''}`}
              data-n={isOpen && n ? n : ''}
              onClick={() => reveal(i)}
              onContextMenu={(e) => flag(e, i)}
            >
              {boom ? '✳' : flags.has(i) && !isOpen ? '⚑' : isOpen && n ? n : ''}
            </button>
          );
        })}
      </div>
    </Frame>
  );
}

/* ══ 6 · SIMON ════════════════════════════════════════════════════════ */
const PADS = [0, 1, 2, 3];
export function Simon() {
  const [seq, setSeq] = useState([]);
  const [step, setStep] = useState(0);
  const [lit, setLit] = useState(-1);
  const [turn, setTurn] = useState('idle');   // idle | show | you | over
  const [best, submit] = useBest('simon');
  const timers = useRef([]);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clear, []);

  const show = useCallback((s) => {
    setTurn('show');
    clear();
    s.forEach((p, i) => {
      timers.current.push(setTimeout(() => setLit(p), 600 * i + 260));
      timers.current.push(setTimeout(() => setLit(-1), 600 * i + 620));
    });
    timers.current.push(setTimeout(() => { setTurn('you'); setStep(0); }, 600 * s.length + 320));
  }, []);

  const grow = useCallback((from) => {
    const next = [...from, PADS[Math.floor(Math.random() * 4)]];
    setSeq(next);
    show(next);
  }, [show]);

  const press = (p) => {
    if (turn !== 'you') return;
    setLit(p);
    timers.current.push(setTimeout(() => setLit(-1), 180));
    if (seq[step] !== p) { setTurn('over'); submit(seq.length - 1); return; }
    if (step + 1 === seq.length) { timers.current.push(setTimeout(() => grow(seq), 520)); return; }
    setStep(step + 1);
  };

  return (
    <Frame
      stats={[{ k: 'ROUND', v: Math.max(0, seq.length) }, { k: 'BEST', v: best ?? 0 }]}
      foot={<span className="gm-hint">{turn === 'show' ? 'Watch…' : turn === 'you' ? 'Your turn' : 'Repeat the sequence'}</span>}
    >
      <div className="gm-simon">
        {(turn === 'idle' || turn === 'over') && (
          <Curtain
            title={turn === 'over' ? `Round ${seq.length - 1}` : 'Simon'}
            sub={turn === 'over' ? 'Wrong pad' : 'Repeat the pattern back'}
            action={turn === 'over' ? 'Again' : 'Start'}
            onAction={() => { setSeq([]); setStep(0); grow([]); }}
          />
        )}
        {PADS.map((p) => (
          <button key={p} className={`gm-pad-btn gm-pad-${p}${lit === p ? ' is-lit' : ''}`}
                  onClick={() => press(p)} aria-label={`Pad ${p + 1}`} />
        ))}
      </div>
    </Frame>
  );
}

/* ══ 7 · TIC TAC TOE ══════════════════════════════════════════════════ */
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const winnerOf = (b) => {
  for (const l of LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return { who: b[l[0]], line: l };
  return b.every(Boolean) ? { who: 'draw', line: [] } : null;
};
export function TicTacToe() {
  const [board, setBoard] = useState(() => Array(9).fill(''));
  const [busy, setBusy] = useState(false);
  const [wins, submit] = useBest('ttt');
  const [tally, setTally] = useState(0);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const res = winnerOf(board);

  const aiMove = useCallback((b) => {
    const free = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    // Win, else block, else centre, else corner. Enough to be annoying.
    for (const who of ['O', 'X']) {
      for (const l of LINES) {
        const vals = l.map((i) => b[i]);
        if (vals.filter((v) => v === who).length === 2 && vals.includes('')) {
          return l[vals.indexOf('')];
        }
      }
    }
    if (b[4] === '') return 4;
    const corners = [0, 2, 6, 8].filter((i) => b[i] === '');
    return corners.length ? corners[Math.floor(Math.random() * corners.length)]
      : free[Math.floor(Math.random() * free.length)];
  }, []);

  const play = (i) => {
    if (board[i] || res || busy) return;
    const next = [...board];
    next[i] = 'X';
    setBoard(next);
    const done = winnerOf(next);
    if (done) { if (done.who === 'X') { const t = tally + 1; setTally(t); submit(t); } return; }
    setBusy(true);
    timer.current = setTimeout(() => {
      const after = [...next];
      after[aiMove(next)] = 'O';
      setBoard(after);
      setBusy(false);
    }, 340);
  };

  return (
    <Frame
      stats={[{ k: 'WINS', v: tally }, { k: 'BEST RUN', v: wins ?? 0 }]}
      foot={<span className="gm-hint">You are X</span>}
    >
      <div className="gm-ttt">
        {res && (
          <Curtain
            title={res.who === 'draw' ? 'Draw' : res.who === 'X' ? 'You win' : 'CPU wins'}
            sub={res.who === 'X' ? `${tally} in a row` : 'Try the centre first'}
            action="Again"
            onAction={() => { setBoard(Array(9).fill('')); if (res.who !== 'X') setTally(0); }}
          />
        )}
        {board.map((v, i) => (
          <button key={i} className={`gm-ttt-c${res?.line.includes(i) ? ' is-win' : ''}`}
                  onClick={() => play(i)} aria-label={`Square ${i + 1}`}>{v}</button>
        ))}
      </div>
    </Frame>
  );
}

/* ══ 8 · REACTION ═════════════════════════════════════════════════════ */
export function Reaction() {
  const [state, setState] = useState('idle');
  const [ms, setMs] = useState(0);
  const start = useRef(0);
  const timer = useRef(0);
  const [best, submit] = useBest('reaction', 'low');

  useEffect(() => () => clearTimeout(timer.current), []);

  const hit = () => {
    if (state === 'idle' || state === 'result' || state === 'foul') {
      setState('wait');
      // Randomised so the delay can never be learned and pre-empted.
      timer.current = setTimeout(() => { start.current = performance.now(); setState('go'); },
        1400 + Math.random() * 2600);
      return;
    }
    if (state === 'wait') { clearTimeout(timer.current); setState('foul'); return; }
    if (state === 'go') {
      const took = Math.round(performance.now() - start.current);
      setMs(took); submit(took); setState('result');
    }
  };

  const copy = {
    idle:   ['Tap to start', 'Wait for green'],
    wait:   ['Wait…', 'Not yet'],
    go:     ['NOW', 'Tap'],
    result: [`${ms} ms`, best === ms ? 'New personal best' : `Best ${best} ms`],
    foul:   ['Too soon', 'Tap to try again'],
  }[state];

  return (
    <Frame stats={[{ k: 'LAST', v: ms ? `${ms}ms` : '—' }, { k: 'BEST', v: best ? `${best}ms` : '—' }]}>
      <button className={`gm-react is-${state}`} onClick={hit}>
        <strong>{copy[0]}</strong>
        <span>{copy[1]}</span>
      </button>
    </Frame>
  );
}

/* ══ 9 · FRAME PERFECT ════════════════════════════════════════════════ */
export function FramePerfect() {
  const [x, setX] = useState(0);
  const [speed, setSpeed] = useState(0.9);
  const [streak, setStreak] = useState(0);
  const [msg, setMsg] = useState(null);
  const [running, setRunning] = useState(true);
  const dir = useRef(1);
  const pos = useRef(0);
  const [best, submit] = useBest('frame');
  const TARGET = 50, BAND = 4.5;

  useLoop((dt) => {
    pos.current += dir.current * speed * (dt / 16.67);
    if (pos.current >= 100) { pos.current = 100; dir.current = -1; }
    if (pos.current <= 0) { pos.current = 0; dir.current = 1; }
    setX(pos.current);
  }, running);

  const cut = () => {
    if (!running) { setRunning(true); setMsg(null); return; }
    setRunning(false);
    const off = Math.abs(pos.current - TARGET);
    if (off <= BAND) {
      const n = streak + 1;
      setStreak(n); submit(n);
      setSpeed((s) => Math.min(4.4, s * 1.18));
      setMsg(off <= 1.2 ? ['FRAME PERFECT', 'dead on the marker'] : ['Cut', `${off.toFixed(1)} frames off`]);
    } else {
      setMsg(['Missed', `${off.toFixed(1)} frames off · streak was ${streak}`]);
      setStreak(0); setSpeed(0.9);
    }
  };

  return (
    <Frame
      stats={[{ k: 'STREAK', v: streak }, { k: 'BEST', v: best ?? 0 }]}
      foot={<Btn onClick={cut}>{running ? 'Cut' : 'Roll'}</Btn>}
    >
      <div className="gm-frame">
        <div className="gm-frame-track" onClick={cut} role="button" tabIndex={0}
             onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); cut(); } }}>
          <span className="gm-frame-band" style={{ left: `${TARGET - BAND}%`, width: `${BAND * 2}%` }} />
          <span className="gm-frame-mark" style={{ left: `${TARGET}%` }} />
          <span className="gm-frame-head" style={{ left: `${x}%` }} />
          {Array.from({ length: 21 }, (_, i) => <i key={i} className="gm-frame-tick" style={{ left: `${i * 5}%` }} />)}
        </div>
        <div className={`gm-frame-out${msg ? ' is-in' : ''}`}>
          {msg && <><strong>{msg[0]}</strong><span>{msg[1]}</span></>}
        </div>
      </div>
    </Frame>
  );
}

/* ══ 10 · COLOUR MATCH ════════════════════════════════════════════════ */
export function ColourMatch() {
  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(3);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 9973));
  const [shake, setShake] = useState(-1);
  const [best, submit] = useBest('colour');

  const { size, odd, base, delta } = useMemo(() => {
    const n = Math.min(6, 2 + Math.floor(round / 2));
    const h = (seed * 1103515245 + 12345) >>> 8;
    return { size: n, odd: h % (n * n), base: (h >>> 7) % 360, delta: Math.max(2.4, 26 - round * 1.6) };
  }, [round, seed]);

  const pick = (i) => {
    if (lives <= 0) return;
    if (i === odd) { submit(round); setRound((r) => r + 1); setSeed((v) => v + 1); }
    else {
      setShake(i); setTimeout(() => setShake(-1), 380);
      setLives((l) => l - 1);
    }
  };
  const restart = () => { setRound(1); setLives(3); setSeed((v) => v + 1); };

  return (
    <Frame
      stats={[{ k: 'ROUND', v: round }, { k: 'LIVES', v: '●'.repeat(Math.max(0, lives)) || '—' }, { k: 'BEST', v: best ?? 0 }]}
      foot={<span className="gm-hint">Find the odd colour out</span>}
    >
      <div className="gm-colour" style={{ '--n': size }}>
        {lives <= 0 && <Curtain title={`Round ${round}`} sub="Out of lives" action="Again" onAction={restart} />}
        {Array.from({ length: size * size }, (_, i) => (
          <button key={i} className={`gm-swatch${shake === i ? ' is-wrong' : ''}`}
                  style={{ background: `oklch(62% 0.16 ${base + (i === odd ? delta : 0)})` }}
                  onClick={() => pick(i)} aria-label={`Tile ${i + 1}`} />
        ))}
      </div>
    </Frame>
  );
}

/* ══ 11 · MEMORY ══════════════════════════════════════════════════════ */
const PAIRS = ['◆', '●', '▲', '■', '★', '⬟', '✦', '⬢'];
export function Memory() {
  const build = useCallback(() => {
    const cards = [...PAIRS, ...PAIRS].map((f) => ({ f, k: Math.random() }));
    cards.sort((a, b) => a.k - b.k);
    return cards.map((c, i) => ({ id: i, face: c.f, done: false }));
  }, []);
  const [deck, setDeck] = useState(build);
  const [open, setOpen] = useState([]);
  const [moves, setMoves] = useState(0);
  const [best, submit] = useBest('memory', 'low');
  const lock = useRef(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const won = deck.every((c) => c.done);

  const flip = (i) => {
    if (lock.current || open.includes(i) || deck[i].done) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next;
    if (deck[a].face === deck[b].face) {
      const done = deck.map((c, j) => (j === a || j === b ? { ...c, done: true } : c));
      setDeck(done); setOpen([]);
      if (done.every((c) => c.done)) submit(moves + 1);
      return;
    }
    lock.current = true;
    timer.current = setTimeout(() => { setOpen([]); lock.current = false; }, 700);
  };

  return (
    <Frame
      stats={[{ k: 'MOVES', v: moves }, { k: 'BEST', v: best ?? '—' }]}
      foot={<span className="gm-hint">Match all eight pairs</span>}
    >
      <div className="gm-mem">
        {won && (
          <Curtain title={`${moves} moves`} sub="Board cleared" action="Again"
                   onAction={() => { setDeck(build()); setOpen([]); setMoves(0); }} />
        )}
        {deck.map((c, i) => {
          const up = open.includes(i) || c.done;
          return (
            <button key={c.id} className={`gm-card${up ? ' is-up' : ''}${c.done ? ' is-done' : ''}`}
                    onClick={() => flip(i)} aria-label={up ? c.face : 'Hidden'}>
              <span className="gm-card-in">
                <span className="gm-card-back" />
                <span className="gm-card-face">{c.face}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Frame>
  );
}

/* ══ 12 · BUG HUNT ════════════════════════════════════════════════════ */
export function BugHunt() {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(20);
  const [score, setScore] = useState(0);
  const [bug, setBug] = useState({ x: 50, y: 50 });
  const [best, submit] = useBest('bugs');
  // The clock reads this instead of nesting a setState in its updater.
  const hitsRef = useRef(0);

  const move = useCallback(() => {
    setBug({ x: 10 + Math.random() * 80, y: 12 + Math.random() * 76 });
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    let n = 20;
    const t = setInterval(() => {
      n -= 1;
      setLeft(Math.max(0, n));
      if (n <= 0) { setRunning(false); submit(hitsRef.current); }
    }, 1000);
    return () => clearInterval(t);
  }, [running, submit]);

  const start = () => { hitsRef.current = 0; setScore(0); setLeft(20); setRunning(true); move(); };

  return (
    <Frame
      stats={[{ k: 'SQUASHED', v: score }, { k: 'TIME', v: `${left}s` }, { k: 'BEST', v: best ?? 0 }]}
      foot={<span className="gm-hint">Twenty seconds. Tap fast.</span>}
    >
      <div className="gm-field">
        {!running && (
          <Curtain
            title={left === 0 ? `${score} squashed` : 'Bug Hunt'}
            sub={left === 0 ? 'Time' : 'Twenty seconds on the clock'}
            action={left === 0 ? 'Again' : 'Start'}
            onAction={start}
          />
        )}
        {running && (
          <button
            className="gm-bug"
            style={{ left: `${bug.x}%`, top: `${bug.y}%`,
                     // Shrinks with the clock: the pressure is time and
                     // target size at once.
                     transform: `translate(-50%,-50%) scale(${0.55 + (left / 20) * 0.55})` }}
            onClick={(e) => { e.stopPropagation(); hitsRef.current += 1; setScore(hitsRef.current); move(); }}
            aria-label="Squash"
          />
        )}
      </div>
    </Frame>
  );
}

/* ══ 13 · SPIN THE WHEEL ══════════════════════════════════════════════ */
const WHEEL = [
  { label: 'Hire me',      note: 'obviously the right answer',   hue: 28  },
  { label: 'Free edit',    note: 'one reel, on the house',       hue: 355 },
  { label: 'Nothing',      note: 'brutal. spin again',           hue: 240 },
  { label: 'Coffee chat',  note: '30 minutes, no pitch',         hue: 150 },
  { label: 'A prompt',     note: 'one that actually works',      hue: 275 },
  { label: 'Colour grade', note: 'on your worst-lit clip',       hue: 195 },
  { label: 'Try again',    note: 'the wheel is not sorry',       hue: 320 },
  { label: 'Jackpot',      note: 'full project, mates rates',    hue: 100 },
];
export function SpinWheel() {
  const cv = useRef(null);
  const angle = useRef(0);
  const raf = useRef(0);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [spins, submit] = useBest('wheel');

  const draw = useCallback(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const R = c.width / 2;
    const step = (Math.PI * 2) / WHEEL.length;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.translate(R, R);
    ctx.rotate(angle.current);
    WHEEL.forEach((seg, i) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R - 5, i * step, i * step + step);
      ctx.closePath();
      ctx.fillStyle = `oklch(${i % 2 ? 62 : 54}% 0.17 ${seg.hue})`;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      ctx.rotate(i * step + step / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#0b0b0c';
      ctx.font = `700 ${Math.round(R * 0.085)}px -apple-system, Inter, sans-serif`;
      ctx.fillText(seg.label.toUpperCase(), R - 22, 0);
      ctx.restore();
    });
    ctx.restore();
    ctx.beginPath();
    ctx.arc(R, R, R * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = '#0b0b0c';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.24)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    /* The winner is chosen first and the landing angle derived from it.
       Reading whatever it stopped on invites off-by-one at the boundary. */
    const win = Math.floor(Math.random() * WHEEL.length);
    const step = (Math.PI * 2) / WHEEL.length;
    const to = (Math.PI * 1.5) - win * step - step / 2 + (5 + Math.floor(Math.random() * 3)) * Math.PI * 2;
    const from = angle.current % (Math.PI * 2);
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / 4000);
      angle.current = from + (to - from) * (1 - Math.pow(1 - t, 5));
      draw();
      if (t < 1) { raf.current = requestAnimationFrame(tick); return; }
      setSpinning(false);
      setResult(WHEEL[win]);
      submit((spins ?? 0) + 1);
    };
    raf.current = requestAnimationFrame(tick);
  };

  return (
    <Frame
      stats={[{ k: 'SPINS', v: spins ?? 0 }]}
      foot={<Btn onClick={spin} disabled={spinning}>{spinning ? 'Spinning…' : result ? 'Spin again' : 'Spin'}</Btn>}
    >
      <div className="gm-wheel">
        <span className="gm-wheel-pin" />
        <canvas ref={cv} width={560} height={560} className="gm-wheel-cv" />
        <div className={`gm-wheel-out${result ? ' is-in' : ''}`}>
          {result && <><strong style={{ color: `oklch(74% 0.18 ${result.hue})` }}>{result.label}</strong><span>{result.note}</span></>}
        </div>
      </div>
    </Frame>
  );
}

/* ══ 14 · TYPING SPEED ════════════════════════════════════════════════ */
const PASSAGE = ('the quick edit cuts silence into rhythm and every frame earns its place '
  + 'colour is a decision not a filter and the grade nobody notices is the one that worked '
  + 'ship it then find out what was wrong because a finished thing beats a perfect plan').split(' ');

export function TypingSpeed() {
  const [typed, setTyped] = useState('');
  const [startedAt, setStartedAt] = useState(0);
  const [left, setLeft] = useState(30);
  const [state, setState] = useState('idle');
  const [wpm, setWpm] = useState(0);
  const [acc, setAcc] = useState(100);
  const [best, submit] = useBest('typing');
  const inputRef = useRef(null);

  const target = useMemo(() => PASSAGE.join(' '), []);

  /* Scored inside the tick that reaches zero, not in an effect reacting
     to the state change — reacting would score one render late and could
     fire again on any unrelated re-render. Latest values come from refs
     because the interval closes over the ones it was created with. */
  const typedRef = useRef(typed);
  useEffect(() => { typedRef.current = typed; });
  const startRef = useRef(startedAt);
  useEffect(() => { startRef.current = startedAt; });

  useEffect(() => {
    if (state !== 'run') return undefined;
    let n = 30;
    const id = setInterval(() => {
      n -= 1;
      setLeft(Math.max(0, n));
      if (n > 0) return;
      const t = typedRef.current;
      const mins = (Date.now() - startRef.current) / 60000;
      const right = t.split('').filter((c, i) => c === target[i]).length;
      const w = Math.max(0, Math.round((right / 5) / Math.max(mins, 0.01)));
      setWpm(w);
      setAcc(t.length ? Math.round((right / t.length) * 100) : 100);
      submit(w);
      setState('done');
    }, 1000);
    return () => clearInterval(id);
  }, [state, target, submit]);

  const onType = (e) => {
    if (state === 'done') return;
    if (state === 'idle') { setState('run'); setStartedAt(Date.now()); }
    setTyped(e.target.value.slice(0, target.length));
  };

  const restart = () => {
    setTyped(''); setLeft(30); setState('idle'); setWpm(0); setAcc(100);
    inputRef.current?.focus();
  };

  return (
    <Frame
      stats={[{ k: 'WPM', v: state === 'done' ? wpm : '—' }, { k: 'TIME', v: `${left}s` }, { k: 'BEST', v: best ?? 0 }]}
      foot={<span className="gm-hint">Start typing — the clock begins on the first key</span>}
    >
      <div className="gm-type" onClick={() => inputRef.current?.focus()}>
        {state === 'done' && (
          <Curtain title={`${wpm} wpm`} sub={`${acc}% accurate`} action="Again" onAction={restart} />
        )}
        <p className="gm-type-text">
          {target.split('').map((ch, i) => {
            const done = i < typed.length;
            const ok = done && typed[i] === ch;
            return (
              <span key={i} className={done ? (ok ? 'is-ok' : 'is-bad') : (i === typed.length ? 'is-cur' : '')}>
                {ch}
              </span>
            );
          })}
        </p>
        {/* Off-screen but focused: the passage above is the real display,
            and a visible input would show the same text twice. */}
        <input ref={inputRef} className="gm-type-in" value={typed} onChange={onType}
               autoComplete="off" spellCheck="false" aria-label="Type the passage" />
      </div>
    </Frame>
  );
}

/* ══ 15 · AIM TRAINER ═════════════════════════════════════════════════ */
const TARGETS = 25;
export function AimTrainer() {
  const [hits, setHits] = useState(0);
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const [state, setState] = useState('idle');
  const [startedAt, setStartedAt] = useState(0);
  const [took, setTook] = useState(0);
  const [best, submit] = useBest('aim', 'low');

  const move = useCallback(() => {
    setSpot({ x: 12 + Math.random() * 76, y: 14 + Math.random() * 72 });
  }, []);

  const start = () => { setHits(0); setState('run'); setStartedAt(Date.now()); move(); };

  const hit = () => {
    const n = hits + 1;
    setHits(n);
    if (n >= TARGETS) {
      const t = Math.round((Date.now() - startedAt) / 100) / 10;
      setTook(t); setState('done'); submit(t);
      return;
    }
    move();
  };

  return (
    <Frame
      stats={[{ k: 'HITS', v: `${hits}/${TARGETS}` }, { k: 'BEST', v: best ? `${best}s` : '—' }]}
      foot={<span className="gm-hint">Hit {TARGETS} targets as fast as you can</span>}
    >
      <div className="gm-aim">
        {state !== 'run' && (
          <Curtain
            title={state === 'done' ? `${took}s` : 'Aim Trainer'}
            sub={state === 'done' ? `${TARGETS} targets` : `${TARGETS} targets, one at a time`}
            action={state === 'done' ? 'Again' : 'Start'}
            onAction={start}
          />
        )}
        {state === 'run' && (
          <button className="gm-target" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  onClick={hit} aria-label="Target" />
        )}
      </div>
    </Frame>
  );
}

/* ══ 16 · NUMBER MEMORY ═══════════════════════════════════════════════ */
export function NumberMemory() {
  const [level, setLevel] = useState(1);
  const [digits, setDigits] = useState('');
  const [entry, setEntry] = useState('');
  const [phase, setPhase] = useState('idle');   // idle | show | type | over
  const [best, submit] = useBest('numbers');
  const inputRef = useRef(null);

  const begin = useCallback((n) => {
    let d = '';
    for (let i = 0; i < n; i++) d += Math.floor(Math.random() * 10);
    setDigits(d); setEntry(''); setPhase('show');
  }, []);

  useEffect(() => {
    if (phase !== 'show') return undefined;
    // A little longer for each extra digit, so the task stays the memory
    // and not the reading.
    const id = setTimeout(() => { setPhase('type'); inputRef.current?.focus(); }, 900 + digits.length * 380);
    return () => clearTimeout(id);
  }, [phase, digits]);

  const submitEntry = (e) => {
    e.preventDefault();
    if (entry === digits) { const n = level + 1; setLevel(n); submit(level); begin(n); }
    else { setPhase('over'); submit(level - 1); }
  };

  return (
    <Frame
      stats={[{ k: 'DIGITS', v: level }, { k: 'BEST', v: best ?? 0 }]}
      foot={<span className="gm-hint">{phase === 'show' ? 'Memorise…' : 'Type it back'}</span>}
    >
      <div className="gm-num">
        {(phase === 'idle' || phase === 'over') && (
          <Curtain
            title={phase === 'over' ? `${level - 1} digits` : 'Number Memory'}
            sub={phase === 'over' ? `It was ${digits}` : 'One more digit every round'}
            action={phase === 'over' ? 'Again' : 'Start'}
            onAction={() => { setLevel(1); begin(1); }}
          />
        )}
        {phase === 'show' && <strong className="gm-num-show">{digits}</strong>}
        {phase === 'type' && (
          <form onSubmit={submitEntry} className="gm-num-form">
            <input ref={inputRef} className="gm-num-in" inputMode="numeric" value={entry}
                   onChange={(e) => setEntry(e.target.value.replace(/\D/g, ''))}
                   aria-label="Type the number" />
            <Btn type="submit">Check</Btn>
          </form>
        )}
      </div>
    </Frame>
  );
}

/* ══ 17 · CHIMP TEST ══════════════════════════════════════════════════ */
export function ChimpTest() {
  const [count, setCount] = useState(4);
  const [cells, setCells] = useState([]);
  const [next, setNext] = useState(1);
  const [phase, setPhase] = useState('idle');   // idle | play | over
  const [best, submit] = useBest('chimp');

  const deal = useCallback((n) => {
    const spots = [];
    while (spots.length < n) {
      const c = { x: 6 + Math.random() * 78, y: 8 + Math.random() * 74 };
      if (spots.every((s) => Math.hypot(s.x - c.x, s.y - c.y) > 18)) spots.push(c);
    }
    setCells(spots.map((s, i) => ({ ...s, n: i + 1 })));
    setNext(1); setPhase('play');
  }, []);

  const tap = (n) => {
    if (n !== next) { setPhase('over'); submit(count - 1); return; }
    if (n === count) { const c = count + 1; setCount(c); submit(count); deal(c); return; }
    setNext(n + 1);
  };

  return (
    <Frame
      stats={[{ k: 'NUMBERS', v: count }, { k: 'BEST', v: best ?? 0 }]}
      foot={<span className="gm-hint">Tap them in order — they hide after the first</span>}
    >
      <div className="gm-chimp">
        {phase !== 'play' && (
          <Curtain
            title={phase === 'over' ? `${count - 1} numbers` : 'Chimp Test'}
            sub={phase === 'over' ? 'Wrong order' : 'They vanish once you start'}
            action={phase === 'over' ? 'Again' : 'Start'}
            onAction={() => { setCount(4); deal(4); }}
          />
        )}
        {cells.map((c) => (
          <button key={c.n} className={`gm-chimp-c${next > 1 && c.n >= next ? ' is-blank' : ''}`}
                  style={{ left: `${c.x}%`, top: `${c.y}%` }}
                  onClick={() => tap(c.n)} aria-label={`Number ${c.n}`}>
            {next > 1 && c.n >= next ? '' : c.n}
          </button>
        ))}
      </div>
    </Frame>
  );
}
