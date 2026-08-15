import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './TerminalWindow.css';
import { useMusicPlayer } from './MusicContext';
import { toggleSpidey } from './spideyBus';

// ── Terminal session lines ────────────────────────────────────────────────────

const LINES = [
  { type: 'meta',  text: 'Last login: Sat May 24 10:28:41 on ttys002' },
  { type: 'blank' },
  { type: 'cmd',   prompt: 'kishore@Kishores-MacBook-Pro ~ %', text: 'cd Documents/coding/"My Portfolio"/app-scaffold' },
  { type: 'blank' },
  { type: 'cmd',   prompt: 'kishore@Kishores-MacBook-Pro app-scaffold %', text: 'npm install framer-motion' },
  { type: 'out',   text: 'added 11 packages, and audited 248 packages in 3.4s' },
  { type: 'out',   text: '' },
  { type: 'out',   text: '3 packages are looking for funding' },
  { type: 'out',   text: '  run `npm fund` for details' },
  { type: 'out',   text: '' },
  { type: 'ok',    text: 'found 0 vulnerabilities' },
  { type: 'blank' },
  { type: 'cmd',   prompt: 'kishore@Kishores-MacBook-Pro app-scaffold %', text: 'git log --oneline -7' },
  { type: 'log',   hash: 'a2f1c9e', ref: '(HEAD -> main)', msg: 'feat: add Notes, Terminal & Calculator windows' },
  { type: 'log',   hash: 'b7e3d12', ref: '',               msg: 'feat: iTunes-style Music window with sidebar' },
  { type: 'log',   hash: 'c4a8f20', ref: '',               msg: 'feat: macOS dock with cosine magnification' },
  { type: 'log',   hash: 'd1b5e8a', ref: '',               msg: 'feat: multiple FinderWindows via createPortal' },
  { type: 'log',   hash: 'e9c3f17', ref: '',               msg: 'feat: TicTacToe AI with minimax algorithm' },
  { type: 'log',   hash: 'f3a8b21', ref: '',               msg: 'feat: animated notification list widget' },
  { type: 'log',   hash: 'g9d2c04', ref: '',               msg: 'init: Vite + React scaffold' },
  { type: 'blank' },
  { type: 'cmd',   prompt: 'kishore@Kishores-MacBook-Pro app-scaffold %', text: 'npm run dev' },
  { type: 'blank' },
  { type: 'out',   text: '> app-scaffold@0.0.0 dev' },
  { type: 'out',   text: '> vite' },
  { type: 'blank' },
  { type: 'vite',  text: '  VITE v8.0.9  ready in 297 ms' },
  { type: 'blank' },
  { type: 'url',   text: '  ➜  Local:   http://localhost:5173/' },
  { type: 'dim',   text: '  ➜  Network: use --host to expose' },
  { type: 'dim',   text: '  ➜  type help + enter to show commands' },
  { type: 'blank' },
  { type: 'prompt' }, // blinking cursor line
];

function Line({ line }) {
  if (line.type === 'blank')  return <div className="trm-blank" />;
  if (line.type === 'meta')   return <div className="trm-meta">{line.text}</div>;
  if (line.type === 'out')    return <div className="trm-out">{line.text || ' '}</div>;
  if (line.type === 'ok')     return <div className="trm-ok">{line.text}</div>;
  if (line.type === 'vite')   return <div className="trm-vite">{line.text}</div>;
  if (line.type === 'url')    return <div className="trm-url">{line.text}</div>;
  if (line.type === 'dim')    return <div className="trm-dim">{line.text}</div>;
  if (line.type === 'prompt') return (
    <div className="trm-cmd">
      <span className="trm-prompt">kishore@Kishores-MacBook-Pro app-scaffold %</span>
      {' '}
      <span className="trm-cursor" aria-hidden="true" />
    </div>
  );
  if (line.type === 'log') return (
    <div className="trm-log">
      <span className="trm-hash">{line.hash}</span>
      {line.ref && <span className="trm-ref"> {line.ref}</span>}
      <span className="trm-msg"> {line.msg}</span>
    </div>
  );
  // cmd
  return (
    <div className="trm-cmd">
      <span className="trm-prompt">{line.prompt}</span>
      {' '}
      <span className="trm-input">{line.text}</span>
    </div>
  );
}

// ── Content ───────────────────────────────────────────────────────────────────
// The terminal used to be a still picture of a terminal. It takes input now:
// some commands print, some genuinely drive the site (theme, music, routing),
// and a few are doors you have to find.

