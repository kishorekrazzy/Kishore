import { useEffect, useState } from 'react';
import Lanyard from './Lanyard';
import { useContent } from './content/store';

/* ══════════════════════════════════════════════════════════════════════
   LANYARD OVERLAY

   Not a modal. The card hangs over the live site — no scrim, no dialog,
   no scroll lock — and the page underneath stays completely usable. Only
   the narrow column the card occupies takes pointer events, so the rest
   of the page is clicked and scrolled normally while it swings there.

   The island's logo toggles it; Escape also puts it away.
   ══════════════════════════════════════════════════════════════════════ */

/* drei's useTexture throws during render when a URL fails to load, and a
   throw there unmounts the whole Canvas — no try/catch inside the scene can
   catch it, because it happens before any of that code runs. That is what a
   404 or a CORS-blocked card image did: console error, no card, dead scene.

   So the URL is proven loadable out here first, with the same crossOrigin
   the texture loader uses, and only handed down once it resolves. A bad
   image now costs you the custom face and nothing else. */
function useLoadableImage(url) {
  // Stores which URL proved loadable, not a boolean — so a url change needs
  // no synchronous reset inside the effect.
  const [loaded, setLoaded] = useState(null);

  useEffect(() => {
    if (!url) return undefined;
    let alive = true;
    const img = new Image();
    // Must match TextureLoader, or a URL that passes here still taints the
    // compositing canvas later.
    img.crossOrigin = 'anonymous';
    img.onload = () => { if (alive) setLoaded(url); };
    img.onerror = () => {
      if (alive) console.warn('[Lanyard] card image unusable, falling back to the built-in artwork:', url);
    };
    img.src = url;
    return () => { alive = false; };
  }, [url]);

  return loaded === url ? url : undefined;
}

export default function LanyardOverlay({ onClose }) {
  const front = useLoadableImage(useContent('images.lanyard.0', null));
  const back  = useLoadableImage(useContent('images.lanyard.1', null));

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="ly-overlay" aria-hidden="true">
      <div className="ly-stage">
        <Lanyard
          /* The canvas covers the whole viewport so the card is never
             clipped by a container edge. It is click-through, and R3F
             takes its pointer events from #root instead. */
          eventSource={typeof document !== 'undefined' ? document.getElementById('root') : undefined}
          /* z=20 is the component's own distance and the one its card
             proportions were drawn for. Pulling back to 30 to gain
             horizontal room shrank the card and dragged its anchor toward
             mid-screen; widening the stage instead keeps both right.
             720x813 at z=20 gives 6.25 x 7.05 world units — half-width
             3.12 against a card resting at 2.95. */
          position={[0, 0, 20]}
          gravity={[0, -40, 0]}
          fov={20}
          transparent
          frontImage={front}
          backImage={back}
          imageFit="cover"
        />
      </div>
    </div>
  );
}
