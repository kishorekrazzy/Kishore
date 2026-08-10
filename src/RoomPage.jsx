import { useState, useEffect, useRef } from 'react';
import './RoomPage.css';

const CAMERAS = [
  { id: '01', src: '/CCtv/room1.mp4', loc: 'MAIN HALL', zone: 'ZONE-A', res: '1080P', fps: 30, rec: true, online: true, sig: 5 },
  { id: '02', src: '/CCtv/Office1.mp4', loc: 'LAB SECTOR', zone: 'ZONE-B', res: '4K', fps: 24, rec: true, online: true, sig: 4 },
  { id: '03', src: '/CCtv/carhack.mp4', loc: 'CORRIDOR-B', zone: 'ZONE-C', res: '720P', fps: 30, rec: true, online: true, sig: 3 },
  { id: '04', src: '/CCtv/Alien1.mp4', loc: 'SERVER ROOM', zone: 'ZONE-A', res: '1080P', fps: 30, rec: true, online: true, sig: 5 },
  { id: '05', src: null, loc: 'Bathroom', zone: 'ZONE-D', res: '720P', fps: 25, rec: false, online: false, sig: 1 },
  { id: '06', src: '/CCtv/Alien2.mp4', loc: 'VAULT', zone: 'ZONE-B', res: '4K', fps: 24, rec: true, online: true, sig: 4 },
];

const INIT_EVENTS = [
  { id: 1, time: '14:23:11', msg: 'Motion detected — ZONE-A · CAM-01', type: 'warn' },
  { id: 2, time: '14:21:54', msg: 'CAM-04 signal restored', type: 'ok' },
  { id: 3, time: '14:18:30', msg: 'CAM-03 INTRUSION DETECTED', type: 'alert' },
  { id: 4, time: '14:15:22', msg: 'Recording session started', type: 'info' },
  { id: 5, time: '14:12:08', msg: 'Auth verified [192.168.1.105]', type: 'ok' },
  { id: 6, time: '14:09:44', msg: 'HDD health check: PASS', type: 'ok' },
  { id: 7, time: '14:06:15', msg: 'Unknown access: CAM-03', type: 'alert' },
];

function SigBars({ strength }) {
  return (
    <div className="svl-sig">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`svl-sig-b${i <= strength ? ' svl-sig-b--on' : ''}`}
          style={{ height: `${4 + i * 2}px` }}
        />
      ))}
    </div>
  );
}

function OfflineFeed() {
  return (
    <div className="svl-offline">
      <div className="svl-static-bg" aria-hidden="true" />
      <div className="svl-offline-inner">
        <div className="svl-offline-x">✕</div>
        <div className="svl-offline-lbl">NO SIGNAL</div>
        <div className="svl-offline-code">ERR_CONN_TIMEOUT · 0x4F4C</div>
      </div>
    </div>
  );
}

function HackOverlay() {
  return (
    <div className="svl-hacked-overlay" aria-live="assertive">
      <div className="svl-hack-label">
        <span className="svl-hack-title">⚠ CAMERA COMPROMISED</span>
        <span className="svl-hack-sub">HACKED BY</span>
        <span className="svl-hack-wife">MY WIFE ♥</span>
      </div>
    </div>
  );
}

function Feed({ cam, time, date, motion, isHacked, onClick }) {
  const isOff = !cam.online;
  let cls = `svl-feed`;
  if (isOff) cls += ' svl-feed--off';
  if (motion) cls += ' svl-feed--motion';
  if (isHacked) cls += ' svl-feed--hacked';
  if (onClick) cls += ' svl-feed--clickable';

  return (
    <div
      className={cls}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e => e.key === 'Enter' && onClick()) : undefined}
    >
      {cam.online
        ? <video className="svl-vid" key={cam.id} autoPlay loop muted playsInline src={cam.src} />
        : <OfflineFeed />
      }

      <div className="svl-scan" aria-hidden="true" />
      <div className="svl-vig" aria-hidden="true" />

      <span className="svl-brk svl-brk-tl" aria-hidden="true" />
      <span className="svl-brk svl-brk-tr" aria-hidden="true" />
      <span className="svl-brk svl-brk-bl" aria-hidden="true" />
      <span className="svl-brk svl-brk-br" aria-hidden="true" />

      <div className="svl-top-bar">
        <span className="svl-feed-id">
          <span style={{ color: isOff ? '#ff4444' : isHacked ? '#ff1a1a' : '#00e676', fontSize: '0.45rem' }}>●</span>
          {' '}CAM-{cam.id}
        </span>
        <span className="svl-feed-loc">{cam.loc}</span>
        {cam.rec && cam.online && <span className="svl-rec">● REC</span>}
      </div>

      <div className="svl-bot-bar">
        <span className="svl-feed-zone">{cam.zone}</span>
        {cam.online ? <SigBars strength={cam.sig} /> : <span className="svl-offline-tag">OFFLINE</span>}
        <span className="svl-feed-ts">
          {cam.online ? `${cam.res} · ${cam.fps}FPS` : '—'}&nbsp;&nbsp;{time}
        </span>
      </div>

      {motion && !isHacked && (
        <div className="svl-motion-alert" aria-live="assertive">⚠ MOTION DETECTED</div>
      )}

      {isHacked && <HackOverlay />}
    </div>
  );
}

