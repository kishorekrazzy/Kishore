import { useState, useRef, useEffect, useCallback } from 'react';
import { useContent } from '../content/store';
import { askOpenRouter } from '../services/openrouter';
import { KISHORE_PERSONA } from '../services/persona';
import { tap } from './mobileUtils';
import { Icon } from './ui';
import Sheet from './Sheet';

/* ══════════════════════════════════════════════════════════════════════
   ASK — the assistant, as a phone conversation

   Same model, same persona and the same streaming service the desktop
   chat uses. Rebuilt rather than reused for one concrete reason: the
   desktop panel stands a WebGL robot on its floor, and RobotBot pulls in
   three.js and react-three-fiber — around 600 KB of JavaScript and a
   live GL context, to draw a mascot on a 390pt screen. It also runs a
   cursor-following glow, on a device with no cursor.

   What is left is what the feature actually is: a transcript, a
   composer, and four openers for people who do not know what to ask.
   ══════════════════════════════════════════════════════════════════════ */

const OPENERS = [
  { label: 'The work',  q: 'What has Kishore actually shipped?' },
  { label: 'Process',   q: 'How does he approach an edit?' },
  { label: 'Toolkit',   q: 'What software and tools does he work in?' },
  { label: 'Hire him',  q: 'Is he available, and how does a project start?' },
];

/* The composer grows with the message and then stops, so a long paragraph
   scrolls inside the box rather than pushing the transcript off screen. */
function useAutoGrow(min, max) {
  const ref = useRef(null);
  const grow = useCallback((reset) => {
    const el = ref.current;
    if (!el) return;
    el.style.height = `${min}px`;
    if (reset) return;
    el.style.height = `${Math.max(min, Math.min(el.scrollHeight, max))}px`;
  }, [min, max]);
  return { ref, grow };
}

export default function AskSheet({ onClose }) {
  const greeting = useContent('ai.greeting', 'How can I help today?');
  const persona  = useContent('ai.system', '') || KISHORE_PERSONA;

  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');

  const logRef = useRef(null);
  const abortRef = useRef(null);
  const { ref: taRef, grow } = useAutoGrow(44, 132);

  // Keep the newest message in view as the reply types itself out.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streaming]);

  // A reply still streaming when the sheet closes would keep writing into
  // unmounted state and keep the connection open.
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(async (text) => {
    const q = (text ?? value).trim();
    if (!q || streaming) return;
    tap();

    const next = [...messages, { role: 'user', content: q }];
    setMessages([...next, { role: 'assistant', content: '' }]);
    setValue('');
    grow(true);
    setError('');
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await askOpenRouter({
        messages: next,
        system: persona,
        signal: ctrl.signal,
        onToken: (tok) => setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { role: 'assistant', content: last.content + tok };
          return copy;
        }),
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'That did not go through. Try again in a moment.');
        // Drop the empty placeholder — an assistant bubble with nothing
        // in it reads as a reply that failed silently.
        setMessages((m) => (m[m.length - 1]?.content ? m : m.slice(0, -1)));
      }
    } finally {
      setStreaming(false);
    }
  }, [value, streaming, messages, persona, grow]);

  return (
    <Sheet title="Ask about this" onClose={onClose} height="88dvh">
      <div className="mb-ask">
        {messages.length === 0 ? (
          <div className="mb-ask-empty">
            <span className="mb-ask-orb"><Icon name="spark" size={26} /></span>
            <h3 className="mb-h3">{greeting}</h3>
            <p className="mb-body" style={{ maxWidth: '28ch' }}>
              It answers as Kish — about the work, the process and the tools. Ask anything,
              or start with one of these.
            </p>
            <div className="mb-ask-openers">
              {OPENERS.map((o) => (
                <button key={o.label} className="mb-chip mb-press" onClick={() => send(o.q)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-ask-log" ref={logRef}>
            {messages.map((m, i) => (
              <div key={i} className={`mb-bubble mb-bubble--${m.role}`}>
                {m.content || (
                  <span className="mb-typing" aria-label="Typing"><i /><i /><i /></span>
                )}
              </div>
            ))}
          </div>
        )}

        {error && <p className="mb-form-err" style={{ margin: '0 var(--mb-pad) 10px' }} role="alert">{error}</p>}

        <form
          className="mb-ask-bar"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => { setValue(e.target.value); grow(); }}
            /* Enter sends on a hardware keyboard. On a phone the return
               key inserts a newline — which is what enterKeyHint="send"
               relabels, and what the button is for. */
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !/Mobi|Android/i.test(navigator.userAgent)) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Ask something…"
            enterKeyHint="send"
            aria-label="Your question"
          />
          <button
            type="submit"
            className="mb-ask-send"
            disabled={!value.trim() || streaming}
            aria-label="Send"
          >
            <Icon name="up" size={20} />
          </button>
        </form>
      </div>
    </Sheet>
  );
}
