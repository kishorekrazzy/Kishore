/* ══════════════════════════════════════════════════════════════════════
   ABOUT YOU — THE LORE TABLES

   Every fixed correspondence the dossier reads from: signs, decans,
   numerology meanings, month and weekday character, stones, flowers,
   moon phases, temperaments. Content, not logic — aboutYou.js does the
   arithmetic and looks the answers up in here, so a reading can be
   reworded without going anywhere near the maths.

   HONESTY NOTE. Astrology, numerology and the month readings are
   traditional lore, not psychology and not evidence. They are in here
   because they are fun to be told, and the modal says as much in its
   footer rather than dressing any of it up as a finding.
   ══════════════════════════════════════════════════════════════════════ */

// ── WESTERN ASTROLOGY ────────────────────────────────────────────────
// Modern rulerships. Decan sub-rulers use the common triplicity table.

export const SIGNS = {
  Aries: {
    element: 'Fire', modality: 'Cardinal', polarity: 'Yang', ruler: 'Mars',
    decans: ['Mars', 'Sun', 'Venus'],
    strengths: 'Direct, brave, allergic to sitting still',
    shadow: 'Starts nine things, finishes two',
    read: 'You move first and think at speed — the trick you keep learning is that not every room needs the door kicked in.',
  },
  Taurus: {
    element: 'Earth', modality: 'Fixed', polarity: 'Yin', ruler: 'Venus',
    decans: ['Venus', 'Mercury', 'Saturn'],
    strengths: 'Steady, sensual, impossible to rush',
    shadow: 'Digs in long after the hill stopped being worth it',
    read: 'You build things that hold. The cost is that changing your mind feels like moving a building.',
  },
  Gemini: {
    element: 'Air', modality: 'Mutable', polarity: 'Yang', ruler: 'Mercury',
    decans: ['Mercury', 'Venus', 'Uranus'],
    strengths: 'Quick, curious, fluent in most rooms',
    shadow: 'Interest outruns attention',
    read: 'You think out loud and learn by talking. The work is finishing the thought you started three thoughts ago.',
  },
  Cancer: {
    element: 'Water', modality: 'Cardinal', polarity: 'Yin', ruler: 'the Moon',
    decans: ['the Moon', 'Pluto', 'Neptune'],
    strengths: 'Protective, intuitive, remembers everything',
    shadow: 'Retreats sideways instead of saying the thing',
    read: 'You read the room before you enter it. Being that porous is a gift you have to learn to close.',
  },
  Leo: {
    element: 'Fire', modality: 'Fixed', polarity: 'Yang', ruler: 'the Sun',
    decans: ['the Sun', 'Jupiter', 'Mars'],
    strengths: 'Warm, generous, genuinely good on stage',
    shadow: 'Takes silence personally',
    read: 'You give heat to whatever you are pointed at. The risk is needing the room to hand it back.',
  },
  Virgo: {
    element: 'Earth', modality: 'Mutable', polarity: 'Yin', ruler: 'Mercury',
    decans: ['Mercury', 'Saturn', 'Venus'],
    strengths: 'Precise, useful, sees the flaw from across the room',
    shadow: 'Mistakes finished for failed',
    read: 'You improve everything you touch, including things nobody asked you to. Done is the discipline, not better.',
  },
  Libra: {
    element: 'Air', modality: 'Cardinal', polarity: 'Yang', ruler: 'Venus',
    decans: ['Venus', 'Uranus', 'Mercury'],
    strengths: 'Fair, charming, good taste that is actually judgement',
    shadow: 'Weighs the choice until it makes itself',
    read: 'You can hold two sides honestly, which is rare. Deciding is the muscle you have to train on purpose.',
  },
  Scorpio: {
    element: 'Water', modality: 'Fixed', polarity: 'Yin', ruler: 'Pluto',
    decans: ['Pluto', 'Neptune', 'the Moon'],
    strengths: 'Focused, loyal, unbothered by the dark bits',
    shadow: 'Keeps score in a ledger nobody else can read',
    read: 'You go all the way in or not at all. Half of maturity is telling people which one you have chosen.',
  },
  Sagittarius: {
    element: 'Fire', modality: 'Mutable', polarity: 'Yang', ruler: 'Jupiter',
    decans: ['Jupiter', 'Mars', 'the Sun'],
    strengths: 'Open, funny, honest to a fault',
    shadow: 'Promises the horizon and books the flight later',
    read: 'You need somewhere to be heading. Freedom you never use is just an unopened door, and you know it.',
  },
  Capricorn: {
    element: 'Earth', modality: 'Cardinal', polarity: 'Yin', ruler: 'Saturn',
    decans: ['Saturn', 'Venus', 'Mercury'],
    strengths: 'Patient, capable, plays the long game on purpose',
    shadow: 'Confuses rest with slacking',
    read: 'You will out-wait almost anyone. The thing worth learning early is that the summit does not hand out identities.',
  },
  Aquarius: {
    element: 'Air', modality: 'Fixed', polarity: 'Yang', ruler: 'Uranus',
    decans: ['Uranus', 'Mercury', 'Venus'],
    strengths: 'Original, principled, immune to peer pressure',
    shadow: 'Watches the room from a seat at the back',
    read: 'You see the system rather than the seat you were given in it. Closeness, not distance, is the harder skill.',
  },
  Pisces: {
    element: 'Water', modality: 'Mutable', polarity: 'Yin', ruler: 'Neptune',
    decans: ['Neptune', 'the Moon', 'Pluto'],
    strengths: 'Imaginative, kind, picks up what is unsaid',
    shadow: 'Dissolves into whoever is loudest',
    read: 'You feel the whole room at once. Edges are not coldness — they are what lets you stay in it.',
  },
};

