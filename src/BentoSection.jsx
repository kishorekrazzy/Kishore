import { useRef, useEffect, useState } from 'react';
import ScrollReveal from './ScrollReveal';
import { DeferredLottie } from './components/DeferredLottie';
import { Play } from 'lucide-react';
import './BentoSection.css';
import { useContent } from './content/store';

function InstagramIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.256 5.649 5.907-5.649zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7H10V9h4v1.5a6 6 0 0 1 2-.5z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// The nine card background plates, in the order they appear below.
const DEFAULT_CARD_IMAGES = [
  'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80',
];

const TOOLS = [
  'Premiere Pro', 'DaVinci Resolve', 'After Effects',
  'Midjourney', 'ComfyUI', 'Stable Diffusion',
  'React', 'Python', 'GSAP', 'Three.js',
];

const SOCIALS = [
  { name: 'Instagram', Icon: InstagramIcon, color: '#e1306c', handle: '@kishoreditx' },
  { name: 'YouTube', Icon: YoutubeIcon, color: '#ff0000', handle: 'KishoreditX' },
  { name: 'X / Twitter', Icon: XIcon, color: '#e7e9ea', handle: '@kishoreditx' },
  { name: 'LinkedIn', Icon: LinkedInIcon, color: '#0a66c2', handle: 'Kish' },
];

// ── ICONS ──────────────────────────────────────────────────────────────────

function SparkleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 6H20l-5 3.6 1.9 6L12 14l-4.9 3.6 1.9-6L4 8h6.2z" opacity="0.9" />
      <path d="M19 2l.9 3h3l-2.4 1.7.9 3L19 8l-2.4 1.7.9-3L15 5h3z" opacity="0.45" />
    </svg>
  );
}

// Chrome + After Effects marks, drawn inline instead of loaded as PNGs.
// Vector keeps them crisp at any size and costs zero network requests.

function ChromeMark() {
  return (
    <svg className="bc-iw-img" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="#fff" />
      <path d="M24 3a21 21 0 0 1 18.2 10.5H24a10.5 10.5 0 0 0-9.6 6.3L7.3 7.6A20.9 20.9 0 0 1 24 3Z" fill="#EA4335" />
      <path d="M7.3 7.6l7.1 12.2A10.5 10.5 0 0 0 24 34.5l-6.4 10.9A21 21 0 0 1 7.3 7.6Z" fill="#34A853" />
      <path d="M42.2 13.5A21 21 0 0 1 17.6 45.4L24 34.5a10.5 10.5 0 0 0 9.1-15.4l9.1-5.6Z" fill="#FBBC05" />
      <circle cx="24" cy="24" r="9.2" fill="#fff" />
      <circle cx="24" cy="24" r="7" fill="#4285F4" />
    </svg>
  );
}

function AfterEffectsMark() {
  return (
    <svg className="bc-iw-img" viewBox="0 0 48 48" aria-hidden="true">
      <rect x="2" y="2" width="44" height="44" rx="9" fill="#00005B" />
      <path d="M17.2 30.6h-5.3l-1.1 3.6H7.1l5.4-16.4h4.2l5.4 16.4h-3.8l-1.1-3.6Zm-.85-3.1-1.8-6-1.8 6h3.6Z" fill="#9999FF" />
      <path d="M31.4 34.5c-3.6 0-6.1-2.4-6.1-6.4s2.5-6.5 6-6.5c3.4 0 5.6 2.3 5.6 6 0 .5 0 1-.1 1.4h-8c.2 1.7 1.3 2.6 2.9 2.6 1.2 0 2.2-.4 3-1.1l1.6 2.2c-1.2 1.2-2.9 1.8-4.9 1.8Zm-2.6-7.7h5c-.1-1.5-1-2.4-2.4-2.4-1.3 0-2.3.8-2.6 2.4Z" fill="#9999FF" />
    </svg>
  );
}

// ── COMPONENT ──────────────────────────────────────────────────────────────

