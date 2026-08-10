import { useState, useEffect } from 'react';
import { useContent, withImages } from './content/store';
import { saveResponse, postComment, getComments } from './firebaseService';
import './SkillsPage.css';

// ── PACK DATA ────────────────────────────────────────────────────────
// downloadUrl: '#' = coming soon  |  set a real URL when ready
const DEFAULT_SKILL_PACKS = [
  {
    id: 'video-editing',
    label: '01',
    title: 'Video & Editing',
    items: [
      {
        id: 'premiere-ai-pack',
        name: 'Premiere Pro AI Pack',
        subtitle: 'Intelligent editing workflows for Claude',
        category: 'Video',
        version: 'v2.1',
        fileSize: '4.2 MB',
        fileType: 'ZIP',
        downloadCount: '2.4K',
        thumb: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=1600&q=80',
        video: '/main1.mp4',
        desc: 'A complete Claude skill set purpose-built for Premiere Pro editors. Includes smart prompt chains for rough cut feedback, colour grade notes, sequence analysis, export checklist automation, and client-ready deliverable scripts.',
        includes: [
          '15 optimised prompt templates',
          '8 workflow automation scripts',
          '3 project structure setups',
          'CLAUDE.md ready to drop in',
        ],
        tags: ['Premiere', 'Workflow', 'NLE', 'Export'],
        downloadUrl: '#',
      },
      {
        id: 'ae-motion-pack',
        name: 'After Effects Motion Pack',
        subtitle: 'Motion graphics Claude prompts',
        category: 'Motion',
        version: 'v1.4',
        fileSize: '2.8 MB',
        fileType: 'ZIP',
        downloadCount: '1.8K',
        thumb: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=80',
        video: '/Glitchvd.mp4',
        desc: 'Supercharge your After Effects workflow with Claude. Covers expression writing, animation timing critique, layer naming conventions, render queue optimisation, and script generation for repetitive tasks.',
        includes: [
          '12 expression helper prompts',
          'Animation timing reviewer',
          'Layer naming system',
          'Render optimisation guide',
        ],
        tags: ['After Effects', 'Expressions', 'Motion', 'Scripts'],
        downloadUrl: 'https://drive.google.com/file/d/19W3R6jPL-4dEkhuRkuRXnjA2DiQeYuR8/view?usp=drive_link#',
      },
      {
        id: 'shortform-pack',
        name: 'Short-form Content Pack',
        subtitle: 'Reels & Shorts editing assistant',
        category: 'Social',
        version: 'v3.0',
        fileSize: '1.6 MB',
        fileType: 'ZIP',
        downloadCount: '3.9K',
        thumb: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80',
        video: '/Glitchvd.mp4',
        desc: 'Everything you need for high-retention short-form video. Hook writing, caption generation, trend analysis prompts, music sync suggestions, and engagement-first cut structure scripts — all tailored for Claude.',
        includes: [
          '20 hook-writing prompts',
          'Caption & hashtag generator',
          'Trend analysis template',
          'Retention curve advisor',
        ],
        tags: ['Reels', 'Shorts', 'Hooks', 'Captions'],
        downloadUrl: '#',
      },
      {
        id: 'davinci-grade-pack',
        name: 'DaVinci Grade Assistant',
        subtitle: 'Colour grading workflow pack',
        category: 'Color',
        version: 'v1.1',
        fileSize: '3.1 MB',
        fileType: 'ZIP',
        downloadCount: '987',
        thumb: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80',
        video: '/CCtv/Office1.mp4',
        desc: 'Claude skills for colour science and grading in DaVinci Resolve. Primary node advice, secondary mask suggestions, LUT creation guidance, and client-ready colour brief templates.',
        includes: [
          'Node graph review prompts',
          'LUT naming & packaging guide',
          'Client colour brief template',
          'Log format cheat sheet',
        ],
        tags: ['DaVinci', 'LUTs', 'Color', 'Nodes'],
        downloadUrl: '#',
      },
    ],
  },
  {
    id: 'ai-prompting',
    label: '02',
    title: 'AI & Prompting',
    items: [
      {
        id: 'midjourney-mastery',
        name: 'Midjourney Mastery Pack',
        subtitle: 'Advanced MJ prompt engineering',
        category: 'AI Art',
        version: 'v4.2',
        fileSize: '1.9 MB',
        fileType: 'ZIP',
        downloadCount: '5.1K',
        thumb: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80',
        video: '/Glitchvd.mp4',
        desc: 'Master Midjourney with Claude as your creative co-pilot. Prompt deconstruction tools, style transfer guides, parameter sheets, and a full prompt library spanning cinematic, editorial, and commercial aesthetics.',
        includes: [
          '50+ prompt templates',
          'Parameter reference card',
          'Style library (30 looks)',
          'Variation strategy guide',
        ],
        tags: ['Midjourney', 'Prompts', 'Style', 'AI Art'],
        downloadUrl: '#',
      },
      {
        id: 'comfy-workflows',
        name: 'ComfyUI Workflow Pack',
        subtitle: 'Node workflow builder prompts',
        category: 'Stable Diffusion',
        version: 'v2.0',
        fileSize: '5.4 MB',
        fileType: 'ZIP',
        downloadCount: '1.2K',
        thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
        video: '/CCtv/Alien2.mp4',
        desc: 'Claude-powered node design and troubleshooting for ComfyUI. ControlNet setup guides, LoRA stacking advice, workflow debugging prompts, and batch automation for high-volume image production.',
        includes: [
          '10 pre-built workflow JSON files',
          'ControlNet setup guide',
          'LoRA stacking advisor',
          'Debug & fix prompt chain',
        ],
        tags: ['ComfyUI', 'Nodes', 'ControlNet', 'Automation'],
        downloadUrl: '#',
      },
      {
        id: 'character-design-pack',
        name: 'Character Design Suite',
        subtitle: 'Consistent character prompts',
        category: 'Design',
        version: 'v1.3',
        fileSize: '2.2 MB',
        fileType: 'ZIP',
        downloadCount: '2.7K',
        thumb: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1600&q=80',
        video: '/main1.mp4',
        desc: 'Build visually consistent characters across AI tools. Includes reference sheet builders, trait definition templates, outfit variation guides, and emotional expression prompt sets all optimised for Claude.',
        includes: [
          'Character sheet template',
          'Trait & personality builder',
          'Outfit variation prompts',
          'Expression set generator',
        ],
        tags: ['Character', 'Consistency', 'Design', 'Reference'],
        downloadUrl: '#',
      },
    ],
  },
  {
    id: 'web-code',
    label: '03',
    title: 'Web & Code',
    items: [
      {
        id: 'react-component-pack',
        name: 'React Component Generator',
        subtitle: 'Claude code skill for React devs',
        category: 'Frontend',
        version: 'v2.5',
        fileSize: '3.3 MB',
        fileType: 'ZIP',
        downloadCount: '1.6K',
        thumb: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80',
        video: '/main1.mp4',
        desc: 'A Claude code skill pack for rapid React development. Component scaffolding prompts, hook pattern guides, performance review templates, accessibility checklist automations, and Tailwind/CSS-in-JS helpers.',
        includes: [
          'Component generator prompts',
          'Custom hook templates',
          'Performance review script',
          'CLAUDE.md for React projects',
        ],
        tags: ['React', 'Components', 'Hooks', 'Frontend'],
        downloadUrl: '#',
      },
      {
        id: 'animation-code-pack',
        name: 'Animation Code Library',
        subtitle: 'GSAP & CSS animation helpers',
        category: 'Animation',
        version: 'v1.7',
        fileSize: '2.4 MB',
        fileType: 'ZIP',
        downloadCount: '978',
        thumb: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80',
        video: '/CCtv/Alien2.mp4',
        desc: 'Claude skills for building rich web animations. GSAP timeline builders, CSS keyframe generators, scroll-trigger helpers, and canvas animation templates — covering both code generation and optimisation.',
        includes: [
          'GSAP timeline templates',
          'CSS keyframe generator',
          'Scroll-trigger setup guide',
          'Canvas & WebGL helpers',
        ],
        tags: ['GSAP', 'CSS Anim', 'WebGL', 'Canvas'],
        downloadUrl: '#',
      },
      {
        id: 'python-automation-pack',
        name: 'Python Automation Pack',
        subtitle: 'Scripting & AI integration',
        category: 'Backend',
        version: 'v1.9',
        fileSize: '1.8 MB',
        fileType: 'ZIP',
        downloadCount: '2.1K',
        thumb: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1600&q=80',
        video: '/Glitchvd.mp4',
        desc: 'Claude skills for Python scripting and automation. Includes batch file processing prompts, API wrapper templates, data pipeline builders, CLI tool generators, and AI pipeline integration guides.',
        includes: [
          'Batch processing scripts',
          'API wrapper templates',
          'CLI tool generator',
          'AI pipeline builder',
        ],
        tags: ['Python', 'Automation', 'Scripts', 'API'],
        downloadUrl: '#',
      },
    ],
  },
  {
    id: 'creative-tools',
    label: '04',
    title: 'Creative Tools',
    items: [
      {
        id: 'lut-creator-pack',
        name: 'LUT Creator Pack',
        subtitle: 'Colour preset design with Claude',
        category: 'Color',
        version: 'v2.3',
        fileSize: '6.1 MB',
        fileType: 'ZIP',
        downloadCount: '3.3K',
        thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=80',
        video: '/CCtv/Office1.mp4',
        desc: 'Build and sell professional LUT packs using Claude as your colour science advisor. Covers naming conventions, packaging, log-to-rec709 maths, mood theory, and commercial release templates.',
        includes: [
          '5 base LUT templates',
          'Packaging & naming guide',
          'Colour theory prompts',
          'Commercial release template',
        ],
        tags: ['LUTs', 'Color', 'Packaging', 'Commercial'],
        downloadUrl: '#',
      },
      {
        id: 'brand-identity-pack',
        name: 'Brand Identity Builder',
        subtitle: 'Visual identity system prompts',
        category: 'Branding',
        version: 'v1.5',
        fileSize: '2.7 MB',
        fileType: 'ZIP',
        downloadCount: '1.4K',
        thumb: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80',
        video: '/main1.mp4',
        desc: 'Create cohesive brand identities with Claude guiding every decision. Mood board analysis, typography pairing, colour palette logic, tone-of-voice writing, and full brand guideline drafts.',
        includes: [
          'Brand audit template',
          'Typography pairing guide',
          'Colour palette builder',
          'Brand voice doc template',
        ],
        tags: ['Branding', 'Identity', 'Typography', 'Voice'],
        downloadUrl: '#',
      },
      {
        id: 'social-content-pack',
        name: 'Social Content Engine',
        subtitle: 'Multi-platform content system',
        category: 'Social',
        version: 'v3.1',
        fileSize: '2.0 MB',
        fileType: 'ZIP',
        downloadCount: '4.6K',
        thumb: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80',
        video: '/Glitchvd.mp4',
        desc: 'A complete Claude skill system for consistent social media output. Content calendar builders, platform-specific caption rewriters, hashtag research prompts, story arc generators, and engagement analytics interpreters.',
        includes: [
          'Content calendar template',
          'Platform caption rewriter',
          'Hashtag research tool',
          'Monthly analytics report',
        ],
        tags: ['Social', 'Content', 'Captions', 'Calendar'],
        downloadUrl: '#',
      },
    ],
  },
];

