import { useEffect, useRef, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

/**
 * DeferredLottie
 * ─────────────────────────────────────────────────────────────────
 * Wraps DotLottieReact so it only mounts AFTER its container has
 * non-zero layout dimensions and has scrolled into the viewport.
 *
 * Why this exists:
 * The underlying renderer (thorvg WASM with WebGPU on supported
 * browsers) creates a render texture sized from the canvas's
 * client width/height at mount time. When React renders the
 * component before the browser has finished layout — common for
 * cards inside transformed/animated bento grids — that size is 0
 * and the GPU rejects the texture with:
 *
 *   "The texture size ([Extent3D width:0, height:0, ...]) is empty.
 *    While validating [TextureDescriptor 'colorBuffer']."
 *
 * Deferring the mount until layout is settled avoids the error.
 *
 * Props are forwarded 1:1 to DotLottieReact.
 */
export function DeferredLottie({ src, className, style, ...rest }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    let ro = null;
    let io = null;
    let safetyId = null;

    const hasSize = () => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };

    const tryReady = () => {
      if (cancelled || !hasSize()) return false;
      // One animation frame to be sure layout is fully flushed
      requestAnimationFrame(() => {
        if (!cancelled && hasSize()) setReady(true);
      });
      return true;
    };

    if (tryReady()) {
      // Already laid out — done.
      return;
    }

    // Fire when the container actually has non-zero size
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        if (tryReady()) {
          ro?.disconnect();
          io?.disconnect();
        }
      });
      ro.observe(el);
    }

    // Also wait until the card is in the viewport — avoids spinning
    // up the WASM renderer for off-screen cards
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && tryReady()) {
              io?.disconnect();
              ro?.disconnect();
              break;
            }
          }
        },
        { threshold: 0.05 },
      );
      io.observe(el);
    }

    // Safety net — if observers never fire (very rare), mount anyway
    safetyId = setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 2500);

    return () => {
      cancelled = true;
      ro?.disconnect();
      io?.disconnect();
      if (safetyId) clearTimeout(safetyId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        // Guarantee a non-zero box for the renderer to measure
        minWidth: 1,
        minHeight: 1,
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      {ready && <DotLottieReact src={src} {...rest} />}
    </div>
  );
}
