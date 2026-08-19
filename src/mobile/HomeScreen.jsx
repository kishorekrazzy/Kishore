import { useState, useEffect, useRef } from 'react';
import { useContent, withImages } from '../content/store';
import { tap } from './mobileUtils';
import { Icon, Img, Reveal } from './ui';
import MobileHero from './MobileHero';

/* ══════════════════════════════════════════════════════════════════════
   HOME

   The narrative screen. It carries the same beats the desktop scroll
   does, in the same order and the same hue journey — hero amber, about
   crimson, syndicate magenta, reel, timeline — but each beat is re-cut
   for one column and a thumb.
   ══════════════════════════════════════════════════════════════════════ */

/* ── The fanned portraits ──
   Three cards stacked with the top one cycling every four seconds. The
   desktop version aligns on hover; a phone has no hover, so time does
   the job instead. */
function PortraitFan({ cards }) {
  const [top, setTop] = useState(0);
  const n = cards.length;

  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setTop((v) => (v + 1) % n), 4000);
    return () => clearInterval(t);
  }, [n]);

  if (!n) return null;

  return (
    <Reveal className="mb-fan">
      {cards.map((c, i) => {
        // Depth is distance from the current top, wrapped — so the stack
        // rotates rather than re-sorting.
        const d = (i - top + n) % n;
        if (d > 2) return null;
        return (
          <button
            key={i}
            className="mb-fan-card"
            data-d={d}
            onClick={() => { tap(); setTop(i); }}
            aria-label={c.title || c.label}
            aria-hidden={d === 0 ? undefined : 'true'}
          >
            <Img src={c.src} alt={c.alt || ''} w={420} />
            {d === 0 && <span className="mb-fan-label">{c.label}</span>}
          </button>
        );
      })}
    </Reveal>
  );
}

