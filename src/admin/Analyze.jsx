import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import './Analyze.css';

/* ══════════════════════════════════════════════════════════════════════
   ANALYZE

   Live view over the counters src/services/analytics.js writes. Two
   subscriptions, both onSnapshot, so nothing polls and nothing needs a
   refresh button: the daily documents for the selected range, and the
   live-session collection for who is on the site right now.

   Everything here is read-only and derived. There is no state worth
   keeping — if a number looks wrong the fix belongs in the collector.
   ══════════════════════════════════════════════════════════════════════ */

const GRID_X = 32;
const GRID_Y = 18;
const LIVE_TTL = 45000;   // a session with no heartbeat for this long is gone

const RANGES = [
  { id: 7,  label: '7 days'  },
  { id: 30, label: '30 days' },
  { id: 90, label: '90 days' },
];

const SECTION_ORDER = [
  'Hero', 'About', 'Syndicate', 'Work', 'Showcase',
  'Notes', 'Personal OS', 'Edit Suite', 'Contact',
];

// ── formatting ───────────────────────────────────────────────────────
const fmtNum = (n) => (n >= 10000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n || 0)));

function fmtDur(ms) {
  const s = Math.round((ms || 0) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, '0')}s`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
}

const dayLabel = (iso) => {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
};

const isoDaysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/* Sums the same map field across every day in range. The documents are
   sparse — a day with no Safari visitor simply has no Safari key — so
   this is the only safe way to read any of them. */
function sumMap(days, key) {
  const out = {};
  for (const d of days) {
    const m = d[key];
    if (!m || typeof m !== 'object') continue;
    for (const [k, v] of Object.entries(m)) {
      if (typeof v === 'number') out[k] = (out[k] || 0) + v;
    }
  }
  return out;
}

const sumField = (days, key) => days.reduce((n, d) => n + (Number(d[key]) || 0), 0);

// ── data ─────────────────────────────────────────────────────────────
function useAnalytics(rangeDays) {
  const [days, setDays] = useState([]);
  const [live, setLive] = useState([]);
  const [state, setState] = useState('loading');   // loading | ready | error
  const [error, setError] = useState('');
  // Ticks once a second purely so live rows age out on screen without a
  // new snapshot arriving.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let unsubDays = null;
    let unsubLive = null;
    let cancelled = false;

    (async () => {
      try {
        const [m, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('../firebase'),
        ]);
        if (cancelled) return;

        /* Document ids are ISO dates, so a string range on the id is a
           date range — no extra field and no composite index. */
        const from = isoDaysAgo(rangeDays - 1);
        unsubDays = m.onSnapshot(
          m.query(
            m.collection(db, 'analytics'),
            m.where(m.documentId(), '>=', from),
            m.orderBy(m.documentId()),
          ),
          (snap) => {
            setDays(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setState('ready');
          },
          (err) => { setError(err.message); setState('error'); },
        );

        unsubLive = m.onSnapshot(
          m.collection(db, 'analytics_live'),
          (snap) => {
            setLive(snap.docs.map((d) => d.data()));

            /* Sweep the dead. A tab killed by the OS, or a browser that
               crashed, never runs its own cleanup, so its row would sit
               there for ever and the collection would only ever grow.
               The dashboard is the one place that is both signed in and
               looking at this data, so it does the pruning — anything an
               hour stale cannot be a live session by any definition. */
            const dead = snap.docs.filter((d) => Date.now() - (d.data().lastSeen || 0) > 3600000);
            for (const d of dead.slice(0, 50)) m.deleteDoc(d.ref).catch(() => {});
          },
          () => { /* live is a nicety; its failure is not the panel's */ },
        );
      } catch (err) {
        if (!cancelled) { setError(err?.message || 'Could not load analytics.'); setState('error'); }
      }
    })();

    return () => { cancelled = true; unsubDays?.(); unsubLive?.(); };
  }, [rangeDays]);

  const active = useMemo(
    () => live.filter((s) => now - (s.lastSeen || 0) < LIVE_TTL)
              .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0)),
    [live, now],
  );

  return { days, live: active, now, state, error };
}

// ── pieces ───────────────────────────────────────────────────────────
function Kpi({ label, value, sub, delta, accent }) {
  const dir = delta == null ? null : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  return (
    <div className={`az-kpi${accent ? ' az-kpi--accent' : ''}`}>
      <span className="az-kpi-label">{label}</span>
      <strong className="az-kpi-value">{value}</strong>
      <span className="az-kpi-foot">
        {sub}
        {dir && dir !== 'flat' && (
          <em className={`az-delta az-delta--${dir}`}>
            {dir === 'up' ? '▲' : '▼'} {Math.abs(delta)}%
          </em>
        )}
      </span>
    </div>
  );
}

function Panel({ title, note, right, children, wide }) {
  return (
    <section className={`az-panel${wide ? ' az-panel--wide' : ''}`}>
      <header className="az-panel-head">
        <div>
          <h3>{title}</h3>
          {note && <p>{note}</p>}
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

/* Daily traffic. Hand-drawn SVG rather than a charting library: two
   series, one axis, and no interaction beyond a tooltip — importing a
   library for that would cost more than it saves. */
function TrafficChart({ days, metric, onMetric }) {
  const [hover, setHover] = useState(null);
  const W = 720;
  const H = 190;
  const PAD = 26;

  const series = days.map((d) => ({
    id: d.id,
    sessions: Number(d.sessions) || 0,
    visitors: Number(d.visitors) || 0,
  }));

  if (series.length === 0) return <p className="az-empty">No visits recorded yet.</p>;

  const max = Math.max(1, ...series.map((s) => s[metric]));
  const bw  = (W - PAD * 2) / series.length;

  return (
    <div className="az-chart">
      <div className="az-seg">
        {['sessions', 'visitors'].map((m) => (
          <button key={m} className={metric === m ? 'is-on' : ''} onClick={() => onMetric(m)}>
            {m === 'sessions' ? 'Sessions' : 'New visitors'}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="az-chart-svg" role="img"
           aria-label={`Daily ${metric} for the selected range`}>
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1={PAD} x2={W - PAD} y1={PAD + (H - PAD * 2) * f} y2={PAD + (H - PAD * 2) * f}
                className="az-grid" />
        ))}
        {series.map((s, i) => {
          const h = ((H - PAD * 2) * s[metric]) / max;
          const x = PAD + i * bw;
          return (
            <g key={s.id}
               onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={x} y={PAD} width={bw} height={H - PAD * 2} fill="transparent" />
              <rect
                className={`az-bar${hover === i ? ' is-hot' : ''}`}
                x={x + bw * 0.18}
                y={H - PAD - h}
                width={bw * 0.64}
                height={Math.max(h, s[metric] ? 2 : 0)}
                rx={Math.min(3, bw * 0.3)}
              />
            </g>
          );
        })}
        <line x1={PAD} x2={W - PAD} y1={H - PAD} y2={H - PAD} className="az-axis" />
      </svg>

      <div className="az-chart-foot">
        <span>{series[0] && dayLabel(series[0].id)}</span>
        <strong>
          {hover != null
            ? `${dayLabel(series[hover].id)} · ${series[hover][metric]} ${metric}`
            : `peak ${max}`}
        </strong>
        <span>{series.at(-1) && dayLabel(series.at(-1).id)}</span>
      </div>
    </div>
  );
}

/* The heat map. Canvas, because 576 cells as DOM nodes re-rendered on
   every snapshot is wasteful, and because a blurred radial per cell is
   what makes it read as heat rather than as a spreadsheet. */
function HeatMap({ heat, clicks, rage, mode, onMode }) {
  const ref = useRef(null);
  const data = mode === 'clicks' ? clicks : heat;

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width;
    const H = cv.height;
    const cw = W / GRID_X;
    const ch = H / GRID_Y;

    ctx.clearRect(0, 0, W, H);

    const values = Object.values(data);
    if (values.length === 0) return;
    /* Scaled against the 95th percentile, not the maximum. One cell with
       a runaway count — a button everybody presses — would otherwise
       flatten the entire rest of the map to black. */
    const sorted = [...values].sort((a, b) => a - b);
    const peak = Math.max(1, sorted[Math.floor(sorted.length * 0.95)] || sorted.at(-1));

    ctx.globalCompositeOperation = 'lighter';
    for (const [key, v] of Object.entries(data)) {
      const [gx, gy] = key.split('_').map(Number);
      if (Number.isNaN(gx) || Number.isNaN(gy)) continue;
      const t = Math.min(1, v / peak);
      const cx = gx * cw + cw / 2;
      const cy = gy * ch + ch / 2;
      const r  = Math.max(cw, ch) * 1.5;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      // blue → cyan → amber → red, the conventional ramp
      const hue = 220 - 220 * t;
      g.addColorStop(0, `hsla(${hue}, 95%, 55%, ${0.16 + t * 0.62})`);
      g.addColorStop(1, `hsla(${hue}, 95%, 55%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    // Rage cells get a ring on top — they are a defect report, not heat.
    if (mode === 'clicks') {
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2;
      for (const key of Object.keys(rage)) {
        const [gx, gy] = key.split('_').map(Number);
        if (Number.isNaN(gx)) continue;
        ctx.beginPath();
        ctx.arc(gx * cw + cw / 2, gy * ch + ch / 2, Math.max(cw, ch) * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [data, rage, mode]);

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  return (
    <div className="az-heat">
      <div className="az-seg">
        {['heat', 'clicks'].map((m) => (
          <button key={m} className={mode === m ? 'is-on' : ''} onClick={() => onMode(m)}>
            {m === 'heat' ? 'Cursor' : 'Clicks'}
          </button>
        ))}
      </div>

      <div className="az-heat-stage">
        <canvas ref={ref} width={GRID_X * 26} height={GRID_Y * 26} className="az-heat-canvas" />
        {total === 0 && <p className="az-heat-empty">Nothing recorded for this range yet.</p>}
        {/* A viewport outline, so it is obvious the map is screen-space —
            positions are normalised, not tied to page coordinates. */}
        <span className="az-heat-frame" aria-hidden="true" />
      </div>

      <div className="az-heat-legend">
        <span>cold</span>
        <i className="az-heat-ramp" />
        <span>hot</span>
        <em>
          {fmtNum(total)} {mode === 'clicks' ? 'clicks' : 'samples'}
          {mode === 'clicks' && Object.keys(rage).length > 0
            && ` · ${Object.keys(rage).length} rage spot${Object.keys(rage).length === 1 ? '' : 's'} ringed`}
        </em>
      </div>
    </div>
  );
}

// A ranked list of key → count, as proportional bars.
function BarList({ data, total, unit, limit = 8, format = fmtNum }) {
  const rows = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  if (rows.length === 0) return <p className="az-empty">No data yet.</p>;
  const top = Math.max(1, rows[0][1]);

  return (
    <ul className="az-bars">
      {rows.map(([k, v]) => (
        <li key={k}>
          <span className="az-bars-key" title={k}>{k.replace(/_/g, ' ')}</span>
          <span className="az-bars-track">
            <i style={{ width: `${(v / top) * 100}%` }} />
          </span>
          <span className="az-bars-val">
            {format(v)}{unit}
            {total > 0 && <em>{Math.round((v / total) * 100)}%</em>}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── panel ────────────────────────────────────────────────────────────
export default function Analyze() {
  const [range, setRange] = useState(30);
  const [metric, setMetric] = useState('sessions');
  const [heatMode, setHeatMode] = useState('heat');
  const { days, live, now, state, error } = useAnalytics(range);

  const d = useMemo(() => {
    const sessions  = sumField(days, 'sessions');
    const visitors  = sumField(days, 'visitors');
    const returning = sumField(days, 'returning');
    const totalMs   = sumField(days, 'totalMs');
    const bounces   = sumField(days, 'bounces');
    const depthSum  = sumField(days, 'depthSum');
    const rageTotal = sumField(days, 'rage');

    /* Sections carry two counters each, so they need a shape the flat map
       summer cannot produce. */
    const sections = {};
    for (const day of days) {
      for (const [name, v] of Object.entries(day.sections || {})) {
        const key = name.replace(/_/g, ' ');
        sections[key] = sections[key] || { ms: 0, views: 0 };
        sections[key].ms    += Number(v?.ms) || 0;
        sections[key].views += Number(v?.views) || 0;
      }
    }

    const sectionMs = Object.values(sections).reduce((n, s) => n + s.ms, 0);
    const ranked = Object.entries(sections)
      .map(([name, s]) => ({
        name,
        ms: s.ms,
        views: s.views,
        share: sectionMs ? s.ms / sectionMs : 0,
        // How long each person who reached it actually stayed. The
        // interesting number: total dwell just rewards being early on
        // the page.
        perView: s.views ? s.ms / s.views : 0,
      }))
      .sort((a, b) => b.ms - a.ms);

    return {
      sessions, visitors, returning, totalMs, bounces, rageTotal,
      sections: ranked,
      avgSession: sessions ? totalMs / sessions : 0,
      avgDepth:   sessions ? depthSum / sessions : 0,
      bounceRate: sessions ? (bounces / sessions) * 100 : 0,
      heat:    sumMap(days, 'heat'),
      clicks:  sumMap(days, 'clicks'),
      rage:    sumMap(days, 'rageCells'),
      hours:   sumMap(days, 'hours'),
      devices: sumMap(days, 'devices'),
      browsers: sumMap(days, 'browsers'),
      os:      sumMap(days, 'os'),
      referrers: sumMap(days, 'referrers'),
      langs:   sumMap(days, 'langs'),
      viewports: sumMap(days, 'viewports'),
      depths:  sumMap(days, 'depths'),
      durations: sumMap(days, 'durations'),
      pages:   sumMap(days, 'pages'),
      events:  sumMap(days, 'events'),
      exits:   sumMap(days, 'exits'),
    };
  }, [days]);

  // Today against yesterday, for the KPI arrows.
  const delta = useMemo(() => {
    const t = days.at(-1);
    const y = days.at(-2);
    if (!t || !y) return {};
    const pc = (a, b) => (b ? Math.round(((a - b) / b) * 100) : null);
    return {
      sessions: pc(Number(t.sessions) || 0, Number(y.sessions) || 0),
      visitors: pc(Number(t.visitors) || 0, Number(y.visitors) || 0),
    };
  }, [days]);

  const todayDoc = days.at(-1);
  const peakHour = useMemo(() => {
    const e = Object.entries(d.hours).sort((a, b) => b[1] - a[1])[0];
    return e ? `${String(e[0]).padStart(2, '0')}:00` : '—';
  }, [d.hours]);

  /* Where sessions most often ended. Not the same as the least popular
     section — this is the one people were looking at when they left. */
  const dropOff = useMemo(() => {
    const e = Object.entries(d.exits).sort((a, b) => b[1] - a[1])[0];
    return e ? e[0].replace(/_/g, ' ') : '—';
  }, [d.exits]);

  const exportCsv = useCallback(() => {
    const cols = ['date', 'sessions', 'visitors', 'returning', 'totalMs', 'bounces', 'clickTotal', 'rage'];
    const rows = [cols.join(',')];
    for (const day of days) rows.push(cols.map((c) => (c === 'date' ? day.id : Number(day[c]) || 0)).join(','));
    for (const s of d.sections) rows.push(`section:${s.name},${s.views},${s.ms}`);
    const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${isoDaysAgo(0)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [days, d.sections]);

  if (state === 'loading') return <p className="az-empty">Loading analytics…</p>;

  if (state === 'error') {
    return (
      <div className="az-error">
        <p><strong>Could not read analytics.</strong> {error}</p>
        <p>
          If this says “Missing or insufficient permissions”, the Firestore rules
          for <code>analytics</code> and <code>analytics_live</code> have not been
          published yet — they are in ADMIN_SETUP.md.
        </p>
      </div>
    );
  }

  const hourMax = Math.max(1, ...Object.values(d.hours));

  return (
    <div className="az">
      {/* ── header ── */}
      <header className="az-head">
        <div>
          <h2>Analyze</h2>
          <p>
            Anonymous, first-party, and live — no cookie and no third-party script.
            Numbers update the moment a visitor’s browser flushes.
          </p>
        </div>
        <div className="az-head-ctl">
          <div className="az-seg">
            {RANGES.map((r) => (
              <button key={r.id} className={range === r.id ? 'is-on' : ''} onClick={() => setRange(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
          <button className="az-export" onClick={exportCsv}>Export CSV</button>
        </div>
      </header>

      {/* ── live now ── */}
      <div className="az-live">
        <span className={`az-pulse${live.length ? ' is-on' : ''}`} aria-hidden="true" />
        <strong>{live.length}</strong>
        <span>{live.length === 1 ? 'person on the site right now' : 'people on the site right now'}</span>
      </div>

      {/* ── KPIs ── */}
      <div className="az-kpis">
        <Kpi label="Sessions today"  value={fmtNum(Number(todayDoc?.sessions) || 0)}
             sub="visits started" delta={delta.sessions} accent />
        <Kpi label="New visitors today" value={fmtNum(Number(todayDoc?.visitors) || 0)}
             sub="first time here" delta={delta.visitors} />
        <Kpi label={`Sessions · ${range}d`} value={fmtNum(d.sessions)}
             sub={`${fmtNum(d.visitors)} new · ${fmtNum(d.returning)} returning`} />
        <Kpi label="Avg. time on site" value={fmtDur(d.avgSession)}
             sub={`${fmtDur(d.totalMs)} total`} />
        <Kpi label="Avg. scroll depth" value={`${Math.round(d.avgDepth)}%`}
             sub={`bounce ${Math.round(d.bounceRate)}%`} />
        <Kpi label="Peak hour" value={peakHour} sub={`drop-off: ${dropOff}`} />
      </div>

      <div className="az-grid">
        {/* ── traffic ── */}
        <Panel title="Traffic" note={`Daily totals across the last ${range} days.`} wide>
          <TrafficChart days={days} metric={metric} onMetric={setMetric} />
        </Panel>

        {/* ── section attention ── */}
        <Panel
          title="Where people spend their time"
          note="Ranked by total dwell. “Per visit” is how long each person who reached the section actually stayed — the fairer measure, since sections near the top of the page are seen by everyone."
          wide
        >
          {d.sections.length === 0
            ? <p className="az-empty">No section data yet.</p>
            : (
              <ul className="az-sections">
                {d.sections.map((s, i) => (
                  <li key={s.name}>
                    <span className="az-sec-rank">{i + 1}</span>
                    <div className="az-sec-body">
                      <div className="az-sec-top">
                        <strong>{s.name}</strong>
                        <span>{fmtDur(s.ms)} · {Math.round(s.share * 100)}%</span>
                      </div>
                      <span className="az-sec-track">
                        <i style={{ width: `${s.share * 100}%` }} />
                      </span>
                      <span className="az-sec-meta">
                        {fmtNum(s.views)} {s.views === 1 ? 'visit' : 'visits'} · {fmtDur(s.perView)} per visit
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
        </Panel>

        {/* ── heat ── */}
        <Panel
          title="Attention map"
          note="Cursor positions and clicks, normalised to the viewport so every screen size contributes to one picture. Ringed spots are rage clicks — three hits in the same place inside a second, which usually means something looks pressable and isn’t."
          wide
        >
          <HeatMap heat={d.heat} clicks={d.clicks} rage={d.rage} mode={heatMode} onMode={setHeatMode} />
        </Panel>

        {/* ── hours ── */}
        <Panel title="When they visit" note="Sessions by hour, visitor’s local time.">
          <div className="az-hours">
            {Array.from({ length: 24 }, (_, h) => {
              const v = d.hours[h] || 0;
              return (
                <span key={h} className="az-hour" title={`${String(h).padStart(2, '0')}:00 — ${v}`}>
                  <i style={{ height: `${Math.max(2, (v / hourMax) * 100)}%` }} className={v ? 'has' : ''} />
                  {h % 6 === 0 && <em>{String(h).padStart(2, '0')}</em>}
                </span>
              );
            })}
          </div>
        </Panel>

        {/* ── live sessions ── */}
        <Panel title="Live sessions" note="Everyone currently on the site, and what they are looking at.">
          {live.length === 0
            ? <p className="az-empty">Nobody on the site right now.</p>
            : (
              <ul className="az-livelist">
                {live.map((s) => (
                  <li key={s.id}>
                    <span className="az-live-dot" aria-hidden="true" />
                    <div>
                      <strong>{s.section || '—'}</strong>
                      <span>{s.device} · {s.browser} · from {s.referrer}</span>
                    </div>
                    <span className="az-live-meta">
                      {fmtDur(now - (s.startedAt || now))}
                      <em>{s.depth || 0}% deep</em>
                    </span>
                  </li>
                ))}
              </ul>
            )}
        </Panel>

        <Panel title="Devices" note="What they are reading it on.">
          <BarList data={d.devices} total={d.sessions} />
          <h4 className="az-sub">Screen width</h4>
          <BarList data={d.viewports} total={d.sessions} limit={4} />
        </Panel>

        <Panel title="Browsers & OS">
          <BarList data={d.browsers} total={d.sessions} limit={5} />
          <h4 className="az-sub">Operating system</h4>
          <BarList data={d.os} total={d.sessions} limit={5} />
        </Panel>

        <Panel title="Where they came from" note="Referring host only — never the full URL.">
          <BarList data={d.referrers} total={d.sessions} />
        </Panel>

        <Panel title="How far they scroll" note="Deepest point reached, in quarters.">
          <BarList
            data={Object.fromEntries(Object.entries(d.depths).map(([k, v]) => [`${k}%`, v]))}
            total={d.sessions}
            limit={5}
          />
          <h4 className="az-sub">How long they stay</h4>
          <BarList data={d.durations} total={d.sessions} limit={6} />
        </Panel>

        <Panel title="Sub-pages opened" note="The overlays behind the Work grid.">
          <BarList data={d.pages} total={0} />
        </Panel>

        <Panel title="Things they did" note="Interactions worth counting.">
          <BarList data={d.events} total={0} />
          {d.rageTotal > 0 && (
            <p className="az-flag">
              {d.rageTotal} rage {d.rageTotal === 1 ? 'click' : 'clicks'} in this range — check the ringed
              spots on the attention map.
            </p>
          )}
        </Panel>

        <Panel title="Language" note="Browser language at the time of the visit.">
          <BarList data={d.langs} total={d.sessions} limit={6} />
        </Panel>

        {/* Reads as a page map rather than a ranking: the order is the
            order of the page, so a gap is visible as a gap. */}
        <Panel title="Section reach" note="Share of sessions that got as far as each section." wide>
          <ul className="az-reach">
            {SECTION_ORDER.map((name) => {
              const s = d.sections.find((x) => x.name === name);
              const pct = d.sessions ? Math.round(((s?.views || 0) / d.sessions) * 100) : 0;
              return (
                <li key={name}>
                  <span className="az-reach-bar">
                    <i style={{ height: `${Math.min(100, pct)}%` }} />
                  </span>
                  <strong>{pct}%</strong>
                  <span className="az-reach-name">{name}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <p className="az-foot">
        {days.length} {days.length === 1 ? 'day' : 'days'} of data · counters are flushed every 20 seconds
        from each open tab, so today’s figures trail live activity by up to that much.
      </p>
    </div>
  );
}
