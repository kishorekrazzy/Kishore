/* ══════════════════════════════════════════════════════════════════════
   SITE CONTENT — defaults

   Every editable string and image URL on the site lives here. Components
   read them through useContent(path, fallback); the admin dashboard
   writes overrides into a single Firestore document, which is merged over
   this object at runtime.

   This file is the floor. If Firestore is empty, unreachable, or a field
   was never edited, the site renders exactly what is written here — so a
   dead network or a wiped database degrades to the original copy rather
   than to blanks.
   ══════════════════════════════════════════════════════════════════════ */

export const DEFAULT_CONTENT = {
  hero: {
    sections: [
      {
        id: 'video',
        label: 'Video Editing',
        image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=2400&q=75',
        stat1: { val: '>100', label: 'Projects delivered' },
        stat2: { val: '>5 Yrs', label: 'Experience' },
        cta: 'View My Work',
        eyebrow: 'AI Editor · Visual Storyteller',
        prose: 'Crafting cinematic narrative through the art of movement, rhythm, and soul design, where algorithms dream and pixel become art in color grading, tuning raw footage into cinematic gold. Every frame tells its own color story.',
        micro: 'KishoreditX · 2026',
        headline: 'THE BEST\nCREATIVE\nIN THE WORLD',
      },
      {
        id: 'ai',
        label: 'AI Images',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=2400&q=75',
        stat1: { val: '>500+', label: 'AI images generated' },
        stat2: { val: '>10+', label: 'AI tools mastered' },
        cta: 'Explore AI Art',
        eyebrow: 'Machine Intelligence · 2026',
        prose: 'Crafting cinematic narrative through the art of movement, rhythm, and soul design, where algorithms dream and pixel become art in color grading, tuning raw footage into cinematic gold. Every frame tells its own color story.',
        micro: '',
        headline: 'MACHINE\nMEETS\nIMAGINATION',
      },
      {
        id: 'color',
        label: 'Color Grading',
        image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=2400&q=75',
        stat1: { val: '>200+', label: 'Videos graded' },
        stat2: { val: '>8 Yrs', label: 'Color expertise' },
        cta: 'See Color Work',
        eyebrow: 'Color Grading · Cinematic',
        prose: 'Crafting cinematic narrative through the art of movement, rhythm, and soul design, where algorithms dream and pixel become art in color grading, tuning raw footage into cinematic gold. Every frame tells its own color story.',
        micro: '',
        headline: 'CINEMATIC\nCOLOR\nSTORIES',
      },
      {
        id: 'web',
        label: 'Web Design',
        image: 'https://images.unsplash.com/photo-1504509546545-e000b4a62425?auto=format&fit=crop&w=2400&q=75',
        stat1: { val: '>30+', label: 'Sites designed' },
        stat2: { val: '>3 Yrs', label: 'Web development' },
        cta: 'View Web Work',
        eyebrow: 'Web Design · Development',
        prose: 'Crafting cinematic narrative through the art of movement, rhythm, and soul design, where algorithms dream and pixel become art in color grading, tuning raw footage into cinematic gold. Every frame tells its own color story.',
        micro: '',
        headline: 'DIGITAL\nEXPERIENCES\nCRAFTED',
      },
    ],
  },

  nav: {
    logo: '/nLogo.svg',
    links: [
      { href: '#work',     label: 'Work'     },
      { href: '#projects', label: 'Projects' },
      { href: '#about',    label: 'About'    },
      { href: '#/certs',   label: 'Certificates' },
    ],
  },

  about: {
    eyebrow: '— About Me',
    heading: ['Crafting', 'Visual', 'Realities'],
    paragraphs: [
      "I'm Kish — an AI-driven video editor and visual storyteller who engineers cinematic experiences that leave a lasting imprint on every screen they touch.",
      'Armed with cutting-edge AI tools and a decade of intuition honed in the dark, I bridge the gap between raw human creativity and machine intelligence — frame by frame, pixel by pixel.',
      'From viral short-form content to full cinematic edits, every project I touch becomes a visual signature — precisely crafted, emotionally resonant, and technically flawless.',
    ],
    cta: 'See My Work',
    hoverHint: 'Hover to align',
    cards: [
      { src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80&auto=format&fit=crop', label: 'Identity',  alt: 'Portrait',
        title: 'The Person Behind It',
        blurb: "Chennai-based, self-taught, and stubborn about craft. Every project starts with the same question — what is this actually trying to make someone feel?" },
      { src: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80&auto=format&fit=crop', label: 'Workspace', alt: 'Editing setup',
        title: 'Where The Work Happens',
        blurb: "Two monitors, a colour-calibrated panel and far too many coffee cups. The room is built so nothing sits between an idea and the timeline." },
      { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80&auto=format&fit=crop', label: 'Visual',   alt: 'Cinematic frame',
        title: 'Frames That Hold',
        blurb: "A shot earns its place or it goes. Composition, contrast and timing do the talking long before any effect gets near the edit." },
    ],
    extraCards: [
      { src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80&auto=format&fit=crop', label: 'Frame',   alt: 'Camera on set',
        title: 'On Set',
        blurb: "Knowing what happens in front of the lens changes what you do behind the desk. Lighting decided on set is worth more than any grade after it.",        row: -1, col: 0 },
      { src: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80&auto=format&fit=crop', label: 'Signal',  alt: 'Studio monitor',
        title: 'Reference First',
        blurb: "Calibrated monitoring, honest scopes, no guessing. If it only looks right on one screen, it is not finished.",       row: -1, col: 1 },
      { src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&auto=format&fit=crop', label: 'Machine', alt: 'Circuit detail',
        title: 'The Machine Half',
        blurb: "Prompt systems, batch pipelines and custom nodes. The tooling exists so the creative decisions get the attention instead of the busywork.",       row: -1, col: 2 },
      { src: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80&auto=format&fit=crop', label: 'Grade',   alt: 'Colour-graded still',
        title: 'Colour As Story',
        blurb: "Grading is not a filter pass. It is deciding where the eye goes, what the scene remembers, and which frames are allowed to breathe.",  row:  1, col: 0 },
      { src: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=600&q=80&auto=format&fit=crop', label: 'Motion',  alt: 'Long-exposure motion',
        title: 'Rhythm And Cut',
        blurb: "Pace is the invisible edit. Hold a beat too long and the audience leaves; cut a beat too early and they never arrive.", row:  1, col: 1 },
      { src: 'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?w=600&q=80&auto=format&fit=crop', label: 'Archive', alt: 'Film archive',
        title: 'Everything Kept',
        blurb: "Every project, every version, every discarded take. The archive is the only honest record of how the work actually got made.",         row:  1, col: 2 },
    ],
    stats: [
      { value: '5+',   label: 'Years Active'      },
      { value: '200+', label: 'Projects Completed' },
      { value: '1M+',  label: 'Views Generated'    },
    ],
  },

  bento: {
    eyebrow: 'Services & Work',
    title: 'The Full',
    titleAccent: 'Stack',
    sub: 'Everything I create — in one frame.',
  },

  contact: {
    eyebrow: 'Contact',
    title: "Let's build",
    titleAccent: 'something.',
    lede: 'Briefs, half-formed ideas and "is this even possible" all welcome. I read everything and reply to anything real.',
    email: 'krazykishore2004@gmail.com',
    facts: {
      basedLabel: 'Based',   basedValue: 'India · IST',
      repliesLabel: 'Replies', repliesValue: 'Within 2 days',
      statusLabel: 'Status',  statusValue: 'Open for work',
    },
    submitLabel: 'Send message',
    note: 'Goes straight to my inbox. No list, no newsletter, no follow-up sequence.',
    doneTitle: 'Message sent',
    doneBody: "It landed. I'll come back to you at the address you gave.",
  },


  /* The ⚠ easter egg in the nav — a scatter of fake browser windows and a
     system alert, styled after an investigation board. */
  /* ── Timeline ───────────────────────────────────────────────────────
     The scrapbook calendar behind the island's logo button. Entries are
     dated 'YYYY-MM-DD'; a day with one shows a dot and opens it. Anything
     before 4 Feb 2004 gets the refusal instead, which is the joke.

     These are placeholders with real dates — put your own in. */
  timeline: {
    blankTitle: 'Nothing written',
    blankNote: 'An ordinary day. Most of them are — that is rather the point.',
    captions: ['first frame', 'the room', 'on location'],
    entries: [
      { date: '2004-02-04', title: 'Day zero',            note: 'The timeline starts here. Everything before this returns a 404.' },
      { date: '2016-06-12', title: 'The Lenovo on the road', note: 'Found a discarded smartphone walking home. Took it apart with my attention, broke every setting, put them back. Photography happened by accident a month later.' },
      { date: '2019-08-21', title: 'First paid edit',     note: 'Someone transferred money for something I would have done for free. That was the moment it stopped being a hobby.' },
      { date: '2021-03-09', title: 'Learned the grade',   note: 'Realised balance comes before look. Spent a week matching two cameras and never edited the same way again.' },
      { date: '2023-11-02', title: 'First prompt that worked', note: 'Not the image — the harness around it. Started keeping a failure catalogue the same night.' },
      { date: '2025-05-18', title: 'Built this site',     note: 'From scratch, no template. Every section is a thing I wanted to find out how to build.' },
    ],
  },


  /* Certificates page — reached from the nav. Plain text on purpose: the
     certificates carry the visual weight, the words just place them. */
  certs: {
    eyebrow: 'Certificates',
    title: 'Proof of the hours',
    intro: "Everything below was earned the slow way — sitting with the software until it stopped arguing. They are not why I can do the work, but they are a fair record of when I started taking each part of it seriously.",
    outro: 'More on the way. I collect these the way other people collect stamps.',
    items: [
      { title: 'Adobe Premiere Pro',      issuer: 'Adobe Certified',        year: '2024', note: 'Advanced editing, multicam and proxy workflows.' },
      { title: 'DaVinci Resolve',         issuer: 'Blackmagic Design',      year: '2024', note: 'Colour grading, node trees and delivery.' },
      { title: 'After Effects',           issuer: 'Adobe Certified',        year: '2023', note: 'Motion graphics, tracking and compositing.' },
      { title: 'Generative AI Imagery',   issuer: 'Independent Study',      year: '2025', note: 'Prompt systems, LoRA training and batch pipelines.' },
      // Spare slots — fill the name in the dashboard and the row appears.
      // A certificate with no name is skipped, so these stay invisible.
      { title: '', issuer: '', year: '', note: '' },
      { title: '', issuer: '', year: '', note: '' },
    ],
  },


  /* The ID card the island's logo swings out. */
  lanyard: {
    title: 'Kishore',
    body: 'AI editor, colourist and creative developer. Drag the card — it swings.',
    hint: 'Drag to play · Esc to close',
  },

  /* Drives the ✨ chat in the nav. `system` is the assistant's persona —
     paste the character sheet here and every reply follows it. */
  ai: {
    greeting: 'How can I help today?',
    system: '',
  },


  /* AI Images exhibition. One object per picture.
     Add another object here (or from the dashboard) and it appears in the
     exhibition with no code change. */
  aiGallery: [
    { src: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1400&q=80',
      title: 'Studio Silhouette', model: 'Midjourney v6' },
    { src: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=1400&q=80',
      title: 'Scarlet Matrix', model: 'Stable Diffusion XL' },
    { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
      title: 'Hyperreal Genesis', model: 'Midjourney v6' },
    { src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1400&q=80',
      title: 'Chrome Bloom', model: 'Midjourney v6' },
    { src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1400&q=80',
      title: 'Analogue Ghost', model: 'Stable Diffusion XL' },
    { src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
      title: 'Circuit Cathedral', model: 'Flux.1' },
    { src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1400&q=80',
      title: 'The Operator', model: 'Midjourney v6' },
    { src: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=1400&q=80',
      title: 'Kinetic Trace', model: 'Flux.1' },
    { src: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1400&q=80',
      title: 'Graded Still', model: 'Midjourney v6' },
    { src: 'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?auto=format&fit=crop&w=1400&q=80',
      title: 'Archive Reel', model: 'Stable Diffusion XL' },
    { src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80',
      title: 'Soft Protocol', model: 'Flux.1' },
    { src: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1400&q=80',
      title: 'Signal Room', model: 'Midjourney v6' },
  ],


  /* ── Theme ────────────────────────────────────────────────────────────
     The site's colour is driven by one hue number per section, composed
     in OKLCH against shared lightness/chroma scalars (see theme.css). So
     recolouring the entire site is a matter of these numbers — no CSS
     edit, no redeploy. 0-360, and the wheel is: 0 red, 30 amber, 100
     yellow, 150 green, 195 cyan, 260 indigo, 300 violet, 340 rose. */
  theme: {
    hues: {
      hero: 28, about: 355, team: 320, bento: 275, banner: 235,
      widget: 195, room: 150, video: 15, notes: 256, contact: 100, mind: 22,
    },
    /* Accent strength. Lightness is perceptual in OKLCH, so one value
       reads equally bright on every hue. */
    accentLight: 75,
    accentChroma: 0.18,
    /* Page ground. */
    bgLightness: 14.5,
    grain: 0.05,
    seam: 1,
  },

  /* ── Feature banner ─────────────────────────────────────────────────
     The wide strip under Notes: one image with the copy over the left of
     it. The artwork is images.feature.0. */
  feature: {
    eyebrow: 'NEW FEATURE',
    title1: 'ONE CANVAS.',
    title2: 'EVERY WORKFLOW.',
    sub1: 'Moodboard, chain workflows, and share',
    sub2: 'with your team - all on one canvas',
    cta: 'Try Canvas',
    ctaHref: '#work',
    /* How much the artwork is darkened behind the words. 0 turns it off
       for images that already leave the left-hand side clear. */
    scrim: 0.55,
  },

  /* ── Footer ─────────────────────────────────────────────────────────
     The panel under Contact: nav row, pitch and stats, a collage whose
     two columns crawl in opposite directions, then the wordmark strip. */
  footer: {
    logo: 'KishoreditX',
    badge: 'Available for freelance work',
    title1: 'Let\u2019s make something',
    title2: 'worth watching',
    title3: 'together',
    sub: 'Editing, colour, AI images and the web \u2014 one person, one pipeline, no handoffs.',
    cta: 'Start a project',
    ctaHref: '#contact',
    cta2: 'See the work',
    cta2Href: '#work',
    /* Placeholders. Put your own numbers here — these are the shape the
       reference uses, not measurements of anything. */
    stats: [
      { cap: 'UP TO', value: '288%', label: 'Uplift in watch time' },
      { cap: 'UP TO', value: '20X',  label: 'Faster turnaround'    },
      { cap: 'UP TO', value: '392%', label: 'More engagement'      },
    ],
    cardAValue: '11.17 mins',
    cardALabel: 'Average watch time',
    cardBKicker: '\u2014 Up to',
    cardBValue: '60%',
    cardBLabel: 'More replies this week',
    marksLabel: 'Tools I work in every day',
    /* Brand slugs, resolved against simple-icons in footerLogos.js.
       Anything that is not a known slug renders as plain text, so a brand
       with no logo available (Adobe, OpenAI, Canva — all removed from the
       icon set at their own request) can still sit on the strip. */
    marks: [
      'davinciresolve', 'blackmagicdesign', 'blender', 'figma', 'framer',
      'notion', 'github', 'react', 'threedotjs', 'greensock', 'javascript',
      'nodedotjs', 'vite', 'python', 'html5', 'css', 'firebase', 'netlify',
      'vercel', 'claude', 'youtube', 'instagram', 'tiktok', 'spotify',
      'obsstudio', 'behance',
    ],
    copyright: '\u00a9 2026 Kishore. Built from scratch.',
  },

  /* ── Promo banner ───────────────────────────────────────────────────
     The magenta strip between About and Syndicate. Its hue (335) is the
     midpoint of those two sections, so it reads as the step between them
     rather than as an insert. */
  promo: {
    badge: 'OPEN FOR WORK',
    title1: 'START A PROJECT WITH',
    title2: 'KISHOREDITX',
    sub: 'Video, AI images and the web — one person, one pipeline',
    cta: 'Start a project',
    ctaHref: '#contact',
    markKicker: 'CREATED WITH',
    markName: 'KISHOREDITX',
  },

  /* ── Feature grid ───────────────────────────────────────────────────
     The promo card and six entry cards under Personal OS. Each card opens
     the sub-page named in DEFAULT_CARDS in FeatureGrid.jsx; only the
     wording is editable here, so a renamed card cannot break its link. */
  grid: {
    heroTitle1: 'SIX GAMES.',
    heroTitle2: 'ONE VERTICAL FEED.',
    heroSub: 'Spin the wheel, beat your reaction time, and cut on the frame',
    heroCta: 'Open the arcade',
    heroHref: '#/games',
    cards: [
      { title: 'Video Editing', sub: 'Cuts, grades and rhythm',     badge: 'SHOWREEL' },
      { title: 'About Me',      sub: 'The long version',            badge: ''         },
      { title: 'AI Images',     sub: 'Prompted, curated, printed',  badge: 'GALLERY'  },
      { title: 'Websites',      sub: 'Designed, built and shipped', badge: ''         },
      { title: 'Skills',        sub: 'Everything in the toolkit',   badge: ''         },
      { title: 'The Room',      sub: 'A CRT and too many ideas',    badge: 'NEW'      },
    ],
  },

  /* ── Edit Suite board ───────────────────────────────────────────────
     Every label on the draggable card board. The component already read
     these through a fallback helper; they had no defaults and no
     dashboard fields, so nothing could reach them. */
  deck: {
    captionTitle: '( Edit Suite )',
    timelineTitle: 'Edit Timeline',
    timelineRange: '21 – 29 December',
    posterATitle: 'Chennai',
    posterASub: 'in Golden Hour',
    posterAKind: 'Street Walk',
    posterAAddr: '6545 Old Denton Rd,\nMarina Beach, Chennai',
    posterATime: '8:30 AM',
    posterBTitle: 'The Long Take',
    posterBSub: 'to Start Grading & Joy',
    posterBKind: 'Call Time',
    posterBAddr: '900 Logan St, Denver 80203,\nSouthwest, Colorado, USA',
    posterBTime: '4:25 PM',
    voice: 'Auto Captions',
    renderTitle: 'Render',
    renderNum: '94',
    renderStats: 'ETA 13m · 4K ProRes',
    clock: 'Cut at 20:35',
    plateTc: '00:04:12:08',
    plateTitle: 'B-Roll',
    plateSub: '48 clips · 4K',
    bestTitle: 'Best Frames',
    bestSub: '290 Clips',
    nleTc: '00:00:26:14',
    nleSeq: 'GOLDEN_HOUR_v07.prproj',
  },

  /* ── Syndicate ──────────────────────────────────────────────────────
     Portraits live in images.team; the text of each member is here. Skills are comma-separated in one field —
     three short chips, not a list worth its own five inputs. */
  team: {
    heading: 'THE SYNDICATE',
    members: [
      { num: '01', role: 'Video Editor',      tagline: 'Cuts silence into sequences',   skills: 'Premiere Pro, DaVinci Resolve, Color Grading', bio: 'Every frame deliberate, every transition earned. Specialized in cinematic storytelling, color narrative, and building emotional rhythm through motion at 24fps.' },
      { num: '02', role: 'AI Artist',         tagline: 'Prompts pixels into poetry',    skills: 'Midjourney, Stable Diffusion, ComfyUI',        bio: 'Blending machine intelligence with human intuition to generate visuals that have never existed before — from concept to final artwork in a single workflow.' },
      { num: '03', role: 'Vibe Coder',        tagline: 'Ships interfaces that breathe', skills: 'React, Three.js, GSAP',                        bio: 'Where logic meets aesthetics — turning abstract concepts into interactive digital experiences with motion, depth, and personality baked right in.' },
      { num: '04', role: 'Creative Director', tagline: 'The vision behind the vision',  skills: 'Art Direction, Brand Strategy, Motion Design',  bio: 'Shapes brand language, visual systems, and the emotional truth that connects through every project — from the first napkin sketch to the final frame.' },
      { num: '05', role: 'Tools Builder',     tagline: 'Engineers the unfair advantage', skills: 'Python, API Design, LLM Chains',               bio: 'Builds custom pipelines, automation systems, and AI workflows that make the impossible routine — so the team creates at the speed of raw thought.' },
    ],
  },

  /* ── Showcase marquee ───────────────────────────────────────────── */
  banners: {
    heading: 'Selected Work',
    items: [
      { label: 'Visual Story' },
      { label: 'Cinematic Grade' },
      { label: 'AI Crafted' },
    ],
  },

  /* ── Working notes ──────────────────────────────────────────────────
     `body` is one string, paragraphs separated by a blank line. A
     textarea is the right tool for prose; six numbered inputs is not. */
  notes: {
    eyebrow: 'Notes',
    title: 'Working',
    titleAccent: 'notes',
    sub: 'Short pieces on colour, cutting, prompting and weight.',
    items: [
      {
        kicker: 'Colour',
        title: 'A grade is not a filter',
        date: '2026-07-28',
        read: '3 min',
        excerpt: 'Balance first, look second. Doing it in that order is why a grade survives being watched on a phone in daylight.',
        body: [
          'Most people who say they colour grade are applying a look. A look is the last five per cent. The first ninety-five is balance: making every shot in the sequence agree about what white is, what black is, and where the skin sits.',
          'The reason this matters is that a look applied to unbalanced footage falls apart the moment the viewing conditions change. It was graded on a calibrated monitor in a dark room; it gets watched on a phone at a bus stop. If the underlying shots disagree with each other, that disagreement is what survives — not your look.',
          'So: neutralise, match, then grade. Node trees, not presets. A preset cannot know what your white balance was, which is exactly the thing that needs fixing first.',
          'The test I use is boring and reliable. Turn the look off. If the sequence still cuts together cleanly with no look at all, the grade will hold up anywhere. If it only works with the look on, the look is hiding a problem rather than adding something.',
        ].join('\n\n'),
      },
      {
        kicker: 'AI',
        title: 'A prompt is not a prompt, it is a system',
        date: '2026-06-14',
        read: '4 min',
        excerpt: 'The prompt that worked once is worthless. The thing worth keeping is the harness around it that tells you when it stops working.',
        body: [
          'Everyone keeps a prompt that worked. Almost nobody keeps the thing that tells them it stopped working. Models get updated, and the prompt that produced exactly the right output in March quietly produces something slightly worse in June. You will not notice, because you are looking at the output and it still looks fine.',
          'What makes prompting production-grade is unglamorous: version the prompt, keep a small set of inputs with known-good outputs, and re-run them when anything changes. That is it. Ten inputs is enough. You are not building an evaluation framework, you are building a smoke alarm.',
          'The other half is a failure catalogue. Every time a prompt produces something wrong, write down what wrong looked like. After thirty entries you stop writing prompts by intuition and start writing them against known failure modes, which is a completely different and much faster activity.',
          'I found the catalogue more useful than the prompts themselves. The prompts are disposable. The knowledge of how this particular model fails is not.',
        ].join('\n\n'),
      },
      {
        kicker: 'Editing',
        title: 'The edit is mostly deletion',
        date: '2026-05-02',
        read: '2 min',
        excerpt: 'Eleven passes on a fourteen-minute film. Almost all of the work was deciding what to remove.',
        body: [
          'A short film I cut last year went through eleven passes. Somewhere around pass four it stopped being about finding the good material and started being about removing the material I liked that was not helping.',
          'That is the actual skill. Anyone can keep the good shot. Cutting the good shot because the scene is better without it is the part that takes years, and it never stops being uncomfortable.',
          'The useful question is not "is this good?" — it is "what breaks if this is gone?" If the answer is nothing, it goes, however much it cost to get. The audience never sees what you removed. They only feel the pace of what is left.',
        ].join('\n\n'),
      },
      {
        kicker: 'Web',
        title: 'Weight is a feature',
        date: '2026-03-19',
        read: '3 min',
        excerpt: 'A page that ships 700 MB of assets is not a rich experience. It is an unfinished one.',
        body: [
          'This portfolio used to ship over 700 MB of images. Not because it needed to — because an easter egg was implemented as a folder of 212 PNG frames exported straight out of After Effects, and nobody had asked what that cost.',
          'The interesting part is that fixing it did not require losing anything. The same animation as a short MP4 is around one per cent of the size. The same background photograph served in AVIF at the size it is actually displayed is a tenth. Nothing on screen changed.',
          'That is the general shape of it: weight is almost never a trade against quality, it is a trade against not having checked. Every heavy thing on a site is heavy for a specific, findable reason, and most of those reasons dissolve the moment you look at them.',
          'Then design for the budget from the start. Deciding a page must load in under a second on a bad connection is a design constraint like any other, and it makes better pages — the same way a runtime limit makes a better edit.',
        ].join('\n\n'),
      },
      {
        kicker: 'Sound',
        title: 'Sound is half the picture',
        date: '2026-02-11',
        read: '3 min',
        excerpt: 'Nobody leaves because the grade was soft. They leave because the room tone changed under a cut.',
        body: [
          'Show an audience a slightly soft frame and they will not mention it. Change the room tone under a cut and they will feel that something is wrong without being able to name it. Sound is the sense that reports errors, and it reports them faster than the eye.',
          'The practical consequence is that continuity of ambience matters more than continuity of angle. A bed of room tone running under a scene will hide a dozen edits. Remove it and the same edits become audible as edits.',
          'I lay ambience before I touch music. Music is a decision about how the audience should feel; ambience is a decision about whether they believe where they are. Getting those in the wrong order produces a scene that is moving and unconvincing at the same time.',
          'The test: play the cut at low volume from another room. If you can still tell where each edit is, the sound is doing less work than the picture, and the picture is carrying something it should not have to.',
        ].join('\n\n'),
      },
      {
        kicker: 'Motion',
        title: 'Easing is a sentence',
        date: '2026-01-24',
        read: '2 min',
        excerpt: 'Linear says nothing. Every curve you choose is a claim about weight, and the audience reads it whether you meant it or not.',
        body: [
          'A linear move is the only easing that never happens in the physical world, which is why it always reads as cheap. Everything real accelerates and settles. The moment you pick a curve you are making a claim about how heavy the thing is.',
          'Fast-out is the honest default for anything the user asked for: it acknowledges the input immediately and then takes its time arriving. Slow-in-slow-out is for things moving of their own accord, where nothing is waiting on it.',
          'Duration is the other half and it is almost always too long. If you cannot tell whether an animation is 200ms or 400ms, it is 400ms and it should be 200ms. Users do not notice fast. They notice waiting.',
          'The one rule I keep: if an element is leaving, it goes faster than it arrived. Nobody needs a graceful exit from something they have already dismissed.',
        ].join('\n\n'),
      },
      {
        kicker: 'Process',
        title: 'Nothing is called final',
        date: '2025-12-08',
        read: '2 min',
        excerpt: 'v07 is a fact. FINAL_v3_ACTUAL_final is a confession that you lost track two days ago.',
        body: [
          'Every naming scheme that contains the word final is a scheme that has already failed. The word encodes a prediction about the future, and the prediction is always wrong, so the filename accretes apologies: final, final2, final_ACTUAL, final_USE_THIS.',
          'Numbers do not make predictions. v07 is simply the seventh, and v08 does not require you to admit anything. The discipline is trivial and it survives contact with a client who has opinions on a Friday afternoon.',
          'The second half is a one-line changelog per version. Not what you exported, what you changed. Three months later the only question you will ever ask is why a decision was made, and the file itself cannot answer that.',
          'This costs about ten seconds per export and it is the single highest-return habit I have. Nobody has ever regretted being able to go back.',
        ].join('\n\n'),
      },
      {
        kicker: 'Colour',
        title: 'Skin is the only calibration that matters',
        date: '2025-11-19',
        read: '3 min',
        excerpt: 'An audience has no reference for what that wall should look like. They have a lifetime of reference for faces.',
        body: [
          'Nobody in the audience knows what colour the wall was. Nobody knows what the jacket was. Everybody, without being able to explain it, knows when a face is wrong — because they have spent their entire life looking at faces under every light there is.',
          'That makes skin the only part of the frame with an external reference, and therefore the only part worth calibrating hard. Get the face right and the audience will forgive almost anything happening behind it.',
          'The corollary is uncomfortable: a grade that looks beautiful on a scope and slightly green on a cheek is a failed grade. The scope does not have a lifetime of faces to compare against.',
          'I check skin on the worst screen I own before I check it on the best one. If it holds on the bad screen it will hold anywhere, and the good screen was never the problem.',
        ].join('\n\n'),
      },
      {
        kicker: 'AI',
        title: 'The model is not the product',
        date: '2025-10-02',
        read: '4 min',
        excerpt: 'Everyone can call the same model you can. What nobody else has is the thing you built around it.',
        body: [
          'The model is a commodity and it gets better every few months whether or not you do anything. Building your identity on which model you use is building on the one part of the stack you do not control and cannot differentiate.',
          'What is actually yours is everything around the call: the inputs you gathered, the failure cases you catalogued, the checks that catch a bad output before a client sees it, and the taste that decides which of five options ships.',
          'This is why the interesting work in AI tooling looks unglamorous from outside. It is plumbing, evaluation and judgement. The generation step is the shortest part of the pipeline and the least defensible.',
          'A useful question before starting anything: if the model got twice as good tomorrow, does my work become more valuable or less? If the answer is less, I was building the wrong half.',
        ].join('\n\n'),
      },
      {
        kicker: 'Editing',
        title: 'Cut to the reaction, not the action',
        date: '2025-08-27',
        read: '2 min',
        excerpt: 'The punch is not the story. The face of the person who saw it is the story.',
        body: [
          'Beginners cut to whatever is moving. The result is technically coherent and emotionally flat, because movement is information and information is not feeling.',
          'The shot that carries a scene is almost always the one where somebody is receiving what just happened. The audience does not know how to feel about an event until they watch someone else feel about it first.',
          'This holds well outside drama. In an interview the cut is not on the answer, it is on the pause after it. In a product film it is not the feature, it is the moment the person using it realises what it means.',
          'Practically: when a scene is not working, stop looking for a better version of the action and go find the reaction you did not use. It is usually already in the rushes, one shot later, with the camera still running.',
        ].join('\n\n'),
      },
      {
        kicker: 'Web',
        title: 'Motion needs a reason',
        date: '2025-07-14',
        read: '3 min',
        excerpt: 'If you cannot say what a piece of animation is telling the user, it is not design. It is decoration with a frame cost.',
        body: [
          'Every animation on a page should be answerable in one sentence: what does this tell somebody that a static layout could not? Where did this come from, where did it go, what is loading, what did I just do. Those are reasons.',
          '"It felt a bit flat" is not a reason. Neither is the fact that it was fun to build, which is the honest source of most of it, including some of mine.',
          'The cost is real and it is paid by the people with the worst hardware. A page that is delightful on the machine it was built on and unusable on a four-year-old phone has not been designed, it has been indulged.',
          'The discipline that helps: build the page with no motion at all and make it good. Then add animation only where the static version genuinely failed to explain something. Almost everything you were going to add does not survive that.',
        ].join('\n\n'),
      },
      {
        kicker: 'Craft',
        title: 'Taste is a backlog',
        date: '2025-06-03',
        read: '2 min',
        excerpt: 'Taste is not a gift. It is the accumulated memory of everything you have seen that did not work.',
        body: [
          'People talk about taste as though it arrives fully formed. In practice it is a list — a long, mostly unconscious list of things you have watched fail, and the specific way each one failed.',
          'Which is good news, because lists can be built deliberately. Every time something looks wrong and you work out why, that is one entry. Every time something looks wrong and you fix it by feel without diagnosing it, you got the fix and not the entry.',
          'This is the argument for finishing bad work rather than abandoning it. An abandoned piece teaches you nothing about the end, and the end is where most of the failures live.',
          'It is also why taste is not transferable by advice. I can give you my conclusions, but the entry in your list only exists once you have watched the thing fail yourself.',
        ].join('\n\n'),
      },
    ],
  },

  /* ── Personal OS ────────────────────────────────────────────────────
     The desktop widgets. Images for each of these are already in the
     registry; this is the text painted over them. */
  os: {
    netflix: {
      title: 'INTERSTELLAR',
      genre: 'Sci-Fi · 4K',
      cards: [
        { title: 'DARK',      sub: 'Mystery'  },
        { title: 'INCEPTION', sub: 'Thriller' },
        { title: 'SIGNAL',    sub: 'Drama'    },
        { title: 'MOTION',    sub: 'Series'   },
      ],
    },
    finder: {
      works: [
        { name: 'Editorial Shoot' }, { name: 'Portrait Series' }, { name: 'Visual FX' },
        { name: 'Motion Study'    }, { name: 'Color Grade'     }, { name: 'Campaign'  },
      ],
    },
    hobbies: {
      eyebrow: 'When not working',
      title: 'Hobbies',
      items: [
        { label: 'Guitar'      }, { label: 'Cinema' }, { label: 'Gaming' }, { label: 'AI Art' },
        { label: 'Photography' }, { label: 'Coding' }, { label: 'Music'  }, { label: 'Travel' },
      ],
    },
  },

  /* ── Inside the mind ───────────────────────────────────────────────
     The ticker under the brainwave card. One line per thought. */
  mind: {
    thoughts: [
      'what if the edit is the story, not the footage',
      'a prompt is a system, not a sentence',
      'the grade nobody notices is the one that worked',
      'build the tool before the deadline needs it',
      'silence is a cut you did not have to make',
      'every finished thing is a data point',
      'the rival is my own head, not the market',
      'ship it, then find out what was wrong',
    ],
  },

  /* ── Image registry ────────────────────────────────────────────────
     Every image URL on the site that is not already a field above, as
     flat arrays of strings keyed by where it appears.

     Strings, not the objects they came from, on purpose: the arrays these
     were lifted out of also hold React components, icon refs and click
     handlers, none of which survive a trip through Firestore. Components
     keep their own data and overlay the URL by index, so a stored list
     can only ever change pictures — never break a handler.

     The dashboard discovers these automatically; nothing here needs a
     SCHEMA entry. */
  images: {
    // Music card — monochrome plate
    musicPlate: [
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80&sat=-100',
    ],
    // Video Editing — card thumbnails
    videoThumbs: [
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=900&q=80',
    ],
    // Feature banner — the artwork behind the copy
    feature: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2400&q=80',
    ],
    // Working notes — one cover per piece
    notes: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    ],
    /* Arcade — one cover per game, in library order. Placeholders: they
       are here so the launcher is never empty, not because they are the
       right pictures. */
    arcade: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=600&q=80',
    ],
    // Footer collage — the four photographs in the crawling columns
    footer: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    ],
    // Promo banner — the artwork behind the magenta wash
    promo: [
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=2400&q=80',
    ],
    // Feature grid — the promo card's artwork
    gridHero: [
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1600&q=80',
    ],
    // Lanyard card — [0] front face, [1] back face
    lanyard: [
      '/idcard-front.png',
      '/idcard-back.png',
    ],
    // Certificates — swap these for the real scans
    certs: [
      '/certs/cert-1.svg',
      '/certs/cert-2.svg',
      '/certs/cert-3.svg',
      '/certs/cert-4.svg',
      '',
      '',
    ],
    // Edit Suite board — scattered card deck
    deck: [
      'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80',
    ],
    /* Timeline — eight photographs for the board, in the order they are
       laid out. No backdrop: the page behind is blurred instead. */
    timeline: [
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    ],
    // About Me — gallery
    aboutMe: [
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1400&q=78',
      'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=1400&q=78',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1400&q=78',
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1400&q=78',
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1400&q=78',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1400&q=78',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1400&q=78',
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1400&q=78',
      'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1400&q=78',
    ],
    // Syndicate — members
    // Syndicate — member portraits, one per member.
    /* These were previously authored as interleaved portrait/backdrop
       pairs, but withImages() overlays by index — so members 2-5 were
       being handed the previous member's backdrop as their portrait, and
       entries 6-10 were dropped on the floor. The backdrops are gone: the
       component never rendered them — the section's background is the
       WebGL scanner. */
    team: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80&auto=format&fit=crop',
    ],
    // Showcase banners
    banners: [
      'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80',
    ],
    // Skills — pack covers
    skillPacks: [
      'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80',
    ],
    // Personal OS — Finder
    finderWorks: [
      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?auto=format&fit=crop&w=1600&q=80',
    ],
    // Personal OS — feature
    netflixHero: [
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=80',
    ],
    // Personal OS — grid
    netflixGrid: [
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80',
    ],
    // Music — album art
    music: [
      'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?auto=format&fit=crop&w=1600&q=80',
    ],
    // Dock — app icons
    dock: [
      'https://cdn.jim-nielsen.com/macos/1024/finder-2021-09-10.png?rf=1024',
      'https://cdn.jim-nielsen.com/macos/1024/safari-2021-06-02.png?rf=1024',
      'https://cdn.jim-nielsen.com/macos/1024/photos-2021-05-28.png?rf=1024',
      'https://cdn.jim-nielsen.com/macos/1024/music-2021-05-25.png?rf=1024',
      'https://cdn.jim-nielsen.com/macos/1024/mail-2021-05-25.png?rf=1024',
      'https://cdn.jim-nielsen.com/macos/1024/notes-2021-05-25.png?rf=1024',
      'https://cdn.jim-nielsen.com/macos/1024/terminal-2021-06-03.png?rf=1024',
      'https://cdn.jim-nielsen.com/macos/1024/calculator-2021-04-29.png?rf=1024',
    ],
    // Work grid — card backgrounds
    bentoCards: [
      'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80',
    ],
    // Personal OS — background plates
    widgetPlates: [
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80',
    ],
  },
};

