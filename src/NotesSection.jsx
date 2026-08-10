import { useState, useEffect, useCallback, useRef } from 'react';
import './NotesSection.css';

/* ══════════════════════════════════════════════════════════════════════
   NOTES — short process writing.

   Reasons to have it: it is the only part of a portfolio that shows how
   somebody thinks rather than what they delivered, it gives a repeat
   visitor a reason to come back, and it is the only content here with
   any chance of ranking for something.

   Posts are plain objects. Add one by adding an entry — no CMS, no
   build step, no markdown parser to keep alive.
   ══════════════════════════════════════════════════════════════════════ */

const NOTES = [
  {
    id: 'grade-not-filter',
    kicker: 'Colour',
    title: 'A grade is not a filter',
    date: '2026-07-28',
    read: '3 min',
    excerpt:
      'Balance first, look second. Doing it in that order is why a grade survives being watched on a phone in daylight.',
    body: [
      'Most people who say they colour grade are applying a look. A look is the last five per cent. The first ninety-five is balance: making every shot in the sequence agree about what white is, what black is, and where the skin sits.',
      'The reason this matters is that a look applied to unbalanced footage falls apart the moment the viewing conditions change. It was graded on a calibrated monitor in a dark room; it gets watched on a phone at a bus stop. If the underlying shots disagree with each other, that disagreement is what survives — not your look.',
      'So: neutralise, match, then grade. Node trees, not presets. A preset cannot know what your white balance was, which is exactly the thing that needs fixing first.',
      'The test I use is boring and reliable. Turn the look off. If the sequence still cuts together cleanly with no look at all, the grade will hold up anywhere. If it only works with the look on, the look is hiding a problem rather than adding something.',
    ],
  },
  {
    id: 'prompts-are-systems',
    kicker: 'AI',
    title: 'A prompt is not a prompt, it is a system',
    date: '2026-06-14',
    read: '4 min',
    excerpt:
      'The prompt that worked once is worthless. The thing worth keeping is the harness around it that tells you when it stops working.',
    body: [
      'Everyone keeps a prompt that worked. Almost nobody keeps the thing that tells them it stopped working. Models get updated, and the prompt that produced exactly the right output in March quietly produces something slightly worse in June. You will not notice, because you are looking at the output and it still looks fine.',
      'What makes prompting production-grade is unglamorous: version the prompt, keep a small set of inputs with known-good outputs, and re-run them when anything changes. That is it. Ten inputs is enough. You are not building an evaluation framework, you are building a smoke alarm.',
      'The other half is a failure catalogue. Every time a prompt produces something wrong, write down what wrong looked like. After thirty entries you stop writing prompts by intuition and start writing them against known failure modes, which is a completely different and much faster activity.',
      'I found the catalogue more useful than the prompts themselves. The prompts are disposable. The knowledge of how this particular model fails is not.',
    ],
  },
  {
    id: 'cut-what-you-love',
    kicker: 'Editing',
    title: 'The edit is mostly deletion',
    date: '2026-05-02',
    read: '2 min',
    excerpt:
      'Eleven passes on a fourteen-minute film. Almost all of the work was deciding what to remove.',
    body: [
      'A short film I cut last year went through eleven passes. Somewhere around pass four it stopped being about finding the good material and started being about removing the material I liked that was not helping.',
      'That is the actual skill. Anyone can keep the good shot. Cutting the good shot because the scene is better without it is the part that takes years, and it never stops being uncomfortable.',
      'The useful question is not "is this good?" — it is "what breaks if this is gone?" If the answer is nothing, it goes, however much it cost to get. The audience never sees what you removed. They only feel the pace of what is left.',
    ],
  },
  {
    id: 'weight-is-a-feature',
    kicker: 'Web',
    title: 'Weight is a feature',
    date: '2026-03-19',
    read: '3 min',
    excerpt:
      'A page that ships 700 MB of assets is not a rich experience. It is an unfinished one.',
    body: [
      'This portfolio used to ship over 700 MB of images. Not because it needed to — because an easter egg was implemented as a folder of 212 PNG frames exported straight out of After Effects, and nobody had asked what that cost.',
      'The interesting part is that fixing it did not require losing anything. The same animation as a short MP4 is around one per cent of the size. The same background photograph served in AVIF at the size it is actually displayed is a tenth. Nothing on screen changed.',
      'That is the general shape of it: weight is almost never a trade against quality, it is a trade against not having checked. Every heavy thing on a site is heavy for a specific, findable reason, and most of those reasons dissolve the moment you look at them.',
      'Then design for the budget from the start. Deciding a page must load in under a second on a bad connection is a design constraint like any other, and it makes better pages — the same way a runtime limit makes a better edit.',
    ],
  },
];

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function Reader({ note, onClose, onStep }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onStep]);

  return (
    <div className="nt-reader" role="dialog" aria-modal="true" aria-label={note.title} onClick={onClose}>
      <article className="nt-sheet" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} className="nt-close" onClick={onClose} aria-label="Close">✕</button>

        <header className="nt-sheet-head">
          <span className="nt-kicker">{note.kicker}</span>
          <h3>{note.title}</h3>
          <p className="nt-sheet-meta">
            <time dateTime={note.date}>{fmtDate(note.date)}</time> · {note.read} read
          </p>
        </header>

        <div className="nt-prose">
          {note.body.map((para, i) => <p key={i}>{para}</p>)}
        </div>

        <footer className="nt-sheet-foot">
          <button onClick={() => onStep(-1)} aria-label="Previous note">← Previous</button>
          <button onClick={() => onStep(1)} aria-label="Next note">Next →</button>
        </footer>
      </article>
    </div>
  );
}

export default function NotesSection() {
  const [openId, setOpenId] = useState(null);
  const sectionRef = useRef(null);
  const note = openId ? NOTES.find((n) => n.id === openId) : null;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('nt-in'); obs.disconnect(); } },
      { threshold: 0, rootMargin: '0px 0px -60px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const step = useCallback((dir) => {
    setOpenId((cur) => {
      const i = NOTES.findIndex((n) => n.id === cur);
      return NOTES[(i + dir + NOTES.length) % NOTES.length].id;
    });
  }, []);

  return (
    <section ref={sectionRef} className="nt-section" id="notes" aria-label="Notes and process writing">
      <div className="nt-head">
        <div className="nt-head-row">
          <div className="nt-head-line" />
          <span className="nt-head-eyebrow">Notes</span>
          <div className="nt-head-line" />
        </div>
        <h2 className="nt-title">Working <span className="nt-title-accent">notes</span></h2>
        <p className="nt-sub">Short pieces on colour, cutting, prompting and weight.</p>
      </div>

      <ol className="nt-list">
        {NOTES.map((n, i) => (
          <li key={n.id} className="nt-item" style={{ '--i': i }}>
            <button className="nt-card" onClick={() => setOpenId(n.id)} aria-label={`Read: ${n.title}`}>
              <span className="nt-card-kicker">{n.kicker}</span>
              <h3 className="nt-card-title">{n.title}</h3>
              <p className="nt-card-excerpt">{n.excerpt}</p>
              <span className="nt-card-foot">
                <time dateTime={n.date}>{fmtDate(n.date)}</time>
                <span className="nt-card-read">{n.read}</span>
              </span>
              <span className="nt-card-cta" aria-hidden="true">Read →</span>
            </button>
          </li>
        ))}
      </ol>

      {note && <Reader note={note} onClose={() => setOpenId(null)} onStep={step} />}
    </section>
  );
}
