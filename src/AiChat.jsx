import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ImageIcon, Workflow, MonitorIcon, SendIcon,
  LoaderIcon, Sparkles, Command, Paperclip,
} from 'lucide-react';
// Aliased to uppercase: without the React ESLint plugin, JSX member usage
// like <Motion.div> is not counted as a reference.
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { askOpenRouter } from './services/openrouter';
import { useContent } from './content/store';
import { KISHORE_PERSONA } from './services/persona';
import { lazy, Suspense } from 'react';
const RobotBot = lazy(() => import('./RobotBot'));
import './AiChat.css';

/* ══════════════════════════════════════════════════════════════════════
   AI CHAT

   The React Bits animated chat, adapted to this project's stack: plain
   JSX and real CSS instead of TSX + Tailwind + shadcn. Installing Tailwind
   here would have collided head-on with theme.css — the OKLCH hue system
   and ~6,000 lines of hand-written CSS — for no gain, since the component
   is a single surface.

   The visual design is unchanged: dark glass panel, violet ambient blobs,
   a command palette, and a cursor-following glow while the input is
   focused. What is new is that it talks to a real model.
   ══════════════════════════════════════════════════════════════════════ */

const COMMANDS = [
  { icon: <ImageIcon size={16} />,   label: 'My work',   prefix: '/work',   hint: 'What has Kish actually shipped?' },
  { icon: <Workflow size={16} />,    label: 'Process',   prefix: '/process', hint: 'How does he approach an edit?' },
  { icon: <MonitorIcon size={16} />, label: 'Tools',     prefix: '/tools',  hint: 'What is in the toolkit?' },
  { icon: <Sparkles size={16} />,    label: 'Hire',      prefix: '/hire',   hint: 'Availability and how to start' },
];

// Auto-grow the textarea between a floor and a ceiling.
function useAutoResize(minHeight, maxHeight) {
  const ref = useRef(null);
  const resize = useCallback((reset) => {
    const el = ref.current;
    if (!el) return;
    el.style.height = `${minHeight}px`;
    if (reset) return;
    el.style.height = `${Math.max(minHeight, Math.min(el.scrollHeight, maxHeight))}px`;
  }, [minHeight, maxHeight]);
  return { ref, resize };
}

