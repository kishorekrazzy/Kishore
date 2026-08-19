import { useState, useEffect, useRef } from 'react';
import { useContent } from '../content/store';
import { useMusicPlayer, fmt } from '../MusicContext';
import { tap } from './mobileUtils';
import { Icon, Img, Reveal } from './ui';
import Sheet from './Sheet';

/* ══════════════════════════════════════════════════════════════════════
   STUDIO — the phone's Personal OS

   The desktop section this replaces is a macOS pastiche: draggable
   windows, a dock, a Finder, a media player, a terminal. Almost none of
   that is meaningful on a touch screen — there is no cursor to drag
   with, no second window to arrange against, and a 390pt-wide desktop
   metaphor is a joke that does not land.

   What the widgets actually SAY, though, translates perfectly: what is
   playing, what the hobbies are, what is on the mind, what is in the
   arcade. So this is the same content in the format a phone home screen
   already uses — a board of widgets, each sized to what it holds.
   ══════════════════════════════════════════════════════════════════════ */

/* A phone clock is a real clock. It ticks on the minute rather than the
   second: nothing here needs second precision, and a per-second setState
   is a re-render every second for the entire screen. */
function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    // Line up with the next minute boundary, then run once a minute.
    const ms = (60 - new Date().getSeconds()) * 1000;
    let interval;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60000);
    }, ms);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, []);
  return now;
}

/* ── Now playing ──
   A real player. It drives the same MusicProvider the desktop uses, so
   the audio element, the track list and the progress are not a mock-up
   of a music widget — they are the music widget. */
function MusicWidget() {
  const player = useMusicPlayer();
  if (!player) return null;
  const { song, playing, setPlaying, next, prev, progress, duration } = player;
  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="mb-w mb-w--wide mb-w--media">
      <div className="mb-w-plate"><Img src={song?.art} alt="" w={620} /></div>

      <div className="mb-w-cap" style={{ color: 'rgba(var(--on-media-rgb),0.7)' }}>
        <Icon name="music" size={12} />
        {playing ? 'Now playing' : 'On the desk'}
        {playing && (
          <span className="mb-eq" style={{ marginLeft: 'auto', height: 14 }}>
            {[0, 1, 2, 3].map((i) => <i key={i} style={{ '--d': `${i * 130}ms` }} />)}
          </span>
        )}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div className="mb-w-val" style={{ fontSize: '1.15rem' }}>{song?.title}</div>
        <p className="mb-w-sub">{song?.artist} · {song?.album}</p>
      </div>

      {/* Progress. A bar rather than a scrubber: precise seeking on a
          3px target with a thumb is a frustration, and the transport
          buttons cover what anyone actually wants here. */}
      <div style={{ height: 3, borderRadius: 2, background: 'rgba(var(--on-media-rgb),0.22)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--acc)', transition: 'width 400ms linear' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button className="mb-hit" onClick={() => { tap(); prev(); }} aria-label="Previous track"
          style={{ display: 'grid', placeItems: 'center', color: 'inherit' }}>
          <Icon name="play" size={17} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <button
          onClick={() => { tap(12); setPlaying((v) => !v); }}
          aria-label={playing ? 'Pause' : 'Play'}
          style={{
            width: 42, height: 42, borderRadius: '50%', flex: 'none',
            display: 'grid', placeItems: 'center',
            background: 'var(--acc)', color: 'var(--acc-ink)',
          }}
        >
          {playing
            ? <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" /><rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" /></svg>
            : <Icon name="play" size={17} />}
        </button>
        <button className="mb-hit" onClick={() => { tap(); next(); }} aria-label="Next track"
          style={{ display: 'grid', placeItems: 'center', color: 'inherit' }}>
          <Icon name="play" size={17} />
        </button>
        <span className="mb-mono" style={{ marginLeft: 'auto', color: 'rgba(var(--on-media-rgb),0.6)' }}>
          {fmt(progress)} / {fmt(duration || song?.duration || 0)}
        </span>
      </div>
    </div>
  );
}

/* ── Inside the mind ──
   One thought at a time, replaced every five seconds. The desktop runs
   these as a horizontal ticker; on a phone a ticker is either too fast
   to read or too slow to notice, so it becomes a cross-fade. */
/* One trace, drawn twice — see .mb-wave. */
const WAVE = 'M0 20 Q 15 20 22 8 T 44 20 T 62 32 T 84 20 T 110 6 T 136 20 T 158 28 T 180 20 T 206 12 T 232 20 T 258 30 T 282 20 T 300 20';

function MindWidget() {
  const thoughts = useContent('mind.thoughts', []);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (thoughts.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % thoughts.length), 5000);
    return () => clearInterval(t);
  }, [thoughts.length]);

  return (
    <div className="mb-w mb-w--wide">
      <div className="mb-w-cap"><Icon name="bolt" size={12} />Inside the mind</div>
      <svg className="mb-wave" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true">
        <path className="mb-wave-base" d={WAVE} />
        <path className="mb-wave-pulse" d={WAVE} />
      </svg>
      {/* Keyed so the replacement plays its entrance instead of the text
          silently swapping in place. */}
      <p className="mb-think" key={i}>“{thoughts[i]}”</p>
    </div>
  );
}

