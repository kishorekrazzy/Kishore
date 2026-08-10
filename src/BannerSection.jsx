import './BannerSection.css';
import { useContent, withImages } from './content/store';
import PixelCard from './PixelCard';

const DEFAULT_BANNERS = [
  { src: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&w=1600&q=80',   label: 'Visual Story' },
  { src: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1600&q=80',  label: 'Cinematic Grade' },
  { src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80',  label: 'AI Crafted' },
];

export default function BannerSection() {
  const BANNERS = withImages(DEFAULT_BANNERS, useContent('images.banners', null), 'src');
  // Duplicated for the seamless infinite loop. Derived here rather than at
  // module scope: BANNERS is a hook result now, so a module-level constant
  // built from it would run before the hook ever does.
  const TRACK = [...BANNERS, ...BANNERS, ...BANNERS];
  return (
    <section className="bn-section" aria-label="Work showcase banners">

      {/* BG layers */}
      <div className="bn-bg"        aria-hidden="true" />
      <div className="bn-noise"     aria-hidden="true" />
      <div className="bn-scanlines" aria-hidden="true" />

      {/* Fade edges */}
      <div className="bn-fade-left"  aria-hidden="true" />
      <div className="bn-fade-right" aria-hidden="true" />

      {/* Section label */}
      <div className="bn-header">
        <div className="bn-header-line" />
        <span className="bn-header-label">Selected Work</span>
        <div className="bn-header-line" />
      </div>

      {/* Marquee track */}
      <div className="bn-marquee-wrap" aria-hidden="true">
        <div className="bn-track">
          {TRACK.map((b, i) => (
            /* PixelCard owns the hover: it paints a canvas of pixels over
               the plate on mouseenter and dissolves them on leave. The card
               keeps its own .bn-card styling — see BannerSection.css, where
               the component's opinionated defaults are neutralised. */
            <PixelCard
              key={i}
              className="bn-card"
              gap={6}
              speed={45}
              colors="#ffffff,#cbd5e1,#64748b"
              noFocus
            >
              <img
                src={b.src}
                alt={b.label}
                className="bn-img"
                loading="lazy"
                draggable="false"
              />
              <div className="bn-overlay" />
              <span className="bn-label">{b.label}</span>
            </PixelCard>
          ))}
        </div>
      </div>

    </section>
  );
}
