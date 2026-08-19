/* ══════════════════════════════════════════════════════════════════════
   WORK — the material

   The phone's Work board and its detail views read from here. The
   entries mirror the desktop sub-pages (VideoEditingPage, RoomPage,
   WebsitePage) so the two builds show the same body of work; what
   differs is how it is presented, which is the whole point of the phone
   build existing separately.

   Kept as plain data in its own module so the components stay about
   behaviour, and so a future move into the CMS is one import change.
   ══════════════════════════════════════════════════════════════════════ */

/* ── The reel ─────────────────────────────────────────────────────────
   `src` is a real file under /public; the entries without one are the
   pieces there is no clip for yet, and the player says so rather than
   showing a dead frame. */
export const REEL = [
  { id: 'v1', src: '/Video1.mp4',
    title: 'Cinematic Reel 2025', sub: 'Annual Showreel · KishoreditX',
    genre: 'Showreel', year: '2025', duration: '2:30', rating: '9.8',
    desc: 'A full-year compilation of cinematic edits, precise colour grades and visual storytelling. Every frame intentional.',
    badges: ['HD', 'Dolby Vision', '5.1'] },
  { id: 'v2', src: '/Glitchvd.mp4',
    title: 'Glitch Art Series', sub: 'Experimental · Digital Decay',
    genre: 'Experimental', year: '2025', duration: '1:45', rating: '9.5',
    desc: 'A visual essay on digital corruption, glitch aesthetics and the strange beauty of broken signals.',
    badges: ['HD', '5.1'] },
  { id: 'v3', src: '/main1.mp4',
    title: 'Brand Film: Aurora', sub: 'Commercial · Identity',
    genre: 'Commercial', year: '2024', duration: '3:15', rating: '9.2',
    desc: 'Atmospheric fog, volumetric light and product narrative folded into a single visual poem.',
    badges: ['4K', 'Dolby Vision'] },
  { id: 'v4', src: '/ProFile Box.mp4',
    title: 'Motion Type Study', sub: 'Typography · Kinetic',
    genre: 'Motion Design', year: '2024', duration: '1:20', rating: '9.0',
    desc: 'Kinetic typography against cinematic motion — a study in text, rhythm and visual tension.',
    badges: ['HD'] },
  { id: 'v5', src: null,
    thumb: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=80',
    title: 'Fragments', sub: 'Short Documentary',
    genre: 'Narrative', year: '2024', duration: '8:40', rating: '9.4',
    desc: 'Disconnected moments woven into one emotional arc — invisible editing at its most precise.',
    badges: ['4K', '5.1', 'CC'] },
  { id: 'v6', src: null,
    thumb: 'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?auto=format&fit=crop&w=900&q=80',
    title: 'Colour Grade: Noir', sub: 'Colour · Grading',
    genre: 'Colour Work', year: '2024', duration: '2:00', rating: '9.6',
    desc: 'Flat log footage taken to noir — the craft of cinematic grading, start to finish.',
    badges: ['HD', 'Dolby Vision'] },
];

/* ── The room ─────────────────────────────────────────────────────────
   The desktop's surveillance wall, same six cameras. Camera 05 is
   offline on purpose — a wall where every feed is perfect does not read
   as a real wall. */
export const CAMERAS = [
  { id: '01', src: '/CCtv/room1.mp4',   loc: 'MAIN HALL',   zone: 'ZONE-A', res: '1080P', fps: 30, online: true,  sig: 5 },
  { id: '02', src: '/CCtv/Office1.mp4', loc: 'LAB SECTOR',  zone: 'ZONE-B', res: '4K',    fps: 24, online: true,  sig: 4 },
  { id: '03', src: '/CCtv/carhack.mp4', loc: 'CORRIDOR-B',  zone: 'ZONE-C', res: '720P',  fps: 30, online: true,  sig: 3 },
  { id: '04', src: '/CCtv/Alien1.mp4',  loc: 'SERVER ROOM', zone: 'ZONE-A', res: '1080P', fps: 30, online: true,  sig: 5 },
  { id: '05', src: null,                loc: 'STAIRWELL',   zone: 'ZONE-D', res: '720P',  fps: 25, online: false, sig: 1 },
  { id: '06', src: '/CCtv/Alien2.mp4',  loc: 'VAULT',       zone: 'ZONE-B', res: '4K',    fps: 24, online: true,  sig: 4 },
];