const PROMPT = 'kishore@Kishores-MacBook-Pro app-scaffold %';

const PAGES = ['about', 'video', 'room', 'ai', 'web', 'skills'];
const SECTIONS = {
  home: '.hue-hero', about: '#about', team: '#team', work: '#work',
  notes: '#notes', suite: '#suite', contact: '#contact',
};

/* The wallet is meant to be found, not advertised. `ls` hides it, `ls -a`
   shows it, `cat .wallet.key` gives the passphrase, `wallet` asks for it. */
const WALLET_PASS = 'finalcut';

const FILES = {
  'readme.md':    ['# KishoreditX', 'Cuts, colour and code. Everything here was made by hand', 'or by a machine I told exactly what to do.'],
  'stack.txt':    ['premiere · resolve · after effects', 'comfyui · midjourney · stable diffusion', 'react · three · gsap'],
  '.wallet.key':  ['-----BEGIN FRAME WALLET KEY-----', 'passphrase: finalcut', '-----END FRAME WALLET KEY-----'],
  '.secrets':     ['every timeline is 40% waiting for a render', 'the best cut is the one nobody notices'],
};

const FORTUNES = [
  'Cut on motion. Always cut on motion.',
  'If the edit works muted, the sound design is a gift, not a crutch.',
  'The audience forgives a soft frame. Never a soft pace.',
  'Colour is the last 10% that everyone notices.',
  'Render early. Render often. Render before you are tired.',
  'A good cut is invisible. A great cut is inevitable.',
];

const ORACLE = [
  'Ship it.', 'Cut 8 frames off the head.', 'That transition is doing too much.',
  'Sleep on it, then delete the first 20 seconds.', 'The client will ask for it in blue.',
  'Yes — but grade it warmer.', 'No. And you already knew that.',
];

const NEOFETCH = [
  { type: 'accent', text: '        ▄▄▄▄▄▄▄        kish@kishoreditx' },
  { type: 'accent', text: '     ▄█████████▄      ─────────────────' },
  { type: 'out',    text: '    ███  ▀█▀  ███     OS      Personal OS 2026' },
  { type: 'out',    text: '    ███   █   ███     Shell   zsh 5.9' },
  { type: 'out',    text: '    ███  ▄█▄  ███     Role    AI Editor · Colourist' },
  { type: 'accent', text: '     ▀█████████▀      Uptime  5 years, 200+ projects' },
  { type: 'accent', text: '        ▀▀▀▀▀▀▀        Render  94% · 4K ProRes' },
];

const HELP = [
  { type: 'blank' },
  { type: 'ok',   text: '  SITE' },
  { type: 'out',  text: '    open <id>       about · video · room · ai · web · skills' },
  { type: 'out',  text: '    goto <section>  home · about · team · work · notes · suite · contact' },
  { type: 'out',  text: '    theme [d|l]     switch the colour theme' },
  { type: 'out',  text: '    music <cmd>     play · pause · next · prev · now' },
  { type: 'out',  text: '    warn            trigger the security notice' },
  { type: 'out',  text: '    spidey          hang him off the right of the page' },
  { type: 'blank' },
  { type: 'ok',   text: '  FILES' },
  { type: 'out',  text: '    ls [-a]         list files (some are hidden)' },
  { type: 'out',  text: '    cat <file>      read one' },
  { type: 'blank' },
  { type: 'ok',   text: '  TOYS' },
  { type: 'out',  text: '    neofetch  matrix  render  scan  coffee  fortune' },
  { type: 'out',  text: '    ask <question>  echo <text>  date  history' },
  { type: 'blank' },
  { type: 'dim',  text: '  Some commands are not listed. Try looking around.' },
  { type: 'blank' },
];

// ── Window ────────────────────────────────────────────────────────────────────
// ── Window ────────────────────────────────────────────────────────────────────