export default function BentoSection({ onAboutClick, onVideoClick, onAIClick, onWebsiteClick, onSkillsClick }) {
  const head = useContent('bento', {
    eyebrow: 'Services & Work',
    title: 'The Full',
    titleAccent: 'Stack',
    sub: 'Everything I create — in one frame.',
  });
  const cardImg = useContent('images.bentoCards', DEFAULT_CARD_IMAGES);
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  // Scroll reveal + stats counter
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function animateCounter(spanEl, target, suffix, duration) {
      const isMillions = target >= 1_000_000;
      const startTime = performance.now();
      const tick = (now) => {
        const p = Math.min((now - startTime) / duration, 1);
        const v = Math.round(easeOutCubic(p) * target);
        const display = isMillions
          ? (v >= 1_000_000 ? '1M' : `${Math.round(v / 1000)}K`)
          : String(v);
        spanEl.textContent = display + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('bento-revealed');
          el.querySelectorAll('[data-count]').forEach((cEl) => {
            animateCounter(
              cEl,
              parseInt(cEl.dataset.count, 10),
              cEl.dataset.suffix ?? '',
              parseInt(cEl.dataset.dur, 10) || 1400,
            );
          });
          obs.disconnect();
        }
      },
      { threshold: 0.04 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Per-card spotlight glow tracking
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const onMove = (e) => {
      const card = e.target.closest('.bento-card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`);
    };
    grid.addEventListener('mousemove', onMove, { passive: true });
    return () => grid.removeEventListener('mousemove', onMove);
  }, []);

  // id="work" — the target every "View my work" CTA and the nav's Work link
  // point at. It used to be "services", which nothing linked to, so #work
  // resolved to nothing and all five of those links did nothing.
  return (
    <section ref={sectionRef} className="bento-section" id="work" aria-label="Services and Skills">

      <div className="bento-bg" aria-hidden="true" />
      <div className="bento-noise" aria-hidden="true" />
      <div className="bento-scanlines" aria-hidden="true" />

      {/* ── HEADER ── */}
      <div className="bento-head">
        <div className="bento-head-row">
          <div className="bento-head-line" />
          <span className="bento-head-eyebrow">{head.eyebrow}</span>
          <div className="bento-head-line" />
        </div>
        <h2 className="bento-head-title">
          {head.title} <span className="bento-head-accent">{head.titleAccent}</span>
        </h2>
        <ScrollReveal
          as="div"
          containerClassName="sr-plain"
          textClassName="bento-head-sub sr-plain"
          baseOpacity={0.12}
          baseRotation={0}
          blurStrength={5}
        >
          {head.sub}
        </ScrollReveal>
      </div>

      {/* ── GRID ── */}
      <div className="bento-grid" ref={gridRef}>

        {/* ══ 1. ABOUT ME ══ */}
        <div className="bento-card bc-about" style={{ '--delay': '0s', cursor: 'pointer' }} onClick={onAboutClick} role="button" tabIndex={0} aria-label="Open about me page">
          <video
            className="bca-bg-video"
            src="/ProFile Box.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className="bca-bg-tint" aria-hidden="true" />
          <div className="bca-content">
            <h3 className="bca-name">Kishore</h3>
            <p className="bca-role">AI Editor · Visual Storyteller</p>
            <div className="bca-tags">
              <span>2026</span>
              <span>Creator</span>
              <span>India</span>
            </div>
            <div className="bca-foot">
              <span className="bca-dot" aria-hidden="true" />
              <span>Available for projects</span>
            </div>
          </div>
        </div>

        {/* ══ 2. VIDEO EDITING ══ */}
        <div className="bento-card bc-video" style={{ '--delay': '0.07s', cursor: 'pointer' }} onClick={onVideoClick} role="button" tabIndex={0} aria-label="Open video editing page">
          <img className="bc-img-bg" src={cardImg[0]} alt="" aria-hidden="true" />
          <div className="bcv-blob" aria-hidden="true" />
          <div className="bcv-body">
            <p className="bc-eyebrow">01 · Service</p>
            <h3 className="bc-title">Video Editing</h3>
            <p className="bc-desc">Cinematic cuts, colour grading &amp; motion storytelling at 24fps.</p>
            <div className="bc-chips">
              {['Premiere Pro', 'DaVinci Resolve', 'After Effects'].map(t => (
                <span key={t} className="bc-chip">{t}</span>
              ))}
            </div>
          </div>
          <div className="bcv-deco" aria-hidden="true">
            <div className="bcv-play">
              <Play size={28} strokeWidth={0} fill="currentColor" />
            </div>
            <div className="bcv-strip">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bcv-frame" />)}
            </div>
          </div>
        </div>

        {/* ══ 3. AI IMAGES ══ */}
        <div className="bento-card bc-aiart" style={{ '--delay': '0.14s', cursor: 'pointer' }} onClick={onAIClick} role="button" tabIndex={0} aria-label="Open AI Images gallery">
          <img className="bc-img-bg" src={cardImg[1]} alt="" aria-hidden="true" />
          <div className="bcai-orb" aria-hidden="true" />
          <div className="bcai-orb2" aria-hidden="true" />
          <p className="bc-eyebrow">02 · Service</p>
          <h3 className="bc-title">AI Images</h3>
          <p className="bc-desc">Machine-born imagery guided by human intent.</p>
          <div className="bc-chips">
            <span className="bc-chip">Midjourney</span>
            <span className="bc-chip">ComfyUI</span>
            <span className="bc-chip">Stable Diffusion</span>
          </div>
          <div className="bcai-icon" aria-hidden="true"><SparkleIcon /></div>
        </div>

        {/* ══ 4. PROMPT ENGINEERING ══ */}
        <div
          className="bento-card bc-prompts"
          style={{ '--delay': '0.21s', cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          aria-label="Open Prompt Paper (opens in new tab)"
          onClick={() => window.open('https://promptpaper.buzz/', '_blank', 'noopener,noreferrer')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              window.open('https://promptpaper.buzz/', '_blank', 'noopener,noreferrer');
            }
          }}
        >
          <img className="bc-img-bg" src={cardImg[2]} alt="" aria-hidden="true" />
          <p className="bc-eyebrow">03 · Service</p>
          <h3 className="bc-title">Prompt Eng.</h3>
          <div className="bcp-term">
            <div className="bcp-topbar" aria-hidden="true">
              <span /><span /><span />
            </div>
            <div className="bcp-body">
              <span className="bcp-prompt">›</span>
              <span className="bcp-text">
                Generate a cinematic<br />noir at golden hour…
              </span>
              <span className="bcp-cursor" aria-hidden="true">█</span>
            </div>
          </div>
        </div>

        {/* ══ 5. WEBSITE ══ */}
        <div className="bento-card bc-website" style={{ '--delay': '0.28s', cursor: 'pointer' }} onClick={onWebsiteClick} role="button" tabIndex={0} aria-label="Open websites page">
          <img className="bc-img-bg" src={cardImg[3]} alt="" aria-hidden="true" />
          <p className="bc-eyebrow">04 · Service</p>
          <h3 className="bc-title">Websites</h3>
          <div className="bcw-code">
            <span className="bcw-ln">01</span><span><span className="bcw-tag">&lt;</span><span className="bcw-name">motion</span></span>
            <span className="bcw-ln">02</span><span>&nbsp;&nbsp;<span className="bcw-attr">depth</span>=<span className="bcw-str">"cinematic"</span></span>
            <span className="bcw-ln">03</span><span><span className="bcw-tag">/&gt;</span></span>
          </div>
          <div className="bc-chips">
            <span className="bc-chip">React</span>
            <span className="bc-chip">GSAP</span>
            <span className="bc-chip">Three.js</span>
          </div>
        </div>

        {/* ══ 6. SKILLS ══ */}
        <div className="bento-card bc-stats" style={{ '--delay': '0.35s', cursor: 'pointer' }} onClick={onSkillsClick} role="button" tabIndex={0} aria-label="Open skills page" onKeyDown={e => e.key === 'Enter' && onSkillsClick?.()}>
          <img className="bc-img-bg" src={cardImg[4]} alt="" aria-hidden="true" />
          <p className="bc-eyebrow">Skill Set</p>
          <h3 className="bc-title">Skills</h3>
          <div className="bcs-lottie">
            <DeferredLottie src="/guitar-lottie.lottie" loop autoplay />
          </div>
        </div>

        {/* ══ 7. CHROME EXTENSIONS ══ */}
        <div className="bento-card bc-chrome" style={{ '--delay': '0.42s' }}>
          <img className="bc-img-bg" src={cardImg[5]} alt="" aria-hidden="true" />
          <div className="bc-icon-wrap bc-iw-green">
            <ChromeMark />
          </div>
          <h3 className="bc-title">Chrome Extensions</h3>
          <p className="bc-desc">Custom browser tools that automate the mundane.</p>
        </div>

        {/* ══ 8. AE PLUGINS ══ */}
        <div className="bento-card bc-aeplug" style={{ '--delay': '0.49s' }}>
          <img className="bc-img-bg" src={cardImg[6]} alt="" aria-hidden="true" />
          <div className="bc-icon-wrap bc-iw-orange">
            <AfterEffectsMark />
          </div>
          <h3 className="bc-title">AE Plugins</h3>
          <p className="bc-desc">After Effects scripts &amp; plugins for faster creative flows.</p>
        </div>

        {/* ══ 9. MY TOOLS ══ */}
        <div className="bento-card bc-tools" style={{ '--delay': '0.56s' }}>
          <img className="bc-img-bg" src={cardImg[7]} alt="" aria-hidden="true" />
          <div className="bct-orb" aria-hidden="true" />
          <p className="bc-eyebrow">Arsenal</p>
          <h3 className="bc-title">My Tools</h3>
          <div className="bct-tags">
            {TOOLS.map(t => <span key={t} className="bct-tag">{t}</span>)}
          </div>
        </div>

        {/* ══ 10. SOCIAL MEDIA ══ */}
        <div className="bento-card bc-social" style={{ '--delay': '0.63s' }}>
          <img className="bc-img-bg" src={cardImg[8]} alt="" aria-hidden="true" />
          <p className="bc-eyebrow">Stay Connected</p>
          <h3 className="bc-title">Social Media</h3>
          <div className="bcsoc-grid">
            {SOCIALS.map(s => (
              <a key={s.name} href="#" className="bcsoc-item" aria-label={s.name}
                style={{ '--sc': s.color }}>
                <span className="bcsoc-icon" style={{ color: s.color }}>
                  <s.Icon size={16} strokeWidth={1.75} />
                </span>
                <div className="bcsoc-info">
                  <span className="bcsoc-name">{s.name}</span>
                  <span className="bcsoc-handle">{s.handle}</span>
                </div>
                <svg className="bcsoc-arrow-icon" width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                  <path d="M2 9L9 2M9 2H3M9 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* ══ 11. VIDEO ══ */}
        <div
          className="bento-card bc-cta"
          style={{ '--delay': '0.70s' }}
          aria-hidden="true"
        >
          <video
            className="bcc-video"
            src="/main1.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />

          {/* Hover warning — taunting "Don't click" pop-up */}
          <div className="bcc-warn" aria-hidden="true">
            <div className="bcc-warn-stripe">
              <span className="bcc-warn-stripe-text">
                ⚠ WARNING ⚠ WARNING ⚠ WARNING ⚠ WARNING ⚠ WARNING ⚠ WARNING ⚠
              </span>
            </div>

            <div className="bcc-warn-card">
              <div className="bcc-warn-glyph">⚠</div>
              <div className="bcc-warn-meta">SYSTEM · ALERT · 0×4F</div>
              <div className="bcc-warn-title">DON&rsquo;T CLICK</div>
              <div className="bcc-warn-sub">Restricted footage · viewer discretion advised</div>
            </div>

            <div className="bcc-warn-stripe">
              <span className="bcc-warn-stripe-text">
                ⚠ WARNING ⚠ WARNING ⚠ WARNING ⚠ WARNING ⚠ WARNING ⚠ WARNING ⚠
              </span>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