/* ── Websites ─────────────────────────────────────────────────────── */
const SHOT = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=78`;

export const SITES = [
  { title: 'Prompt Paper', tagline: 'A living library of production prompts',
    desc: 'Versioned, searchable prompt systems with evaluations attached, so a prompt that worked last month still works today.',
    url: 'https://promptpaper.buzz/', host: 'promptpaper.buzz',
    stack: ['React', 'Vite', 'Firebase'], year: '2026', status: 'Live',
    shot: SHOT('1547658719-da2b51169166') },
  { title: 'Grade Deck', tagline: 'Send a look, not a screenshot',
    desc: 'A browser-side LUT previewer for showing clients a grade without shipping a 4GB export. Loads the cube file and applies it on the GPU.',
    url: null, host: 'gradedeck.local',
    stack: ['Three.js', 'GLSL', 'WebGL'], year: '2025', status: 'Private beta',
    shot: SHOT('1550684376-efcbd6e3f031') },
  { title: 'Cut Sheet', tagline: 'Shot lists that survive the shoot',
    desc: 'An offline-first shot list that keeps working when the location has no signal, then syncs when it does.',
    url: null, host: 'cutsheet.app',
    stack: ['Svelte', 'IndexedDB', 'PWA'], year: '2025', status: 'In progress',
    shot: SHOT('1492691527719-9d1e07e534b4') },
  { title: 'Studio Metrics', tagline: 'What actually got watched',
    desc: 'Retention and watch-time pulled into one board, so the next edit is informed by the last one rather than by a hunch.',
    url: null, host: 'metrics.studio',
    stack: ['React', 'D3', 'Postgres'], year: '2025', status: 'Internal',
    shot: SHOT('1551288049-bebda4e38f71') },
  { title: 'This Portfolio', tagline: 'Two front-ends, one body of work',
    desc: 'Built from scratch with no template — a desktop app and a separate phone app, sharing only the content store and the colour system.',
    url: 'https://kishoreditx.com/', host: 'kishoreditx.com',
    stack: ['React 19', 'OKLCH', 'Canvas'], year: '2026', status: 'Live',
    shot: SHOT('1504509546545-e000b4a62425') },
  { title: 'Frame One', tagline: 'A stills archive that loads instantly',
    desc: 'Every frame worth keeping, indexed and served at the size the screen asked for. No framework, no build step worth mentioning.',
    url: null, host: 'frameone.co',
    stack: ['Astro', 'Vanilla CSS'], year: '2024', status: 'Live',
    shot: SHOT('1486325212027-8081e485255e') },
];

/* ── Colour grading ───────────────────────────────────────────────────
   The wipe compares one photograph against itself under a CSS grade, so
   there is no second download and the two halves cannot drift out of
   register the way two separately-shot stills would. */
export const GRADES = [
  { title: 'Night Exterior', note: 'Cooled shadows, warm practicals held back',
    src: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=1200&q=80',
    filter: 'contrast(1.22) saturate(1.18) hue-rotate(-8deg) brightness(0.94)' },
  { title: 'Interior Portrait', note: 'Skin protected, everything else pulled down',
    src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
    filter: 'contrast(1.16) saturate(0.86) sepia(0.22) brightness(1.03)' },
  { title: 'Street, Golden Hour', note: 'Highlight roll-off, green pulled out of the mids',
    src: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=1200&q=80',
    filter: 'contrast(1.2) saturate(1.3) hue-rotate(6deg) brightness(1.02)' },
];

/* ── The toolkit ──────────────────────────────────────────────────── */
export const TOOLKIT = [
  { group: 'Motion',  items: ['Premiere Pro', 'DaVinci Resolve', 'After Effects', 'Blender'] },
  { group: 'Colour',  items: ['Resolve Color Page', 'Node trees', 'Scopes', 'LUT design'] },
  { group: 'AI',      items: ['Midjourney v6', 'Stable Diffusion XL', 'Flux.1', 'ComfyUI'] },
  { group: 'Design',  items: ['Figma', 'Framer', 'Photoshop', 'Illustrator'] },
  { group: 'Code',    items: ['React', 'Three.js', 'GSAP', 'Node', 'Python'] },
];
