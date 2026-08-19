/* ══════════════════════════════════════════════════════════════════════
   ABOUT YOU — the maths behind the dossier

   Pure functions and browser storage only. No React, so both the banner
   and the modal can read the same numbers without one importing the
   other's component module (which is what breaks fast refresh).

   Nothing here talks to the network. A visitor's name and birth date
   stay in this browser's localStorage and nowhere else, which is what
   the banner's "Learn more" drawer promises.
   ══════════════════════════════════════════════════════════════════════ */

import {
  SIGNS, ELEMENTS, MODALITIES, ANIMAL_TRAITS, YEAR_ELEMENTS, NUMBERS,
  PERSONAL_YEARS, MONTH_CHARACTER, WEEKDAYS, MOON_PHASES, BIRTHSTONES,
  BIRTH_FLOWERS, GENERATIONS,
} from './aboutYouLore.js';

const KEY = 'kx.dossier.v1';

// ── STORAGE ──────────────────────────────────────────────────────────
// Every call is guarded: Safari private mode throws on setItem, and a
// half-written value from an older build should read as "not unlocked"
// rather than crash the section.

export function readDossier() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved.name !== 'string' || typeof saved.dob !== 'string') return null;
    return parseDob(saved.dob) ? { name: saved.name, dob: saved.dob } : null;
  } catch { return null; }
}

export function saveDossier({ name, dob }) {
  try { localStorage.setItem(KEY, JSON.stringify({ name, dob })); } catch { /* private mode */ }
}

export function clearDossier() {
  try { localStorage.removeItem(KEY); } catch { /* private mode */ }
}

// ── DATES ────────────────────────────────────────────────────────────

/* 'YYYY-MM-DD' → Date at local midnight, or null.
   Built from parts rather than passed to the Date parser: a bare
   'YYYY-MM-DD' string is read as UTC, which lands on the previous day
   for anyone west of Greenwich and shifts every number below by one. */
