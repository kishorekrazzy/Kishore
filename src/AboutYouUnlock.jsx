import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { computeProfile, saveDossier, clearDossier, dobProblem, toIso } from './aboutYou';
import './AboutYouUnlock.css';

/* ══════════════════════════════════════════════════════════════════════
   ABOUT YOU — THE DECODER

   Two fields and a dial. What makes it worth opening is the sequence,
   not the form: the panel switches on like a CRT, the date is entered
   into three lock barrels that roll each digit into place, the button
   has to be HELD rather than clicked (a ring charges around it), and
   the decode ends with the panel physically turning over to show the
   file on its back.

   The hold is the centre of it. A click is over before it registers;
   900ms of a ring filling under your thumb is the one moment where the
   thing feels like it is actually working something out. Releasing
   early rewinds the ring three times as fast, so an accidental tap
   snaps back instead of quietly doing nothing.

   Everything degrades under prefers-reduced-motion: the scramble, the
   count-ups and the decode all resolve instantly, and the hold unlocks
   on press. The information is identical; only the theatre is gone.
   ══════════════════════════════════════════════════════════════════════ */

const GLYPHS = '▚▞▓▒░ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*/\\';
const HOLD_MS   = 900;   // charge
const REWIND_MS = 300;   // discharge — deliberately faster than the charge
const DECODE_MS = 1750;

const nf = new Intl.NumberFormat('en-US');
const cf = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

const isReduced = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* Text that resolves out of noise, character by character. The settle
   front runs slightly ahead of the clock so the last letter lands a beat
   before the animation nominally ends — otherwise it reads as a stall. */
function Scramble({ text, dur = 620, delay = 0, className }) {
  const reduced = isReduced();
  const [out, setOut] = useState('');

  useEffect(() => {
    if (reduced) return undefined;
    let raf = 0;
    let t0  = 0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = (t - t0 - delay) / dur;
      if (p >= 1) { setOut(text); return; }
      const front = p <= 0 ? 0 : p * text.length * 1.15;
      setOut(
        text.split('')
            .map((c, i) => (i < front || c === ' ' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
            .join(''),
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, dur, delay, reduced]);

  return <span className={className}>{reduced ? text : (out || '\u00a0')}</span>;
}

/* A number that runs up to its value. Cubic ease-out, so the big ones
   (frames, heartbeats) spend most of their time near the answer rather
   than blurring past it. */
function CountUp({ to, dur = 1500, delay = 0, compact = false }) {
  const reduced = isReduced();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduced) return undefined;
    let raf = 0;
    let t0  = 0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, Math.max(0, (t - t0 - delay) / dur));
      setN(Math.round(to * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, dur, delay, reduced]);

  return <>{(compact ? cf : nf).format(reduced ? to : n)}</>;
}

/* One barrel of the date lock. The visible cells are spans; the real
   input sits transparent on top of them so the keyboard, autofill and
   screen readers all get a normal numeric field. Each digit span is
   keyed by its own character, so React remounts it when it changes and
   the roll-in keyframe replays — that is the whole trick. */
function Reel({ id, label, size, value, onValue, inputRef, onFilled, onBack }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="ayu-reel" data-focused={focused}>
      <span className="ayu-reel-cells" aria-hidden="true">
        {Array.from({ length: size }, (_, i) => {
          const ch = value[i];
          return (
            <span key={i} className={`ayu-cell${focused && i === value.length ? ' is-caret' : ''}`}>
              <span key={ch || '_'} className={`ayu-cell-d${ch ? '' : ' is-empty'}`}>{ch || '0'}</span>
            </span>
          );
        })}
      </span>

      <input
        id={id}
        ref={inputRef}
        className="ayu-reel-in"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={size}
        value={value}
        aria-label={label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, size);
          onValue(v);
          if (v.length === size) onFilled?.();
        }}
        onKeyDown={(e) => { if (e.key === 'Backspace' && !value) onBack?.(); }}
      />
      <label className="ayu-reel-lbl" htmlFor={id}>{label}</label>
    </div>
  );
}