export default function RoomPage({ onBack }) {
  const [time, setTime] = useState('--:--:--');
  const [date, setDate] = useState('----/--/--');
  const [uptime, setUptime] = useState('00:00:00');
  const [bw, setBw] = useState(12.4);
  const [motionId, setMotion] = useState(null);
  const [events, setEvents] = useState(INIT_EVENTS);
  const [selectedCam, setSelectedCam] = useState(null);
  const [hackActive, setHackActive] = useState(false);

  const startRef = useRef(Date.now() - 15_723_000);
  const mTimerRef = useRef(null);

  const activeCams = CAMERAS.filter(c => c.online).length;

  // Clock + uptime
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
      const ms = Date.now() - startRef.current;
      const h = String(Math.floor(ms / 3_600_000)).padStart(2, '0');
      const m = String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, '0');
      const s = String(Math.floor((ms % 60_000) / 1_000)).padStart(2, '0');
      setUptime(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Bandwidth fluctuation
  useEffect(() => {
    const id = setInterval(() => {
      setBw(p => parseFloat(Math.max(8, Math.min(20, p + (Math.random() - 0.5) * 1.4)).toFixed(1)));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  // Random motion alerts
  useEffect(() => {
    const online = CAMERAS.filter(c => c.online);
    const schedule = () => {
      mTimerRef.current = setTimeout(() => {
        const cam = online[Math.floor(Math.random() * online.length)];
        setMotion(cam.id);
        const t = new Date().toLocaleTimeString('en-US', { hour12: false });
        setEvents(prev => [
          { id: Date.now(), time: t, msg: `Motion detected — ${cam.zone} · CAM-${cam.id}`, type: 'warn' },
          ...prev.slice(0, 8),
        ]);
        setTimeout(() => setMotion(null), 3500);
        schedule();
      }, 7000 + Math.random() * 5000);
    };
    schedule();
    return () => clearTimeout(mTimerRef.current);
  }, []);

  // CAM-03 hack — triggers every 5s, lasts 2.5s
  useEffect(() => {
    let hackT, unhackT;
    const schedule = () => {
      hackT = setTimeout(() => {
        setHackActive(true);
        const t = new Date().toLocaleTimeString('en-US', { hour12: false });
        setEvents(prev => [
          { id: Date.now(), time: t, msg: '⚠ CAM-03 COMPROMISED — UNAUTHORIZED ACCESS', type: 'alert' },
          ...prev.slice(0, 8),
        ]);
        unhackT = setTimeout(() => {
          setHackActive(false);
          schedule();
        }, 2500);
      }, 5000);
    };
    schedule();
    return () => { clearTimeout(hackT); clearTimeout(unhackT); };
  }, []);

  // Escape → deselect camera
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSelectedCam(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleCamClick = (cam) => {
    setSelectedCam(prev => prev?.id === cam.id ? null : cam);
  };

  // Keep selectedCam data in sync (e.g. if motion/hack state updates)
  const activeSel = selectedCam
    ? CAMERAS.find(c => c.id === selectedCam.id) ?? null
    : null;

  return (
    <div className="svl-root">
      <div className="svl-page-scan" aria-hidden="true" />

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="svl-header">
        <button className="svl-back" onClick={onBack}>← EXIT</button>

        <div className="svl-hdr-brand">
          <span className="svl-hdr-title">◈ SURVEILLANCE SYSTEM</span>
          <span className="svl-hdr-sub">SECTOR 7 · MONITORING ARRAY · v3.2.1</span>
        </div>

        <div className="svl-hdr-pills">
          <span className="svl-pill svl-pill--green">● SYS ONLINE</span>
          <span className="svl-pill">{activeCams}/6 FEEDS ACTIVE</span>
          {activeSel && (
            <span className="svl-pill svl-pill--green">
              ◉ CAM-{activeSel.id} · {activeSel.loc}
            </span>
          )}
        </div>

        <div className="svl-hdr-time">
          <span className="svl-clock">{time}</span>
          <span className="svl-hdr-date">{date}</span>
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────────────── */}
      <div className="svl-main">

        {activeSel ? (
          /* ── EXPANDED VIEW: left thumb rail + 16:9 big feed ── */
          <div className="svl-expanded-wrap">

            {/* Left thumbnail rail */}
            <div className="svl-thumb-rail">
              <div className="svl-thumb-rail-lbl">ALL FEEDS</div>
              {CAMERAS.map(cam => (
                <div
                  key={cam.id}
                  className={`svl-thumb${cam.id === activeSel.id ? ' svl-thumb--active' : ''}`}
                  onClick={() => handleCamClick(cam)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleCamClick(cam)}
                  aria-label={`Switch to CAM-${cam.id}`}
                >
                  <Feed
                    cam={cam}
                    time={time}
                    date={date}
                    motion={motionId === cam.id}
                    isHacked={hackActive && cam.id === '03'}
                  />
                  {cam.id === activeSel.id && (
                    <div className="svl-thumb-active-bar" aria-hidden="true" />
                  )}
                </div>
              ))}
              <button className="svl-thumb-close" onClick={() => setSelectedCam(null)}>
                ✕ CLOSE
              </button>
            </div>

            {/* Main 16:9 big feed */}
            <div className="svl-big-feed-area">
              <div className="svl-big-feed-ratio">
                <Feed
                  cam={activeSel}
                  time={time}
                  date={date}
                  motion={motionId === activeSel.id}
                  isHacked={hackActive && activeSel.id === '03'}
                />
              </div>
            </div>

          </div>
        ) : (
          /* ── NORMAL 6-GRID + SIDE PANEL ── */
          <>
            <section className="svl-feeds-wrap" aria-label="Live camera feeds">
              <div className="svl-feeds-label">
                <span>LIVE FEEDS</span>
                <span className="svl-feeds-count">{activeCams} ACTIVE&nbsp;&nbsp;·&nbsp;&nbsp;{6 - activeCams} OFFLINE</span>
              </div>
              <div className="svl-grid">
                {CAMERAS.map(cam => (
                  <Feed
                    key={cam.id}
                    cam={cam}
                    time={time}
                    date={date}
                    motion={motionId === cam.id}
                    isHacked={hackActive && cam.id === '03'}
                    onClick={() => handleCamClick(cam)}
                  />
                ))}
              </div>
            </section>

            <aside className="svl-panel" aria-label="System status panel">

              <div className="svl-blk">
                <div className="svl-blk-hdr">SYS OVERVIEW</div>
                <div className="svl-stat"><span>ACTIVE FEEDS</span> <span className="svl-val">{activeCams} / 6</span></div>
                <div className="svl-stat"><span>RECORDING</span>    <span className="svl-val svl-val--green svl-pulse">● LIVE</span></div>
                <div className="svl-stat"><span>UPTIME</span>       <span className="svl-val">{uptime}</span></div>
                <div className="svl-stat"><span>BANDWIDTH</span>    <span className="svl-val">{bw} MB/s</span></div>
                <div className="svl-stat"><span>LATENCY</span>      <span className="svl-val svl-val--cyan">4 ms</span></div>
                <div className="svl-stat"><span>ENCRYPT</span>      <span className="svl-val">AES-256</span></div>
              </div>

              <div className="svl-blk">
                <div className="svl-blk-hdr">STORAGE</div>
                <div className="svl-stor-bar">
                  <div className="svl-stor-fill" style={{ width: '47%' }} />
                </div>
                <div className="svl-stor-info">
                  <span className="svl-val">47% USED</span>
                  <span>1.2 TB FREE</span>
                </div>
              </div>

              <div className="svl-blk">
                <div className="svl-blk-hdr">CAMERAS</div>
                {CAMERAS.map(cam => (
                  <div key={cam.id} className={`svl-cam-item${cam.online ? '' : ' svl-cam-item--off'}`}>
                    <span style={{ color: cam.online ? '#00e676' : '#ff4444', fontSize: '0.48rem' }}>
                      {cam.online ? '●' : '✕'}
                    </span>
                    <span className="svl-cam-id-s">CAM-{cam.id}</span>
                    <span className="svl-cam-name-s">{cam.loc}</span>
                    <span className="svl-cam-res">{cam.online ? cam.res : 'OFFLINE'}</span>
                  </div>
                ))}
              </div>

              <div className="svl-blk svl-blk--grow">
                <div className="svl-blk-hdr">EVENT LOG</div>
                <div className="svl-evlog">
                  {events.map(ev => (
                    <div key={ev.id} className={`svl-ev svl-ev--${ev.type}`}>
                      <span className="svl-ev-t">{ev.time}</span>
                      <span className="svl-ev-m">{ev.msg}</span>
                    </div>
                  ))}
                </div>
              </div>

            </aside>
          </>
        )}
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="svl-footer">
        <span>NET: 192.168.1.1</span>
        <span className="svl-sep">·</span>
        <span className="svl-ft-g">MOTION: ARMED</span>
        <span className="svl-sep">·</span>
        <span>ENCRYPT: AES-256</span>
        <span className="svl-sep">·</span>
        <span className="svl-ft-r">⚠ 1 FEED OFFLINE</span>
        <span className="svl-sep">·</span>
        <span>PING: 4ms</span>
        <span className="svl-sep">·</span>
        <span className="svl-ft-g">STORAGE: 47%</span>
        <span className="svl-sep">·</span>
        <span className="svl-ft-g svl-pulse">▮ REC</span>
        {hackActive && <>
          <span className="svl-sep">·</span>
          <span className="svl-ft-r svl-pulse">⚠ CAM-03 COMPROMISED</span>
        </>}
      </footer>
    </div>
  );
}
