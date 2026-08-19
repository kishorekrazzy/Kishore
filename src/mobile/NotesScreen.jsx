import { useState, useMemo } from 'react';
import { useContent } from '../content/store';
import { tap } from './mobileUtils';
import { Icon, Img, Reveal } from './ui';
import Sheet from './Sheet';

/* ══════════════════════════════════════════════════════════════════════
   NOTES

   Twelve written pieces. The desktop shows them as a grid of covers; on
   a phone that is twelve screens of scrolling before you have read a
   word, so the lead piece keeps its cover and the rest become rows.

   Reading happens in a full-height sheet with a progress line — the one
   piece of chrome that genuinely helps on a long article, because a
   phone scrollbar is invisible until you are already moving.
   ══════════════════════════════════════════════════════════════════════ */

const FALLBACK = { items: [] };

const niceDate = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

function Meta({ note }) {
  return (
    <div className="mb-note-meta">
      <span className="mb-note-kicker">{note.kicker}</span>
      <i />
      <span>{niceDate(note.date)}</span>
      <i />
      <span>{note.read}</span>
    </div>
  );
}

/* ── Reader ───────────────────────────────────────────────────────── */
function Reader({ note, cover, onClose, onNext, nextNote }) {
  /* The CMS stores the body as one string with blank lines between
     paragraphs — a textarea is the right editor for prose, and this is
     the cost of that decision: split it back out at render. */
  const paras = useMemo(
    () => String(note.body || note.excerpt || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
    [note],
  );

  return (
    <Sheet title={note.kicker} onClose={onClose} full progress>
      <article className="mb-read">
        <div className="mb-read-cover">
          <Img src={cover} alt="" w={760} eager />
        </div>

        <header className="mb-read-head">
          <Meta note={note} />
          <h1>{note.title}</h1>
        </header>

        <div className="mb-read-prose">
          {paras.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        {nextNote && (
          <div className="mb-read-end">
            <p className="mb-eyebrow">Next</p>
            <button className="mb-note-row" onClick={() => { tap(); onNext(); }} style={{ borderBottom: 0 }}>
              <div>
                <h3>{nextNote.title}</h3>
                <Meta note={nextNote} />
              </div>
              <Icon name="chev" size={20} />
            </button>
          </div>
        )}
      </article>
    </Sheet>
  );
}

/* ── Screen ───────────────────────────────────────────────────────── */
export default function NotesScreen({ open, onOpen }) {
  const notes  = useContent('notes', FALLBACK);
  const covers = useContent('images.notes', []);
  /* `notes.items || []` is a fresh array on every render when the CMS
     has nothing stored, which would defeat every memo below it. */
  const items  = useMemo(() => notes.items || [], [notes.items]);

  const [kicker, setKicker] = useState('All');
  // Built from the notes themselves, so a new category in the dashboard
  // gets a filter without anyone touching this file.
  const kickers = useMemo(
    () => ['All', ...Array.from(new Set(items.map((n) => n.kicker).filter(Boolean)))],
    [items],
  );

  const shown = kicker === 'All' ? items : items.filter((n) => n.kicker === kicker);
  const openIdx = typeof open === 'number' ? open : -1;
  const note = items[openIdx];
  const nextNote = items[openIdx + 1];

  const [lead, ...rest] = shown;

  return (
    <>
      <section className="mb-sec mb-notes" style={{ paddingTop: 'calc(var(--mb-safe-t) + var(--mb-top) + 12px)' }}>
        <div className="mb-head">
          <Reveal as="p" className="mb-eyebrow">{notes.eyebrow || 'Notes'}</Reveal>
          <Reveal as="h1" className="mb-h1" delay={50}>
            {notes.title || 'Working'} <span className="mb-accent">{notes.titleAccent || 'notes'}</span>
          </Reveal>
          <Reveal as="p" className="mb-body" delay={90}>{notes.sub}</Reveal>
        </div>

        <div className="mb-filters" role="tablist" aria-label="Filter notes">
          {kickers.map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={kicker === k}
              className={`mb-filter${kicker === k ? ' mb-filter--on' : ''}`}
              onClick={() => { tap(); setKicker(k); }}
            >
              {k}
            </button>
          ))}
        </div>

        {lead && (
          <Reveal
            as="button"
            className="mb-note-lead"
            onClick={() => { tap(); onOpen(items.indexOf(lead)); }}
          >
            <Img src={covers[items.indexOf(lead)]} alt="" w={720} />
            <span className="mb-note-lead-body">
              <Meta note={lead} />
              <h3 className="mb-h3">{lead.title}</h3>
              <p className="mb-body" style={{ fontSize: '0.83rem' }}>{lead.excerpt}</p>
              <span className="mb-link">Read it<Icon name="arrow" size={15} /></span>
            </span>
          </Reveal>
        )}

        {rest.map((n, i) => {
          const idx = items.indexOf(n);
          return (
            <Reveal
              as="button"
              className="mb-note-row"
              key={idx}
              delay={Math.min(i, 4) * 45}
              onClick={() => { tap(); onOpen(idx); }}
            >
              <span>
                <h3>{n.title}</h3>
                <Meta note={n} />
              </span>
              <Img src={covers[idx]} alt="" w={220} />
            </Reveal>
          );
        })}

        {shown.length === 0 && (
          <p className="mb-body" style={{ padding: '30px 0', textAlign: 'center' }}>
            Nothing filed under {kicker} yet.
          </p>
        )}
      </section>

      {note && (
        <Reader
          /* Keyed so moving to the next piece rebuilds the reader —
             scrolled back to the top, progress bar reset. Without the
             key you land halfway down an article you have not read. */
          key={openIdx}
          note={note}
          cover={covers[openIdx]}
          nextNote={nextNote}
          onNext={() => onOpen(openIdx + 1)}
          onClose={() => onOpen(null)}
        />
      )}
    </>
  );
}
