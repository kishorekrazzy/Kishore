import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/* ─────────────────────────────────────────────────────────────
   PngSequenceOverlay
   ─────────────────────────────────────────────────────────────
   Plays a frame-numbered PNG sequence as a one-shot fullscreen
   overlay. Renders to a <canvas> instead of swapping <img src>
   so that:

   • If a target frame hasn't downloaded yet, the canvas keeps
     showing the previously-drawn frame — no blank flash, no
     broken-image. The animation always looks smooth.
   • Frames are eagerly preloaded into Image objects on idle and
     reused via drawImage(), so subsequent triggers play from
     in-memory cache.
   • encodeURI() is applied to every frame URL so paths with
     spaces or unusual characters are deploy-safe.

   Props
   ─────
   • playing    : boolean — toggles playback on / off
   • frameCount : number  — total number of frames
   • urlBuilder : (i) => string — builds the URL for frame i
   • fps        : number — playback rate (default 30)
   • onDone     : ()    — called when the last frame is reached
   ───────────────────────────────────────────────────────────── */

export function PngSequenceOverlay({
  playing,
  frameCount,
  urlBuilder,
  fps = 30,
  onDone,
}) {
  const canvasRef = useRef(null);
  const cacheRef  = useRef([]);
  const rafRef    = useRef(null);
  const lastTsRef = useRef(null);
  const onDoneRef = useRef(onDone);

  // Keep the latest onDone in a ref so the rAF closure always has it
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  // ── Eagerly preload every frame on mount (idle-time) ──
  useEffect(() => {
    let idleId, timeoutId;

    const start = () => {
      if (cacheRef.current.length) return;
      const cache = new Array(frameCount);
      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.decoding = 'async';
        img.src = urlBuilder(i);
        cache[i] = img;
      }
      cacheRef.current = cache;
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(start, { timeout: 4000 });
    } else {
      timeoutId = setTimeout(start, 800);
    }

    return () => {
      if (idleId && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [frameCount, urlBuilder]);

  // ── Playback driver ──
  useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    // Safety net — if user clicked before idle preload fired, kick it now
    if (!cacheRef.current.length) {
      const cache = new Array(frameCount);
      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.decoding = 'async';
        img.src = urlBuilder(i);
        cache[i] = img;
      }
      cacheRef.current = cache;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const msPerFrame = 1000 / fps;
    let curFrame = 0;
    let lastDrawn = -1;
    lastTsRef.current = null;

    const tryDraw = (frame) => {
      const img = cacheRef.current[frame];
      if (!img) return false;
      // Image decoded and has dimensions → draw it
      if (img.complete && img.naturalWidth > 0) {
        // Auto-fit canvas backing store to natural pixel size of the asset
        if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
          canvas.width  = img.naturalWidth;
          canvas.height = img.naturalHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        lastDrawn = frame;
        return true;
      }
      return false;
    };

    const tick = (ts) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const elapsed = ts - lastTsRef.current;

      if (elapsed >= msPerFrame) {
        const steps = Math.floor(elapsed / msPerFrame);
        curFrame += steps;
        lastTsRef.current = ts - (elapsed % msPerFrame);

        if (curFrame >= frameCount) {
          // Final frame: draw whatever the last frame is, then exit
          tryDraw(frameCount - 1);
          if (onDoneRef.current) onDoneRef.current();
          return;
        }

        // Try to draw the target frame; if not loaded, the canvas
        // keeps showing whatever was drawn last (no flicker, no blank).
        tryDraw(curFrame);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // We intentionally only re-run when `playing` flips. Other props are
    // stable for the lifetime of a given trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  if (!playing) return null;

  return createPortal(
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: '100vw',
          height: 'auto',
          display: 'block',
        }}
      />
    </div>,
    document.body,
  );
}