export const IMAGE_GROUP_LABELS = {
  'musicPlate': 'Music card — plate',
  'videoThumbs': 'Video Editing — card thumbnails',
  'feature': 'Feature banner',
  'notes': 'Working notes \u2014 covers',
  'arcade': 'Arcade \u2014 game covers',
  'footer': 'Footer \u2014 collage',
  'promo': 'Promo banner \u2014 artwork',
  'gridHero': 'Feature grid \u2014 promo art',
  'lanyard': 'Profile card (lanyard)',
  'certs': 'Certificates',
  'deck': 'Edit Suite board',
  'timeline': 'Timeline — scrapbook',
  'aboutMe': 'About Me \u2014 gallery',
  'team': 'Syndicate \u2014 portraits',
  'banners': 'Showcase banners',
  'skillPacks': 'Skills \u2014 pack covers',
  'finderWorks': 'Personal OS \u2014 Finder',
  'netflixHero': 'Personal OS \u2014 feature',
  'netflixGrid': 'Personal OS \u2014 grid',
  'music': 'Music \u2014 album art',
  'dock': 'Dock \u2014 app icons',
  'bentoCards': 'Work grid \u2014 card backgrounds',
  'widgetPlates': 'Personal OS \u2014 background plates'
};

/* ── Admin schema ──────────────────────────────────────────────────────
   Describes what the dashboard renders. Every entry names a path into the
   object above, so adding a field to the admin UI is one line here once
   the default exists — no dashboard code changes.

   type: 'text' | 'multiline' | 'image' */
