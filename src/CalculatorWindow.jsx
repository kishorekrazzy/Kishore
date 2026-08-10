import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './CalculatorWindow.css';

// ── Button layout — null = empty slot (0 spans it) ───────────────────────────
const ROWS = [
  ['AC', '+/-', '%',  '÷'],
  ['7',  '8',   '9',  '×'],
  ['4',  '5',   '6',  '-'],
  ['1',  '2',   '3',  '+'],
  ['0',  null,  '.',  '='],
];

function compute(a, b, op) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '×') return a * b;
  if (op === '÷') return b !== 0 ? a / b : 0;
  return b;
}

function tidy(n) {
  if (!isFinite(n)) return 'Error';
  const v = parseFloat(parseFloat(n).toPrecision(12));
  const s = String(v);
  return s.length > 10 ? v.toExponential(3) : s;
}

function CalculatorWindow({ visible, onClose }) {
  const [disp,  setDisp]  = useState('0');
  const [op,    setOp]    = useState(null);
  const [saved, setSaved] = useState(null);
  const [fresh, setFresh] = useState(false);

  const isAC = disp === '0' && op === null;

  const press = (k) => {
    if (k === 'AC') {
      if (disp !== '0') { setDisp('0'); setFresh(false); }
      else { setOp(null); setSaved(null); }
      return;
    }
    if (k === '+/-') {
      setDisp(d => d === '0' ? d : d.startsWith('-') ? d.slice(1) : '-' + d);
      return;
    }
    if (k === '%') { setDisp(d => tidy(parseFloat(d) / 100)); return; }

    if (['+', '-', '×', '÷'].includes(k)) {
      const val = parseFloat(disp);
      if (op && !fresh) {
        const res = compute(saved, val, op);
        setDisp(tidy(res)); setSaved(res);
      } else { setSaved(val); }
      setOp(k); setFresh(true);
      return;
    }

    if (k === '=') {
      if (!op) return;
      const res = compute(saved, parseFloat(disp), op);
      setDisp(tidy(res));
      setSaved(null); setOp(null); setFresh(true);
      return;
    }

    if (k === '.') {
      if (fresh) { setDisp('0.'); setFresh(false); return; }
      if (!disp.includes('.')) setDisp(d => d + '.');
      return;
    }

    // Digit
    if (fresh || disp === '0') { setDisp(k); setFresh(false); }
    else if (disp.replace(/\D/g, '').length < 9) { setDisp(d => d + k); }
  };

  // Drag
  const [pos, setPos]   = useState({ x: 200, y: 0 });
  const [grab, setGrab] = useState(false);
  const dr = useRef({ on: false, sx: 0, sy: 0, px: 0, py: 0 });

  const onGrab = (e) => {
    if (e.target.closest('button')) return;
    dr.current = { on: true, sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
    setGrab(true); e.preventDefault();
  };

  useEffect(() => {
    const mv = (e) => {
      if (!dr.current.on) return;
      const { sx, sy, px, py } = dr.current;
      setPos({ x: px + e.clientX - sx, y: py + e.clientY - sy });
    };
    const up = () => { if (dr.current.on) { dr.current.on = false; setGrab(false); } };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
  }, []);

  const fsize = disp.length > 9 ? '1.8rem' : disp.length > 6 ? '2.4rem' : '3.2rem';

  const btnCls = (k) => {
    const t = ['AC', '+/-', '%'].includes(k) ? 'func'
      : ['+', '-', '×', '÷', '='].includes(k) ? 'op' : 'num';
    return `cw-btn cw-btn--${t}${k === '0' ? ' cw-btn--zero' : ''}${op === k ? ' cw-btn--lit' : ''}`;
  };

  return createPortal(
    <div
      className={`cw-window${!visible ? ' cw-window--hidden' : ''}`}
      style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
    >
      {/* Title bar */}
      <div className="cw-titlebar" onMouseDown={onGrab} style={{ cursor: grab ? 'grabbing' : 'grab' }}>
        <div className="wg-fn-lights">
          <button className="wg-fn-light wg-fn-red"    onClick={onClose} aria-label="Close" />
          <button className="wg-fn-light wg-fn-yellow" aria-label="Minimise" />
          <button className="wg-fn-light wg-fn-green"  aria-label="Full screen" />
        </div>
        <span className="cw-title">Calculator</span>
        <div style={{ width: 60 }} />
      </div>

      {/* Display */}
      <div className="cw-display" aria-live="polite" aria-label={`Display: ${disp}`}>
        <span className="cw-num" style={{ fontSize: fsize }}>{disp}</span>
      </div>

      {/* Button grid */}
      <div className="cw-grid">
        {ROWS.map((row, ri) =>
          row.map((k, ci) =>
            k !== null ? (
              <button
                key={`${ri}-${ci}`}
                className={btnCls(k)}
                onClick={() => press(k)}
                aria-label={k === 'AC' ? (isAC ? 'All Clear' : 'Clear') : k}
              >
                {k === 'AC' ? (isAC ? 'AC' : 'C') : k}
              </button>
            ) : null
          )
        )}
      </div>
    </div>,
    document.body
  );
}

// ── Self-contained manager ────────────────────────────────────────────────────

export function CalculatorWindowManager() {
  const [open,    setOpen]    = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.app !== 'calculator') return;
      setOpen(true); setVisible(true);
      window.dispatchEvent(new CustomEvent('macdock:running', { detail: { app: 'calculator', running: true } }));
    };
    window.addEventListener('macdock:open', handler);
    return () => window.removeEventListener('macdock:open', handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.dispatchEvent(new CustomEvent('macdock:running', { detail: { app: 'calculator', running: false } }));
  };

  if (!open) return null;
  return <CalculatorWindow visible={visible} onClose={handleClose} />;
}
