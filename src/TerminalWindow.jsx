import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './TerminalWindow.css';

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

// ── Commands ──────────────────────────────────────────────────────────────────
// The terminal used to be a still picture of a terminal. It takes input now,
// because the admin panel is reached by typing `adminunlock` into it — an
// unlisted door rather than a link anyone can find in the nav.

const PROMPT = 'kishore@Kishores-MacBook-Pro app-scaffold %';

const HELP = [
  { type: 'out', text: '' },
  { type: 'ok',  text: '  Available commands' },
  { type: 'out', text: '    help          this list' },
  { type: 'out', text: '    whoami        who is running this' },
  { type: 'out', text: '    ls            what is in here' },
  { type: 'out', text: '    open <id>     about · video · room · ai · web · skills' },
  { type: 'out', text: '    clear         wipe the scrollback' },
  { type: 'out', text: '' },
];

const PAGES = ['about', 'video', 'room', 'ai', 'web', 'skills'];

// ── Window ────────────────────────────────────────────────────────────────────

function TerminalWindow({ visible, onClose }) {
  const bodyRef  = useRef(null);
  const inputRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [value, setValue]     = useState('');

  const write = (lines) => setHistory((h) => [...h, ...lines]);

  const run = (raw) => {
    // `-adminunlock`, `--adminunlock` and `adminunlock` all work.
    const input = raw.trim();
    const [cmd, ...args] = input.replace(/^-+/, '').toLowerCase().split(/\s+/);
    write([{ type: 'cmd', prompt: PROMPT, text: input }]);
    if (!cmd) return;

    if (cmd === 'adminunlock') {
      write([
        { type: 'ok',  text: '  ✔ admin unlocked — opening dashboard' },
        { type: 'dim', text: '  sign in with your Firebase account to continue' },
      ]);
      // Let the line paint before the route swap tears the window down.
      setTimeout(() => { window.location.hash = '#/admin'; onClose(); }, 420);
      return;
    }
    if (cmd === 'help' || cmd === 'h')  return write(HELP);
    if (cmd === 'clear' || cmd === 'c') return setHistory([{ type: 'clear' }]);
    if (cmd === 'whoami') return write([{ type: 'out', text: '  kish — AI editor, visual storyteller' }]);
    if (cmd === 'ls') return write([
      { type: 'out', text: '  hero/  about/  work/  notes/  personal-os/  contact/' },
    ]);
    if (cmd === 'open') {
      const id = args[0];
      if (!PAGES.includes(id)) {
        return write([{ type: 'out', text: `  open: unknown page '${args[0] || ''}' — try ${PAGES.join(', ')}` }]);
      }
      write([{ type: 'ok', text: `  ✔ opening ${id}` }]);
      setTimeout(() => { window.location.hash = `#/${id}`; onClose(); }, 300);
      return;
    }
    write([{ type: 'out', text: `  zsh: command not found: ${cmd}` }]);
  };

  const onKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    run(value);
    setValue('');
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
            <span className="trm-prompt">{PROMPT}</span>
            {' '}
            <input
              ref={inputRef}
              className="trm-entry"
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