const TOTAL_DOWNLOADS = '22K+';

// ── COMPONENT ────────────────────────────────────────────────────────
export default function SkillsPage({ onBack }) {
  const SKILL_PACKS = withImages(DEFAULT_SKILL_PACKS, useContent('images.skillPacks', null), 'thumb');
  // Counted from the live list for the same reason — see BannerSection.
  const TOTAL_PACKS = SKILL_PACKS.reduce((n, t) => n + t.items.length, 0);
  const [activePack, setActivePack] = useState(null);
  const [likes, setLikes] = useState({});
  const [likedSet, setLikedSet] = useState(new Set());
  const [downloadedSet, setDownloadedSet] = useState(new Set());
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Load comments when modal opens
  useEffect(() => {
    if (!activePack) return;
    if (comments[activePack.id]) return;
    getComments(activePack.id, 30)
      .then(data => setComments(prev => ({ ...prev, [activePack.id]: data })))
      .catch(() => { });
  }, [activePack]);

  // Lock page scroll behind modal
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Escape closes modal
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setActivePack(null); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const handleLike = (pack) => {
    if (likedSet.has(pack.id)) return;
    setLikedSet(prev => new Set([...prev, pack.id]));
    setLikes(prev => ({ ...prev, [pack.id]: (prev[pack.id] ?? 0) + 1 }));
    saveResponse({ type: 'pack_like', value: pack.id, page: 'skills' }).catch(() => { });
  };

  const handleDownload = (e, pack) => {
    if (e) e.stopPropagation();
    if (!pack.downloadUrl || pack.downloadUrl === '#') return;
    setDownloadedSet(prev => new Set([...prev, pack.id]));
    window.open(pack.downloadUrl, '_blank', 'noopener,noreferrer');
    saveResponse({ type: 'pack_download', value: pack.id, page: 'skills' }).catch(() => { });
  };

  const handleShare = (pack) => {
    const url = `${window.location.origin}${window.location.pathname}?skill=${pack.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = url; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    saveResponse({ type: 'pack_share', value: pack.id, page: 'skills' }).catch(() => { });
  };

  const handleComment = async () => {
    if (!commentInput.trim() || !activePack) return;
    setCommentLoading(true);
    try {
      await postComment({
        workId: activePack.id,
        author: authorInput.trim() || 'Anonymous',
        text: commentInput.trim(),
      });
      const fresh = await getComments(activePack.id, 30);
      setComments(prev => ({ ...prev, [activePack.id]: fresh }));
      setCommentInput('');
    } catch {
      // Firebase may be blocked in dev preview
    } finally {
      setCommentLoading(false);
    }
  };

  const openPack = (pack) => {
    setActivePack(pack);
    setCommentInput('');
  };

  const activeComments = activePack ? (comments[activePack.id] ?? []) : [];
  const activeLikes = activePack ? (likes[activePack.id] ?? 0) : 0;
  const isSoon = (pack) => !pack.downloadUrl || pack.downloadUrl === '#';

  return (
    <div className="sp-page">

      {/* ── BACK ── */}
      <button className="sp-back" onClick={onBack} aria-label="Go back">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      {/* ── HERO ── */}
      <div className="sp-hero">
        <video autoPlay loop muted playsInline className="sp-hero-video" aria-hidden="true">
          <source src="/main1.mp4" type="video/mp4" />
        </video>
        <div className="sp-hero-overlay" aria-hidden="true" />
        <div className="sp-hero-grain" aria-hidden="true" />

        <div className="sp-hero-content">
          <span className="sp-hero-eyebrow">KishoreditX · Free Downloads · 2026</span>
          <h1 className="sp-hero-title" aria-label="Custom Claude Skills">
            <span className="sp-hero-line sp-hero-line--1">CUSTOM</span>
            <span className="sp-hero-line sp-hero-line--2">CLAUDE SKILLS</span>
          </h1>
          <p className="sp-hero-sub">
            Handcrafted prompt packs, workflow templates &amp; AI skill sets — download and deploy instantly.
          </p>

          <div className="sp-hero-stats" role="list">
            <div className="sp-hero-stat" role="listitem">
              <strong>{TOTAL_PACKS}</strong>
              <span>Free packs</span>
            </div>
            <div className="sp-hero-divider" aria-hidden="true" />
            <div className="sp-hero-stat" role="listitem">
              <strong>{SKILL_PACKS.length}</strong>
              <span>Categories</span>
            </div>
            <div className="sp-hero-divider" aria-hidden="true" />
            <div className="sp-hero-stat" role="listitem">
              <strong>{TOTAL_DOWNLOADS}</strong>
              <span>Downloads</span>
            </div>
          </div>
        </div>

        <div className="sp-hero-scroll" aria-hidden="true">
          <span>Browse packs</span>
          <div className="sp-hero-scroll-line" />
        </div>
      </div>

      {/* ── PACK SECTIONS ── */}
      <div className="sp-topics">
        {SKILL_PACKS.map(topic => (
          <section key={topic.id} className="sp-topic" aria-label={topic.title}>
            <div className="sp-topic-header">
              <div className="sp-topic-left">
                <span className="sp-topic-num" aria-hidden="true">{topic.label}</span>
                <h2 className="sp-topic-title">{topic.title}</h2>
              </div>
              <div className="sp-topic-right">
                <span className="sp-drag-hint" aria-hidden="true">Drag →</span>
                <button className="sp-view-all" aria-label={`View all ${topic.title} packs`}>
                  View All
                </button>
              </div>
            </div>

            <div className="sp-cards-row" role="list" aria-label={`${topic.title} packs`}>
              {topic.items.map(pack => (
                <button
                  key={pack.id}
                  className="sp-card"
                  role="listitem"
                  onClick={() => openPack(pack)}
                  aria-label={`${pack.name} — ${pack.category}, ${pack.version}`}
                >
                  {/* Thumbnail */}
                  <div className="sp-card-thumb" aria-hidden="true">
                    <img src={pack.thumb} alt="" loading="lazy" />
                    <div className="sp-card-thumb-overlay" />
                    <div className="sp-card-play">▶</div>
                    <span className="sp-card-filetype">{pack.fileType}</span>
                  </div>

                  {/* Body */}
                  <div className="sp-card-body">
                    <div className="sp-card-meta">
                      <span className="sp-card-cat">{pack.category}</span>
                      <span className="sp-card-ver">{pack.version}</span>
                    </div>
                    <h3 className="sp-card-name">{pack.name}</h3>
                    <p className="sp-card-sub">{pack.subtitle}</p>
                    <div className="sp-card-tags" aria-hidden="true">
                      {pack.tags.slice(0, 2).map(t => (
                        <span key={t} className="sp-card-tag">{t}</span>
                      ))}
                    </div>
                    <div className="sp-card-footer">
                      <span className="sp-card-dl-count">↓ {pack.downloadCount}</span>
                      <span
                        className={`sp-card-dl-btn${isSoon(pack) ? ' sp-card-dl-btn--soon' : ''}${downloadedSet.has(pack.id) ? ' sp-card-dl-btn--done' : ''}`}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { if (!isSoon(pack)) handleDownload(e, pack); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !isSoon(pack)) handleDownload(e, pack); }}
                      >
                        {isSoon(pack) ? '🔒 Soon' : downloadedSet.has(pack.id) ? '✓ Got it' : '↓ Get'}
                      </span>
                    </div>
                  </div>

                  {(likes[pack.id] ?? 0) > 0 && (
                    <div className="sp-card-likes" aria-label={`${likes[pack.id]} likes`}>
                      ♥ {likes[pack.id]}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ── TICKER ── */}
      <div className="sp-ticker" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i}>Free Download · Claude Skills · KishoreditX · 2026 ·&nbsp;</span>
        ))}
      </div>

      {/* ── CINEMATIC MODAL ── */}
      {activePack && (
        <div
          className="sp-modal-overlay"
          onClick={e => e.target === e.currentTarget && setActivePack(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${activePack.name} details`}
        >
          <div className="sp-modal">
            {/* Close */}
            <button
              className="sp-modal-close"
              onClick={() => setActivePack(null)}
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* ── VIDEO HERO — 16:9 big cinematic ── */}
            <div className="sp-modal-video-hero">
              <video autoPlay loop muted playsInline className="sp-modal-video">
                <source src={activePack.video} type="video/mp4" />
              </video>
              <div className="sp-modal-video-grad" aria-hidden="true" />
              <div className="sp-modal-video-hud" aria-hidden="true">
                <span className="sp-modal-video-live">● LIVE PREVIEW</span>
              </div>
              {/* Floating chips on video */}
              <div className="sp-modal-video-chips">
                <span className="sp-vchip">{activePack.category}</span>
                <span className="sp-vchip">{activePack.version}</span>
                <span className="sp-vchip">{activePack.fileSize}</span>
              </div>
            </div>

            {/* ── INFO PANEL ── */}
            <div className="sp-modal-body">
              {/* Title row */}
              <div className="sp-modal-head">
                <div className="sp-modal-head-left">
                  <h2 className="sp-modal-title">{activePack.name}</h2>
                  <p className="sp-modal-subtitle">{activePack.subtitle}</p>
                </div>
                <div className="sp-modal-head-meta">
                  <span className="sp-modal-dl-count">↓ {activePack.downloadCount}</span>
                  <span className="sp-modal-file-badge">{activePack.fileType}</span>
                </div>
              </div>

              {/* ── ACTION ROW: Download · Like · Share ── */}
              <div className="sp-modal-action-row">
                {/* Download */}
                <button
                  className={`sp-action-dl${isSoon(activePack) ? ' sp-action-dl--soon' : ''}${downloadedSet.has(activePack.id) ? ' sp-action-dl--done' : ''}`}
                  onClick={(e) => handleDownload(e, activePack)}
                  disabled={isSoon(activePack)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 16l-5-5h3V4h4v7h3l-5 5z" fill="currentColor" />
                    <path d="M5 18h14v2H5v-2z" fill="currentColor" opacity=".5" />
                  </svg>
                  {isSoon(activePack) ? 'Coming Soon' : downloadedSet.has(activePack.id) ? 'Downloaded' : 'Download Free'}
                </button>

                {/* Like */}
                <button
                  className={`sp-action-like${likedSet.has(activePack.id) ? ' sp-action-like--liked' : ''}`}
                  onClick={() => handleLike(activePack)}
                  aria-pressed={likedSet.has(activePack.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={likedSet.has(activePack.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {activeLikes > 0 ? activeLikes : 'Like'}
                </button>

                {/* Share */}
                <button
                  className={`sp-action-share${copied ? ' sp-action-share--copied' : ''}`}
                  onClick={() => handleShare(activePack)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  {copied ? 'Copied!' : 'Share'}
                </button>
              </div>

              {/* ── DETAILS GRID ── */}
              <div className="sp-modal-details">
                {/* Description */}
                <div className="sp-modal-desc-block">
                  <p className="sp-modal-desc">{activePack.desc}</p>
                </div>

                {/* Sidebar info */}
                <div className="sp-modal-sidebar">
                  {/* What's included */}
                  <div className="sp-includes">
                    <h4 className="sp-includes-title">What's included</h4>
                    <ul className="sp-includes-list">
                      {activePack.includes.map(item => (
                        <li key={item} className="sp-includes-item">
                          <span className="sp-check" aria-hidden="true">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Meta */}
                  <div className="sp-modal-meta-grid">
                    <div className="sp-meta-item">
                      <span className="sp-meta-label">Version</span>
                      <span className="sp-meta-value">{activePack.version}</span>
                    </div>
                    <div className="sp-meta-item">
                      <span className="sp-meta-label">Size</span>
                      <span className="sp-meta-value">{activePack.fileSize}</span>
                    </div>
                    <div className="sp-meta-item">
                      <span className="sp-meta-label">Format</span>
                      <span className="sp-meta-value">{activePack.fileType}</span>
                    </div>
                    <div className="sp-meta-item">
                      <span className="sp-meta-label">Downloads</span>
                      <span className="sp-meta-value sp-meta-value--orange">{activePack.downloadCount}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="sp-modal-tags">
                    {activePack.tags.map(t => (
                      <span key={t} className="sp-modal-tag">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── COMMENTS ── */}
              <div className="sp-comments">
                <h4 className="sp-comments-title">
                  Comments
                  {activeComments.length > 0 && (
                    <span className="sp-comments-count">{activeComments.length}</span>
                  )}
                </h4>
                <div className="sp-comment-form">
                  <input
                    className="sp-comment-author"
                    placeholder="Your name (optional)"
                    value={authorInput}
                    onChange={e => setAuthorInput(e.target.value)}
                    maxLength={40}
                  />
                  <div className="sp-comment-row">
                    <textarea
                      className="sp-comment-textarea"
                      placeholder="Share your thoughts…"
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); }
                      }}
                      rows={2}
                      maxLength={400}
                    />
                    <button
                      className="sp-comment-send"
                      onClick={handleComment}
                      disabled={commentLoading || !commentInput.trim()}
                    >{commentLoading ? '…' : '→'}</button>
                  </div>
                </div>
                <div className="sp-comment-list">
                  {activeComments.length === 0 ? (
                    <p className="sp-no-comments">No comments yet — be the first.</p>
                  ) : (
                    activeComments.map(c => (
                      <div key={c.id} className="sp-comment">
                        <span className="sp-comment-name">{c.author}</span>
                        <p className="sp-comment-text">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