function TerminalWindow({ visible, onClose }) {
  const bodyRef  = useRef(null);
  const inputRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [value, setValue]     = useState('');
  /* When a command needs an answer it parks a handler here; Enter routes to
     it instead of the parser until it resolves. That is what makes `wallet`
     and `hire` conversations rather than one-shot prints. */
  const [ask, setAsk] = useState(null);

  const aliveRef  = useRef(true);
  const typedRef  = useRef([]);          // command history for `history`
  const unlockRef = useRef(false);       // wallet stays open once opened
  const music     = useMusicPlayer();

  /* Re-arm on mount, not just disarm on unmount. StrictMode runs
     mount → cleanup → mount, so a cleanup-only version latches false on
     the first simulated unmount and never recovers — which silently made
     write() a no-op for the whole dev session. */
  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  const write = useCallback((lines) => {
    if (!aliveRef.current) return;
    setHistory((h) => [...h, ...(Array.isArray(lines) ? lines : [lines])]);
  }, []);

  // Prints one line at a time so long output arrives like a real process.
  const typeOut = useCallback((lines, step = 90) => {
    lines.forEach((line, i) => {
      setTimeout(() => write(line), i * step);
    });
    return lines.length * step;
  }, [write]);

  const run = useCallback((raw) => {
    const input = raw.trim();
    const [cmd, ...args] = input.replace(/^-+/, '').toLowerCase().split(/\s+/);
    const rest = input.replace(/^\s*\S+\s*/, '');
    write([{ type: 'cmd', prompt: PROMPT, text: input }]);
    if (!input) return;
    typedRef.current.push(input);

    const say  = (t, type = 'out') => write([{ type, text: '  ' + t }]);
    const fail = (t) => say(t, 'warn');

    switch (cmd) {
      // ── the unlisted door ──
      case 'adminunlock':
        say('✔ admin unlocked — opening dashboard', 'ok');
        say('sign in with your Firebase account to continue', 'dim');
        setTimeout(() => { window.location.hash = '#/admin'; onClose(); }, 420);
        return;

      case 'help': case 'h': return write(HELP);
      case 'clear': case 'c': return setHistory([{ type: 'clear' }]);
      case 'exit': case 'quit': say('closing…', 'dim'); return setTimeout(onClose, 300);

      case 'whoami':
        return write([
          { type: 'out',  text: '  kish — AI editor, colourist, visual storyteller' },
          { type: 'dim',  text: '  chennai · ist · open for work' },
        ]);

      case 'neofetch': return typeOut(NEOFETCH, 70);
      case 'date':     return say(new Date().toString());
      case 'echo':     return say(rest || '');
      case 'fortune':  return say(FORTUNES[Math.floor(Math.random() * FORTUNES.length)], 'accent');

      case 'ask': case 'oracle':
        if (!rest) return fail('ask what? try: ask should I cut this scene');
        say('…consulting the timeline gods', 'dim');
        setTimeout(() => say(ORACLE[Math.floor(Math.random() * ORACLE.length)], 'accent'), 700);
        return;

      case 'history':
        return write(typedRef.current.length
          ? typedRef.current.map((c, i) => ({ type: 'out', text: `  ${String(i + 1).padStart(3)}  ${c}` }))
          : [{ type: 'dim', text: '  nothing yet' }]);

      // ── files ──
      case 'ls': {
        const all = args.includes('a') || args.includes('-a') || rest.includes('-a');
        const shown = Object.keys(FILES).filter((f) => all || !f.startsWith('.'));
        write([{ type: 'out', text: '  hero/  about/  work/  notes/  personal-os/  contact/' }]);
        write([{ type: all ? 'accent' : 'out', text: '  ' + shown.join('   ') }]);
        if (!all) write([{ type: 'dim', text: '  (2 hidden — ls -a)' }]);
        return;
      }
      case 'cat': {
        const f = rest.trim().toLowerCase();
        if (!f) return fail('cat what?');
        if (!FILES[f]) return fail(`cat: ${f}: No such file or directory`);
        return write(FILES[f].map((l) => ({ type: f.startsWith('.') ? 'accent' : 'out', text: '  ' + l })));
      }

      // ── the hidden wallet ──
      case 'wallet':
        if (unlockRef.current) return showWallet();
        say('frame wallet · locked', 'warn');
        setAsk({
          label: 'passphrase:',
          mask: true,
          onAnswer: (a) => {
            if (a.trim().toLowerCase() === WALLET_PASS) {
              unlockRef.current = true;
              say('✔ unlocked', 'ok');
              setTimeout(showWallet, 260);
            } else {
              fail('✖ denied — the key is lying around here somewhere');
            }
          },
        });
        return;

      // ── conversational brief ──
      case 'hire': {
        const brief = {};
        const q3 = () => setAsk({ label: 'budget range?', onAnswer: (a) => {
          brief.budget = a;
          write([
            { type: 'blank' },
            { type: 'ok',  text: '  ── brief captured ──' },
            { type: 'out', text: `  name    ${brief.name}` },
            { type: 'out', text: `  project ${brief.project}` },
            { type: 'out', text: `  budget  ${brief.budget}` },
            { type: 'dim', text: '  opening the contact form so you can send it…' },
          ]);
          setTimeout(() => { goto('contact'); onClose(); }, 900);
        } });
        const q2 = () => setAsk({ label: 'what are you making?', onAnswer: (a) => { brief.project = a; q3(); } });
        say('let us take a brief. three questions.', 'ok');
        setAsk({ label: 'your name?', onAnswer: (a) => { brief.name = a; q2(); } });
        return;
      }

      // ── things that actually drive the site ──
      case 'music': {
        const sub = args[0] || 'now';
        if (sub === 'play')  { music.setPlaying(true);  return say(`▶ ${music.song?.title || 'playing'}`, 'ok'); }
        if (sub === 'pause') { music.setPlaying(false); return say('⏸ paused', 'ok'); }
        if (sub === 'next')  { music.next(); return say('⏭ next track', 'ok'); }
        if (sub === 'prev')  { music.prev(); return say('⏮ previous track', 'ok'); }
        return say(`♪ ${music.song?.title || '—'} — ${music.song?.artist || ''}${music.playing ? ' (playing)' : ' (paused)'}`);
      }

      case 'open': {
        const id = args[0];
        if (!PAGES.includes(id)) return fail(`open: unknown page '${args[0] || ''}' — try ${PAGES.join(', ')}`);
        say(`✔ opening ${id}`, 'ok');
        setTimeout(() => { window.location.hash = `#/${id}`; onClose(); }, 300);
        return;
      }

      case 'goto': {
        const id = args[0];
        if (!SECTIONS[id]) return fail(`goto: unknown section — try ${Object.keys(SECTIONS).join(', ')}`);
        say(`↓ ${id}`, 'ok');
        setTimeout(() => { goto(id); onClose(); }, 300);
        return;
      }

      case 'spidey': {
        const down = toggleSpidey({ mode: 'page' });
        say(down
          ? '🕷  friendly neighbourhood dropped in — run `spidey` again to send him home'
          : '🕷  spidey swung off', down ? 'ok' : 'dim');
        return;
      }

      case 'warn':
        say('⚠ raising security notice', 'warn');
        setTimeout(() => { window.dispatchEvent(new CustomEvent('kish:warn')); onClose(); }, 350);
        return;

      // ── toys ──
      case 'matrix': {
        const glyphs = 'アイウエオカキクケコｱｲｳ01<>/\\|=+*';
        const rows = Array.from({ length: 12 }, () =>
          ({ type: 'accent', text: '  ' + Array.from({ length: 54 }, () => glyphs[Math.floor(Math.random() * glyphs.length)]).join('') }));
        typeOut(rows, 65);
        setTimeout(() => say('wake up, editor.', 'ok'), rows.length * 65 + 200);
        return;
      }

      case 'render': {
        const name = rest || 'GOLDEN_HOUR_v07';
        const frames = [0, 12, 28, 41, 55, 63, 78, 89, 96, 100];
        say(`rendering ${name}.mov · 4K ProRes 422`, 'dim');
        frames.forEach((pct, i) => setTimeout(() => {
          const filled = Math.round(pct / 4);
          write([{ type: pct === 100 ? 'ok' : 'out',
                   text: `  [${'█'.repeat(filled)}${'░'.repeat(25 - filled)}] ${String(pct).padStart(3)}%` }]);
          if (pct === 100) write([{ type: 'ok', text: '  ✔ done — 00:02:14:06 written to /exports' }]);
        }, 260 + i * 220));
        return;
      }

      case 'scan': {
        const found = [
          { type: 'out', text: '  scanning portfolio…' },
          { type: 'ok',  text: '  ✔ 122 images catalogued' },
          { type: 'ok',  text: '  ✔ 9 sections responding' },
          { type: 'warn',text: '  ! 1 nav link points at #projects, which does not exist' },
          { type: 'ok',  text: '  ✔ 0 unhandled errors' },
          { type: 'dim', text: '  scan complete in 1.4s' },
        ];
        return typeOut(found, 260);
      }

      case 'coffee':
        return typeOut([
          { type: 'dim',    text: '        ( (' },
          { type: 'dim',    text: '         ) )' },
          { type: 'accent', text: '      ........' },
          { type: 'accent', text: '      |      |]' },
          { type: 'accent', text: '      \\      /' },
          { type: 'accent', text: '       `----\'' },
          { type: 'ok',     text: '  brewed. now go finish the cut.' },
        ], 130);

      // ── jokes ──
      case 'sudo':
        return fail(`kish is not in the sudoers file. This incident has been reported.`);
      case 'rm':
        if (rest.includes('/')) {
          say('rm: refusing to remove the entire portfolio', 'warn');
          return say('nice try', 'dim');
        }
        return fail('rm: missing operand');

      default:
        return fail(`zsh: command not found: ${cmd}`);
    }

    function goto(id) {
      const sc = document.getElementById('main-scroll');
      const el = document.querySelector(SECTIONS[id]);
      if (sc && el) sc.scrollTop += el.getBoundingClientRect().top;
    }

    function showWallet() {
      write([
        { type: 'blank' },
        { type: 'accent', text: '  ┌─ FRAME WALLET ─────────────────────────┐' },
        { type: 'accent', text: '  │  balance      1,284,900 frames         │' },
        { type: 'accent', text: '  │  delivered      200 projects           │' },
        { type: 'accent', text: '  │  reach           1.2M views            │' },
        { type: 'accent', text: '  │  coffee        ∞ (overdrawn)           │' },
        { type: 'accent', text: '  └────────────────────────────────────────┘' },
        { type: 'dim',    text: '  every frame in here was paid for in hours.' },
        { type: 'blank' },
      ]);
    }
  }, [write, typeOut, onClose, music]);

  const onKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    const v = value;
    setValue('');
    if (ask) {
      // Echo the answer, masked if the question asked for it.
      write([{ type: 'cmd', prompt: ask.label, text: ask.mask ? '•'.repeat(v.length) : v }]);
      const { onAnswer } = ask;
      setAsk(null);
      onAnswer(v);
      return;
    }
    run(v);
  };

  // Stick to the bottom as output arrives.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [history]);

  // Focus the prompt whenever the window is shown.
  useEffect(() => {
    if (visible) inputRef.current?.focus();
  }, [visible]);

  // Drag
  const [pos, setPos]   = useState({ x: 20, y: 60 });
  const [grab, setGrab] = useState(false);
  const dr = useRef({ on: false, sx: 0, sy: 0, px: 0, py: 0 });

  const onGrab = (e) => {
    if (e.target.closest('button')) return;
    dr.current = { on: true, sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
    setGrab(true); e.preventDefault();
  };

  useEffect(() => {
    const mv = (e) => {
      if (!dr.current.on) return;
      const { sx, sy, px, py } = dr.current;
      setPos({ x: px + e.clientX - sx, y: py + e.clientY - sy });
    };
    const up = () => { if (dr.current.on) { dr.current.on = false; setGrab(false); } };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
  }, []);

  return createPortal(
    <div
      className={`trm-window${!visible ? ' trm-window--hidden' : ''}`}
      style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
    >
      {/* Title bar */}
      <div className="trm-titlebar" onMouseDown={onGrab} style={{ cursor: grab ? 'grabbing' : 'grab' }}>
        <div className="wg-fn-lights">
          <button className="wg-fn-light wg-fn-red"    onClick={onClose} aria-label="Close" />
          <button className="wg-fn-light wg-fn-yellow" aria-label="Minimise" />
          <button className="wg-fn-light wg-fn-green"  aria-label="Full screen" />
        </div>
        <div className="trm-tab-bar">
          <div className="trm-tab trm-tab--active">
            <span className="trm-tab-icon">⌘</span>
            zsh — app-scaffold — 120×34
          </div>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Terminal body — click anywhere to focus the prompt */}
      <div className="trm-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
        <div className="trm-lines">
          {(history.some((l) => l.type === 'clear')
            ? history.slice(history.findIndex((l) => l.type === 'clear') + 1)
            : [...LINES, ...history]
          ).map((line, i) => <Line key={i} line={line} />)}

          {/* Live prompt */}
          <div className="trm-cmd">
            <span className={`trm-prompt${ask ? ' trm-prompt--ask' : ''}`}>{ask ? ask.label : PROMPT}</span>
            {' '}
            <input
              ref={inputRef}
              className="trm-entry"
              type={ask?.mask ? 'password' : 'text'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              aria-label="Terminal input"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Self-contained manager ────────────────────────────────────────────────────

export function TerminalWindowManager() {
  const [open,    setOpen]    = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.app !== 'terminal') return;
      setOpen(true); setVisible(true);
      window.dispatchEvent(new CustomEvent('macdock:running', { detail: { app: 'terminal', running: true } }));
    };
    window.addEventListener('macdock:open', handler);
    return () => window.removeEventListener('macdock:open', handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.dispatchEvent(new CustomEvent('macdock:running', { detail: { app: 'terminal', running: false } }));
  };

  if (!open) return null;
  return <TerminalWindow visible={visible} onClose={handleClose} />;
}