const heroGroup = (i, name) => ({
  id: `hero-${i}`,
  title: `Hero — ${name}`,
  fields: [
    { path: `hero.sections.${i}.label`,       label: 'Tab label',        type: 'text'      },
    { path: `hero.sections.${i}.image`,       label: 'Background image', type: 'image'     },
    { path: `hero.sections.${i}.headline`,    label: 'Headline',         type: 'multiline', hint: 'One line per row — this is the warped text' },
    { path: `hero.sections.${i}.eyebrow`,     label: 'Eyebrow',          type: 'text'      },
    { path: `hero.sections.${i}.prose`,       label: 'Description',      type: 'multiline' },
    { path: `hero.sections.${i}.micro`,       label: 'Micro caption',    type: 'text'      },
    { path: `hero.sections.${i}.cta`,         label: 'Button label',     type: 'text'      },
    { path: `hero.sections.${i}.stat1.val`,   label: 'Stat 1 value',     type: 'text'      },
    { path: `hero.sections.${i}.stat1.label`, label: 'Stat 1 caption',   type: 'text'      },
    { path: `hero.sections.${i}.stat2.val`,   label: 'Stat 2 value',     type: 'text'      },
    { path: `hero.sections.${i}.stat2.label`, label: 'Stat 2 caption',   type: 'text'      },
  ],
});