export default function StudioScreen({ onGo, onOpenTimeline }) {
  const os       = useContent('os', {});
  const registry = useContent('images', {});
  const timeline = useContent('timeline', {});
  const footer   = useContent('footer', {});
  const now      = useClock();

  const hobbies = os.hobbies?.items || [];
  const works   = os.finder?.works || [];
  const arcade  = registry.arcade || [];
  const stats   = footer.stats || [];

  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  const day  = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <section className="mb-sec mb-studio" style={{ paddingTop: 'calc(var(--mb-safe-t) + var(--mb-top) + 12px)' }}>
        <div className="mb-head">
          <Reveal as="p" className="mb-eyebrow">Personal OS</Reveal>
          <Reveal as="h1" className="mb-h1" delay={50}>The <span className="mb-accent">studio</span></Reveal>
          <Reveal as="p" className="mb-body" delay={90}>
            What is running, what is playing and what is on the mind — the desk, as a home screen.
          </Reveal>
        </div>

        <Reveal className="mb-widgets" delay={120}>
          {/* Clock. */}
          <div className="mb-w">
            <div className="mb-w-cap"><Icon name="clock" size={12} />Local · IST</div>
            <div className="mb-clock" style={{ marginTop: 'auto' }}>
              {time}<em>IST</em>
            </div>
            <p className="mb-w-sub">{day}</p>
          </div>

          {/* Status. */}
          <div className="mb-w">
            <div className="mb-w-cap"><Icon name="bolt" size={12} />Status</div>
            <div className="mb-w-val" style={{ fontSize: '1.15rem', marginTop: 'auto' }}>Open for work</div>
            <p className="mb-w-sub">Replies within two days. Briefs, half-ideas and “is this possible” all welcome.</p>
          </div>

          <MusicWidget />
          <MindWidget />

          {/* Hobbies. */}
          <div className="mb-w mb-w--wide">
            <div className="mb-w-cap"><Icon name="spark" size={12} />{os.hobbies?.eyebrow || 'When not working'}</div>
            <div className="mb-hobbies">
              {hobbies.map((h, i) => <span key={i}>{h.label}</span>)}
            </div>
          </div>

          {/* Arcade. */}
          <button className="mb-w mb-w--wide mb-press" onClick={() => { tap(); onGo('work', 'games'); }}>
            <div className="mb-w-cap"><Icon name="game" size={12} />The arcade</div>
            <div className="mb-w-val" style={{ fontSize: '1.3rem' }}>Six games</div>
            <p className="mb-w-sub">Spin the wheel, beat your reaction time, cut on the frame.</p>
            <div className="mb-arcade">
              {arcade.slice(0, 5).map((src, i) => (
                <span className="mb-arcade-cover" key={i}><Img src={src} alt="" w={140} /></span>
              ))}
            </div>
          </button>

          {/* Recent work — the Finder, flattened. */}
          <div className="mb-w mb-w--wide">
            <div className="mb-w-cap"><Icon name="layers" size={12} />Recent files</div>
            <ul className="mb-detail-list" style={{ marginTop: 4 }}>
              {works.slice(0, 4).map((w, i) => (
                <li key={i}>
                  <Icon name="camera" size={16} />
                  <b>{w.name}</b>
                  <span>{2026 - i}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Numbers. */}
          {stats.map((s, i) => (
            <div className="mb-w" key={i}>
              <div className="mb-w-cap">{s.cap}</div>
              <div className="mb-w-val" style={{ marginTop: 'auto' }}>{s.value}</div>
              <p className="mb-w-sub">{s.label}</p>
            </div>
          ))}

          {/* Timeline. */}
          <button className="mb-w mb-w--wide mb-press mb-w--media" onClick={() => { tap(); onOpenTimeline(); }}>
            <div className="mb-w-plate"><Img src={registry.timeline?.[0]} alt="" w={620} /></div>
            <div className="mb-w-cap" style={{ color: 'rgba(var(--on-media-rgb),0.7)' }}>
              <Icon name="clock" size={12} />The record
            </div>
            <div className="mb-w-val" style={{ fontSize: '1.3rem', marginTop: 'auto' }}>
              {(timeline.entries || []).length} entries
            </div>
            <p className="mb-w-sub">Every date that mattered, from day zero.</p>
          </button>
        </Reveal>
      </section>
    </>
  );
}

/* ── Timeline sheet ───────────────────────────────────────────────────
   Exported separately: the studio launches it, but so does anything else
   that wants it, and it has no business being tangled in the widget
   board's state. */
export function TimelineSheet({ onClose }) {
  const timeline = useContent('timeline', {});
  const covers   = useContent('images.timeline', []);
  const entries  = [...(timeline.entries || [])].reverse();
  const bodyRef  = useRef(null);

  return (
    <Sheet title="The record" onClose={onClose} full bodyRef={bodyRef}>
      <div style={{ padding: '18px var(--mb-pad) 40px' }}>
        <p className="mb-eyebrow" style={{ marginBottom: 14 }}>Newest first</p>
        <div className="mb-timeline">
          {entries.map((e, i) => (
            <div className="mb-tl-item" key={e.date}>
              <div className="mb-tl-date">
                {new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <h3>{e.title}</h3>
              <p>{e.note}</p>
              {covers[i] && (
                <div style={{ marginTop: 11, borderRadius: 'var(--mb-r-sm)', overflow: 'hidden' }}>
                  <Img src={covers[i]} alt="" w={560} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
