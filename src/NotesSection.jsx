import { useState, useEffect, useRef, useCallback } from 'react';
import ScrollReveal from './ScrollReveal';
import spideyLogo from './assets/spidey logo.gif';
import { useContent } from './content/store';
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

const DEFAULT_NOTES = [
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
  {
    id: 'sound-is-half',
    kicker: 'Sound',
    title: 'Sound is half the picture',
    date: '2026-02-11',
    read: '3 min',
    cover: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=80',
    excerpt:
      'Nobody leaves because the grade was soft. They leave because the room tone changed under a cut.',
    body: [
      'Show an audience a slightly soft frame and they will not mention it. Change the room tone under a cut and they will feel that something is wrong without being able to name it. Sound is the sense that reports errors, and it reports them faster than the eye.',
      'The practical consequence is that continuity of ambience matters more than continuity of angle. A bed of room tone running under a scene will hide a dozen edits. Remove it and the same edits become audible as edits.',
      'I lay ambience before I touch music. Music is a decision about how the audience should feel; ambience is a decision about whether they believe where they are. Getting those in the wrong order produces a scene that is moving and unconvincing at the same time.',
      'The test: play the cut at low volume from another room. If you can still tell where each edit is, the sound is doing less work than the picture, and the picture is carrying something it should not have to.',
    ],
  },
  {
    id: 'easing-is-a-sentence',
    kicker: 'Motion',
    title: 'Easing is a sentence',
    date: '2026-01-24',
    read: '2 min',
    cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80',
    excerpt:
      'Linear says nothing. Every curve you choose is a claim about weight, and the audience reads it whether you meant it or not.',
    body: [
      'A linear move is the only easing that never happens in the physical world, which is why it always reads as cheap. Everything real accelerates and settles. The moment you pick a curve you are making a claim about how heavy the thing is.',
      'Fast-out is the honest default for anything the user asked for: it acknowledges the input immediately and then takes its time arriving. Slow-in-slow-out is for things moving of their own accord, where nothing is waiting on it.',
      'Duration is the other half and it is almost always too long. If you cannot tell whether an animation is 200ms or 400ms, it is 400ms and it should be 200ms. Users do not notice fast. They notice waiting.',
      'The one rule I keep: if an element is leaving, it goes faster than it arrived. Nobody needs a graceful exit from something they have already dismissed.',
    ],
  },
  {
    id: 'nothing-is-final',
    kicker: 'Process',
    title: 'Nothing is called final',
    date: '2025-12-08',
    read: '2 min',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
    excerpt:
      'v07 is a fact. FINAL_v3_ACTUAL_final is a confession that you lost track two days ago.',
    body: [
      'Every naming scheme that contains the word final is a scheme that has already failed. The word encodes a prediction about the future, and the prediction is always wrong, so the filename accretes apologies: final, final2, final_ACTUAL, final_USE_THIS.',
      'Numbers do not make predictions. v07 is simply the seventh, and v08 does not require you to admit anything. The discipline is trivial and it survives contact with a client who has opinions on a Friday afternoon.',
      'The second half is a one-line changelog per version. Not what you exported, what you changed. Three months later the only question you will ever ask is why a decision was made, and the file itself cannot answer that.',
      'This costs about ten seconds per export and it is the single highest-return habit I have. Nobody has ever regretted being able to go back.',
    ],
  },
  {
    id: 'skin-is-the-calibration',
    kicker: 'Colour',
    title: 'Skin is the only calibration that matters',
    date: '2025-11-19',
    read: '3 min',
    cover: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    excerpt:
      'An audience has no reference for what that wall should look like. They have a lifetime of reference for faces.',
    body: [
      'Nobody in the audience knows what colour the wall was. Nobody knows what the jacket was. Everybody, without being able to explain it, knows when a face is wrong — because they have spent their entire life looking at faces under every light there is.',
      'That makes skin the only part of the frame with an external reference, and therefore the only part worth calibrating hard. Get the face right and the audience will forgive almost anything happening behind it.',
      'The corollary is uncomfortable: a grade that looks beautiful on a scope and slightly green on a cheek is a failed grade. The scope does not have a lifetime of faces to compare against.',
      'I check skin on the worst screen I own before I check it on the best one. If it holds on the bad screen it will hold anywhere, and the good screen was never the problem.',
    ],
  },
  {
    id: 'model-is-not-the-product',
    kicker: 'AI',
    title: 'The model is not the product',
    date: '2025-10-02',
    read: '4 min',
    cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    excerpt:
      'Everyone can call the same model you can. What nobody else has is the thing you built around it.',
    body: [
      'The model is a commodity and it gets better every few months whether or not you do anything. Building your identity on which model you use is building on the one part of the stack you do not control and cannot differentiate.',
      'What is actually yours is everything around the call: the inputs you gathered, the failure cases you catalogued, the checks that catch a bad output before a client sees it, and the taste that decides which of five options ships.',
      'This is why the interesting work in AI tooling looks unglamorous from outside. It is plumbing, evaluation and judgement. The generation step is the shortest part of the pipeline and the least defensible.',
      'A useful question before starting anything: if the model got twice as good tomorrow, does my work become more valuable or less? If the answer is less, I was building the wrong half.',
    ],
  },
  {
    id: 'cut-to-the-reaction',
    kicker: 'Editing',
    title: 'Cut to the reaction, not the action',
    date: '2025-08-27',
    read: '2 min',
    cover: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    excerpt:
      'The punch is not the story. The face of the person who saw it is the story.',
    body: [
      'Beginners cut to whatever is moving. The result is technically coherent and emotionally flat, because movement is information and information is not feeling.',
      'The shot that carries a scene is almost always the one where somebody is receiving what just happened. The audience does not know how to feel about an event until they watch someone else feel about it first.',
      'This holds well outside drama. In an interview the cut is not on the answer, it is on the pause after it. In a product film it is not the feature, it is the moment the person using it realises what it means.',
      'Practically: when a scene is not working, stop looking for a better version of the action and go find the reaction you did not use. It is usually already in the rushes, one shot later, with the camera still running.',
    ],
  },
  {
    id: 'motion-needs-a-reason',
    kicker: 'Web',
    title: 'Motion needs a reason',
    date: '2025-07-14',
    read: '3 min',
    cover: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
    excerpt:
      'If you cannot say what a piece of animation is telling the user, it is not design. It is decoration with a frame cost.',
    body: [
      'Every animation on a page should be answerable in one sentence: what does this tell somebody that a static layout could not? Where did this come from, where did it go, what is loading, what did I just do. Those are reasons.',
      '"It felt a bit flat" is not a reason. Neither is the fact that it was fun to build, which is the honest source of most of it, including some of mine.',
      'The cost is real and it is paid by the people with the worst hardware. A page that is delightful on the machine it was built on and unusable on a four-year-old phone has not been designed, it has been indulged.',
      'The discipline that helps: build the page with no motion at all and make it good. Then add animation only where the static version genuinely failed to explain something. Almost everything you were going to add does not survive that.',
    ],
  },
  {
    id: 'taste-is-a-backlog',
    kicker: 'Craft',
    title: 'Taste is a backlog',
    date: '2025-06-03',
    read: '2 min',
    cover: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    excerpt:
      'Taste is not a gift. It is the accumulated memory of everything you have seen that did not work.',
    body: [
      'People talk about taste as though it arrives fully formed. In practice it is a list — a long, mostly unconscious list of things you have watched fail, and the specific way each one failed.',
      'Which is good news, because lists can be built deliberately. Every time something looks wrong and you work out why, that is one entry. Every time something looks wrong and you fix it by feel without diagnosing it, you got the fix and not the entry.',
      'This is the argument for finishing bad work rather than abandoning it. An abandoned piece teaches you nothing about the end, and the end is where most of the failures live.',
      'It is also why taste is not transferable by advice. I can give you my conclusions, but the entry in your list only exists once you have watched the thing fail yourself.',
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

/* Four on screen at a time; the rest are one swap away. */
const VISIBLE = 4;
const POOL = DEFAULT_NOTES.length;

export default function NotesSection() {
  /* CMS text over the defaults, per post and per key. `body` is stored as
     one string with blank lines between paragraphs — prose belongs in a
     textarea, not in four numbered inputs — and is split back out here. */
  const head   = useContent('notes', {});
  const items  = useContent('notes.items', null);
  const covers = useContent('images.notes', null);
  const NOTES = DEFAULT_NOTES.map((n, i) => {
    const c = items?.[i];
    if (!c) return { ...n, cover: covers?.[i] || n.cover };
    const body = typeof c.body === 'string'
      ? c.body.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean)
      : null;
    return {
      ...n,
      kicker:  c.kicker  || n.kicker,
      cover:   covers?.[i] || n.cover,
      title:   c.title   || n.title,
      date:    c.date    || n.date,
      read:    c.read    || n.read,
      excerpt: c.excerpt || n.excerpt,
      body:    body?.length ? body : n.body,
    };
  });

  const [openId, setOpenId] = useState(null);

  /* Four cards on screen, twelve written. `slots` holds which note is in
     which position; the swap button on a card keeps that one and deals
     three fresh ones into the others.

     The updater is pure — no cursor ref, no Math.random. React invokes
     updaters twice in development, and either of those would give a
     different answer on the second pass and silently skip a note. Walking
     forward from the highest index currently on screen is deterministic
     and cycles the whole set. */
  const [slots, setSlots] = useState(() => Array.from({ length: VISIBLE }, (_, i) => i));

  const swap = useCallback((slot) => {
    if (POOL <= VISIBLE) return;
    setSlots((cur) => {
      const keep = cur[slot];
      const used = new Set([keep]);
      const out = [...cur];
      let c = Math.max(...cur);
      for (let i = 0; i < out.length; i++) {
        if (i === slot) continue;
        do { c = (c + 1) % POOL; } while (used.has(c));
        used.add(c);
        out[i] = c;
      }
      return out;
    });
  }, []);

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

  const step = (dir) => {
    setOpenId((cur) => {
      const i = NOTES.findIndex((n) => n.id === cur);
      return NOTES[(i + dir + NOTES.length) % NOTES.length].id;
    });
  };

  return (
    <section ref={sectionRef} className="nt-section" id="notes" aria-label="Notes and process writing">
      <div className="nt-head">
        <div className="nt-head-row">
          <div className="nt-head-line" />
          <span className="nt-head-eyebrow">{head.eyebrow || 'Notes'}</span>
          <div className="nt-head-line" />
        </div>
        <h2 className="nt-title">{head.title || 'Working'} <span className="nt-title-accent">{head.titleAccent || 'notes'}</span></h2>
        <ScrollReveal
          as="div"
          containerClassName="sr-plain"
          textClassName="nt-sub sr-plain"
          baseOpacity={0.12}
          baseRotation={0}
          blurStrength={5}
        >
          {head.sub || 'Short pieces on colour, cutting, prompting and weight.'}
        </ScrollReveal>
      </div>

      {/* A media grid: cover, title, the two facts that matter, and the
          category carrying a mark. The first piece takes the accent panel,
          the way a featured item does in the reference. */}
      <ol className="nt-list">
        {slots.map((noteIdx, i) => {
          const n = NOTES[noteIdx];
          return (
          <li key={n.id} className="nt-item" style={{ '--i': i }}>
            <div className="nt-card">
            <button className="nt-open" onClick={() => setOpenId(n.id)} aria-label={`Read: ${n.title}`}>
              <span className="nt-thumb">
                {n.cover
                  ? <img src={n.cover} alt="" loading="lazy" draggable="false" />
                  : <i className="nt-thumb-fallback" aria-hidden="true" />}
                <span className="nt-thumb-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 5.5h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z"
                          stroke="currentColor" strokeWidth="1.6" />
                    <path d="M17 10.5 22 7.5v9l-5-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>

              <span className="nt-row">
                <h3 className="nt-card-title">{n.title}</h3>
                <span className="nt-stats">
                  {/* Read time and date rather than views and likes: this
                      is writing, not a feed, and inventing counters for it
                      would be inventing numbers. */}
                  <span className="nt-stat">
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M8 4.6V8l2.4 1.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    {n.read}
                  </span>
                  <span className="nt-stat">
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <rect x="2.2" y="3.4" width="11.6" height="10.4" rx="2" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M2.2 6.6h11.6M5.6 2.2v2.4M10.4 2.2v2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    <time dateTime={n.date}>{fmtDate(n.date)}</time>
                  </span>
                </span>
              </span>

              <span className="nt-by">
                <span className="nt-by-av" aria-hidden="true">
                  <img src={spideyLogo} alt="" draggable="false" />
                </span>
                <span className="nt-by-name">{n.kicker}</span>
                <span className="nt-by-mark" aria-hidden="true">
                  <svg viewBox="0 0 14 14" fill="none">
                    <path d="M3.4 7.2 5.9 9.7l4.7-5.4" stroke="currentColor" strokeWidth="1.9"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
            </button>

            {/* Opposite the profile mark, on the byline row. A sibling of
                the open button, never inside it — nesting one button in
                another is invalid and the parser pulls it back out. */}
            <button
              className="nt-swap"
              onClick={() => swap(i)}
              title="Show three different notes"
              aria-label={`Keep "${n.title}" and show three different notes`}
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2.6 5.4h8.2m0 0L8.4 3m2.4 2.4L8.4 7.8M13.4 10.6H5.2m0 0 2.4-2.4m-2.4 2.4L7.6 13"
                      stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            </div>
          </li>
          );
        })}
      </ol>

      {note && <Reader note={note} onClose={() => setOpenId(null)} onStep={step} />}
    </section>
  );
}
