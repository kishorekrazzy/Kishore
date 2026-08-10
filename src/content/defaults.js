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
        prose: 'Crafting cinematic narratives\nthrough the art of movement,\nrhythm, and sound design.',
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
        prose: 'Where algorithms dream and pixels become art.',
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
        prose: 'Turning raw footage into\ncinematic gold. Every frame\ntells its own color story.',
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
        prose: 'Designing digital experiences\nthat look as good as\nthey perform.',
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
      { href: '#contact',  label: 'Contact'  },
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
  warning: {
    dialogTitle: 'Unsecured Connection',
    dialogBody: 'Someone has been reading this portfolio for an unusual length of time. Their session has been logged, traced and — frankly — appreciated.',
    okLabel: 'OK',
    tabs: [
      { url: 'search.locations',   caption: 'Last known position' },
      { url: 'wanted.poster.jpg',  caption: 'Subject identified'  },
      { url: 'archive.reel.mov',   caption: 'Footage recovered'   },
      { url: 'signal.feed',        caption: 'Feed intercepted'    },
      { url: 'traces.log',         caption: 'Trace active'        },
      { url: 'profile.render',     caption: 'Match confirmed'     },
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
    // Warning stack — browser window plates
    warning: [
      'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1200&q=80',
    ],
    // AI Images — hero strip
    aiHero: [
      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80',
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
    team: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=85&auto=format&fit=crop',
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
  'warning': 'Warning stack — windows',
  'aiHero': 'AI Images \u2014 hero strip',
  'aboutMe': 'About Me \u2014 gallery',
  'team': 'Syndicate \u2014 members',
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
    id: 'warning',
    title: 'Warning pop-up (⚠ nav button)',
    fields: [
      { path: 'warning.dialogTitle', label: 'Alert title', type: 'text' },
      { path: 'warning.dialogBody',  label: 'Alert message', type: 'multiline' },
      { path: 'warning.okLabel',     label: 'Button label', type: 'text' },
      ...Array.from({ length: 6 }, (_, i) => ([
        { path: `warning.tabs.${i}.url`,     label: `Window ${i + 1} — address bar`, type: 'text' },
        { path: `warning.tabs.${i}.caption`, label: `Window ${i + 1} — caption`,     type: 'text' },
      ])).flat(),
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
