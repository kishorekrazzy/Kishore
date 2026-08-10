import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './NotesWindow.css';

// ── Note data ─────────────────────────────────────────────────────────────────

const NOTES = [
  {
    id: 1,
    title: 'About Me',
    date: 'Today at 11:42 AM',
    folder: 'Portfolio',
    preview: 'Full-stack creative based in Chennai…',
    body: [
      { type: 'h1',   text: 'Kishore' },
      { type: 'sub',  text: 'Full-Stack Creative  ·  Chennai, India' },
      { type: 'rule' },
      { type: 'p',    text: 'I craft visual stories at the intersection of technology and art — from cinematic edits and AI-generated worlds to seamless web experiences that perform as beautifully as they look.' },
      { type: 'h2',   text: 'Expertise' },
      { type: 'li',   text: 'Video Editing & Color Grading — 5+ years' },
      { type: 'li',   text: 'AI Image Generation & Prompting' },
      { type: 'li',   text: 'Web Design & Development (React, Vite, CSS)' },
      { type: 'li',   text: 'Motion Graphics & Visual FX' },
      { type: 'li',   text: 'Photography & Composition' },
      { type: 'h2',   text: 'Numbers' },
      { type: 'li',   text: '>100 projects delivered across films, brands & digital' },
      { type: 'li',   text: '>500 AI images generated' },
      { type: 'li',   text: '>30 websites designed & built' },
      { type: 'rule' },
      { type: 'h2',   text: 'Status' },
      { type: 'tag',  text: '⚡ Open to Work — Freelance & Full-Time Roles' },
      { type: 'h2',   text: 'Contact' },
      { type: 'link', text: 'krazykishore2004@gmail.com' },
      { type: 'link', text: 'instagram @kishoreditx' },
    ],
  },
  {
    id: 2,
    title: 'Project Ideas — 2026',
    date: 'Yesterday at 3:15 PM',
    folder: 'Portfolio',
    preview: '□ AI Video Generator…',
    body: [
      { type: 'h1',  text: 'Project Ideas — 2026' },
      { type: 'rule' },
      { type: 'h2',  text: 'In Progress' },
      { type: 'cb',  done: true,  text: 'Portfolio v3 with interactive widgets' },
      { type: 'cb',  done: true,  text: 'macOS Finder interface inside portfolio' },
      { type: 'cb',  done: false, text: 'AI Video Generator — Stable Diffusion + ControlNet' },
      { type: 'cb',  done: false, text: 'Portfolio v4 — 3D WebGL with Three.js' },
      { type: 'h2',  text: 'Content' },
      { type: 'cb',  done: false, text: 'Color Grade Preset Pack (LUT Bundle)' },
      { type: 'cb',  done: false, text: 'Motion Design System — After Effects templates' },
      { type: 'cb',  done: false, text: 'Shorts Algorithm Study — visual performance research' },
      { type: 'h2',  text: 'Tools to Explore' },
      { type: 'li',  text: 'ComfyUI workflows for batch generation' },
      { type: 'li',  text: 'Remotion — video editing in React' },
      { type: 'li',  text: 'Lottie animations for web' },
    ],
  },
  {
    id: 3,
    title: 'Quick Notes',
    date: 'May 23',
    folder: 'Personal',
    preview: '→ Update reel with 2026 projects…',
    body: [
      { type: 'h1',  text: 'Quick Notes' },
      { type: 'rule' },
      { type: 'h2',  text: 'Portfolio TODO' },
      { type: 'li',  text: '→ Update showreel with 2026 projects' },
      { type: 'li',  text: '→ Add case studies section' },
      { type: 'li',  text: '→ Mobile optimization pass' },
      { type: 'li',  text: '→ SEO meta tags' },
      { type: 'h2',  text: 'Tools I Use Daily' },
      { type: 'p',   text: 'Premiere Pro · After Effects · Midjourney · Figma · VS Code · Topaz AI · DaVinci Resolve' },
      { type: 'h2',  text: 'Watching' },
      { type: 'li',  text: 'Severance S2' },
      { type: 'li',  text: 'The Bear S3' },
      { type: 'li',  text: 'Slow Horses S5' },
      { type: 'h2',  text: 'Music lately' },
      { type: 'p',   text: 'Hans Zimmer · Ludovico Einaudi · Max Richter · Bonobo' },
    ],
  },
];

