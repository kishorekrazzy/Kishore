import { useState } from 'react';
import './AIImagesPage.css';
import { useContent, withImages } from './content/store';

const FILTERS = ['All', 'Portraits', 'Landscapes', 'Abstract', 'Cinematic', 'Characters'];

const DEFAULT_IMAGES = [
  { id: 1,  src: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1600&q=80',             title: 'Studio Silhouette',   cat: 'Portraits',   model: 'Midjourney v6',    size: 'xl',   ac: '#ff3344', num: '01', tags: ['portrait', 'studio', 'dramatic'] },
  { id: 2,  src: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=1600&q=80',                   title: 'Scarlet Matrix',      cat: 'Abstract',    model: 'Stable Diffusion', size: 'tall', ac: '#ff2244', num: '02', tags: ['abstract', 'matrix', 'red'] },
  { id: 3,  src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',             title: 'Hyperreal Genesis',   cat: 'Cinematic',   model: 'Midjourney v6',    size: 'sm',   ac: '#e50914', num: '03', tags: ['cinematic', 'hyperreal', 'dark'] },
  { id: 4,  src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1600&q=80',                   title: 'Dark Transition',     cat: 'Abstract',    model: 'ComfyUI',          size: 'sm',   ac: '#cc0033', num: '04', tags: ['abstract', 'dark', 'shift'] },
  { id: 5,  src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80',     title: 'Natural Light',       cat: 'Portraits',   model: 'Midjourney v6',    size: 'wide', ac: '#ff3344', num: '05', tags: ['portrait', 'natural', 'light'] },
  { id: 6,  src: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80',                   title: 'Deep Render',         cat: 'Cinematic',   model: 'ComfyUI',          size: 'tall', ac: '#ff4400', num: '06', tags: ['cinematic', 'depth', 'render'] },
  { id: 7,  src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80',                   title: 'Void Form',           cat: 'Abstract',    model: 'Stable Diffusion', size: 'sm',   ac: '#dd0022', num: '07', tags: ['void', 'form', 'abstract'] },
  { id: 8,  src: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1600&q=80',             title: 'Neural Portrait',     cat: 'Characters',  model: 'Midjourney v6',    size: 'sm',   ac: '#ff4400', num: '08', tags: ['character', 'neural', 'generated'] },
  { id: 9,  src: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=1600&q=80',             title: 'Studio Drama',        cat: 'Portraits',   model: 'Midjourney v6',    size: 'xl',   ac: '#e50914', num: '09', tags: ['portrait', 'studio', 'dramatic'] },
  { id: 10, src: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=80',                   title: 'Synthetic Dream',     cat: 'Cinematic',   model: 'ComfyUI',          size: 'sm',   ac: '#cc0033', num: '10', tags: ['cinematic', 'synthetic', 'dream'] },
  { id: 11, src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80',                   title: 'Crimson Shift',       cat: 'Abstract',    model: 'Stable Diffusion', size: 'wide', ac: '#ff2244', num: '11', tags: ['crimson', 'shift', 'abstract'] },
  { id: 12, src: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=80',             title: 'Ember Wave',          cat: 'Abstract',    model: 'ComfyUI',          size: 'tall', ac: '#ff1133', num: '12', tags: ['ember', 'wave', 'abstract'] },
  { id: 13, src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=80',     title: 'Sari & Light',        cat: 'Portraits',   model: 'Midjourney v6',    size: 'wide', ac: '#ff3344', num: '13', tags: ['portrait', 'traditional', 'light'] },
  { id: 14, src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80',                   title: 'Quantum Bloom',       cat: 'Landscapes',  model: 'Midjourney v6',    size: 'sm',   ac: '#ff4400', num: '14', tags: ['landscape', 'quantum', 'bloom'] },
  { id: 15, src: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=1600&q=80',             title: 'Fractal Pulse',       cat: 'Abstract',    model: 'Stable Diffusion', size: 'sm',   ac: '#ff3344', num: '15', tags: ['fractal', 'pulse', 'abstract'] },
  { id: 16, src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80', title: 'Luminous Portrait', cat: 'Portraits',   model: 'Midjourney v6',    size: 'tall', ac: '#cc0033', num: '16', tags: ['portrait', 'luminous', 'skin'] },
  { id: 17, src: 'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?auto=format&fit=crop&w=1600&q=80',             title: 'Phoenix State',       cat: 'Cinematic',   model: 'ComfyUI',          size: 'wide', ac: '#ff4400', num: '17', tags: ['cinematic', 'phoenix', 'fire'] },
  { id: 18, src: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80',             title: 'Red Frequency',       cat: 'Abstract',    model: 'Stable Diffusion', size: 'sm',   ac: '#dd0022', num: '18', tags: ['red', 'frequency', 'abstract'] },
  { id: 19, src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',             title: 'Glitch Entity',       cat: 'Characters',  model: 'ComfyUI',          size: 'sm',   ac: '#e50914', num: '19', tags: ['character', 'glitch', 'entity'] },
  { id: 20, src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80',             title: 'Neon Bloom',          cat: 'Landscapes',  model: 'Midjourney v6',    size: 'tall', ac: '#ff2244', num: '20', tags: ['landscape', 'neon', 'bloom'] },
  { id: 21, src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',             title: 'Phase Shift',         cat: 'Abstract',    model: 'Stable Diffusion', size: 'sm',   ac: '#cc0033', num: '21', tags: ['phase', 'shift', 'abstract'] },
  { id: 22, src: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80',             title: 'Ember Echo',          cat: 'Cinematic',   model: 'ComfyUI',          size: 'wide', ac: '#ff4400', num: '22', tags: ['cinematic', 'ember', 'echo'] },
  { id: 23, src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80',                   title: 'Signal Break',        cat: 'Abstract',    model: 'Stable Diffusion', size: 'sm',   ac: '#ff2244', num: '23', tags: ['signal', 'break', 'abstract'] },
];

// ── FLAT GRID CARD ───────────────────────────────────────────────────
function Card({ img }) {
  return (
    <div
      className={`aip-card aip-card--${img.size}`}
      style={{ '--ac': img.ac }}
      role="img"
      aria-label={img.title}
    >
      <img className="aip-img" src={img.src} alt={img.title} loading="lazy" />
      <div className="aip-mesh"  aria-hidden="true" />
      <div className="aip-grain" aria-hidden="true" />
      <span className="aip-bignum" aria-hidden="true">{img.num}</span>
      <div className="aip-overlay">
        <div className="aip-overlay-body">
          <p className="aip-overlay-cat">{img.cat}</p>
          <h3 className="aip-overlay-title">{img.title}</h3>
          <p className="aip-overlay-model">{img.model}</p>
          <div className="aip-tags">
            {img.tags.map(t => <span key={t} className="aip-tag">#{t}</span>)}
          </div>
        </div>
        <div className="aip-overlay-bar" />
      </div>
      <div className="aip-label">
        <span className="aip-label-num">{img.num}</span>
        <span className="aip-label-title">{img.title}</span>
        <span className="aip-label-cat">{img.cat}</span>
      </div>
    </div>
  );
}

// ── PAGE ─────────────────────────────────────────────────────────────
export default function AIImagesPage({ onBack }) {
  const IMAGES = withImages(DEFAULT_IMAGES, useContent('images.aiHero', null), 'src');
  const [filter, setFilter] = useState('All');
  const visible = filter === 'All' ? IMAGES : IMAGES.filter(i => i.cat === filter);

  return (
    <div className="aip-root">

      {/* ── NAV ── */}
      <nav className="aip-nav">
        <button className="aip-back" onClick={onBack}>
          <span>←</span> Portfolio
        </button>
        <span className="aip-nav-brand">AI Images · KishoreditX</span>
        <div className="aip-nav-pad" aria-hidden="true" />
      </nav>

      {/* ── HERO ── */}
      <div className="aip-hero" aria-label="AI Images collection">
        <div className="aip-hero-glow" aria-hidden="true" />
        <p className="aip-hero-sup">KishoreditX &nbsp;·&nbsp; Machine Vision</p>
        <h1 className="aip-hero-title">AI IMAGES</h1>
        <p className="aip-hero-sub">
          AI-generated imagery guided by human intent — each prompt a directive, each output a revelation.
        </p>
        <div className="aip-hero-stats">
          <span>200+ Generations</span>
          <span className="aip-hs-dot">·</span>
          <span>Midjourney</span>
          <span className="aip-hs-dot">·</span>
          <span>ComfyUI</span>
          <span className="aip-hs-dot">·</span>
          <span>Stable Diffusion</span>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="aip-filters" role="tablist" aria-label="Filter by category">
        {FILTERS.map(f => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            className={`aip-filter-btn${filter === f ? ' aip-filter-btn--on' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── FLAT GRID ── */}
      <div className="aip-grid-wrap">
        <div className="aip-grid">
          {visible.map(img => <Card key={img.id} img={img} />)}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="aip-footer">
        <span>All works generated by Kish using AI tools.</span>
        <span>KishoreditX © 2026</span>
      </div>

    </div>
  );
}