export function parseDob(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  // Rejects 31/02 and friends — the constructor rolls them over silently.
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

export function toIso(dd, mm, yyyy) {
  return `${String(yyyy).padStart(4, '0')}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

/* What is wrong with this date, in a sentence, or '' if nothing is.
   The modal shows this under the reels instead of just refusing. */
export function dobProblem(dd, mm, yyyy) {
  if (dd.length < 2 || mm.length < 2 || yyyy.length < 4) return 'Fill all three — day, month, year.';
  const date = parseDob(toIso(dd, mm, yyyy));
  if (!date) return "That date doesn't exist on any calendar.";
  if (date > new Date()) return 'That is in the future. Impressive, but no.';
  if (date.getFullYear() < 1900) return 'Before 1900 the maths stops being flattering.';
  return '';
}

// ── LOOKUPS ──────────────────────────────────────────────────────────

/* Upper bound of each sign, as [month (1-12), last day]. Each glyph
   carries U+FE0E so it renders as monochrome text and takes the gold
   around it — the emoji presentation drops a purple tile into the row. */
const ZODIAC = [
  { end: [1, 19],  name: 'Capricorn',  glyph: '♑\uFE0E' },
  { end: [2, 18],  name: 'Aquarius',   glyph: '♒\uFE0E' },
  { end: [3, 20],  name: 'Pisces',     glyph: '♓\uFE0E' },
  { end: [4, 19],  name: 'Aries',      glyph: '♈\uFE0E' },
  { end: [5, 20],  name: 'Taurus',     glyph: '♉\uFE0E' },
  { end: [6, 20],  name: 'Gemini',     glyph: '♊\uFE0E' },
  { end: [7, 22],  name: 'Cancer',     glyph: '♋\uFE0E' },
  { end: [8, 22],  name: 'Leo',        glyph: '♌\uFE0E' },
  { end: [9, 22],  name: 'Virgo',      glyph: '♍\uFE0E' },
  { end: [10, 22], name: 'Libra',      glyph: '♎\uFE0E' },
  { end: [11, 21], name: 'Scorpio',    glyph: '♏\uFE0E' },
  { end: [12, 21], name: 'Sagittarius',glyph: '♐\uFE0E' },
  { end: [12, 31], name: 'Capricorn',  glyph: '♑\uFE0E' },
];

// 1900 was a Rat year. Ignores the lunar new year, so January and early
// February birthdays land one animal ahead — fine for a party trick.
const ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
                 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];

/* One line about the decade someone was born into, told through what
   the picture looked like then. This is a video editor's site — the
   era is the part of the file that belongs to the host, not the guest. */
const ERAS = [
  { from: 2020, line: 'Born into the synthetic era — the first generation whose home videos were graded before they were shot.' },
  { from: 2010, line: 'Born as the sensor beat the film stock. Everything you remember was shot in a rectangle you could hold.' },
  { from: 2000, line: 'Born on the cut between tape and file. Somewhere there is a MiniDV of you nobody can play any more.' },
  { from: 1990, line: 'Born in the grain. Your earliest footage has a timecode burned into the corner and it is never coming off.' },
  { from: 1980, line: 'Born in the age of the VHS dub — third generation, tracking lines, and better for it.' },
  { from: 1970, line: 'Born when the picture came from a projector and the whole room had to agree to watch it.' },
  { from: 0,    line: 'Born before the medium learned most of its tricks — and watched it learn every one of them.' },
];

// ── THE FILE ─────────────────────────────────────────────────────────

const DAY = 86400000;
const SYNODIC = 29.530588853;                    // one lunar month, days
const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);   // a known new moon, ms
const AVG_BPM = 70;                              // heartbeats ≈ minutes × 70
const BREATHS_PER_MIN = 16;
const FPS = 24;                                  // if a life ran on a timeline
const ORBIT_KM = 940_000_000;                    // Earth's yearly path, km

/* Deterministic four-digit case number from name + date, so the same
   person always reopens the same file. Plain djb2 — it is a label. */
function fileNo(name, dob) {
  let h = 5381;
  const seed = `${name.toLowerCase().trim()}|${dob}`;
  for (let i = 0; i < seed.length; i += 1) h = ((h << 5) + h + seed.charCodeAt(i)) >>> 0;
  const letter = String.fromCharCode(65 + (h % 26));
  return `${letter}-${String(h % 10000).padStart(4, '0')}`;
}

// ── NUMEROLOGY ───────────────────────────────────────────────────────

/* Add the digits until one is left. 11, 22 and 33 stop early — they are
   the master numbers, and reducing them away is the one thing every
   numerologist agrees you must not do. */
function reduce(n, keepMasters = true) {
  let v = Math.abs(Math.trunc(n));
  while (v > 9 && !(keepMasters && (v === 11 || v === 22 || v === 33))) {
    v = String(v).split('').reduce((a, d) => a + Number(d), 0);
  }
  return v;
}

// Pythagorean: A-I are 1-9, J-R are 1-9 again, S-Z are 1-8.
const letterValue = (ch) => ((ch.charCodeAt(0) - 65) % 9) + 1;
const VOWELS = 'AEIOU';

function nameNumber(name, pick) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '').split('');
  const kept = letters.filter((c) =>
    pick === 'all' ? true : pick === 'vowels' ? VOWELS.includes(c) : !VOWELS.includes(c));
  if (!kept.length) return 0;
  return reduce(kept.reduce((a, c) => a + letterValue(c), 0));
}

/* Life path is the sum of three separately reduced parts, not of every
   digit in a row — the two methods disagree often enough to matter, and
   this is the one that keeps master numbers intact. */
function lifePath(birth) {
  return reduce(reduce(birth.getDate())
              + reduce(birth.getMonth() + 1)
              + reduce(birth.getFullYear()));
}

const numberCard = (n) => ({ n, ...(NUMBERS[n] || { keyword: '—', read: '' }) });

// ── THE SKY AT BIRTH ─────────────────────────────────────────────────

/* Which third of its sign the birthday falls in. The sign's own start is
   the day after the previous sign's last day, which the ZODIAC table
   already encodes — no second table to keep in step. */
function decanOf(zodiacIndex, birth) {
  const prev = ZODIAC[(zodiacIndex + ZODIAC.length - 1) % ZODIAC.length].end;
  const year = birth.getFullYear();
  let start = new Date(year, prev[0] - 1, prev[1] + 1);
  if (start > birth) start = new Date(year - 1, prev[0] - 1, prev[1] + 1);
  const into = Math.floor((birth - start) / DAY);
  return Math.min(2, Math.max(0, Math.floor(into / 10)));
}

/* Age of the moon on the birthday, as a fraction of one cycle. Local
   noon is close enough — the phase changes by about 3% a day, so the
   hour of birth cannot move it out of its bucket. */
function moonAt(birth) {
  const noon = Date.UTC(birth.getFullYear(), birth.getMonth(), birth.getDate(), 12);
  const cycles = (noon - NEW_MOON) / DAY / SYNODIC;
  const phase = ((cycles % 1) + 1) % 1;
  return {
    ...MOON_PHASES[Math.round(phase * 8) % 8],
    illumination: Math.round(((1 - Math.cos(2 * Math.PI * phase)) / 2) * 100),
    age: Math.round(phase * SYNODIC * 10) / 10,
  };
}

const SEASONS = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer',
                 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'];

// ── THE FILE ─────────────────────────────────────────────────────────

export function computeProfile({ name, dob }) {
  const birth = parseDob(dob);
  if (!birth) return null;

  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  /* Whole days between two local midnights. Both ends are normalised
     first so a DST changeover in between cannot round the difference
     down to a fraction and lose a day. */
  const days = Math.max(0, Math.round((today - birth) / DAY));

  const hadBirthday =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  const years = Math.max(0, now.getFullYear() - birth.getFullYear() - (hadBirthday ? 0 : 1));

  // Next birthday. A 29 February birth falls back to 1 March in the
  // common years, which is what the constructor's rollover already does.
  const nextYear = now.getFullYear() + (hadBirthday ? 1 : 0);
  const next     = new Date(nextYear, birth.getMonth(), birth.getDate());
  const untilBirthday = Math.max(0, Math.round((next - today) / DAY));

  const mo  = birth.getMonth() + 1;
  const d   = birth.getDate();
  const idx = ZODIAC.findIndex((z) => mo < z.end[0] || (mo === z.end[0] && d <= z.end[1]));
  const zi  = idx === -1 ? 0 : idx;
  const sign = ZODIAC[zi];
  const lore = SIGNS[sign.name];

  const clean   = name.trim().replace(/\s+/g, ' ');
  const weekday = birth.toLocaleDateString('en-US', { weekday: 'long' });
  const animal  = ANIMALS[(birth.getFullYear() - 1900 + 1200) % 12];

  const decan = decanOf(zi, birth);
  const life  = lifePath(birth);
  const expression = nameNumber(clean, 'all');
  const personalYear = reduce(reduce(mo) + reduce(d) + reduce(now.getFullYear()), false) || 9;

  /* Milestones the day count is heading for: the next round thousand,
     and the "golden birthday" — the year you turn the age you were born
     on, which is a one-shot and easy to miss. */
  const nextThousand = (Math.floor(days / 1000) + 1) * 1000;
  const goldenYear   = birth.getFullYear() + d;
  const halfBirthday = new Date(birth.getFullYear() + years, birth.getMonth() + 6, d);

  const fmtDate = (date) =>
    date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return {
    // ── identity ──
    name:     clean,
    first:    clean.split(' ')[0],
    dob,
    born:     birth,
    fileNo:   fileNo(clean, dob),
    dateLong: fmtDate(birth),
    weekday,
    days,
    years,
    untilBirthday,
    era:      (ERAS.find((e) => birth.getFullYear() >= e.from) || ERAS[ERAS.length - 1]).line,
    generation: (GENERATIONS.find((g) => birth.getFullYear() >= g.from) || GENERATIONS[GENERATIONS.length - 1]).name,
    season:   SEASONS[birth.getMonth()],

    // ── the sky ──
    zodiac: sign,
    astro: {
      element:    lore.element,
      modality:   lore.modality,
      modalRead:  MODALITIES[lore.modality],
      polarity:   lore.polarity,
      ruler:      lore.ruler,
      decan:      decan + 1,
      decanRuler: lore.decans[decan],
      strengths:  lore.strengths,
      shadow:     lore.shadow,
      read:       lore.read,
      moon:       moonAt(birth),
      stone:      BIRTHSTONES[birth.getMonth()],
      flower:     BIRTH_FLOWERS[birth.getMonth()],
    },
    chinese: {
      animal,
      trait:   ANIMAL_TRAITS[animal],
      element: YEAR_ELEMENTS[birth.getFullYear() % 10],
      force:   birth.getFullYear() % 2 === 0 ? 'Yang' : 'Yin',
    },

    // ── the numbers ──
    numerology: {
      life:        numberCard(life),
      expression:  numberCard(expression),
      soul:        numberCard(nameNumber(clean, 'vowels')),
      personality: numberCard(nameNumber(clean, 'consonants')),
      /* The raw day carries the meaning of its reduced digit — 17 reads
         as an 8. Both are shown so the arithmetic is not a mystery. */
      birthday:    { n: d, reduced: reduce(d), ...(NUMBERS[reduce(d)] || {}) },
      maturity:    numberCard(reduce(life + expression)),
      personal:    { n: personalYear, keyword: `Personal Year ${personalYear}`, read: PERSONAL_YEARS[personalYear] },
    },

    // ── the readings ──
    mind: {
      month:       MONTH_CHARACTER[birth.getMonth()],
      weekday:     WEEKDAYS[weekday],
      temperament: ELEMENTS[lore.element].temperament,
      elementRead: ELEMENTS[lore.element].read,
    },

    // ── the tally ──
    tally: {
      frames:     days * 24 * 60 * 60 * FPS,
      heartbeats: days * 24 * 60 * AVG_BPM,
      breaths:    days * 24 * 60 * BREATHS_PER_MIN,
      sleptYears: Math.round((years / 3) * 10) / 10,
      fullMoons:  Math.floor(days / SYNODIC),
      orbitKm:    Math.round(days / 365.25 * ORBIT_KM),
      nextThousand,
      nextThousandOn: fmtDate(new Date(today.getTime() + (nextThousand - days) * DAY)),
      goldenAge:   d,
      goldenYear,
      goldenDone:  goldenYear < now.getFullYear() || (goldenYear === now.getFullYear() && hadBirthday),
      halfBirthday: fmtDate(halfBirthday),
      nextBirthdayWeekday: next.toLocaleDateString('en-US', { weekday: 'long' }),
    },
  };
}
