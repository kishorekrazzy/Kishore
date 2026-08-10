import { useEffect, useRef, useState } from 'react';

// ── Click-to-cycle palettes ─────────────────────────────────────────
const PALETTES = [
  {
    tubes:  ['#6366f1', '#a855f7', '#ec4899'],
    lights: ['#818cf8', '#c084fc', '#f0abfc', '#6366f1'],
  },
  {
    tubes:  ['#3b82f6', '#6366f1', '#8b5cf6'],
    lights: ['#60a5fa', '#818cf8', '#a78bfa', '#38bdf8'],
  },
  {
    tubes:  ['#ec4899', '#f43f5e', '#a855f7'],
    lights: ['#f9a8d4', '#fb7185', '#d946ef', '#c084fc'],
  },
  {
    tubes:  ['#06b6d4', '#3b82f6', '#6366f1'],
    lights: ['#67e8f9', '#93c5fd', '#818cf8', '#22d3ee'],
  },
];

// ── Per-section fixed palettes ──────────────────────────────────────
const SECTION_PALETTES = {
  // Orange + amber + yellow mix
  video: {
    tubes:  ['#f97316', '#f59e0b', '#fbbf24', '#ea580c', '#fcd34d'],
    lights: ['#fde68a', '#fbbf24', '#f97316', '#fb923c', '#fef08a', '#d97706'],
  },
  // Red + orange-red + hot pink + coral mix
  ai: {
    tubes:  ['#ef4444', '#f43f5e', '#f97316', '#ec4899', '#fb7185'],
    lights: ['#fda4af', '#f43f5e', '#ef4444', '#fb923c', '#f9a8d4', '#dc2626'],
  },
  // Blue + indigo + purple + violet mix
  color: {
    tubes:  ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#7c3aed'],
    lights: ['#c4b5fd', '#818cf8', '#60a5fa', '#a78bfa', '#ddd6fe', '#4f46e5'],
  },
  // Lime + yellow-green + emerald + bright green mix
  web: {
    tubes:  ['#22c55e', '#84cc16', '#a3e635', '#4ade80', '#16a34a'],
    lights: ['#d9f99d', '#bef264', '#86efac', '#22c55e', '#ecfccb', '#15803d'],
  },
};

// ── Idle fade timings ───────────────────────────────────────────────
// The tube lines lag the cursor and keep travelling for a good while
// after it stops. The old timings began the fade 1 s after the last
// movement and took 1.2 s over it, so the trail dissolved mid-flight —
// you never saw it arrive, and the long dissolve made the whole thing
// feel sluggish. The wait is now long enough for the lines to actually
// reach the cursor and settle, and the fade itself is quick.
const SETTLE_MS = 2600;   // trail catches up before anything fades
const FADE_OUT  = '0.4s'; // then it goes, rather than slowly dissolving

let paletteIndex = 0;

const nextPalette = () => {
  paletteIndex = (paletteIndex + 1) % PALETTES.length;
  return PALETTES[paletteIndex];
};