function TypingDots() {
  return (
    <span className="aic-dots" aria-hidden="true">
      {[0, 1, 2].map((d) => (
        <Motion.i
          key={d}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </span>
  );
}

export default function AiChat({ onClose }) {
  // A blank CMS value means 'not set', so fall through to the built-in.
  const persona = useContent('ai.system', '') || KISHORE_PERSONA;
  const greeting = useContent('ai.greeting', 'How can I help today?');

  const [value, setValue]         = useState('');
  const [messages, setMessages]   = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError]         = useState('');
  const [palettePinned, setPalettePinned] = useState(false);
  const [active, setActive]       = useState(-1);
  /* Derived, not stored. A leading slash opens the palette; the toolbar
     button pins it open. Computing it here avoids setting state from an
     effect, which React 19 flags as a cascading render. */
  const palette = palettePinned || (value.startsWith('/') && !value.includes(' '));
  const [focused, setFocused]     = useState(false);
  const [mouse, setMouse]         = useState({ x: 0, y: 0 });

  const { ref: taRef, resize } = useAutoResize(60, 200);
  const abortRef = useRef(null);
  const logRef   = useRef(null);

  useEffect(() => {
    const move = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !palette) onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, palette]);

  // Keep the transcript pinned to the newest message.
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, streaming]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async () => {
    const text = value.trim();
    if (!text || streaming) return;

    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setValue('');
    resize(true);
    setError('');
    setStreaming(true);

    // Placeholder the tokens stream into.
    setMessages((m) => [...m, { role: 'assistant', content: '' }]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await askOpenRouter({
        messages: next,
        system: persona,
        signal: ctrl.signal,
        onToken: (tok) => {
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = {
              role: 'assistant',
              content: copy[copy.length - 1].content + tok,
            };
            return copy;
          });
        },
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong.');
        // Drop the empty placeholder so the transcript stays clean.
        setMessages((m) => (m[m.length - 1]?.content === '' ? m.slice(0, -1) : m));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const pick = (i) => {
    setValue(`${COMMANDS[i].prefix} `);
    setPalettePinned(false);
    taRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (palette) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((p) => (p < COMMANDS.length - 1 ? p + 1 : 0)); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActive((p) => (p > 0 ? p - 1 : COMMANDS.length - 1)); return; }
      if ((e.key === 'Tab' || e.key === 'Enter') && active >= 0) { e.preventDefault(); pick(active); return; }
      if (e.key === 'Escape')    { e.preventDefault(); setPalettePinned(false); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="aic" role="dialog" aria-modal="true" aria-label="Ask about this portfolio">
      <button className="aic-scrim" onClick={onClose} aria-label="Close chat" tabIndex={-1} />

      {/* Ambient colour, straight from the original design. */}
      <div className="aic-blobs" aria-hidden="true"><i /><i /><i /></div>

      {focused && (
        <Motion.div
          className="aic-cursor-glow"
          aria-hidden="true"
          animate={{ x: mouse.x - 400, y: mouse.y - 400 }}
          transition={{ type: 'spring', damping: 25, stiffness: 150, mass: 0.5 }}
        />
      )}

      <Motion.div
        className="aic-shell"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <button className="aic-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="aic-head">
          <h1>{greeting}</h1>
          <span className="aic-rule" aria-hidden="true" />
          <p>Type a command or ask a question</p>
        </div>

        {messages.length > 0 && (
          <div className="aic-log" ref={logRef}>
            {messages.map((m, i) => (
              <div key={i} className={`aic-msg aic-msg--${m.role}`}>
                {m.content || <TypingDots />}
              </div>
            ))}
          </div>
        )}

        {error && <p className="aic-error" role="alert">{error}</p>}

        <div className="aic-panel">
          <AnimatePresence>
            {palette && (
              <Motion.div
                className="aic-palette"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
              >
                {COMMANDS.map((c, i) => (
                  <button
                    key={c.prefix}
                    className={`aic-pal-row${active === i ? ' is-active' : ''}`}
                    onClick={() => pick(i)}
                  >
                    <span className="aic-pal-icon">{c.icon}</span>
                    <span className="aic-pal-label">{c.label}</span>
                    <span className="aic-pal-prefix">{c.prefix}</span>
                  </button>
                ))}
              </Motion.div>
            )}
          </AnimatePresence>

          <textarea
            ref={taRef}
            className="aic-input"
            value={value}
            rows={1}
            placeholder="Ask about the work, the process, anything…"
            onChange={(e) => { setValue(e.target.value); resize(); }}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

          <div className="aic-bar">
            <div className="aic-bar-left">
              <button className="aic-icon-btn" aria-label="Attach (not wired)" disabled>
                <Paperclip size={16} />
              </button>
              <button
                className={`aic-icon-btn${palette ? ' is-on' : ''}`}
                onClick={() => setPalettePinned((p) => !p)}
                aria-label="Commands"
              >
                <Command size={16} />
              </button>
            </div>

            <button
              className={`aic-send${value.trim() ? ' is-ready' : ''}`}
              onClick={send}
              disabled={streaming || !value.trim()}
            >
              {streaming ? <LoaderIcon size={16} className="aic-spin" /> : <SendIcon size={16} />}
              <span>{streaming ? 'Thinking' : 'Send'}</span>
            </button>
          </div>
        </div>

        <div className="aic-chips">
          {COMMANDS.map((c, i) => (
            <Motion.button
              key={c.prefix}
              className="aic-chip"
              onClick={() => pick(i)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              title={c.hint}
            >
              {c.icon}<span>{c.label}</span>
            </Motion.button>
          ))}
        </div>


        {/* Stands on the floor of the panel, under everything else. The
            contact shadow is what sells it as grounded rather than
            hovering. */}
        <div className="aic-robot" aria-hidden="true">
          <Suspense fallback={null}>
            <RobotBot follow ground scale={1.6} pantallaColor="#8b5cf6" pantallaBrillo={1.35} />
          </Suspense>
        </div>

      </Motion.div>
    </div>
  );
}
