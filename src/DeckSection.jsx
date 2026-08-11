import { useRef, useCallback, useMemo } from 'react';
import './DeckSection.css';
import { useContent } from './content/store';

/* ══════════════════════════════════════════════════════════════════════
   EDIT SUITE — a scattered, draggable board

   Every card is positioned in px on a fixed 1200×900 stage, then the whole
   stage is scaled to the viewport. That is what keeps the composition an
   exact match at any width: the gaps, sizes and angles are authored once
   at reference scale and never reflow — they only shrink together.

   The board scales through a unit (--u), not a CSS transform, so a card's
   translate is already in real screen pixels — pointer deltas map 1:1 and
   must NOT be divided by the scale factor. Doing so made cards drift ahead
   of the cursor by exactly 1/scale.
   ══════════════════════════════════════════════════════════════════════ */

// x, y, w, h are stage px. rot in degrees. z is the resting stack order.
const ITEMS = [
  { id: 'tag1',     kind: 'tag',      x: 22,  y: 25,  w: 112, h: 28,  rot: 0,    z: 6  },
  { id: 'tag2',     kind: 'tag',      x: 22,  y: 63,  w: 64,  h: 28,  rot: 0,    z: 6  },
  { id: 'chip1',    kind: 'chip',     x: 116, y: 151, w: 122, h: 38,  rot: -2,   z: 12 },
  { id: 'timeline', kind: 'timeline', x: 148, y: 217, w: 178, h: 143, rot: -3.5, z: 8  },
  { id: 'posterA',  kind: 'posterA',  x: 306, y: 181, w: 285, h: 397, rot: 0,    z: 14 },
  { id: 'voice',    kind: 'voicepill',x: 710, y: 223, w: 143, h: 36,  rot: 0,    z: 16 },
  { id: 'render',   kind: 'render',   x: 909, y: 81,  w: 203, h: 207, rot: 0,    z: 10 },
  { id: 'clock',    kind: 'clock',    x: 852, y: 117, w: 96,  h: 32,  rot: 0,    z: 15 },
  { id: 'posterB',  kind: 'posterB',  x: 611, y: 279, w: 274, h: 384, rot: 0,    z: 13 },
  { id: 'chip2',    kind: 'chip',     x: 962, y: 547, w: 124, h: 44,  rot: 0,    z: 12 },
  { id: 'plate',    kind: 'plate',    x: 102, y: 603, w: 205, h: 207, rot: 0,    z: 9  },
  { id: 'wave',     kind: 'wave',     x: 412, y: 647, w: 288, h: 50,  rot: 0,    z: 17 },
  { id: 'best',     kind: 'best',     x: 817, y: 639, w: 189, h: 118, rot: -3,   z: 11 },
  { id: 'nle',      kind: 'nle',      x: 330, y: 714, w: 450, h: 142, rot: -1,   z: 18 },
  { id: 'tools',    kind: 'tools',    x: 786, y: 776, w: 172, h: 44,  rot: 2,    z: 12 },
  { id: 'caption',  kind: 'caption',  x: 984, y: 800, w: 200, h: 78,  rot: 0,    z: 7  },
];