const cardFields = (base, count, titlePrefix) =>
  Array.from({ length: count }, (_, i) => ([
    { path: `${base}.${i}.src`,   label: `${titlePrefix} ${i + 1} — image`,   type: 'image' },
    { path: `${base}.${i}.label`, label: `${titlePrefix} ${i + 1} — caption`, type: 'text'  },
    { path: `${base}.${i}.alt`,   label: `${titlePrefix} ${i + 1} — alt text`, type: 'text' },
  ])).flat();

export const SCHEMA = [
  {
    id: 'theme',
    title: 'Colour & theme',
    intro: 'One hue per section drives every accent, glow and tint in it. Changes apply live.',
    fields: [
      { path: 'theme.hues.hero',    label: 'Hero',        type: 'hue' },
      { path: 'theme.hues.about',   label: 'About',       type: 'hue' },
      { path: 'theme.hues.team',    label: 'Syndicate',   type: 'hue' },
      { path: 'theme.hues.bento',   label: 'Work',        type: 'hue' },
      { path: 'theme.hues.banner',  label: 'Showcase',    type: 'hue' },
      { path: 'theme.hues.notes',   label: 'Notes',       type: 'hue' },
      { path: 'theme.hues.widget',  label: 'Personal OS', type: 'hue' },
      { path: 'theme.hues.mind',    label: 'Personal OS (dark)', type: 'hue' },
      { path: 'theme.hues.contact', label: 'Contact',     type: 'hue' },
      { path: 'theme.hues.room',    label: 'The Room',    type: 'hue' },
      { path: 'theme.hues.video',   label: 'Video page',  type: 'hue' },
      { path: 'theme.accentLight',  label: 'Accent lightness', type: 'range', min: 40, max: 95, step: 0.5, unit: '%' },
      { path: 'theme.accentChroma', label: 'Accent chroma',    type: 'range', min: 0, max: 0.32, step: 0.005 },
      { path: 'theme.bgLightness',  label: 'Background lightness', type: 'range', min: 4, max: 30, step: 0.5, unit: '%' },
      { path: 'theme.grain',            label: 'Film grain',               type: 'range', min: 0, max: 0.2, step: 0.005 },
      { path: 'theme.seam',             label: 'Section seams',            type: 'range', min: 0, max: 1, step: 1 },
    ],
  },
  heroGroup(0, 'Video Editing'),
  heroGroup(1, 'AI Images'),
  heroGroup(2, 'Color Grading'),
  heroGroup(3, 'Web Design'),
  {
    id: 'nav',
    title: 'Navigation',
    fields: [
      { path: 'nav.logo', label: 'Island logo', type: 'image', hint: 'GIF, SVG or PNG. Falls back to the letter K if it fails to load.' },
      ...Array.from({ length: 4 }, (_, i) => ([
        { path: `nav.links.${i}.label`, label: `Link ${i + 1} — label`,  type: 'text' },
        { path: `nav.links.${i}.href`,  label: `Link ${i + 1} — target`, type: 'text', hint: 'An anchor like #work, or a full URL' },
      ])).flat(),
    ],
  },
  {
    id: 'about',
    title: 'About — text',
    fields: [
      { path: 'about.eyebrow',      label: 'Eyebrow',           type: 'text' },
      { path: 'about.heading.0',    label: 'Heading line 1',    type: 'text' },
      { path: 'about.heading.1',    label: 'Heading line 2',    type: 'text', hint: 'This is the outlined word' },
      { path: 'about.heading.2',    label: 'Heading line 3',    type: 'text' },
      { path: 'about.paragraphs.0', label: 'Paragraph 1',       type: 'multiline' },
      { path: 'about.paragraphs.1', label: 'Paragraph 2',       type: 'multiline' },
      { path: 'about.paragraphs.2', label: 'Paragraph 3',       type: 'multiline' },
      { path: 'about.cta',          label: 'Button label',      type: 'text' },
      { path: 'about.hoverHint',    label: 'Card stack hint',   type: 'text' },
      { path: 'about.stats.0.value', label: 'Stat 1 value',     type: 'text' },
      { path: 'about.stats.0.label', label: 'Stat 1 caption',   type: 'text' },
      { path: 'about.stats.1.value', label: 'Stat 2 value',     type: 'text' },
      { path: 'about.stats.1.label', label: 'Stat 2 caption',   type: 'text' },
      { path: 'about.stats.2.value', label: 'Stat 3 value',     type: 'text' },
      { path: 'about.stats.2.label', label: 'Stat 3 caption',   type: 'text' },
    ],
  },
  {
    id: 'about-cards',
    title: 'About — card stack',
    fields: cardFields('about.cards', 3, 'Card'),
  },
  {
    id: 'about-grid',
    title: 'About — reveal grid',
    fields: cardFields('about.extraCards', 6, 'Card'),
  },
  {
    id: 'bento',
    title: 'Work / Full Stack header',
    fields: [
      { path: 'bento.eyebrow',     label: 'Eyebrow',      type: 'text' },
      { path: 'bento.title',       label: 'Title',        type: 'text' },
      { path: 'bento.titleAccent', label: 'Accent word',  type: 'text' },
      { path: 'bento.sub',         label: 'Subtitle',     type: 'text' },
    ],
  },
  {
    id: 'timeline',
    title: 'Timeline',
    intro: 'The scrapbook calendar behind the island button. Dates are YYYY-MM-DD; anything before 4 Feb 2004 gets the refusal message instead of an entry.',
    fields: [
      ...Array.from({ length: 8 }, (_, i) => (
        { path: `images.timeline.${i}`, label: `Photo ${i + 1}`, type: 'image' }
      )),
      ...Array.from({ length: 3 }, (_, i) => (
        { path: `timeline.captions.${i}`, label: `Caption ${i + 1} (matted prints only)`, type: 'text' }
      )),
      { path: 'timeline.blankTitle', label: 'Empty day — title', type: 'text' },
      { path: 'timeline.blankNote',  label: 'Empty day — note',  type: 'multiline' },
      ...Array.from({ length: 6 }, (_, i) => ([
        { path: `timeline.entries.${i}.date`,  label: `Entry ${i + 1} — date`,  type: 'text', hint: 'YYYY-MM-DD' },
        { path: `timeline.entries.${i}.title`, label: `Entry ${i + 1} — title`, type: 'text' },
        { path: `timeline.entries.${i}.note`,  label: `Entry ${i + 1} — note`,  type: 'multiline' },
      ])).flat(),
    ],
  },
  {
    id: 'certs',
    title: 'Certificates page',
    fields: [
      { path: 'certs.eyebrow', label: 'Eyebrow',      type: 'text' },
      { path: 'certs.title',   label: 'Page title',   type: 'text' },
      { path: 'certs.intro',   label: 'Intro text',   type: 'multiline' },
      { path: 'certs.outro',   label: 'Closing line', type: 'multiline' },
      ...Array.from({ length: 6 }, (_, i) => ([
        { path: `images.certs.${i}`, label: `Certificate ${i + 1} — IMAGE URL`, type: 'image',
          hint: 'Paste any image URL, or a path like /certs/cert-1.svg for a file in public/. Leave the name blank to hide this certificate.' },
        { path: `certs.items.${i}.title`,  label: `Certificate ${i + 1} — name`,   type: 'text' },
        { path: `certs.items.${i}.issuer`, label: `Certificate ${i + 1} — issuer`, type: 'text' },
        { path: `certs.items.${i}.year`,   label: `Certificate ${i + 1} — year`,   type: 'text' },
        { path: `certs.items.${i}.note`,   label: `Certificate ${i + 1} — note`,   type: 'multiline' },
      ])).flat(),
    ],
  },
  {
    id: 'lanyard',
    title: 'Profile card (logo click)',
    fields: [
      { path: 'lanyard.title', label: 'Name',    type: 'text' },
      { path: 'lanyard.body',  label: 'Blurb',   type: 'multiline' },
      { path: 'lanyard.hint',  label: 'Hint',    type: 'text' },
      { path: 'images.lanyard.0', label: 'Card front', type: 'image', hint: 'Portrait orientation reads best on the card face.' },
      { path: 'images.lanyard.1', label: 'Card back',  type: 'image' },
    ],
  },
  {
    id: 'ai',
    title: 'AI chat (✨ nav button)',
    fields: [
      { path: 'ai.greeting', label: 'Greeting headline', type: 'text' },
      { path: 'ai.system',   label: 'System prompt / character sheet', type: 'multiline',
        hint: 'Paste the character sheet here. Leave blank to use the built-in default in AiChat.jsx.' },
    ],
  },
  {
    id: 'ai-gallery',
    title: 'AI Images gallery',
    fields: Array.from({ length: 12 }, (_, i) => ([
      { path: `aiGallery.${i}.src`,    label: `Image ${i + 1} — URL`,    type: 'image' },
      { path: `aiGallery.${i}.title`,  label: `Image ${i + 1} — title`,  type: 'text'  },
      { path: `aiGallery.${i}.model`,  label: `Image ${i + 1} — model`,  type: 'text'  },
    ])).flat(),
  },
  {
    id: 'team',
    title: 'Syndicate',
    intro: 'The five roles on the card stack.',
    fields: [
      { path: 'team.heading', label: 'Section heading', type: 'text' },
      ...Array.from({ length: 5 }, (_, i) => ([
        { path: `team.members.${i}.num`,     label: `Member ${i + 1} — number`,  type: 'text' },
        { path: `team.members.${i}.role`,    label: `Member ${i + 1} — role`,    type: 'text' },
        { path: `team.members.${i}.tagline`, label: `Member ${i + 1} — tagline`, type: 'text' },
        { path: `team.members.${i}.skills`,  label: `Member ${i + 1} — skills`,  type: 'text', hint: 'Comma-separated — each becomes a chip' },
        { path: `team.members.${i}.bio`,     label: `Member ${i + 1} — bio`,     type: 'multiline' },
        { path: `images.team.${i}`,          label: `Member ${i + 1} — portrait`, type: 'image' },
      ])).flat(),
    ],
  },
  {
    id: 'banners',
    title: 'Showcase marquee',
    intro: 'The scrolling strip of work between Syndicate and Notes.',
    fields: [
      { path: 'banners.heading', label: 'Strip label', type: 'text' },
      ...Array.from({ length: 3 }, (_, i) => ([
        { path: `images.banners.${i}`,      label: `Banner ${i + 1} — image`,   type: 'image' },
        { path: `banners.items.${i}.label`, label: `Banner ${i + 1} — caption`, type: 'text'  },
      ])).flat(),
    ],
  },
  {
    id: 'notes',
    title: 'Working notes',
    intro: 'Twelve written pieces; four show at a time and the swap button on a card rotates the other three. Separate paragraphs in the body with a blank line.',
    fields: [
      { path: 'notes.eyebrow',     label: 'Eyebrow',     type: 'text' },
      { path: 'notes.title',       label: 'Title',       type: 'text' },
      { path: 'notes.titleAccent', label: 'Accent word', type: 'text' },
      { path: 'notes.sub',         label: 'Subtitle',    type: 'multiline' },
      ...Array.from({ length: 12 }, (_, i) => ([
        { path: `images.notes.${i}`,        label: `Note ${i + 1} — cover image`, type: 'image' },
        { path: `notes.items.${i}.kicker`,  label: `Note ${i + 1} — category`,  type: 'text' },
        { path: `notes.items.${i}.title`,   label: `Note ${i + 1} — title`,     type: 'text' },
        { path: `notes.items.${i}.date`,    label: `Note ${i + 1} — date`,      type: 'text', hint: 'YYYY-MM-DD' },
        { path: `notes.items.${i}.read`,    label: `Note ${i + 1} — read time`, type: 'text' },
        { path: `notes.items.${i}.excerpt`, label: `Note ${i + 1} — excerpt`,   type: 'multiline' },
        { path: `notes.items.${i}.body`,    label: `Note ${i + 1} — full text`, type: 'multiline', hint: 'Blank line between paragraphs' },
      ])).flat(),
    ],
  },
  {
    id: 'os',
    title: 'Personal OS',
    intro: 'Text painted over the desktop widgets. Their pictures are in Images → Personal OS.',
    fields: [
      { path: 'os.netflix.title', label: 'Feature — title', type: 'text' },
      { path: 'os.netflix.genre', label: 'Feature — genre line', type: 'text' },
      ...Array.from({ length: 4 }, (_, i) => ([
        { path: `os.netflix.cards.${i}.title`, label: `Poster ${i + 1} — title`,    type: 'text' },
        { path: `os.netflix.cards.${i}.sub`,   label: `Poster ${i + 1} — subtitle`, type: 'text' },
      ])).flat(),
      ...Array.from({ length: 6 }, (_, i) => (
        { path: `os.finder.works.${i}.name`, label: `Finder file ${i + 1} — name`, type: 'text' }
      )),
      { path: 'os.hobbies.eyebrow', label: 'Hobbies — eyebrow', type: 'text' },
      { path: 'os.hobbies.title',   label: 'Hobbies — title',   type: 'text' },
      ...Array.from({ length: 8 }, (_, i) => (
        { path: `os.hobbies.items.${i}.label`, label: `Hobby ${i + 1}`, type: 'text' }
      )),
    ],
  },
  {
    id: 'mind',
    title: 'Inside the mind',
    intro: 'The thought ticker under the brainwave reader. One line each; they cycle in order.',
    fields: Array.from({ length: 8 }, (_, i) => (
      { path: `mind.thoughts.${i}`, label: `Thought ${i + 1}`, type: 'text' }
    )),
  },
  {
    id: 'feature',
    title: 'Feature banner',
    intro: 'The wide strip under Notes. One image with the copy laid over the left of it.',
    fields: [
      { path: 'images.feature.0', label: 'Banner artwork', type: 'image',
        hint: 'Fills the whole strip, cropped to cover. Roughly 5.5:1 (e.g. 2400x435) fits without cropping.' },
      { path: 'feature.eyebrow', label: 'Eyebrow',         type: 'text', hint: 'Leave blank to hide' },
      { path: 'feature.title1',  label: 'Headline line 1', type: 'text' },
      { path: 'feature.title2',  label: 'Headline line 2', type: 'text', hint: 'Leave blank for a one-line headline' },
      { path: 'feature.sub1',    label: 'Subtitle line 1', type: 'text' },
      { path: 'feature.sub2',    label: 'Subtitle line 2', type: 'text' },
      { path: 'feature.cta',     label: 'Button label',    type: 'text', hint: 'Leave blank to hide the button' },
      { path: 'feature.ctaHref', label: 'Button target',   type: 'text', hint: 'An anchor like #work, or a full URL' },
      { path: 'feature.scrim',   label: 'Darken behind the text', type: 'range', min: 0, max: 0.85, step: 0.05,
        hint: 'Keeps the copy legible over a busy image. 0 turns it off.' },
    ],
  },
  {
    id: 'arcade',
    title: 'Arcade covers',
    intro: 'One thumbnail per game, in library order. The defaults are placeholders — replace each with your own URL.',
    fields: [
      { path: 'images.arcade.0', label: 'Snake — cover', type: 'image' },
      { path: 'images.arcade.1', label: 'Pong — cover', type: 'image' },
      { path: 'images.arcade.2', label: 'Breakout — cover', type: 'image' },
      { path: 'images.arcade.3', label: '2048 — cover', type: 'image' },
      { path: 'images.arcade.4', label: 'Minesweeper — cover', type: 'image' },
      { path: 'images.arcade.5', label: 'Simon — cover', type: 'image' },
      { path: 'images.arcade.6', label: 'Tic Tac Toe — cover', type: 'image' },
      { path: 'images.arcade.7', label: 'Reaction Test — cover', type: 'image' },
      { path: 'images.arcade.8', label: 'Frame Perfect — cover', type: 'image' },
      { path: 'images.arcade.9', label: 'Colour Match — cover', type: 'image' },
      { path: 'images.arcade.10', label: 'Memory — cover', type: 'image' },
      { path: 'images.arcade.11', label: 'Bug Hunt — cover', type: 'image' },
      { path: 'images.arcade.12', label: 'Spin the Wheel — cover', type: 'image' },
      { path: 'images.arcade.13', label: 'Typing Speed — cover', type: 'image' },
      { path: 'images.arcade.14', label: 'Aim Trainer — cover', type: 'image' },
      { path: 'images.arcade.15', label: 'Number Memory — cover', type: 'image' },
      { path: 'images.arcade.16', label: 'Chimp Test — cover', type: 'image' },
    ],
  },
  {
    id: 'footer',
    title: 'Footer',
    intro: 'The panel under Contact. The stat figures are placeholders taken from the reference layout — replace them with your own.',
    fields: [
      { path: 'footer.logo',    label: 'Wordmark',        type: 'text' },
      { path: 'footer.badge',   label: 'Badge',           type: 'text' },
      { path: 'footer.title1',  label: 'Headline line 1', type: 'text' },
      { path: 'footer.title2',  label: 'Headline line 2', type: 'text' },
      { path: 'footer.title3',  label: 'Headline line 3 (muted)', type: 'text' },
      { path: 'footer.sub',     label: 'Subtitle',        type: 'multiline' },
      { path: 'footer.cta',     label: 'Primary button',  type: 'text' },
      { path: 'footer.ctaHref', label: 'Primary target',  type: 'text' },
      { path: 'footer.cta2',    label: 'Secondary button', type: 'text' },
      { path: 'footer.cta2Href', label: 'Secondary target', type: 'text' },
      ...Array.from({ length: 3 }, (_, i) => ([
        { path: `footer.stats.${i}.cap`,   label: `Stat ${i + 1} — caption`, type: 'text' },
        { path: `footer.stats.${i}.value`, label: `Stat ${i + 1} — figure`,  type: 'text' },
        { path: `footer.stats.${i}.label`, label: `Stat ${i + 1} — label`,   type: 'text' },
      ])).flat(),
      ...Array.from({ length: 4 }, (_, i) => (
        { path: `images.footer.${i}`, label: `Collage photo ${i + 1}`, type: 'image' }
      )),
      { path: 'footer.cardAValue',  label: 'Amber card — figure', type: 'text' },
      { path: 'footer.cardALabel',  label: 'Amber card — label',  type: 'text' },
      { path: 'footer.cardBKicker', label: 'Mint card — kicker',  type: 'text' },
      { path: 'footer.cardBValue',  label: 'Mint card — figure',  type: 'text' },
      { path: 'footer.cardBLabel',  label: 'Mint card — label',   type: 'text' },
      { path: 'footer.marksLabel',  label: 'Wordmark strip — caption', type: 'text' },
      { path: 'footer.copyright',   label: 'Copyright line', type: 'text' },
    ],
  },
  {
    id: 'promo',
    title: 'Promo banner',
    intro: 'The magenta strip between About and Syndicate. Its colour sits between those two sections on purpose, so the surround follows it.',
    fields: [
      { path: 'images.promo.0', label: 'Banner artwork', type: 'image',
        hint: 'Fills the strip, cropped to cover. The magenta wash covers its left half, so put the subject on the right.' },
      { path: 'promo.badge',      label: 'Badge',            type: 'text', hint: 'Leave blank to hide' },
      { path: 'promo.title1',     label: 'Headline line 1',  type: 'text' },
      { path: 'promo.title2',     label: 'Headline line 2',  type: 'text', hint: 'Leave blank for a one-line headline' },
      { path: 'promo.sub',        label: 'Subtitle',         type: 'multiline' },
      { path: 'promo.cta',        label: 'Button label',     type: 'text', hint: 'Leave blank to hide the button' },
      { path: 'promo.ctaHref',    label: 'Button target',    type: 'text', hint: 'An anchor like #contact, or a full URL' },
      { path: 'promo.markKicker', label: 'Watermark — kicker', type: 'text' },
      { path: 'promo.markName',   label: 'Watermark — name',   type: 'text', hint: 'Leave blank to hide the watermark' },
    ],
  },
  {
    id: 'grid',
    title: 'Feature grid',
    intro: 'The promo card and six entry cards under Personal OS. Each card keeps the sub-page it opens; only its wording is editable, so renaming one cannot break the link.',
    fields: [
      { path: 'images.gridHero.0', label: 'Promo artwork', type: 'image',
        hint: 'Fills the promo card, cropped to cover. The copy sits over its left-hand side.' },
      { path: 'grid.heroTitle1', label: 'Promo — line 1 (lime)', type: 'text' },
      { path: 'grid.heroTitle2', label: 'Promo — line 2 (grey)', type: 'text' },
      { path: 'grid.heroSub',    label: 'Promo — subtitle',      type: 'multiline' },
      { path: 'grid.heroCta',    label: 'Promo — button label',  type: 'text' },
      { path: 'grid.heroHref',   label: 'Promo — button target', type: 'text', hint: 'A route like #/games, an anchor like #work, or a full URL' },
      ...Array.from({ length: 6 }, (_, i) => ([
        { path: `grid.cards.${i}.title`, label: `Card ${i + 1} — title`,    type: 'text' },
        { path: `grid.cards.${i}.sub`,   label: `Card ${i + 1} — subtitle`, type: 'text' },
        { path: `grid.cards.${i}.badge`, label: `Card ${i + 1} — badge`,    type: 'text', hint: 'Leave blank for no badge' },
      ])).flat(),
    ],
  },
  {
    id: 'deck',
    title: 'Edit Suite board',
    intro: 'Every label on the draggable board. Pictures are in Images → Edit Suite board.',
    fields: [
      { path: 'deck.captionTitle',  label: 'Board caption',      type: 'text' },
      { path: 'deck.timelineTitle', label: 'Timeline — title',   type: 'text' },
      { path: 'deck.timelineRange', label: 'Timeline — dates',   type: 'text' },
      { path: 'deck.posterATitle',  label: 'Poster A — title',   type: 'text' },
      { path: 'deck.posterASub',    label: 'Poster A — subtitle', type: 'text' },
      { path: 'deck.posterAKind',   label: 'Poster A — kind',    type: 'text' },
      { path: 'deck.posterAAddr',   label: 'Poster A — address', type: 'multiline' },
      { path: 'deck.posterATime',   label: 'Poster A — time',    type: 'text' },
      { path: 'deck.posterBTitle',  label: 'Poster B — title',   type: 'text' },
      { path: 'deck.posterBSub',    label: 'Poster B — subtitle', type: 'text' },
      { path: 'deck.posterBKind',   label: 'Poster B — kind',    type: 'text' },
      { path: 'deck.posterBAddr',   label: 'Poster B — address', type: 'multiline' },
      { path: 'deck.posterBTime',   label: 'Poster B — time',    type: 'text' },
      { path: 'deck.voice',         label: 'Voice pill',         type: 'text' },
      { path: 'deck.renderTitle',   label: 'Render — title',     type: 'text' },
      { path: 'deck.renderNum',     label: 'Render — percent',   type: 'text' },
      { path: 'deck.renderStats',   label: 'Render — stats',     type: 'text' },
      { path: 'deck.clock',         label: 'Clock chip',         type: 'text' },
      { path: 'deck.plateTc',       label: 'Plate — timecode',   type: 'text' },
      { path: 'deck.plateTitle',    label: 'Plate — title',      type: 'text' },
      { path: 'deck.plateSub',      label: 'Plate — subtitle',   type: 'text' },
      { path: 'deck.bestTitle',     label: 'Best frames — title', type: 'text' },
      { path: 'deck.bestSub',       label: 'Best frames — count', type: 'text' },
      { path: 'deck.nleTc',         label: 'NLE — timecode',     type: 'text' },
      { path: 'deck.nleSeq',        label: 'NLE — sequence name', type: 'text' },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    fields: [
      { path: 'contact.eyebrow',     label: 'Eyebrow',       type: 'text' },
      { path: 'contact.title',       label: 'Title',         type: 'text' },
      { path: 'contact.titleAccent', label: 'Accent word',   type: 'text' },
      { path: 'contact.lede',        label: 'Lede',          type: 'multiline' },
      { path: 'contact.email',       label: 'Email address', type: 'text', hint: 'Used by the copy button and the fallback mailto link' },
      { path: 'contact.facts.basedLabel',   label: 'Fact 1 — label', type: 'text' },
      { path: 'contact.facts.basedValue',   label: 'Fact 1 — value', type: 'text' },
      { path: 'contact.facts.repliesLabel', label: 'Fact 2 — label', type: 'text' },
      { path: 'contact.facts.repliesValue', label: 'Fact 2 — value', type: 'text' },
      { path: 'contact.facts.statusLabel',  label: 'Fact 3 — label', type: 'text' },
      { path: 'contact.facts.statusValue',  label: 'Fact 3 — value', type: 'text' },
      { path: 'contact.submitLabel', label: 'Submit button', type: 'text' },
      { path: 'contact.note',        label: 'Form footnote', type: 'multiline' },
      { path: 'contact.doneTitle',   label: 'Success title', type: 'text' },
      { path: 'contact.doneBody',    label: 'Success body',  type: 'multiline' },
    ],
  },
];