export const ELEMENTS = {
  Fire:  { temperament: 'Choleric',    read: 'Fast to act, quick to heat, bored by anything that will not start today.' },
  Earth: { temperament: 'Melancholic', read: 'Slow to commit, hard to shift, quietly building while everyone else announces.' },
  Air:   { temperament: 'Sanguine',    read: 'Thinks in conversation, needs new input like food, solves by reframing.' },
  Water: { temperament: 'Phlegmatic',  read: 'Feels first and explains later, absorbs the mood of a room without being asked.' },
};

export const MODALITIES = {
  Cardinal: 'a starter — you open things',
  Fixed:    'a holder — you see things through',
  Mutable:  'an adapter — you bend and carry on',
};

// ── CHINESE ASTROLOGY ────────────────────────────────────────────────

export const ANIMAL_TRAITS = {
  Rat:     'Resourceful and quick — first to spot the gap and take it.',
  Ox:      'Dependable and stubborn — will finish what everyone else abandoned.',
  Tiger:   'Bold and restless — leads by walking off before anyone agrees.',
  Rabbit:  'Diplomatic and careful — wins by not needing to fight.',
  Dragon:  'Confident and unmissable — takes up room without trying.',
  Snake:   'Private and precise — decides long before it says anything.',
  Horse:   'Free and headlong — needs the road more than the destination.',
  Goat:    'Gentle and inventive — makes places softer than it found them.',
  Monkey:  'Clever and playful — solves it sideways while others queue.',
  Rooster: 'Sharp and candid — notices the detail and mentions it.',
  Dog:     'Loyal and fair — keeps the promise long after it stopped being convenient.',
  Pig:     'Generous and unhurried — enjoys things properly or not at all.',
};

// Year element runs on the last digit of the year, two years per element.
export const YEAR_ELEMENTS = ['Metal', 'Metal', 'Water', 'Water', 'Wood', 'Wood',
                              'Fire', 'Fire', 'Earth', 'Earth'];

// ── NUMEROLOGY (Pythagorean) ─────────────────────────────────────────

export const NUMBERS = {
  1:  { keyword: 'The Originator',  read: 'Built to go first. Independent to the point of inconvenience, and best when nobody is standing over you.' },
  2:  { keyword: 'The Diplomat',    read: 'Reads people faster than plans. You do your best work beside someone, not in front of them.' },
  3:  { keyword: 'The Expresser',   read: 'You think by making — words, images, edits. Scattered when uninspired, unstoppable when lit.' },
  4:  { keyword: 'The Builder',     read: 'Structure is your love language. You want it solid, documented and still standing in ten years.' },
  5:  { keyword: 'The Free Agent',  read: 'Change is the fuel, not the disruption. Routine flattens you faster than pressure ever will.' },
  6:  { keyword: 'The Keeper',      read: 'You carry other people. Warm, responsible, and prone to fixing things that were not yours to fix.' },
  7:  { keyword: 'The Analyst',     read: 'You need to understand it before you will trust it. Solitude is not a symptom, it is a requirement.' },
  8:  { keyword: 'The Operator',    read: 'You see leverage — money, scale, timing. Ambitious, and happiest when the results are measurable.' },
  9:  { keyword: 'The Humanitarian',read: 'You take the wide view and feel responsible for it. Letting go is the recurring lesson.' },
  11: { keyword: 'The Visionary',   read: 'A master number: intuition turned up loud. Inspiring on a good day, overloaded on a bad one.' },
  22: { keyword: 'The Master Builder', read: 'A master number: big ideas with the patience to actually build them. Pressure comes standard.' },
  33: { keyword: 'The Teacher',     read: 'A master number: care at scale. Rare, heavy, and easiest to carry when it is aimed at real people.' },
};

export const NUM_LABELS = {
  life:        ['Life Path',    'The spine of the chart — how you tend to move through a life.'],
  expression:  ['Expression',   'From every letter of your name — what you are equipped to do.'],
  soul:        ['Soul Urge',    'From the vowels — what you actually want when nobody is watching.'],
  personality: ['Personality',  'From the consonants — the version of you people meet first.'],
  birthday:    ['Birthday',     'The day of the month itself — a talent you get for free.'],
  maturity:    ['Maturity',     'Life Path plus Expression — what the second half tends to be about.'],
  personal:    ['Personal Year','Where you are in the nine-year cycle right now.'],
};

