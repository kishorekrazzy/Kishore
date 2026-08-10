/**
 * CardSwap — GSAP-powered 3D card stack with auto-cycle & imperative goTo.
 *
 * Key design: every swap() call KILLS any in-flight timeline first, then
 * snaps all cards to their correct logical slot before animating the
 * single front-card-off / promote / return sequence. This prevents the
 * compounding-offset bugs that relative moves (y += 500) cause when
 * timelines overlap.
 */
import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useMemo,
  useEffect,
  useRef,
  useImperativeHandle,
} from 'react';
import gsap from 'gsap';

// ── Card ────────────────────────────────────────────────────────────────────

export const Card = forwardRef(({ style, children, onClick, className, customClass, ...rest }, ref) => (
  <div
    ref={ref}
    onClick={onClick}
    className={`${className ?? ''} ${customClass ?? ''}`.trim()}
    style={{
      position:           'absolute',
      top:                '50%',
      left:               '50%',
      borderRadius:       '16px',
      transformStyle:     'preserve-3d',
      willChange:         'transform',
      backfaceVisibility: 'hidden',
      border:             '1px solid rgba(255,255,255,0.08)',
      overflow:           'hidden',
      boxShadow:          '0 24px 80px rgba(0,0,0,0.75)',
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

// ── Helpers ─────────────────────────────────────────────────────────────────

const makeSlot = (i, distX, distY, total) => ({
  x:      i * distX,
  y:     -i * distY,
  z:     -i * distX * 1.5,
  zIndex: total - i,
});

const snapTo = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x, y: slot.y, z: slot.z,
    xPercent: -50, yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  });

// ── CardSwap ────────────────────────────────────────────────────────────────

export const CardSwap = forwardRef(({
  width           = 500,
  height          = 400,
  cardDistance    = 60,
  verticalDistance= 70,
  delay           = 5000,
  pauseOnHover    = false,
  onCardClick,
  onActiveChange,
  skewAmount      = 6,
  easing          = 'elastic',
  children,
}, ref) => {
  const cfg =
    easing === 'elastic'
      ? { ease: 'elastic.out(0.6,0.9)', dur: 1.6, promoteOverlap: 0.85, stagger: 0.12 }
      : { ease: 'power1.inOut',          dur: 0.8, promoteOverlap: 0.4,  stagger: 0.18 };

  const childArr    = useMemo(() => Children.toArray(children).filter(isValidElement), [children]);
  const cardRefs    = useMemo(() => childArr.map(() => React.createRef()), [childArr.length]);
  const orderRef    = useRef(childArr.map((_, i) => i));
  const tlRef       = useRef(null);
  const intervalRef = useRef(0);
  const containerRef= useRef(null);
  const swapFnRef   = useRef(null);
  const onActiveChangeRef = useRef(onActiveChange);
  const total       = childArr.length;

  useEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  }, [onActiveChange]);

  // ── Snap every card to its correct logical slot (no animation) ──
  const snapAllToOrder = () => {
    orderRef.current.forEach((cardIdx, slotPos) => {
      const el = cardRefs[cardIdx]?.current;
      if (el) snapTo(el, makeSlot(slotPos, cardDistance, verticalDistance, total), skewAmount);
    });
  };

  // ── Imperative API for parent ──
  useImperativeHandle(ref, () => ({
    goTo: (targetCardIdx) => {
      if (!swapFnRef.current) return;
      clearInterval(intervalRef.current);
      swapFnRef.current(targetCardIdx);
      intervalRef.current = window.setInterval(() => swapFnRef.current(), delay);
    },
  }));

  useEffect(() => {
    // Initial placement
    snapAllToOrder();

    // ── Core swap function ──
    // targetCardIdx = undefined → auto-cycle (move front to back)
    // targetCardIdx = number   → bring that card to front
    const swap = (targetCardIdx) => {
      const cur = orderRef.current;
      if (cur.length < 2) return;

      const currentFront = cur[0];

      // If target is already the front card, nothing to do
      if (targetCardIdx !== undefined && currentFront === targetCardIdx) return;

      // 1. KILL any in-flight animation immediately and snap to clean state
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }
      snapAllToOrder();

      // 2. Compute the new order
      let newOrder;
      if (targetCardIdx !== undefined) {
        // Rotate the array so targetCardIdx becomes index 0
        const pos = cur.indexOf(targetCardIdx);
        if (pos < 0) return; // not found
        if (pos === 0) return; // already front
        newOrder = [...cur.slice(pos), ...cur.slice(0, pos)];
      } else {
        // Simple auto-cycle: move front to back
        newOrder = [...cur.slice(1), currentFront];
      }

      // 3. Notify parent IMMEDIATELY so left panel updates in sync
      onActiveChangeRef.current?.(newOrder[0]);

      // 4. Build the animation timeline
      const tl = gsap.timeline();
      tlRef.current = tl;

      const frontEl = cardRefs[currentFront]?.current;
      const frontSlot = makeSlot(0, cardDistance, verticalDistance, total);
      // Absolute drop position: current slot y + 500
      const dropY = frontSlot.y + 500;

      // Phase 1: Drop the current front card down (absolute y target)
      if (frontEl) {
        tl.to(frontEl, {
          y: dropY,
          duration: cfg.dur,
          ease: cfg.ease,
        });
      }

      // Phase 2: Promote all other cards to their new slots
      tl.addLabel('promote', `-=${cfg.dur * cfg.promoteOverlap}`);
      newOrder.forEach((cardIdx, newSlotPos) => {
        if (cardIdx === currentFront) return; // handle separately below
        const el = cardRefs[cardIdx]?.current;
        if (!el) return;
        const slot = makeSlot(newSlotPos, cardDistance, verticalDistance, total);
        tl.set(el, { zIndex: slot.zIndex }, 'promote');
        tl.to(el, {
          x: slot.x, y: slot.y, z: slot.z,
          duration: cfg.dur,
          ease: cfg.ease,
        }, `promote+=${newSlotPos * cfg.stagger}`);
      });

      // Phase 3: Return the dropped card to its new back position
      const backSlotPos = newOrder.indexOf(currentFront);
      const backSlot = makeSlot(backSlotPos, cardDistance, verticalDistance, total);
      tl.addLabel('return', `promote+=${cfg.dur * 0.05}`);
      if (frontEl) {
        tl.set(frontEl, { zIndex: backSlot.zIndex }, 'return');
        tl.to(frontEl, {
          x: backSlot.x, y: backSlot.y, z: backSlot.z,
          duration: cfg.dur,
          ease: cfg.ease,
        }, 'return');
      }

      // Phase 4: Commit the new order once animation completes
      tl.call(() => { orderRef.current = newOrder; });
    };

    swapFnRef.current = swap;

    // Start auto-cycle
    intervalRef.current = window.setInterval(() => swap(), delay);

    // Hover pause/resume
    if (pauseOnHover && containerRef.current) {
      const node  = containerRef.current;
      const pause = () => {
        if (tlRef.current) tlRef.current.pause();
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        if (tlRef.current) tlRef.current.play();
        intervalRef.current = window.setInterval(() => swap(), delay);
      };
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
      return () => {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
        clearInterval(intervalRef.current);
        if (tlRef.current) tlRef.current.kill();
      };
    }

    return () => {
      clearInterval(intervalRef.current);
      if (tlRef.current) tlRef.current.kill();
    };
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing]); // removed onActiveChange

  // ── Render ──
  const rendered = childArr.map((child, i) =>
    cloneElement(child, {
      key: i,
      ref: cardRefs[i],
      style: { width, height, ...(child.props.style ?? {}) },
      onClick: (e) => {
        child.props.onClick?.(e);
        onCardClick?.(i);
      },
    })
  );

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width, height, perspective: '1200px', transform: 'translateZ(0)' }}
    >
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
        {rendered}
      </div>
    </div>
  );
});

CardSwap.displayName = 'CardSwap';
export default CardSwap;
