import {
  Snake, Pong, Breakout, Game2048, Minesweeper, Simon, TicTacToe,
  Reaction, FramePerfect, ColourMatch, Memory, BugHunt, SpinWheel,
  TypingSpeed, AimTrainer, NumberMemory, ChimpTest,
} from './arcadeGames';

/* ══════════════════════════════════════════════════════════════════════
   ARCADE — the library

   Data only, in its own module: arcadeGames.jsx may export components and
   nothing else, or fast refresh breaks.

   `shot` is the index into images.arcade, so every cover is a URL the
   dashboard owns rather than artwork baked into the code.

   `span` is how many bento columns and rows the tile takes. The grid is
   built from these rather than from a fixed template, so adding a game is
   one line here and the layout absorbs it.
   ══════════════════════════════════════════════════════════════════════ */

export const GAMES = [
  { id: 'snake',    title: 'Snake',         genre: 'Retro',      era: '1976', Comp: Snake,       hue: 150, shot: 0, dir: 'high', unit: '',       span: [2, 2], blurb: 'Grow without biting your own tail.' },
  { id: 'pong',     title: 'Pong',          genre: 'Retro',      era: '1972', Comp: Pong,        hue: 195, shot: 1, dir: 'high', unit: '',       span: [1, 1], blurb: 'The first one. Still unfair.' },
  { id: 'breakout', title: 'Breakout',      genre: 'Retro',      era: '1976', Comp: Breakout,    hue: 28,  shot: 2, dir: 'high', unit: '',       span: [1, 1], blurb: 'Thirty-two bricks and three lives.' },
  { id: 'g2048',    title: '2048',          genre: 'Puzzle',     era: '2014', Comp: Game2048,    hue: 55,  shot: 3, dir: 'high', unit: '',       span: [1, 2], blurb: 'Slide, merge, run out of room.' },
  { id: 'mines',    title: 'Minesweeper',   genre: 'Puzzle',     era: '1990', Comp: Minesweeper, hue: 240, shot: 4, dir: 'low',  unit: 's',      span: [2, 1], blurb: 'Nine by nine. Ten of them are mines.' },
  { id: 'simon',    title: 'Simon',         genre: 'Memory',     era: '1978', Comp: Simon,       hue: 320, shot: 5, dir: 'high', unit: '',       span: [1, 1], blurb: 'Watch the pattern. Give it back.' },
  { id: 'ttt',      title: 'Tic Tac Toe',   genre: 'Strategy',   era: '1952', Comp: TicTacToe,   hue: 275, shot: 6, dir: 'high', unit: '',       span: [1, 1], blurb: 'It blocks. Beat it anyway.' },
  { id: 'reaction', title: 'Reaction Test', genre: 'Reflex',     era: '—',    Comp: Reaction,    hue: 150, shot: 7, dir: 'low',  unit: 'ms',     span: [2, 1], blurb: 'Wait for green. Under 200ms is respectable.' },
  { id: 'frame',    title: 'Frame Perfect', genre: 'Timing',     era: '—',    Comp: FramePerfect, hue: 275, shot: 8, dir: 'high', unit: '',      span: [2, 1], blurb: 'Stop the playhead on the marker.' },
  { id: 'colour',   title: 'Colour Match',  genre: 'Perception', era: '—',    Comp: ColourMatch, hue: 195, shot: 9, dir: 'high', unit: '',       span: [1, 1], blurb: 'One tile is off-hue, and it gets subtler.' },
  { id: 'memory',   title: 'Memory',        genre: 'Memory',     era: '—',    Comp: Memory,      hue: 320, shot: 10, dir: 'low', unit: ' moves', span: [1, 1], blurb: 'Eight pairs. Fewest moves wins.' },
  { id: 'bugs',     title: 'Bug Hunt',      genre: 'Arcade',     era: '—',    Comp: BugHunt,     hue: 355, shot: 11, dir: 'high', unit: '',      span: [1, 1], blurb: 'Twenty seconds of what shipping feels like.' },
  { id: 'wheel',    title: 'Spin the Wheel', genre: 'Chance',    era: '—',    Comp: SpinWheel,   hue: 28,  shot: 12, dir: 'high', unit: '',      span: [1, 1], blurb: 'Eight outcomes. One of them is nothing.' },
  { id: 'typing',  title: 'Typing Speed',  genre: 'Skill',  era: '—',    Comp: TypingSpeed,  hue: 100, shot: 13, dir: 'high', unit: ' wpm', span: [2, 1], blurb: 'Thirty seconds. Words per minute, honestly counted.' },
  { id: 'aim',     title: 'Aim Trainer',   genre: 'Reflex', era: '—',    Comp: AimTrainer,   hue: 15,  shot: 14, dir: 'low',  unit: 's',    span: [1, 1], blurb: 'Twenty-five targets, one at a time, against the clock.' },
  { id: 'numbers', title: 'Number Memory', genre: 'Memory', era: '—',    Comp: NumberMemory, hue: 240, shot: 15, dir: 'high', unit: '',     span: [1, 1], blurb: 'One more digit every round until you drop one.' },
  { id: 'chimp',   title: 'Chimp Test',    genre: 'Memory', era: '2007', Comp: ChimpTest,    hue: 60,  shot: 16, dir: 'high', unit: '',     span: [1, 1], blurb: 'Tap them in order. They vanish once you start.' },
];

export const GENRES = [...new Set(GAMES.map((g) => g.genre))];