/* ── Syndicate rail ── */
function TeamRail({ members, images }) {
  const railRef = useRef(null);
  const [at, setAt] = useState(0);

  // The dots report where the rail is; they are not a control. Reading
  // scrollLeft on a passive scroll listener is cheap and avoids the
  // per-card observers the alternative would need.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const onScroll = () => {
      const step = el.scrollWidth / members.length;
      setAt(Math.round(el.scrollLeft / step));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [members.length]);

  return (
    <>
      <div className="mb-rail" ref={railRef}>
        {members.map((m, i) => (
          <article className="mb-member" key={i}>
            <div className="mb-member-top">
              <Img src={images[i]} alt={m.role} w={380} />
              <span className="mb-member-num">{m.num}</span>
            </div>
            <div className="mb-member-body">
              <h3>{m.role}</h3>
              <p className="mb-member-tag">{m.tagline}</p>
              <p className="mb-member-bio">{m.bio}</p>
              <div className="mb-tags">
                {String(m.skills || '').split(',').map((s) => s.trim()).filter(Boolean).map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mb-dots" aria-hidden="true">
        {members.map((_, i) => <i key={i} className={i === at ? 'on' : ''} />)}
      </div>
    </>
  );
}

export default function HomeScreen({ onGo, onOpenDossier, onStory }) {
  const about   = useContent('about', {});
  const team    = useContent('team', {});
  const teamImg = useContent('images.team', []);
  const promo   = useContent('promo', {});
  const banners = useContent('banners', {});
  const timeline = useContent('timeline', {});
  const bento   = useContent('bento', {});

  const cards = [...(about.cards || []), ...(about.extraCards || [])].slice(0, 6);
  const members = team.members || [];
  const paragraphs = about.paragraphs || [];
  const stats = about.stats || [];
  // Newest first, and only the ones with something written on them.
  const entries = [...(timeline.entries || [])].reverse().slice(0, 4);

  return (
    <>
      <MobileHero onCta={(id) => onGo('work', id)} onScrollDown={onStory} />

      {/* ══ ABOUT ══════════════════════════════════════════════════ */}
      <section className="mb-sec mb-about" id="mb-about" data-section="About">
        <PortraitFan cards={cards} />

        <div className="mb-head">
          <Reveal as="p" className="mb-eyebrow">{String(about.eyebrow || 'About Me').replace(/^—\s*/, '')}</Reveal>
          <Reveal as="h2" className="mb-h2" delay={60}>
            {(about.heading || ['Crafting', 'Visual', 'Realities']).map((w, i) => (
              <span key={i} className={i === 2 ? 'mb-accent' : undefined}>{w}{i < 2 ? ' ' : ''}</span>
            ))}
          </Reveal>
        </div>

        {paragraphs[0] && (
          <Reveal as="p" className="mb-about-lede" delay={100}>{paragraphs[0]}</Reveal>
        )}
        {paragraphs.slice(1, 3).map((p, i) => (
          <Reveal as="p" className="mb-body" delay={140 + i * 50} key={i} style={{ marginBottom: 14 }}>{p}</Reveal>
        ))}

        <Reveal delay={200} style={{ marginTop: 22 }}>
          <div className="mb-stats">
            {stats.map((s, i) => (
              <div className="mb-stat" key={i}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={240} style={{ marginTop: 20 }}>
          <button className="mb-btn mb-btn--fill mb-btn--wide" onClick={() => onGo('work')}>
            {about.cta || 'See My Work'}
            <Icon name="arrow" size={17} />
          </button>
        </Reveal>

        {/* ── The dossier ──
            The About You decoder, which the desktop presents as a wide
            festival banner. Same invitation, same button, in the shape a
            phone can actually hold. */}
        <Reveal delay={280}>
          <div className="mb-dossier">
            <div className="mb-dossier-top">
              <h3>{about.dossier?.title || 'PERSONAL DOSSIER'}</h3>
              <span className="mb-dossier-val">{about.dossier?.titleValue || 'SEALED'}</span>
            </div>
            <p className="mb-body" style={{ fontSize: '0.83rem' }}>
              {about.dossier?.sub || 'Your name and your birthday — I decode the rest in about ten seconds'}
            </p>
            <button className="mb-btn mb-btn--fill mb-btn--wide" onClick={onOpenDossier}>
              <Icon name="user" size={16} />
              {about.dossier?.cta || 'About You'}
            </button>
          </div>
        </Reveal>
      </section>

      {/* Chapter break. See .mb-strip — it is the page's one nod to
          what the work actually is. */}
      <div className="mb-strip" aria-hidden="true" />

      {/* ══ PROMO ═════════════════════════════════════════════════ */}
      <section className="mb-sec mb-sec--tight mb-sec--flush" style={{ '--h': 'var(--h-team)' }} data-section="Open for work">
        <Reveal className="mb-promo">
          <span className="mb-promo-badge">{promo.badge || 'OPEN FOR WORK'}</span>
          <h2>
            {promo.title1 || 'START A PROJECT WITH'}<br />
            {promo.title2 || 'KISHOREDITX'}
          </h2>
          <p>{promo.sub}</p>
          <button className="mb-btn mb-btn--fill" onClick={() => onGo('contact')}>
            {promo.cta || 'Start a project'}
            <Icon name="arrow" size={17} />
          </button>
        </Reveal>
      </section>

      {/* ══ SYNDICATE ═════════════════════════════════════════════ */}
      <section className="mb-sec mb-sec--flush mb-team" data-section="The Syndicate">
        <div className="mb-head" style={{ paddingInline: 'var(--mb-pad)' }}>
          <Reveal as="p" className="mb-eyebrow">Five roles, one person</Reveal>
          <Reveal as="h2" className="mb-h2" delay={60}>{team.heading || 'THE SYNDICATE'}</Reveal>
          <Reveal as="p" className="mb-body" delay={100}>
            Everything below is the same pair of hands wearing a different hat. Swipe through.
          </Reveal>
        </div>
        <TeamRail members={members} images={withImages(members.map(() => ({})), teamImg, 'src').map((x, i) => teamImg[i])} />
      </section>

      {/* ══ REEL ══════════════════════════════════════════════════
          The desktop plays this full-screen between sections. It stays,
          because it is the one moving thing on the page that is actually
          the work — but it is muted, inline and lazy so iOS plays it
          without going full-screen and Android does not pre-buffer it
          before you have scrolled anywhere near. */}
      <section className="mb-reel" data-section="Selected Work">
        {/* No poster attribute. An empty one resolves against the page
            URL, so the browser fetches the document as an image, fails,
            and some engines then refuse to paint the first frame at all.
            preload="metadata" rather than "none": the element needs a
            frame to show before it is scrolled to, and metadata is a few
            KB where the clip is four megabytes. */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label="Showreel"
          src="/Glitchvd.mp4"
        />
        <div className="mb-reel-body">
          <Reveal as="p" className="mb-eyebrow" style={{ color: 'var(--acc-hi)' }}>
            {banners.heading || 'Selected Work'}
          </Reveal>
          <Reveal as="h2" className="mb-h2" delay={60} style={{ color: 'rgb(var(--on-media-rgb))' }}>
            {bento.title || 'The Full'} <span className="mb-accent">{bento.titleAccent || 'Stack'}</span>
          </Reveal>
          <Reveal as="p" className="mb-hero-prose" delay={100}>
            {bento.sub || 'Everything I create — in one frame.'}
          </Reveal>
          <Reveal delay={140}>
            <button className="mb-btn mb-btn--fill" onClick={() => onGo('work')}>
              Open the work
              <Icon name="arrow" size={17} />
            </button>
          </Reveal>
        </div>
      </section>

      {/* ══ MARQUEE ═══════════════════════════════════════════════ */}
      <section className="mb-sec mb-sec--tight mb-sec--flush" style={{ '--h': 'var(--h-banner)' }}>
        <div className="mb-marquee" aria-hidden="true">
          {/* Two identical tracks. The second is what the first hands off
              to at the end of its travel, which is what makes the loop
              seamless. */}
          {[0, 1].map((k) => (
            <div className="mb-marquee-track" key={k} style={{ '--dur': '22s' }}>
              {(banners.items || []).map((b, i) => (
                <span className="mb-marquee-word" key={i}>
                  {b.label}<i>◆</i>
                </span>
              ))}
              <span className="mb-marquee-word"><em>KISHOREDITX</em><i>◆</i></span>
            </div>
          ))}
        </div>
      </section>

      {/* Chapter break. See .mb-strip — it is the page's one nod to
          what the work actually is. */}
      <div className="mb-strip" aria-hidden="true" />

      {/* ══ TIMELINE ══════════════════════════════════════════════ */}
      <section className="mb-sec" style={{ '--h': 'var(--h-notes)' }} data-section="The Record">
        <div className="mb-head">
          <Reveal as="p" className="mb-eyebrow">The record</Reveal>
          <Reveal as="h2" className="mb-h2" delay={60}>How it<br /><span className="mb-accent">got here</span></Reveal>
        </div>
        <Reveal className="mb-timeline" delay={100}>
          {entries.map((e, i) => (
            <div className="mb-tl-item" key={i}>
              <div className="mb-tl-date">
                {new Date(e.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
              </div>
              <h3>{e.title}</h3>
              <p>{e.note}</p>
            </div>
          ))}
        </Reveal>
        <Reveal delay={160}>
          <button className="mb-link" onClick={() => onGo('studio')}>
            Everything else in the studio
            <Icon name="arrow" size={15} />
          </button>
        </Reveal>
      </section>
    </>
  );
}