const READOUT = [
  'MATCHING NAME TO FILE',
  'RESOLVING BIRTH FRAME',
  'COUNTING EVERY DAY SINCE',
  'DOSSIER ASSEMBLED',
];

const GHOSTS = ['YOUR NAME', 'WHO IS ASKING', 'FOR THE FILE'];

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'stars',   label: 'Stars'   },
  { id: 'numbers', label: 'Numbers' },
  { id: 'mind',    label: 'Mind'    },
  { id: 'life',    label: 'Life'    },
];

// Small building blocks for the file's pages. Every direct child of
// .ayu-tabbody is staggered in by CSS, so these stay presentational.
const Row = ({ k, v }) => (
  <div className="ayu-row"><dt>{k}</dt><dd>{v}</dd></div>
);

const Block = ({ title, children }) => (
  <section className="ayu-block">
    <h3 className="ayu-block-h">{title}</h3>
    {children}
  </section>
);

// A number with its title — the unit the Numbers page is built from.
const NumCard = ({ label, n, keyword }) => (
  <div className="ayu-num">
    <span className="ayu-num-n">{n}</span>
    <span className="ayu-num-l">{label}</span>
    <span className="ayu-num-k">{keyword}</span>
  </div>
);

export default function AboutYouUnlock({ initial, onClose, onUnlocked, onReset }) {
  // 'form' → 'decoding' → 'done'. Reopening an already-unlocked file
  // starts on 'done' with no theatre; it has been decoded already.
  const [phase,   setPhase]   = useState(() => (initial ? 'done' : 'form'));
  const [profile, setProfile] = useState(() => (initial ? computeProfile(initial) : null));
  const [closing, setClosing] = useState(false);

  const [name, setName] = useState(initial?.name || '');
  const [dd,   setDd]   = useState('');
  const [mm,   setMm]   = useState('');
  const [yy,   setYy]   = useState('');
  const [error, setError] = useState('');
  // 'idle' | 'done' | 'fail' — the copy button reports its own outcome.
  // The .ayu-err line lives on the form face, which has turned away by
  // the time anyone can press Copy, so a failure there is invisible.
  const [copyState, setCopyState] = useState('idle');
  const [ghost, setGhost] = useState(GHOSTS[0]);
  const [tab, setTab]     = useState('profile');

  const nameRef  = useRef(null);
  const ddRef    = useRef(null);
  const mmRef    = useRef(null);
  const yyRef    = useRef(null);
  const ringRef  = useRef(null);
  const panelRef = useRef(null);
  const returnTo = useRef(null);

  // ── open / close plumbing ───────────────────────────────────────────

  const requestClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => onClose?.(), isReduced() ? 0 : 240);
  }, [onClose]);

  /* Both of these change identity while the modal is open — `initial` the
     moment a file is decoded, `requestClose` on every render of the
     banner above. Read through refs so the effect below stays mount-only:
     re-running it would restore the page scroll and throw focus back to
     the button behind the dialog the instant someone unlocks. */
  const startedDecoded = useRef(!!initial);
  const closeLatest    = useRef(requestClose);
  useEffect(() => { closeLatest.current = requestClose; });

  useEffect(() => {
    returnTo.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeLatest.current(); }
    };
    window.addEventListener('keydown', onKey, true);

    /* The name field is the first thing to do, so it gets the caret.
       A file that is already decoded has nothing to type into, so focus
       goes to the panel itself — Escape and Tab both work from there,
       and no button opens wearing a focus ring. */
    const t = setTimeout(() => (startedDecoded.current ? panelRef : nameRef).current?.focus(), 420);

    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prev;
      returnTo.current?.focus?.();
    };
  }, []);

  /* Focus stays inside the panel while it is open — Tab off the last
     control wraps to the first rather than walking the page behind. */
  useEffect(() => {
    const onTab = (e) => {
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!items.length) return;
      const first = items[0];
      const last  = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onTab);
    return () => window.removeEventListener('keydown', onTab);
  }, []);

  // Placeholder cycles while the field is empty, so the panel is never
  // completely still while it waits for you.
  useEffect(() => {
    if (name || phase !== 'form' || isReduced()) return undefined;
    let i = 0;
    const id = setInterval(() => { i += 1; setGhost(GHOSTS[i % GHOSTS.length]); }, 2600);
    return () => clearInterval(id);
  }, [name, phase]);

  // ── validation ──────────────────────────────────────────────────────

  const problem = useMemo(() => {
    if (name.trim().length < 2) return 'A name first — two letters is enough.';
    return dobProblem(dd, mm, yy);
  }, [name, dd, mm, yy]);

  // ── hold to unlock ──────────────────────────────────────────────────

  const [holding, setHolding] = useState(false);
  const [refused, setRefused] = useState(false);
  const hold = useRef({ raf: 0, p: 0, last: 0, dir: 0 });

  const setP = (p) => {
    hold.current.p = p;
    ringRef.current?.style.setProperty('--p', p.toFixed(3));
  };

  const unlock = useCallback(() => {
    const prof = computeProfile({ name: name.trim().replace(/\s+/g, ' '), dob: toIso(dd, mm, yy) });
    if (!prof) return;
    setProfile(prof);
    saveDossier({ name: prof.name, dob: prof.dob });
    onUnlocked?.(prof);
    setPhase('decoding');
    setTimeout(() => setPhase('done'), isReduced() ? 0 : DECODE_MS);
  }, [name, dd, mm, yy, onUnlocked]);

  const runHold = useCallback(() => {
    cancelAnimationFrame(hold.current.raf);
    const step = (t) => {
      const h = hold.current;
      const dt = h.last ? t - h.last : 16;
      h.last = t;
      const next = h.p + (h.dir > 0 ? dt / HOLD_MS : -dt / REWIND_MS);

      if (next >= 1) { setP(1); setHolding(false); h.dir = 0; h.last = 0; unlock(); return; }
      if (next <= 0) { setP(0); h.dir = 0; h.last = 0; return; }

      setP(next);
      h.raf = requestAnimationFrame(step);
    };
    hold.current.raf = requestAnimationFrame(step);
  }, [unlock]);

  const startHold = useCallback((e) => {
    e?.preventDefault?.();
    if (phase !== 'form') return;
    if (problem) {
      // Refuse loudly rather than sit there doing nothing.
      setError(problem);
      setRefused(true);
      setTimeout(() => setRefused(false), 460);
      (name.trim().length < 2 ? nameRef : ddRef).current?.focus();
      return;
    }
    setError('');
    /* Capture the pointer for the duration. Without it a thumb that
       drifts off the button mid-hold fires pointerleave and rewinds the
       ring, which on a phone is most of the time. */
    if (e?.pointerId !== undefined) e.currentTarget?.setPointerCapture?.(e.pointerId);
    if (isReduced()) { setP(1); unlock(); return; }
    setHolding(true);
    hold.current.dir = 1;
    hold.current.last = 0;
    runHold();
  }, [phase, problem, name, runHold, unlock]);

  const endHold = useCallback(() => {
    if (hold.current.dir <= 0) return;
    setHolding(false);
    hold.current.dir = -1;
    hold.current.last = 0;
    runHold();
  }, [runHold]);

  useEffect(() => () => cancelAnimationFrame(hold.current.raf), []);

  // The face that just turned away may still hold the caret; the panel
  // takes it so the next Tab starts from the file that is now showing.
  useEffect(() => {
    if (phase === 'done') panelRef.current?.focus();
  }, [phase]);

  // ── dossier actions ─────────────────────────────────────────────────

  const rerun = () => {
    clearDossier();
    onReset?.();
    setProfile(null);
    setName(''); setDd(''); setMm(''); setYy('');
    setP(0);
    setTab('profile');
    setPhase('form');
    setTimeout(() => nameRef.current?.focus(), 600);
  };

  const copy = () => {
    if (!profile) return;
    const { astro, chinese, numerology: num, mind, tally } = profile;
    const text = [
      `FILE ${profile.fileNo} — ${profile.name.toUpperCase()}`,
      `Born ${profile.dateLong}, a ${profile.weekday}. ${profile.generation}.`,
      '',
      `STARS   ${astro.element} ${profile.zodiac.name}, ${astro.modality}, ruled by ${astro.ruler}`,
      `        ${astro.decan}${['st', 'nd', 'rd'][astro.decan - 1]} decan (${astro.decanRuler}) · ${astro.moon.name} at birth, ${astro.moon.illumination}% lit`,
      `        ${chinese.element} ${chinese.animal} (${chinese.force}) · ${astro.stone} · ${astro.flower}`,
      '',
      `NUMBERS Life Path ${num.life.n} — ${num.life.keyword}`,
      `        Expression ${num.expression.n} · Soul Urge ${num.soul.n} · Personality ${num.personality.n} · Maturity ${num.maturity.n}`,
      `        Personal Year ${num.personal.n} of 9`,
      '',
      `MIND    ${mind.temperament} temperament · ${profile.weekday}'s child`,
      `        Born in ${profile.born.toLocaleDateString('en-US', { month: 'long' })} — ${mind.month}`,
      '',
      `LIFE    ${profile.years} years · ${nf.format(profile.days)} days · ${cf.format(tally.frames)} frames at 24fps`,
      `        ${cf.format(tally.heartbeats)} heartbeats · ${nf.format(tally.fullMoons)} full moons · ${cf.format(tally.orbitKm)} km around the sun`,
      '',
      'Decoded at kishoreditx. Lore is for fun; the dates and counts are exact.',
    ].join('\n');
    const settle = (result) => {
      setCopyState(result);
      setTimeout(() => setCopyState('idle'), 2200);
    };
    if (!navigator.clipboard) { settle('fail'); return; }
    navigator.clipboard.writeText(text).then(() => settle('done'), () => settle('fail'));
  };

  // Pointer-tracked sheen across the finished file.
  const trackSheen = (e) => {
    const el = e.currentTarget;
    const r  = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  // ── faces ───────────────────────────────────────────────────────────

  /* inert rather than aria-hidden on the faces: the one that has turned
     away must also be untabbable, or the caret stays on a name field
     nobody can see once the panel has flipped. */
  const front = (
    <div className="ayu-face ayu-face--front" inert={phase === 'done'}>
      <p className="ayu-kicker">
        <span className="ayu-dot" /> IDENTITY REQUIRED
      </p>

      <h2 className="ayu-title" id="ayu-title">
        <Scramble text="ABOUT YOU" dur={700} delay={260} />
      </h2>
      <p className="ayu-lede">
        Give me a name and the day you started. I will decode the rest —
        and none of it leaves this browser.
      </p>

      <div className="ayu-field">
        <label className="ayu-lbl" htmlFor="ayu-name">Your name</label>
        <div className="ayu-name-wrap">
          <input
            id="ayu-name"
            ref={nameRef}
            className="ayu-name"
            type="text"
            autoComplete="given-name"
            maxLength={40}
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ddRef.current?.focus(); } }}
          />
          {!name && <span className="ayu-ghost" aria-hidden="true"><Scramble text={ghost} dur={520} /></span>}
          <span className="ayu-underline" aria-hidden="true" />
        </div>
      </div>

      <div className="ayu-field">
        <span className="ayu-lbl" id="ayu-dob-lbl">Date of birth</span>
        <div className="ayu-lock" role="group" aria-labelledby="ayu-dob-lbl">
          <Reel id="ayu-dd" label="Day" size={2} value={dd} inputRef={ddRef}
                onValue={(v) => { setDd(v); setError(''); }}
                onFilled={() => mmRef.current?.focus()} />
          <span className="ayu-sep" aria-hidden="true">/</span>
          <Reel id="ayu-mm" label="Month" size={2} value={mm} inputRef={mmRef}
                onValue={(v) => { setMm(v); setError(''); }}
                onFilled={() => yyRef.current?.focus()}
                onBack={() => ddRef.current?.focus()} />
          <span className="ayu-sep" aria-hidden="true">/</span>
          <Reel id="ayu-yy" label="Year" size={4} value={yy} inputRef={yyRef}
                onValue={(v) => { setYy(v); setError(''); }}
                onBack={() => mmRef.current?.focus()} />
        </div>
      </div>

      <p className={`ayu-err${error ? ' is-shown' : ''}`} role="status">{error || ' '}</p>

      <div className="ayu-unlock-row">
        <button
          type="button"
          ref={ringRef}
          className={`ayu-unlock${holding ? ' is-holding' : ''}${refused ? ' is-refused' : ''}`}
          style={{ '--p': 0 }}
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) startHold(e); }}
          onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') endHold(); }}
        >
          <span className="ayu-unlock-ring" aria-hidden="true" />
          <span className="ayu-unlock-fill" aria-hidden="true" />
          <span className="ayu-unlock-txt">
            <svg className="ayu-lockicon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="3.2" y="7" width="9.6" height="7" rx="2" stroke="currentColor" strokeWidth="1.3" />
              <path className="ayu-shackle" d="M5.6 7V5a2.4 2.4 0 0 1 4.8 0v2"
                    stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {holding ? 'DECODING…' : 'HOLD TO UNLOCK'}
          </span>
        </button>
        <span className="ayu-hint">Press and hold — about a second</span>
      </div>
    </div>
  );

  // ── the file's five pages ───────────────────────────────────────────

  const pages = profile && {
    profile: (
      <>
        <div className="ayu-tiles">
          <div className="ayu-tile">
            <span className="ayu-tile-v"><CountUp to={profile.years} dur={900} delay={220} /></span>
            <span className="ayu-tile-l">years on record</span>
          </div>
          <div className="ayu-tile">
            <span className="ayu-tile-v"><CountUp to={profile.days} dur={1500} delay={340} /></span>
            <span className="ayu-tile-l">days lived</span>
          </div>
          <div className="ayu-tile">
            <span className="ayu-tile-v"><CountUp to={profile.tally.frames} dur={1800} delay={460} compact /></span>
            <span className="ayu-tile-l">frames at 24fps</span>
          </div>
        </div>

        <dl className="ayu-rows">
          <Row k="Born" v={`${profile.dateLong}, a ${profile.weekday}`} />
          <Row k="Cohort" v={`${profile.generation} · born in ${profile.season}`} />
          <Row k="Star sign" v={`${profile.zodiac.glyph} ${profile.zodiac.name} · ${profile.astro.element}`} />
          <Row k="Life path" v={`${profile.numerology.life.n} · ${profile.numerology.life.keyword}`} />
          <Row k="Next birthday"
               v={profile.untilBirthday === 0
                   ? 'Today. Go and enjoy it.'
                   : `${profile.untilBirthday} days out, on a ${profile.tally.nextBirthdayWeekday}`} />
        </dl>

        <p className="ayu-era">{profile.era}</p>
      </>
    ),

    stars: (
      <>
        <div className="ayu-hero">
          <span className="ayu-hero-glyph">{profile.zodiac.glyph}</span>
          <div>
            <h3 className="ayu-hero-t">{profile.zodiac.name}</h3>
            <p className="ayu-hero-s">
              {profile.astro.element} · {profile.astro.modality} · {profile.astro.polarity} ·
              ruled by {profile.astro.ruler}
            </p>
          </div>
        </div>

        <p className="ayu-read">{profile.astro.read}</p>

        <div className="ayu-split">
          <Block title="Strengths"><p>{profile.astro.strengths}</p></Block>
          <Block title="Shadow"><p>{profile.astro.shadow}</p></Block>
        </div>

        <dl className="ayu-rows">
          <Row k="Decan" v={`${profile.astro.decan}${['st', 'nd', 'rd'][profile.astro.decan - 1]} decan · sub-ruled by ${profile.astro.decanRuler}`} />
          <Row k="Modality" v={profile.astro.modalRead} />
          <Row k="Moon at birth" v={`${profile.astro.moon.name} · ${profile.astro.moon.illumination}% lit, ${profile.astro.moon.age} days old`} />
          <Row k="Chinese year" v={`${profile.chinese.element} ${profile.chinese.animal} · ${profile.chinese.force}`} />
          <Row k="Birthstone" v={`${profile.astro.stone} · ${profile.astro.flower}`} />
        </dl>

        <p className="ayu-read">{profile.astro.moon.read}</p>
        <p className="ayu-read">{profile.chinese.trait}</p>
      </>
    ),

    numbers: (
      <>
        <div className="ayu-hero ayu-hero--num">
          <span className="ayu-hero-n">{profile.numerology.life.n}</span>
          <div>
            <h3 className="ayu-hero-t">{profile.numerology.life.keyword}</h3>
            <p className="ayu-hero-s">Life Path — the spine of the chart</p>
          </div>
        </div>

        <p className="ayu-read">{profile.numerology.life.read}</p>

        <div className="ayu-nums">
          <NumCard label="Expression"  n={profile.numerology.expression.n}  keyword={profile.numerology.expression.keyword} />
          <NumCard label="Soul urge"   n={profile.numerology.soul.n}        keyword={profile.numerology.soul.keyword} />
          <NumCard label="Personality" n={profile.numerology.personality.n} keyword={profile.numerology.personality.keyword} />
          <NumCard label="Maturity"    n={profile.numerology.maturity.n}    keyword={profile.numerology.maturity.keyword} />
        </div>

        <dl className="ayu-rows">
          <Row k="Birthday number"
               v={`${profile.numerology.birthday.n} → ${profile.numerology.birthday.reduced} · ${profile.numerology.birthday.keyword}`} />
          <Row k="Personal year" v={`${profile.numerology.personal.n} of 9`} />
        </dl>

        <p className="ayu-read">{profile.numerology.personal.read}</p>
        <p className="ayu-read ayu-read--dim">{profile.numerology.soul.read}</p>
      </>
    ),

    mind: (
      <>
        <Block title={`Born in ${profile.born.toLocaleDateString('en-US', { month: 'long' })}`}>
          <p className="ayu-cap">{profile.mind.month}</p>
        </Block>

        <Block title={`${profile.weekday}'s child`}>
          <p className="ayu-rhyme">“{profile.mind.weekday.rhyme}”</p>
          <p>{profile.mind.weekday.read}</p>
        </Block>

        <Block title={`${profile.mind.temperament} · ${profile.astro.element}`}>
          <p>{profile.mind.elementRead}</p>
        </Block>

        <dl className="ayu-rows">
          <Row k="Day ruler" v={profile.mind.weekday.planet} />
          <Row k="Reads as" v={profile.astro.modalRead} />
          <Row k="Watch for" v={profile.astro.shadow} />
        </dl>
      </>
    ),

    life: (
      <>
        <dl className="ayu-rows">
          <Row k="Days lived" v={nf.format(profile.days)} />
          <Row k="Heartbeats" v={`≈ ${cf.format(profile.tally.heartbeats)}`} />
          <Row k="Breaths" v={`≈ ${cf.format(profile.tally.breaths)}`} />
          <Row k="Spent asleep" v={`≈ ${profile.tally.sleptYears} years of it`} />
          <Row k="Full moons seen" v={nf.format(profile.tally.fullMoons)} />
          <Row k="Around the sun" v={`${profile.years} orbits · ${cf.format(profile.tally.orbitKm)} km`} />
          <Row k="Next milestone" v={`day ${nf.format(profile.tally.nextThousand)} — ${profile.tally.nextThousandOn}`} />
          <Row k="Half birthday" v={profile.tally.halfBirthday} />
          <Row k="Golden birthday"
               v={profile.tally.goldenDone
                   ? `Turning ${profile.tally.goldenAge} in ${profile.tally.goldenYear} — already spent`
                   : `Turning ${profile.tally.goldenAge} in ${profile.tally.goldenYear}`} />
        </dl>

        <p className="ayu-read">
          Every number above is worked out from two fields and today's date. Nothing was
          looked up, and nothing was sent anywhere.
        </p>
      </>
    ),
  };

  const back = profile && (
    <div className="ayu-face ayu-face--back" inert={phase !== 'done'}>
      <div className="ayu-doss" onPointerMove={trackSheen}>
        <span className="ayu-doss-sheen" aria-hidden="true" />

        <div className="ayu-doss-head">
          <span className="ayu-stamp" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18.4" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2.4" />
              <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
              <path d="M14 20.4 18.2 24.6 26.4 15.8" stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="ayu-doss-kicker">FILE {profile.fileNo} · DECODED</p>
            <h2 className="ayu-doss-name">
              {profile.name.split('').map((c, i) => (
                <span key={i} className="ayu-doss-ch" style={{ '--d': `${0.3 + i * 0.035}s` }}>
                  {c === ' ' ? ' ' : c}
                </span>
              ))}
            </h2>
          </div>
        </div>

        {/* Five pages rather than one long scroll: the header, the tabs
            and the actions stay put, and only the page between them
            moves. Arrow keys walk the strip, as a tablist should. */}
        <div className="ayu-tabs" role="tablist" aria-label="Sections of your file">
          {TABS.map(({ id, label }, i) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`ayu-tab-${id}`}
              aria-selected={tab === id}
              aria-controls="ayu-tabpanel"
              tabIndex={tab === id ? 0 : -1}
              className={`ayu-tab${tab === id ? ' is-on' : ''}`}
              onClick={() => setTab(id)}
              onKeyDown={(e) => {
                const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                if (!dir) return;
                e.preventDefault();
                const next = TABS[(i + dir + TABS.length) % TABS.length];
                setTab(next.id);
                document.getElementById(`ayu-tab-${next.id}`)?.focus();
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className="ayu-tabbody"
          id="ayu-tabpanel"
          role="tabpanel"
          aria-labelledby={`ayu-tab-${tab}`}
          tabIndex={0}
          key={tab}
        >
          {pages[tab]}
        </div>

        <div className="ayu-doss-foot">
          <p className="ayu-disclaimer">
            Astrology, numerology and the month readings are traditional lore, not science.
            The dates, counts and day names are exact; the character bits are for the fun of it.
          </p>
          <div className="ayu-doss-actions">
            <button type="button" className={`ayu-btn ayu-btn--solid${copyState === 'fail' ? ' is-fail' : ''}`}
                    onClick={copy}>
              {copyState === 'done' ? 'Copied to clipboard'
                : copyState === 'fail' ? 'Clipboard blocked — select and copy'
                : 'Copy my file'}
            </button>
            <button type="button" className="ayu-btn" onClick={rerun}>Run it again</button>
            <button type="button" className="ayu-btn ayu-btn--quiet" onClick={requestClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <div
      className={`ayu-scrim${closing ? ' is-closing' : ''}`}
      onPointerDown={(e) => { if (e.target === e.currentTarget) requestClose(); }}
    >
      <div
        className={`ayu-panel${closing ? ' is-closing' : ''}`}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ayu-title"
        tabIndex={-1}
      >
        <span className="ayu-scan" aria-hidden="true" />
        <span className="ayu-flare" aria-hidden="true" />

        <button type="button" className="ayu-close" onClick={requestClose} aria-label="Close">
          <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 2 12 12M12 2 2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>

        <div className="ayu-stage">
          <div className="ayu-flip" data-face={phase === 'done' ? 'back' : 'front'}>
            {front}
            {back}
          </div>
        </div>

        {/* The decode. Sits over the front face while the panel works,
            then the flip takes it away. */}
        {phase === 'decoding' && (
          <div className="ayu-decode">
            {/* One announcement. The list below is mid-scramble most of
                the time, and reading that aloud is noise, not progress. */}
            <p className="ayu-sr" role="status">Decoding your file…</p>
            <span className="ayu-decode-beam" aria-hidden="true" />
            <ul className="ayu-readout" aria-hidden="true">
              {READOUT.map((line, i) => (
                <li key={line} className="ayu-readout-li" style={{ '--d': `${i * 0.34}s` }}>
                  <Scramble text={line} dur={420} delay={i * 340} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