// ── COMPONENT ──────────────────────────────────────────────────────
export default function TubesBackground({ onLoadedChange, sectionId }) {
  const canvasRef = useRef(null);
  const tubesRef  = useRef(null);
  const stopRef   = useRef(null);
  const [loaded,   setLoaded]   = useState(false);
  const [clicking, setClicking] = useState(false);

  // Show tubes on cursor move, hide once they have settled — zero re-renders
  useEffect(() => {
    if (!loaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMove = () => {
      // Show immediately while moving
      canvas.style.transition = 'opacity 0.12s ease';
      canvas.style.opacity    = '0.62';
      // Reset the hide timer on every move so we never cut mid-animation
      clearTimeout(stopRef.current);
      stopRef.current = setTimeout(() => {
        canvas.style.transition = `opacity ${FADE_OUT} ease`;
        canvas.style.opacity    = '0';
      }, SETTLE_MS);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      clearTimeout(stopRef.current);
    };
  }, [loaded]);

  // Switch tube color when the hero section changes
  useEffect(() => {
    if (!tubesRef.current || !sectionId) return;
    const palette = SECTION_PALETTES[sectionId];
    if (!palette) return;
    tubesRef.current.tubes.setColors(palette.tubes);
    tubesRef.current.tubes.setLightsColors(palette.lights);
  }, [sectionId]);

  useEffect(() => {
    let mounted = true;
    let resizeObs = null;

    const init = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Wait until the canvas has non-zero layout dimensions before
      // initialising the WebGL/WebGPU context. Otherwise the GPU
      // backend tries to allocate a 0×0 colorBuffer texture and aborts
      // with: "TextureDescriptor 'colorBuffer' size is empty".
      const hasSize = () => canvas.clientWidth > 0 && canvas.clientHeight > 0;

      if (!hasSize()) {
        await new Promise((resolve) => {
          let resolved = false;
          const finish = () => {
            if (resolved) return;
            resolved = true;
            resizeObs?.disconnect();
            clearTimeout(timeoutId);
            resolve();
          };

          if (typeof ResizeObserver !== 'undefined') {
            resizeObs = new ResizeObserver(() => {
              if (hasSize()) finish();
            });
            resizeObs.observe(canvas);
          }

          // Safety timeout — give up waiting after 4s and bail out
          // gracefully (background tubes will simply not appear).
          const timeoutId = setTimeout(finish, 4000);
        });
      }

      if (!mounted) return;
      if (!hasSize()) {
        // Canvas still 0×0 — abort silently rather than crash the GPU
        return;
      }

      // Mirror the layout size onto the canvas's HTML width/height
      // attributes so the library has a sane backing-store size even
      // if it inspects canvas.width directly.
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = Math.max(1, Math.floor(canvas.clientWidth  * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

      try {
        // Dynamic CDN import — @vite-ignore suppresses Vite's static-analysis warning.
        // The dependency is loaded at runtime; if it 404s or is blocked
        // by CSP we silently disable the effect rather than break the page.
        const module = await import(
          /* @vite-ignore */
          'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js'
        );
        if (!mounted) return;

        const TubesCursor = module.default;
        const { tubes, lights } = SECTION_PALETTES[sectionId] ?? PALETTES[0];

        const app = TubesCursor(canvasRef.current, {
          tubes: {
            colors: tubes,
            lights: {
              intensity: 180,
              colors:   lights,
            },
          },
        });

        tubesRef.current = app;
        setLoaded(true);
        onLoadedChange?.(true);
      } catch {
        // CDN fetch failed (network, region block, CSP) or runtime
        // initialisation crashed. Background tubes are a non-essential
        // visual flourish — degrade silently.
      }
    };

    init();
    return () => {
      mounted = false;
      resizeObs?.disconnect();
    };
  }, [onLoadedChange]);

  const handleClick = () => {
    if (!tubesRef.current) return;

    setClicking(true);
    setTimeout(() => setClicking(false), 300);

    const { tubes, lights } = nextPalette();
    tubesRef.current.tubes.setColors(tubes);
    tubesRef.current.tubes.setLightsColors(lights);
  };

  return (
    <canvas
      ref={canvasRef}
      width={1}
      height={1}
      onClick={handleClick}
      aria-hidden="true"
      style={{
        position:    'absolute',
        inset:        0,
        width:       '100%',
        height:      '100%',
        display:     'block',
        touchAction: 'none',
        zIndex:       1,           // above video (z=0), below grain (z=2)
        mixBlendMode: 'screen',    // neon tubes glow blends with the dark video
        opacity:    0,
        transition: 'opacity 0.15s ease',
        cursor:      clicking ? 'crosshair' : 'none',  // hide cursor — portfolio uses default system cursor anyway
        pointerEvents: 'all',
      }}
    />
  );
}
