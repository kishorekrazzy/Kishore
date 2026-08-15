import { useEffect, useRef } from 'react';
import { subscribeSpidey, readSpidey } from './spideyBus';
import spideyGif from './assets/upside down.gif';
import './Spidey.css';

/* ══════════════════════════════════════════════════════════════════════
   SPIDEY

   One figure for the whole page, fixed to the viewport and always a full
   screen tall, hanging from a thread that starts above the fold. What
   moves is a transform on two axes, never the box itself — that is the
   whole reason he glides between About cards instead of snapping. An
   earlier version drove the drop through `height`, which is not an
   animatable step here: every card handoff resized the element in one
   frame while the transform stayed put, and it read as a glitch.

   `--drop` of 0 IS the hidden state — translateY(-100%) parks him a full
   viewport above the top edge. So there is no separate hide animation to
   keep in sync; he simply travels back to zero.
   ══════════════════════════════════════════════════════════════════════ */

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* Viewport-anchored modes are resolved here rather than at the call site
   so they can be re-resolved on resize without the caller knowing. */
function resolve(req) {
  if (!req) return null;
  const W = window.innerWidth;
  const H = window.innerHeight;

  if (req.mode === 'card') return req; // already measured in px

  if (req.mode === 'bot') {
    /* Down the right-hand side to the middle of the screen, on the
       robot's own column — landing directly above it is what ties the
       drop to the thing you are hovering. He stops well short of the
       dock vertically, so the robot is never covered. */
    const w = clamp(W * 0.15, 130, 210);
    const dock = document.querySelector('.abd')?.getBoundingClientRect();
    const cx = dock ? dock.left + dock.width / 2 : W - 108;
    return { w, x: clamp(cx - w / 2, 12, W - w - 12), drop: H * 0.56 };
  }

  if (req.mode === 'mind') {
    /* Scrolling into Inside The Mind. He drops into the right-hand
       margin beside the widget grid rather than on top of it — and only
       overlaps the grid's edge if the window is too narrow to have a
       margin at all. */
    const w = clamp(W * 0.13, 120, 185);
    const grid = document.querySelector('.wg-grid')?.getBoundingClientRect();
    const gutterL = grid ? grid.right + 10 : W - w - 40;
    const room = W - 10 - gutterL;
    const x = room >= w
      ? gutterL + (room - w) / 2
      : clamp(W - w - 10, 12, W - w - 10);
    return { w, x, drop: H * 0.46 };
  }

  // 'page' — the terminal summon. Right side, biggest of them all.
  const w = clamp(W * 0.17, 150, 230);
  return { w, x: clamp(W - w - W * 0.07, 12, W - w - 12), drop: H * 0.62 };
}

export default function Spidey() {
  const ref = useRef(null);
  const armed = useRef(false);

  useEffect(() => {
    const apply = (req) => {
      const el = ref.current;
      if (!el) return;

      if (!req) {
        el.style.setProperty('--drop', '0px');
        el.classList.remove('is-down', 'is-shift');
        return;
      }

      // 1.6 MB of GIF is not worth fetching for someone who never hovers.
      if (!armed.current) {
        const img = el.querySelector('img');
        if (img && !img.src) img.src = spideyGif;
        armed.current = true;
      }

      const g = resolve(req);
      const wasDown = el.classList.contains('is-down');

      el.style.setProperty('--w', `${g.w}px`);
      el.style.setProperty('--x', `${g.x}px`);

      /* Coming in from nothing, the horizontal position is not a move —
         it is where he starts. Commit it without a transition so he drops
         straight down instead of swinging in on a diagonal. Card-to-card
         changes keep the transition and glide. */
      if (!wasDown) {
        el.classList.add('no-glide');
        void el.offsetWidth; // flush, so the class actually takes effect
        el.classList.remove('no-glide');
      }

      /* Arriving is a drop — it wants weight and a quick settle. Moving
         between two anchors he is already hanging from is a shift, and
         that reads better slow and even at both ends. */
      el.classList.toggle('is-shift', wasDown);
      el.style.setProperty('--drop', `${g.drop}px`);
      el.classList.add('is-down');
    };

    apply(readSpidey());
    const off = subscribeSpidey(apply);

    const onResize = () => {
      const req = readSpidey();
      // Card geometry is stale the moment the layout moves; the
      // viewport-anchored modes just re-resolve.
      if (req && req.mode !== 'card') apply(req);
    };
    window.addEventListener('resize', onResize);
    return () => { off(); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <div className="spidey" ref={ref} aria-hidden="true">
      <span className="spidey-line" />
      <img alt="" draggable="false" />
    </div>
  );
}
