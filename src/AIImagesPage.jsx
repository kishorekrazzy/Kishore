import React, { useState, useEffect, useCallback } from 'react';
import './AIImagesPage.css';
import { useContent } from './content/store';

/* ══════════════════════════════════════════════════════════════════════
   AI IMAGES — bento

   Built to the reference: the type is not a header sitting above a
   gallery, it is a cell inside the same bento as the pictures. Twelve
   columns, explicit spans, one tight gutter throughout.

   Every cell's placement is authored rather than flowed, so the
   composition is identical on every visit and at every reload. The
   breakpoints re-author it rather than letting it reflow into rows.
   ══════════════════════════════════════════════════════════════════════ */

/* col span / row span, in the 12-column bento. Ordered to interleave the
   two text cells among the pictures the way the reference does. */
const CELLS = [
  { k: 'img', c: 4, r: 5 },   // 01  tall, top-right of the type
  { k: 'img', c: 3, r: 4 },   // 02
  { k: 'img', c: 3, r: 6 },   // 03  tall
  { k: 'img', c: 2, r: 4 },   // 04  narrow
  { k: 'img', c: 4, r: 5 },   // 05
  { k: 'img', c: 3, r: 4 },   // 06
  { k: 'img', c: 2, r: 5 },   // 07  narrow tall
  { k: 'img', c: 4, r: 4 },   // 08
  { k: 'img', c: 3, r: 5 },   // 09
  { k: 'img', c: 3, r: 4 },   // 10
  { k: 'img', c: 4, r: 4 },   // 11
  { k: 'img', c: 2, r: 5 },   // 12
];

export default function AIImagesPage({ onBack }) {
  const items = useContent('aiGallery', []);
  const [open, setOpen] = useState(null);

  const close = useCallback(() => setOpen(null), []);
  const step  = useCallback((d) => setOpen((i) => (i + d + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (open === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft')  step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close, step]);

  const active = open === null ? null : items[open];

  return (
    <div className="bnt">
      {/* ── Chrome ── */}
      <div className="bnt-bar">
        <button className="bnt-mark" onClick={onBack}>
          <span className="bnt-mark-dot" aria-hidden="true" />
          KISH<em>.</em>
        </button>
        <span className="bnt-bar-mid">AI IMAGES — 2026</span>
        <button className="bnt-close" onClick={onBack} aria-label="Back">
          <span aria-hidden="true" /><span aria-hidden="true" />
        </button>
      </div>

      {/* ══ BENTO ══ */}
      <main className="bnt-grid">
        {/* Type cell — first in the grid, same gutter as the pictures. */}
        <section className="bnt-cell bnt-type">
          <h1>
            Beyond the prompt.<br />
            <span>Pure intent.</span>
          </h1>
          <p>
            Frames generated with diffusion models, then cut, graded and
            finished by hand — until the machine stops showing.
          </p>
          <button className="bnt-cta" onClick={() => setOpen(0)}>
            See the frames
          </button>
        </section>

        {items.map((item, i) => {
          const cell = CELLS[i % CELLS.length];
          return (
            <React.Fragment key={item.src + i}>
            <button
              className="bnt-cell bnt-tile"
              style={{ '--c': cell.c, '--r': cell.r, '--i': i }}
              onClick={() => setOpen(i)}
              aria-label={`Open ${item.title}`}
            >
              <img src={item.src} alt={item.title} loading="lazy" draggable="false" />
            </button>

            {/* The statement lands inside the run, not above it — the
                reference has it sitting among the pictures. */}
            {i === 2 && (
              <section className="bnt-cell bnt-list">
                <ul>
                  <li><i aria-hidden="true">↗</i> Generated, not stock.</li>
                  <li><i aria-hidden="true">↗</i> Graded by hand.</li>
                  <li><i aria-hidden="true">↗</i> Grain left in.</li>
                  <li><i aria-hidden="true">↗</i> Quiet on purpose.</li>
                </ul>
                <p className="bnt-list-n">
                  <b>{String(items.length).padStart(2, '0')}</b><span>frames</span>
                </p>
              </section>
            )}
            </React.Fragment>
          );
        })}
      </main>

      {/* ══ PREVIEW WINDOW ══
          A macOS Preview window rather than a full-screen lightbox: fixed
          chrome, traffic lights, the filename centred in the title bar,
          and the picture sized to the window instead of the viewport. */}
      {active && (
        <div className="bnt-pv" role="dialog" aria-modal="true" aria-label={active.title}>
          <button className="bnt-pv-scrim" onClick={close} aria-label="Close" tabIndex={-1} />

          <div className="bnt-pv-win">
            <div className="bnt-pv-bar">
              <span className="bnt-pv-lights">
                <button className="bnt-pv-light bnt-pv-light--r" onClick={close} aria-label="Close" />
                <span className="bnt-pv-light bnt-pv-light--y" aria-hidden="true" />
                <span className="bnt-pv-light bnt-pv-light--g" aria-hidden="true" />
              </span>

              <span className="bnt-pv-name">
                {active.title.replace(/\s+/g, '-').toLowerCase()}.png
              </span>

              <span className="bnt-pv-count">
                {String(open + 1).padStart(2, '0')} of {String(items.length).padStart(2, '0')}
              </span>
            </div>

            <div className="bnt-pv-canvas">
              <img src={active.src} alt={active.title} />
            </div>

            <div className="bnt-pv-foot">
              <button onClick={() => step(-1)} aria-label="Previous">‹</button>
              <span>{active.title}</span>
              <button onClick={() => step(1)} aria-label="Next">›</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
