import { useRef, useEffect, useState } from 'react';
import { useContent, withImages } from './content/store';
import './MacDock.css';

const DEFAULT_APPS = [
  { id: 'finder',     name: 'Finder',     icon: 'https://cdn.jim-nielsen.com/macos/1024/finder-2021-09-10.png?rf=1024',     action: { app: 'finder',  view: 'applications' } },
  { id: 'safari',     name: 'Safari',     icon: 'https://cdn.jim-nielsen.com/macos/1024/safari-2021-06-02.png?rf=1024',     action: { app: 'video' } },
  { id: 'photos',     name: 'Photos',     icon: 'https://cdn.jim-nielsen.com/macos/1024/photos-2021-05-28.png?rf=1024',     action: { app: 'finder',  view: 'works' } },
  { id: 'music',      name: 'Music',      icon: 'https://cdn.jim-nielsen.com/macos/1024/music-2021-05-25.png?rf=1024',      action: { app: 'music' } },
  { id: 'mail',       name: 'Mail',       icon: 'https://cdn.jim-nielsen.com/macos/1024/mail-2021-05-25.png?rf=1024',       action: { app: 'about' } },
  { id: 'notes',      name: 'Notes',      icon: 'https://cdn.jim-nielsen.com/macos/1024/notes-2021-05-25.png?rf=1024',      action: { app: 'notes'      } },
  { id: 'terminal',   name: 'Terminal',   icon: 'https://cdn.jim-nielsen.com/macos/1024/terminal-2021-06-03.png?rf=1024',   action: { app: 'terminal'   } },
  { id: 'calculator', name: 'Calculator', icon: 'https://cdn.jim-nielsen.com/macos/1024/calculator-2021-04-29.png?rf=1024', action: { app: 'calculator' } },
];

const ICON  = 46;
const SCALE = 1.72;
const RANGE = 160;
const LERP  = 0.18;

export default function MacDock() {
  const APPS = withImages(DEFAULT_APPS, useContent('images.dock', null), 'icon');
  const [visible,  setVisible]  = useState(false);
  const [bouncing, setBouncing] = useState(null);
  const [running,  setRunning]  = useState(new Set());

  const mouseYRef = useRef(-9999);
  const scaleRef  = useRef(APPS.map(() => 1));
  const itemRefs  = useRef([]);
  const rafRef    = useRef(null);
  const hideTimer = useRef(null);

  // RAF loop — batch reads then batch writes to avoid layout thrashing
  useEffect(() => {
    const tick = () => {
      const my    = mouseYRef.current;
      const rects = itemRefs.current.map(el => el?.getBoundingClientRect() ?? null);

      APPS.forEach((_, i) => {
        const el = itemRefs.current[i];
        const rc = rects[i];
        if (!el || !rc) return;

        const cy   = rc.top + rc.height / 2;
        const dist = Math.abs(my - cy);
        let target = 1;
        if (dist < RANGE) {
          const theta = (1 - dist / RANGE) * Math.PI;
          target = 1 + ((1 - Math.cos(theta)) / 2) * (SCALE - 1);
        }

        const cur  = scaleRef.current[i];
        const next = cur + (target - cur) * LERP;
        if (Math.abs(next - cur) > 0.0005) {
          scaleRef.current[i] = next;
          const px = next * ICON;
          el.style.width  = `${px}px`;
          el.style.height = `${px}px`;
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Global mouse → show / hide dock
  useEffect(() => {
    const onMove = (e) => {
      mouseYRef.current = e.clientY;
      if (e.clientX < 82) {
        clearTimeout(hideTimer.current);
        setVisible(true);
      } else {
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => {
          setVisible(false);
          mouseYRef.current = -9999;
        }, 1600);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      clearTimeout(hideTimer.current);
    };
  }, []);

  // Track which windows are open (dot indicators)
  useEffect(() => {
    const handler = (e) => {
      const { app, running: isRunning } = e.detail || {};
      if (!app) return;
      setRunning(prev => {
        const next = new Set(prev);
        isRunning ? next.add(app) : next.delete(app);
        return next;
      });
    };
    window.addEventListener('macdock:running', handler);
    return () => window.removeEventListener('macdock:running', handler);
  }, []);

  const handleClick = (app) => {
    setBouncing(app.id);
    setTimeout(() => setBouncing(prev => (prev === app.id ? null : prev)), 580);
    window.dispatchEvent(new CustomEvent('macdock:open', { detail: app.action }));
  };

  return (
    <nav
      className={`mac-dock${visible ? ' mac-dock--vis' : ''}`}
      aria-label="Application dock"
    >
      <ul className="mac-dock-list">
        {APPS.map((app, i) => (
          <li
            key={app.id}
            className={`mac-dock-item${bouncing === app.id ? ' mac-dock-item--bounce' : ''}`}
            ref={el => { itemRefs.current[i] = el; }}
            style={{ width: ICON, height: ICON }}
          >
            <button
              className="mac-dock-btn"
              onClick={() => handleClick(app)}
              aria-label={app.name}
            >
              <img
                className="mac-dock-icon"
                src={app.icon}
                alt=""
                draggable={false}
              />
            </button>
            <span className="mac-dock-tooltip" aria-hidden="true">{app.name}</span>
            {running.has(app.id) && (
              <span className="mac-dock-dot" aria-hidden="true" />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
