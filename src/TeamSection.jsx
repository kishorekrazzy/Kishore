import { useState, useRef } from 'react';
import { useContent, withImages } from './content/store';
import { CardSwap, Card } from './CardSwap';
import './TeamSection.css';

const DEFAULT_TEAM = [
  {
    num: '01',
    role: 'Video Editor',
    tagline: 'Cuts silence into sequences',
    bio: 'Every frame deliberate, every transition earned. Specialized in cinematic storytelling, color narrative, and building emotional rhythm through motion at 24fps.',
    skills: ['Premiere Pro', 'DaVinci Resolve', 'Color Grading'],
    accent: '#7f76dc',
    img: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80&auto=format&fit=crop',
    bgImg: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=85&auto=format&fit=crop',
  },
  {
    num: '02',
    role: 'AI Artist',
    tagline: 'Prompts pixels into poetry',
    bio: 'Blending machine intelligence with human intuition to generate visuals that have never existed before — from concept to final artwork in a single workflow.',
    skills: ['Midjourney', 'Stable Diffusion', 'ComfyUI'],
    accent: '#986dd0',
    img: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80&auto=format&fit=crop',
    bgImg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=85&auto=format&fit=crop',
  },
  {
    num: '03',
    role: 'Vibe Coder',
    tagline: 'Ships interfaces that breathe',
    bio: 'Where logic meets aesthetics — turning abstract concepts into interactive digital experiences with motion, depth, and personality baked right in.',
    skills: ['React', 'Three.js', 'GSAP'],
    accent: '#ad65be',
    img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80&auto=format&fit=crop',
    bgImg: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&q=85&auto=format&fit=crop',
  },
  {
    num: '04',
    role: 'Creative Director',
    tagline: 'The vision behind the vision',
    bio: 'Shapes brand language, visual systems, and the emotional truth that connects through every project — from the first napkin sketch to the final frame.',
    skills: ['Art Direction', 'Brand Strategy', 'Motion Design'],
    accent: '#be5ea5',
    img: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=600&q=80&auto=format&fit=crop',
    bgImg: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=85&auto=format&fit=crop',
  },
  {
    num: '05',
    role: 'Tools Builder',
    tagline: 'Engineers the unfair advantage',
    bio: 'Builds custom pipelines, automation systems, and AI workflows that make the impossible routine — so the team creates at the speed of raw thought.',
    skills: ['Python', 'API Design', 'LLM Chains'],
    accent: '#c95a8b',
    img: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80&auto=format&fit=crop',
    bgImg: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=85&auto=format&fit=crop',
  },
];