function NoteBody({ body }) {
  return (
    <div className="no-body">
      {body.map((item, i) => {
        if (item.type === 'h1')   return <h1 key={i}  className="no-h1">{item.text}</h1>;
        if (item.type === 'h2')   return <h2 key={i}  className="no-h2">{item.text}</h2>;
        if (item.type === 'sub')  return <p  key={i}  className="no-sub">{item.text}</p>;
        if (item.type === 'p')    return <p  key={i}  className="no-p">{item.text}</p>;
        if (item.type === 'rule') return <hr key={i}  className="no-rule" />;
        if (item.type === 'tag')  return <div key={i} className="no-tag">{item.text}</div>;
        if (item.type === 'link') return <p  key={i}  className="no-link">{item.text}</p>;
        if (item.type === 'li')   return (
          <div key={i} className="no-li">
            <span className="no-li-dot" aria-hidden="true">·</span>
            <span>{item.text}</span>
          </div>
        );
        if (item.type === 'cb') return (
          <div key={i} className="no-cb">
            <span className={`no-cb-box${item.done ? ' no-cb-box--done' : ''}`} aria-hidden="true">
              {item.done ? '✓' : ''}
            </span>
            <span className={item.done ? 'no-cb-text--done' : ''}>{item.text}</span>
          </div>
        );
        return null;
      })}
    </div>
  );
}

// ── Window ────────────────────────────────────────────────────────────────────

function NotesWindow({ visible, onClose }) {
  const [activeId, setActiveId] = useState(1);
  const activeNote = NOTES.find(n => n.id === activeId);

  // Drag
  const [pos, setPos]   = useState({ x: -80, y: 30 });
  const [grab, setGrab] = useState(false);
  const dr = useRef({ on: false, sx: 0, sy: 0, px: 0, py: 0 });

  const onGrab = (e) => {
    if (e.target.closest('button') || e.target.closest('.no-list')) return;
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
      className={`no-window${!visible ? ' no-window--hidden' : ''}`}
      style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
    >
      {/* Title bar */}
      <div className="no-titlebar" onMouseDown={onGrab} style={{ cursor: grab ? 'grabbing' : 'grab' }}>
        <div className="wg-fn-lights">
          <button className="wg-fn-light wg-fn-red"    onClick={onClose} aria-label="Close" />
          <button className="wg-fn-light wg-fn-yellow" aria-label="Minimise" />
          <button className="wg-fn-light wg-fn-green"  aria-label="Full screen" />
        </div>
        <span className="no-titlebar-label">Notes</span>
        <div className="no-titlebar-actions">
          <button className="no-hdr-btn" aria-label="New note">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
          <button className="no-hdr-btn" aria-label="Share">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="no-body-wrap">

        {/* Note list */}
        <aside className="no-list">
          <div className="no-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>
            <span>Search</span>
          </div>
          {NOTES.map(n => (
            <button
              key={n.id}
              className={`no-list-item${activeId === n.id ? ' no-list-item--active' : ''}`}
              onClick={() => setActiveId(n.id)}
            >
              <p className="no-list-title">{n.title}</p>
              <p className="no-list-meta">
                <span className="no-list-date">{n.date}</span>
                <span className="no-list-preview"> {n.preview}</span>
              </p>
              <span className="no-list-folder">{n.folder}</span>
            </button>
          ))}
        </aside>

        {/* Note content */}
        <main className="no-content">
          {activeNote && <NoteBody body={activeNote.body} />}
        </main>

      </div>
    </div>,
    document.body
  );
}

// ── Self-contained manager ────────────────────────────────────────────────────

export function NotesWindowManager() {
  const [open,    setOpen]    = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.app !== 'notes') return;
      setOpen(true); setVisible(true);
      window.dispatchEvent(new CustomEvent('macdock:running', { detail: { app: 'notes', running: true } }));
    };
    window.addEventListener('macdock:open', handler);
    return () => window.removeEventListener('macdock:open', handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.dispatchEvent(new CustomEvent('macdock:running', { detail: { app: 'notes', running: false } }));
  };

  if (!open) return null;
  return <NotesWindow visible={visible} onClose={handleClose} />;
}
