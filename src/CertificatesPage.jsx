import { useState, useRef, useCallback, useEffect } from 'react';
import './CertificatesPage.css';
import { useContent } from './content/store';
import ElasticMesh from './ElasticMesh';
import Scanner from './Scanner';

/* ══════════════════════════════════════════════════════════════════════
   CERTIFICATES

   A gallery wall: each certificate centred and large, lit from behind by
   the pillar, with a placard set directly underneath — index, name,
   issuer, note and reactions on one tight line.

   The previous version set the certificate left and its details right,
   which left a dead column beside every entry and stranded the text in
   96vh of empty space. Centring removes the empty half and lets the
   certificate have the full width of the page's attention.
   ══════════════════════════════════════════════════════════════════════ */

const REACTIONS = [
  { id: 'like',  emoji: '👍', label: 'Like' },
  { id: 'heart', emoji: '❤️', label: 'Love' },
  { id: 'wow',   emoji: '😮', label: 'Wow'  },
  { id: 'fire',  emoji: '🔥', label: 'Fire' },
  { id: 'clap',  emoji: '👏', label: 'Clap' },
];

const STORE_KEY = 'kish.certreacts';
const readCounts = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
};

// ── One entry ─────────────────────────────────────────────────────────
function CertItem({ cert, shot, index, total, counts, onReact, onSeen }) {
  const [bursts, setBursts] = useState([]);
  /* The mesh maps its texture across the whole sheet, so a certificate
     whose proportions differ from the sheet's gets stretched. Real scans
     come in every ratio, so the sheet takes its shape from the image
     instead of assuming one. 1200/850 is only the starting guess. */
  const [ratio, setRatio] = useState(1200 / 850);
  const seedRef = useRef(0);
  const rootRef = useRef(null);

  // Tells the sticky rail which entry is on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) onSeen(index); },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [index, onSeen]);

  const fire = useCallback((r) => {
    onReact(r.id);
    const id = ++seedRef.current;
    const parts = Array.from({ length: 14 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.5;
      const dist  = 110 + Math.random() * 200;
      return {
        k: `${id}-${i}`,
        emoji: r.emoji,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 70,
        rot: (Math.random() - 0.5) * 240,
        dur: 800 + Math.random() * 420,
        delay: Math.random() * 90,
      };
    });
    setBursts((b) => [...b, ...parts]);
    setTimeout(() => setBursts((b) => b.filter((p) => !p.k.startsWith(`${id}-`))), 1400);
  }, [onReact]);

  return (
    <article className="cert-item" ref={rootRef}>
      <div className="cert-sheet" style={{ '--ratio': ratio }}>
        {shot && (
          <img
            className="cert-still"
            src={shot}
            alt={`${cert.title} certificate`}
            onLoad={(e) => {
              const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
              if (w && h) setRatio(w / h);
            }}
          />
        )}
        {shot && (
          <ElasticMesh
            className="cert-mesh"
            image={shot}
            showGrid={false}
            interaction="hover"
            tilt={0}
            shading={0.58}
            pull={0.42}
            wobble={5}
            stiffness={0.05}
            damping={0.2}
            grabRadius={0.55}
            borderRadius={2}
            resolution={26}
          />
        )}
        <div className="cert-burst" aria-hidden="true">
          {bursts.map((p) => (
            <span
              key={p.k}
              className="cert-particle"
              style={{
                '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--r': `${p.rot}deg`,
                animationDuration: `${p.dur}ms`, animationDelay: `${p.delay}ms`,
              }}
            >{p.emoji}</span>
          ))}
        </div>
      </div>

      {/* Placard — everything about the work on one line beneath it */}
      <div className="cert-placard">
        <span className="cert-no">
          {String(index + 1).padStart(2, '0')}<i>/{String(total).padStart(2, '0')}</i>
        </span>

        <div className="cert-titles">
          <h2 className="cert-name">{cert.title}</h2>
          <p className="cert-issuer">{cert.issuer} <em>·</em> {cert.year}</p>
        </div>

        <p className="cert-note">{cert.note}</p>

        <div className="cert-reacts">
          {REACTIONS.map((r) => (
            <button key={r.id} className="cert-react" onClick={() => fire(r)}
                    aria-label={`${r.label} this certificate`}>
              <span className="cert-react-emoji">{r.emoji}</span>
              <span className="cert-react-count">{counts[r.id] || 0}</span>
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

// ── Page ──────────────────────────────────────────────────────────────
export default function CertificatesPage({ onBack }) {
  const copy  = useContent('certs', {});
  const shots = useContent('images.certs', []);
  const items = (copy.items || [])
    .map((c, i) => ({ ...c, _i: i }))
    .filter((c) => (c.title || '').trim());

  const [counts, setCounts] = useState(readCounts);
  const [active, setActive] = useState(0);

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(counts)); } catch { /* private mode */ }
  }, [counts]);

  const react = useCallback((key, rid) => {
    setCounts((c) => ({ ...c, [key]: { ...(c[key] || {}), [rid]: ((c[key] || {})[rid] || 0) + 1 } }));
  }, []);

  const onSeen = useCallback((i) => setActive(i), []);

  return (
    <div className="cert-root">
      {/* Background. Fixed behind the scroll, tuned down to a signal field
          rather than a light show — the certificates stay the brightest
          thing on the page. */}
      <div className="cert-bg" aria-hidden="true">
        <Scanner
          color1="#241d3a"
          color2="#b9c0ff"
          color3="#ffffff"
          speed={0.34}
          sweepSpeed={0.16}
          sweepWidth={2.1}
          sweepFalloff={7}
          scale={1.9}
          frequency={1.7}
          ripple={0.26}
          bandDensity={9}
          lineSharpness={6}
          glow={0.16}
          scanDirection="vertical"
          colorSpread={0.55}
          brightness={0.82}
          contrast={1.2}
          softness={1.5}
          vignette={0.62}
          scanline
          grain
          grainIntensity={0.035}
          opacity={0.55}
          mouseInteraction
          mouseRadius={0.55}
          mouseStrength={0.45}
        />
      </div>

      {/* Sticky rail — always says where you are */}
      <header className="cert-bar">
        <button className="cert-back" onClick={onBack}>← Back</button>
        <span className="cert-bar-title">{copy.eyebrow || 'Certificates'}</span>
        <span className="cert-bar-count">
          <b>{String(Math.min(active + 1, items.length || 1)).padStart(2, '0')}</b>
          <i>/ {String(items.length).padStart(2, '0')}</i>
        </span>
      </header>

      <section className="cert-open">
        <h1 className="cert-title">{copy.title || 'Proof of the hours'}</h1>
        <p className="cert-intro">{copy.intro}</p>
      </section>

      <div className="cert-list">
        {items.map((c, i) => (
          <CertItem
            key={c.title || i}
            cert={c}
            shot={shots[c._i]}
            index={i}
            total={items.length}
            counts={counts[c.title] || {}}
            onReact={(rid) => react(c.title, rid)}
            onSeen={onSeen}
          />
        ))}
      </div>

      {copy.outro && <p className="cert-outro">{copy.outro}</p>}
    </div>
  );
}