export default function TeamSection() {
  const TEAM = withImages(DEFAULT_TEAM, useContent('images.team', null), 'img');
  const [activeIdx, setActiveIdx] = useState(0);
  const [displayedIdx, setDisplayedIdx] = useState(0);
  const [isOut, setIsOut] = useState(false);
  const cardSwapRef = useRef(null);

  const member = TEAM[displayedIdx];

  const handleActiveChange = (idx) => {
    if (idx === activeIdx) return;
    setActiveIdx(idx);
    setIsOut(true);
    setTimeout(() => {
      setDisplayedIdx(idx);
      setIsOut(false);
    }, 280);
  };

  const handleJumpToCard = (idx) => {
    if (idx === activeIdx) return;
    cardSwapRef.current?.goTo(idx);
  };

  return (
    <section className="ts-section" id="team" aria-label="Team Skills">

      {/* ── FULL-SCREEN B&W BACKGROUND IMAGES ── */}
      <div className="ts-full-bg" aria-hidden="true">
        {TEAM.map((m, i) => (
          <img
            key={m.num}
            src={m.bgImg}
            alt=""
            className={`ts-bg-slide${activeIdx === i ? ' ts-bg-slide--active' : ''}`}
            draggable="false"
          />
        ))}
        <div className="ts-bg-overlay" />
      </div>

      {/* ── BG LAYERS ── */}
      <div className="ts-bg" aria-hidden="true" />
      <div className="ts-noise" aria-hidden="true" />
      <div className="ts-scanlines" aria-hidden="true" />
      <div className="ts-blob" aria-hidden="true" style={{ backgroundColor: member.accent }} />
      <div className="ts-blob-secondary" aria-hidden="true" style={{ backgroundColor: member.accent }} />

      {/* ── SECTION LABEL ── */}
      <div className="ts-section-header">
        <h2 className="ts-sh-title">THE SYNDICATE</h2>
        <div className="ts-sh-line" />
      </div>

      {/* ── MAIN GRID ── */}
      <div className="ts-inner">

        {/* ════ LEFT PANEL ════ */}
        <div className="ts-left">

          {/* Vertical accent bar */}
          <div className="ts-accent-bar" style={{ backgroundColor: member.accent }} />

          {/* Counter row */}
          <div className="ts-counter-row">
            <span className="ts-num" style={{ color: member.accent }}>{member.num}</span>
            <span className="ts-num-sep">/ 05</span>
          </div>

          {/* Animated content block */}
          <div className={`ts-content${isOut ? ' ts-out' : ''}`}>

            <span className="ts-eyebrow" style={{ color: member.accent }}>
              — {member.tagline}
            </span>

            <h2 className="ts-role">{member.role}</h2>

            <div
              className="ts-rule"
              style={{ background: `linear-gradient(90deg, ${member.accent}90, transparent)` }}
            />

            <p className="ts-bio">{member.bio}</p>

            <div className="ts-skills">
              {member.skills.map((skill) => (
                <span
                  key={skill}
                  className="ts-skill"
                  style={{
                    borderColor: `${member.accent}45`,
                    color: `${member.accent}cc`,
                    background: `${member.accent}12`,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>

            <a href="#contact" className="ts-cta" id={`team-cta-${displayedIdx}`}>
              <span>Work With Us</span>
              <svg width="32" height="12" viewBox="0 0 32 12" fill="none" aria-hidden="true">
                <line x1="0" y1="6" x2="26" y2="6" stroke="currentColor" strokeWidth="1" />
                <polyline points="22,2 26,6 22,10" stroke="currentColor" strokeWidth="1" fill="none" />
              </svg>
            </a>

          </div>
        </div>

        {/* ════ RIGHT PANEL ════ */}
        <div className="ts-right">
          {/* Ambient glow behind cards */}
          <div
            className="ts-card-ambient"
            aria-hidden="true"
            style={{ background: member.accent }}
          />

          <CardSwap
            ref={cardSwapRef}
            width={300}
            height={410}
            cardDistance={50}
            verticalDistance={34}
            delay={2500}
            pauseOnHover={true}
            skewAmount={4}
            easing="elastic"
            onActiveChange={handleActiveChange}
            onCardClick={handleJumpToCard}
          >
            {TEAM.map((m, i) => (
              <Card key={i}>
                <div className="ts-card-inner">
                  <img
                    src={m.img}
                    alt={m.role}
                    className="ts-card-img"
                    loading="lazy"
                    draggable="false"
                  />
                  <div className="ts-card-gradient" />
                  <span className="ts-card-index">{m.num}</span>
                  <div className="ts-card-body">
                    <p className="ts-card-role-name">{m.role}</p>
                    <span
                      className="ts-card-badge"
                      style={{
                        borderColor: `${m.accent}60`,
                        background: `${m.accent}20`,
                        color: m.accent,
                      }}
                    >
                      Kish Studio
                    </span>
                  </div>
                  <div className="ts-card-edge" style={{ background: m.accent }} />
                </div>
              </Card>
            ))}
          </CardSwap>
        </div>

      </div>

      {/* ════ BOTTOM MEMBER TABS ════ */}
      <div className="ts-tabs" role="tablist" aria-label="Navigate team members">
        {TEAM.map((m, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === activeIdx}
            aria-label={`View ${m.role}`}
            className={`ts-tab${i === activeIdx ? ' ts-tab--active' : ''}`}
            onClick={() => handleJumpToCard(i)}
          >
            {/* Progress line at top */}
            {i === activeIdx && (
              <span
                className="ts-tab-line"
                style={{ background: m.accent }}
                aria-hidden="true"
              />
            )}
            <span className="ts-tab-num" style={i === activeIdx ? { color: m.accent } : {}}>
              {m.num}
            </span>
            <span className="ts-tab-role">{m.role}</span>
          </button>
        ))}
      </div>

    </section>
  );
}