export const PERSONAL_YEARS = {
  1: 'A starting year. Plant it now, even badly.',
  2: 'A patience year. Partnerships, not launches.',
  3: 'An expressive year. Make things and show them.',
  4: 'A groundwork year. Unglamorous, load-bearing.',
  5: 'A change year. Say yes to the disruption.',
  6: 'A responsibility year. People and home come first.',
  7: 'An inward year. Study, rest, work it out.',
  8: 'A harvest year. Push for the result and take the money.',
  9: 'A closing year. Finish, forgive, clear the desk.',
};

/* ── MONTH CHARACTER ──────────────────────────────────────────────────
   The traditional born-in-this-month readings, one per month. No "Born
   in March —" prefix: the block heading in the modal already says the
   month, and the clipboard copy adds the prefix back itself. */

export const MONTH_CHARACTER = [
  'disciplined and self-critical, ambitious in a quiet way, slow to open and loyal once you do.',
  'abstract and independent, romantic under a cool surface, quietly rebellious about being told what to do.',
  'generous and easily moved, imaginative, prone to giving more than is sensible and calling it nothing.',
  'direct and energetic, brave, quick to commit and quicker to be bored by anything half-hearted.',
  'stubborn and steady, drawn to beauty and comfort, immovable once the mind is made up.',
  'curious and talkative, quick-witted, restless enough to need several things happening at once.',
  'protective and observant, funny in private, feels far more than the face lets on.',
  'warm and confident, natural in front of people, generous and quietly needing to be seen.',
  'precise and analytical, high standards for yourself first, calm competence under noise.',
  'fair and charming, allergic to conflict, weighs everything before choosing and then commits.',
  'intense and private, formidably focused, remembers both kindness and slights.',
  'optimistic and blunt, restless for the next horizon, honest even when it costs you.',
];

// ── WEEKDAY CHARACTER ────────────────────────────────────────────────
// The old rhyme, plus a plain-English read of the same day.

export const WEEKDAYS = {
  Sunday:    { planet: 'the Sun',  rhyme: "Sunday's child is bonny and blithe, good and wise",
               read: 'Warm and unhurried — you set the temperature of a room without raising your voice.' },
  Monday:    { planet: 'the Moon', rhyme: "Monday's child is fair of face",
               read: 'Tuned to mood and undercurrent — you know how a room feels before anyone says anything.' },
  Tuesday:   { planet: 'Mars',     rhyme: "Tuesday's child is full of grace",
               read: 'Drive under a smooth surface — you push hard and make it look like nothing.' },
  Wednesday: { planet: 'Mercury',  rhyme: "Wednesday's child is full of woe",
               read: 'Mercury reframes it: quick, wordy, analytical — the child who thinks too much, and usefully.' },
  Thursday:  { planet: 'Jupiter',  rhyme: "Thursday's child has far to go",
               read: 'Expansive and lucky-ish — you get further than the starting position suggested.' },
  Friday:    { planet: 'Venus',    rhyme: "Friday's child is loving and giving",
               read: 'Drawn to beauty and to people — taste and warmth are the same instinct in you.' },
  Saturday:  { planet: 'Saturn',   rhyme: "Saturday's child works hard for a living",
               read: 'Built for the long haul — discipline arrives early and never quite leaves.' },
};

// ── MOON PHASES ──────────────────────────────────────────────────────

export const MOON_PHASES = [
  { name: 'New Moon',        read: 'Born on a blank page — beginnings suit you more than inheritances.' },
  { name: 'Waxing Crescent', read: 'Born on the build — you back the idea before there is proof.' },
  { name: 'First Quarter',   read: 'Born at the push — you meet resistance early and grow on it.' },
  { name: 'Waxing Gibbous',  read: 'Born mid-refine — nearly-there is where you do your best work.' },
  { name: 'Full Moon',       read: 'Born under the floodlight — everything you feel arrives at full volume.' },
  { name: 'Waning Gibbous',  read: 'Born in the telling — you make sense of things by explaining them.' },
  { name: 'Last Quarter',    read: 'Born at the clear-out — you are unusually good at letting go.' },
  { name: 'Waning Crescent', read: 'Born in the quiet before — reflective, patient, early to see what is ending.' },
];

// ── MONTH TOKENS ─────────────────────────────────────────────────────

export const BIRTHSTONES = ['Garnet', 'Amethyst', 'Aquamarine', 'Diamond', 'Emerald', 'Pearl',
                            'Ruby', 'Peridot', 'Sapphire', 'Opal', 'Topaz', 'Turquoise'];

export const BIRTH_FLOWERS = ['Carnation', 'Violet', 'Daffodil', 'Daisy', 'Lily of the valley', 'Rose',
                              'Larkspur', 'Gladiolus', 'Aster', 'Marigold', 'Chrysanthemum', 'Narcissus'];

// ── GENERATION ───────────────────────────────────────────────────────

export const GENERATIONS = [
  { from: 2025, name: 'Generation Beta' },
  { from: 2013, name: 'Generation Alpha' },
  { from: 1997, name: 'Generation Z' },
  { from: 1981, name: 'Millennial' },
  { from: 1965, name: 'Generation X' },
  { from: 1946, name: 'Baby Boomer' },
  { from: 1928, name: 'The Silent Generation' },
  { from: 0,    name: 'The Greatest Generation' },
];