export default function DeckSection() {
  const copy = useContent('deck', {});
  const img  = useContent('images.deck', []);

  const stageRef = useRef(null);

  // Live offsets per card, kept in a ref and written straight to the DOM.
  // Routing 14 cards' drag positions through React state would re-render
  // the whole board on every pointermove.
  const posRef  = useRef({});
  const nodeRef = useRef({});
  const dragRef = useRef(null);
  const zRef    = useRef(100);   // next front-most layer; no render needed

  /* Ref callbacks built once for the static item list. Creating them inside
     bind() would hand React a new function every render — it would null and
     re-set every node each time — and reads a ref on the render path. */
  const refs = useMemo(
    () => Object.fromEntries(ITEMS.map((i) => [i.id, (el) => { nodeRef.current[i.id] = el; }])),
    [],
  );

  const apply = (id) => {
    const node = nodeRef.current[id];
    const p = posRef.current[id] || { dx: 0, dy: 0 };
    const item = ITEMS.find((i) => i.id === id);
    if (node) node.style.transform = `translate(${p.dx}px, ${p.dy}px) rotate(${item.rot}deg)`;
  };

  const onPointerDown = useCallback((e, id) => {
    const node = nodeRef.current[id];
    if (!node) return;
    node.setPointerCapture(e.pointerId);
    const p = posRef.current[id] || { dx: 0, dy: 0 };
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, ox: p.dx, oy: p.dy, moved: false };
    // Whatever you grab comes to the front and stays there.
    zRef.current += 1;
    node.style.zIndex = String(zRef.current);
    node.classList.add('dk-item--held');
  }, []);

  const onPointerMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = d.ox + (e.clientX - d.sx);
    const dy = d.oy + (e.clientY - d.sy);
    if (!d.moved && Math.hypot(dx - d.ox, dy - d.oy) > 2) d.moved = true;
    posRef.current[d.id] = { dx, dy };
    apply(d.id);
  }, []);

  const endDrag = useCallback((e) => {
    const d = dragRef.current;
    if (!d) return;
    nodeRef.current[d.id]?.classList.remove('dk-item--held');
    nodeRef.current[d.id]?.releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
  }, []);

  // Double-click any card to send the whole board home.
  const resetAll = useCallback(() => {
    for (const item of ITEMS) {
      posRef.current[item.id] = { dx: 0, dy: 0 };
      const n = nodeRef.current[item.id];
      if (n) {
        n.style.transition = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
        n.style.zIndex = String(item.z);
        apply(item.id);
        setTimeout(() => { if (n) n.style.transition = ''; }, 600);
      }
    }
  }, []);

  const t = (k, fallback) => (copy[k] === undefined || copy[k] === '' ? fallback : copy[k]);

  const bind = (item) => ({
    ref: refs[item.id],
    className: `dk-item dk-${item.kind}`,
    style: {
      // Stage px via --u, the single unit the whole board scales from.
      // Not em: an element's own font-size would then rescale its geometry.
      left: `calc(${item.x} * var(--u))`, top: `calc(${item.y} * var(--u))`,
      width: `calc(${item.w} * var(--u))`, height: `calc(${item.h} * var(--u))`,
      zIndex: item.z,
      transform: `translate(0px, 0px) rotate(${item.rot}deg)`,
    },
    onPointerDown: (e) => onPointerDown(e, item.id),
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onDoubleClick: resetAll,
  });

  const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

  return (
    <section className="dk-section" id="suite" aria-label="Edit suite board">
      <div className="dk-stage-wrap">
        <div className="dk-stage" ref={stageRef}>

          {/* Ghost words behind everything */}
          <div className="dk-ghost" aria-hidden="true">
            <span>the impossible</span>
            <span>cut made in</span>
            <span>real time</span>
          </div>

          {/* ── Corner tags ── */}
          <div {...bind(byId.tag1)}><span>{t('tag1', 'Timeline Tools')}</span></div>
          <div {...bind(byId.tag2)}><span>{t('tag2', 'Grade')}</span></div>

          {/* ── Chips ── */}
          <div {...bind(byId.chip1)}>
            <span className="dk-chip-emoji" aria-hidden="true">🎬</span>
            <span className="dk-chip-label">{t('chip1', 'Cinematic')}</span>
            <i className="dk-chip-tail" aria-hidden="true" />
          </div>
          <div {...bind(byId.chip2)}>
            <span className="dk-chip-emoji" aria-hidden="true">🎨</span>
            <span className="dk-chip-label">{t('chip2', 'Colour')}</span>
            <i className="dk-chip-tail" aria-hidden="true" />
          </div>

          {/* ── Timeline card ── */}
          <div {...bind(byId.timeline)}>
            <p className="dk-tl-title">{t('timelineTitle', 'Edit Timeline')}</p>
            <p className="dk-tl-range">{t('timelineRange', '21 – 29 December')}</p>
            <div className="dk-tl-strip">
              <span className="dk-tl-day"><b>23</b><i>Tue</i></span>
              {img[3] && <img src={img[3]} alt="" draggable="false" />}
              <span className="dk-tl-clip" />
              <span className="dk-tl-clip dk-tl-clip--b" />
            </div>
          </div>

          {/* ── Poster A ── */}
          <div {...bind(byId.posterA)}>
            {img[0] && <img className="dk-poster-img" src={img[0]} alt="" draggable="false" />}
            <div className="dk-poster-tint dk-poster-tint--red" />
            <div className="dk-poster-body">
              <h3>{t('posterATitle', 'Chennai')}<br /><em>{t('posterASub', 'in Golden Hour')}</em></h3>
              <div className="dk-poster-meta">
                <span className="dk-date"><b>16</b><i>Sun</i></span>
                <span className="dk-meta-mid">
                  <b>{t('posterAKind', 'Street Walk')}</b>
                  {t('posterAAddr', '6545 Old Denton Rd,\nMarina Beach, Chennai')}
                </span>
                <span className="dk-meta-time"><b>{t('posterATime', '8:30 AM')}</b>GMT</span>
              </div>
            </div>
          </div>

          {/* ── Poster B ── */}
          <div {...bind(byId.posterB)}>
            {img[1] && <img className="dk-poster-img" src={img[1]} alt="" draggable="false" />}
            <div className="dk-poster-tint dk-poster-tint--amber" />
            <span className="dk-poster-badge" aria-hidden="true">A</span>
            <div className="dk-poster-body">
              <h3>{t('posterBTitle', 'The Long Take')}<br /><em>{t('posterBSub', 'to Start Grading & Joy')}</em></h3>
              <div className="dk-poster-meta">
                <span className="dk-date"><b>29</b><i>Fri</i></span>
                <span className="dk-meta-mid">
                  <b>{t('posterBKind', 'Call Time')}</b>
                  {t('posterBAddr', '900 Logan St, Denver 80203,\nSouthwest, Colorado, USA')}
                </span>
                <span className="dk-meta-time"><b>{t('posterBTime', '4:25 PM')}</b></span>
              </div>
            </div>
          </div>

          {/* ── Voice pill ── */}
          <div {...bind(byId.voice)}>
            <i className="dk-vp-bars" aria-hidden="true"><b /><b /><b /></i>
            <span>{t('voice', 'Auto Captions')}</span>
            <i className="dk-chip-tail dk-chip-tail--red" aria-hidden="true" />
          </div>

          {/* ── Render widget ── */}
          <div {...bind(byId.render)}>
            {img[2] && <img className="dk-rd-img" src={img[2]} alt="" draggable="false" />}
            <div className="dk-rd-tint" />
            <p className="dk-rd-place">{t('renderTitle', 'Render')}</p>
            <p className="dk-rd-num">{t('renderNum', '94')}<sup>%</sup></p>
            <p className="dk-rd-stats">{t('renderStats', 'ETA 13m · 4K ProRes')}</p>
          </div>

          {/* ── Clock pill ── */}
          <div {...bind(byId.clock)}><span>{t('clock', 'Cut at 20:35')}</span></div>

          {/* ── Media-bin plate ── */}
          <div {...bind(byId.plate)}>
            {img[6] && <img className="dk-plate-img" src={img[6]} alt="" draggable="false" />}
            <div className="dk-plate-tint" />
            <span className="dk-plate-tc">{t('plateTc', '00:04:12:08')}</span>
            <div className="dk-plate-foot">
              <p className="dk-plate-title">{t('plateTitle', 'B-Roll')}</p>
              <p className="dk-plate-sub">{t('plateSub', '48 clips · 4K')}</p>
            </div>
          </div>

          {/* ── Waveform ── */}
          <div {...bind(byId.wave)}>
            <span className="dk-wave-bars" aria-hidden="true">
              {Array.from({ length: 44 }, (_, i) => (
                <i key={i} style={{ '--h': `${18 + Math.abs(Math.sin(i * 1.7)) * 74}%` }} />
              ))}
            </span>
            <span className="dk-wave-mic" aria-hidden="true">🎙</span>
          </div>

          {/* ── Best frames ── */}
          <div {...bind(byId.best)}>
            <p className="dk-bp-title">{t('bestTitle', 'Best Frames')}</p>
            <p className="dk-bp-sub">{t('bestSub', '290 Clips')}</p>
            <span className="dk-bp-thumbs">
              {img[4] && <img src={img[4]} alt="" draggable="false" />}
              {img[5] && <img src={img[5]} alt="" draggable="false" />}
            </span>
            <span className="dk-bp-strip" aria-hidden="true">
              {img[3] && <img src={img[3]} alt="" draggable="false" />}
            </span>
          </div>

          {/* ── Timeline (NLE) panel ── */}
          <div {...bind(byId.nle)}>
            <div className="dk-nle-bar">
              <span className="dk-nle-tc">{t('nleTc', '00:00:26:14')}</span>
              <span className="dk-nle-name">{t('nleSeq', 'GOLDEN_HOUR_v07.prproj')}</span>
            </div>

            <div className="dk-nle-ruler" aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i}>{`00:00:${String(i * 15).padStart(2, '0')}:00`}</span>
              ))}
            </div>

            <div className="dk-nle-tracks" aria-hidden="true">
              {[
                { n: 'V2', clips: [[2, 16, 'a'], [22, 20, 'b'], [46, 12, 'a']] },
                { n: 'V1', clips: [[0, 30, 'v'], [32, 26, 'v'], [60, 34, 'v']] },
                { n: 'A1', clips: [[0, 58, 'au'], [60, 34, 'au']] },
                { n: 'A2', clips: [[8, 44, 'am']] },
              ].map((tr) => (
                <div className="dk-nle-track" key={tr.n}>
                  <span className="dk-nle-head">{tr.n}</span>
                  <span className="dk-nle-lane">
                    {tr.clips.map(([left, width, kind], i) => (
                      <i key={i} className={`dk-clip dk-clip--${kind}`}
                         style={{ left: `${left}%`, width: `${width}%` }} />
                    ))}
                  </span>
                </div>
              ))}
              <span className="dk-nle-playhead" style={{ left: '38%' }} />
            </div>
          </div>

          {/* ── Tool palette ── */}
          <div {...bind(byId.tools)}>
            {['↖', '✂', '✥', '🔍', '✎'].map((g, i) => (
              <span key={i} className={`dk-tool${i === 1 ? ' dk-tool--on' : ''}`} aria-hidden="true">{g}</span>
            ))}
          </div>

          {/* ── Caption ── */}
          <div {...bind(byId.caption)}>
            <p className="dk-cap-title">{t('captionTitle', '( Edit Suite )')}</p>
            <p className="dk-cap-body">
              {t('captionBody', "We're a full post house — offline, grade, sound and finish. Cinematic edits, AI-assisted workflows and deliverables for every screen…")}
            </p>
          </div>

        </div>
      </div>

      <p className="dk-hint" aria-hidden="true">Drag anything · double-click to reset</p>
    </section>
  );
}
