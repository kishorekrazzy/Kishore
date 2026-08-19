import { useState } from 'react';
import { useReveal, phoneSrc } from './mobileUtils';

/* ══════════════════════════════════════════════════════════════════════
   MOBILE UI PRIMITIVES

   The three things every screen is built out of: the entrance wrapper,
   the picture, and the icon set. Separated from mobileUtils.js because
   a module that exports both components and plain functions cannot be
   hot-reloaded — Fast Refresh needs a file to be one or the other.
   ══════════════════════════════════════════════════════════════════════ */

export function Reveal({ children, delay = 0, as, className = '', style, ...rest }) {
  const [ref, shown] = useReveal();
  const Tag = as || 'div';
  return (
    <Tag
      ref={ref}
      className={`mb-rv${shown ? ' mb-rv--in' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--rv-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* A picture that fades up once it has actually decoded, over a tinted
   block of its own. Without the placeholder a slow connection shows a
   column of empty rectangles; without the fade, images pop in hard. */
export function Img({ src, alt = '', w = 720, exact = false, className = '', eager = false, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className={`mb-img${loaded ? ' mb-img--on' : ''}${className ? ` ${className}` : ''}`}>
      <img
        src={phoneSrc(src, w, exact)}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        draggable="false"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        {...rest}
      />
    </span>
  );
}

/* ── Icons ────────────────────────────────────────────────────────────
   Drawn on a 24 grid at 1.6 stroke, which is the weight that survives a
   2x phone screen without going spidery. */
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function Icon({ name, size = 22, ...rest }) {
  const p = { viewBox: '0 0 24 24', width: size, height: size, 'aria-hidden': 'true', ...rest };
  switch (name) {
    case 'home':    return <svg {...p}><path {...S} d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /></svg>;
    case 'grid':    return <svg {...p}><rect {...S} x="3" y="3" width="7.5" height="7.5" rx="2" /><rect {...S} x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect {...S} x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect {...S} x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></svg>;
    case 'note':    return <svg {...p}><path {...S} d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path {...S} d="M14 3v5h5M8.5 13h7M8.5 17h4.5" /></svg>;
    case 'studio':  return <svg {...p}><circle {...S} cx="12" cy="12" r="8.5" /><circle {...S} cx="12" cy="12" r="2.6" /><path {...S} d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" /></svg>;
    case 'mail':    return <svg {...p}><rect {...S} x="3" y="5" width="18" height="14" rx="2.5" /><path {...S} d="m3.8 7 7.3 5.3a1.5 1.5 0 0 0 1.8 0L20.2 7" /></svg>;
    case 'play':    return <svg {...p}><path fill="currentColor" d="M8 5.5 18 12 8 18.5z" /></svg>;
    case 'spark':   return <svg {...p}><path fill="currentColor" d="M12 2.6 13.9 8.4 19.7 10.3 13.9 12.2 12 18 10.1 12.2 4.3 10.3 10.1 8.4z" /><path fill="currentColor" d="m18.6 16.2.85 2.35 2.35.85-2.35.85-.85 2.35-.85-2.35-2.35-.85 2.35-.85z" opacity=".7" /></svg>;
    case 'arrow':   return <svg {...p}><path {...S} d="M5 12h13M13 6.5 18.5 12 13 17.5" /></svg>;
    case 'up':      return <svg {...p}><path {...S} d="M12 19V6M6.5 11.5 12 6l5.5 5.5" /></svg>;
    case 'close':   return <svg {...p}><path {...S} d="M6 6l12 12M18 6 6 18" /></svg>;
    case 'back':    return <svg {...p}><path {...S} d="M19 12H6M11 5.5 5 12l6 6.5" /></svg>;
    case 'menu':    return <svg {...p}><path {...S} d="M4 7h16M4 12h16M4 17h10" /></svg>;
    case 'copy':    return <svg {...p}><rect {...S} x="9" y="9" width="11" height="11" rx="2.5" /><path {...S} d="M5.5 15H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v.5" /></svg>;
    case 'check':   return <svg {...p}><path {...S} d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
    case 'clock':   return <svg {...p}><circle {...S} cx="12" cy="12" r="8.5" /><path {...S} d="M12 7v5.2l3.2 2" /></svg>;
    case 'pin':     return <svg {...p}><path {...S} d="M12 21s6.5-6.1 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 14.9 12 21 12 21z" /><circle {...S} cx="12" cy="10.5" r="2.4" /></svg>;
    case 'camera':  return <svg {...p}><rect {...S} x="3" y="7" width="18" height="13" rx="2.5" /><path {...S} d="M8.5 7 10 4.5h4L15.5 7" /><circle {...S} cx="12" cy="13.5" r="3.4" /></svg>;
    case 'code':    return <svg {...p}><path {...S} d="m8.5 8.5-4 4 4 4M15.5 8.5l4 4-4 4M13.5 5.5l-3 13" /></svg>;
    case 'wand':    return <svg {...p}><path {...S} d="m4 20 11-11M14.5 4.2l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9zM19.4 13.1l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z" /></svg>;
    case 'colour':  return <svg {...p}><circle {...S} cx="12" cy="12" r="8.5" /><path fill="currentColor" d="M12 3.5a8.5 8.5 0 0 1 0 17z" opacity=".85" /></svg>;
    case 'game':    return <svg {...p}><rect {...S} x="2.5" y="7" width="19" height="10.5" rx="5.25" /><path {...S} d="M7.5 10.6v3.4M5.8 12.3h3.4" /><circle fill="currentColor" cx="16" cy="11.4" r="1.15" /><circle fill="currentColor" cx="18.2" cy="13.6" r="1.15" /></svg>;
    case 'award':   return <svg {...p}><circle {...S} cx="12" cy="9" r="5.5" /><path {...S} d="m8.5 13.8-1 7 4.5-2.4 4.5 2.4-1-7" /></svg>;
    case 'layers':  return <svg {...p}><path {...S} d="m12 3 8.5 4.6L12 12.2 3.5 7.6z" /><path {...S} d="m4.6 12 7.4 4 7.4-4M4.6 16.3l7.4 4 7.4-4" /></svg>;
    case 'music':   return <svg {...p}><path {...S} d="M9 18V6.2l10-2v11.4" /><circle {...S} cx="6.6" cy="18" r="2.4" /><circle {...S} cx="16.6" cy="15.6" r="2.4" /></svg>;
    case 'bolt':    return <svg {...p}><path fill="currentColor" d="M13.4 2 5 13.4h5.3L9.9 22l8.6-11.6h-5.4z" /></svg>;
    case 'moon':    return <svg {...p}><path {...S} d="M20 14.2A8.4 8.4 0 0 1 9.8 4 8.5 8.5 0 1 0 20 14.2z" /></svg>;
    case 'globe':   return <svg {...p}><circle {...S} cx="12" cy="12" r="8.5" /><path {...S} d="M3.6 12h16.8M12 3.5c2.3 2.4 3.4 5.3 3.4 8.5S14.3 18.1 12 20.5c-2.3-2.4-3.4-5.3-3.4-8.5S9.7 5.9 12 3.5z" /></svg>;
    case 'user':    return <svg {...p}><circle {...S} cx="12" cy="8.5" r="4" /><path {...S} d="M4.5 20.2a7.7 7.7 0 0 1 15 0" /></svg>;
    case 'chev':    return <svg {...p}><path {...S} d="m9 5.5 6.5 6.5L9 18.5" /></svg>;
    case 'sound':   return <svg {...p}><path {...S} d="M11 5 6.5 8.5H3.5v7h3L11 19z" /><path {...S} d="M15 9.2a4 4 0 0 1 0 5.6M17.8 6.4a8 8 0 0 1 0 11.2" /></svg>;
    case 'muted':   return <svg {...p}><path {...S} d="M11 5 6.5 8.5H3.5v7h3L11 19z" /><path {...S} d="m15.5 9.5 5 5M20.5 9.5l-5 5" /></svg>;
    case 'desktop': return <svg {...p}><rect {...S} x="3" y="4.5" width="18" height="12" rx="2" /><path {...S} d="M9 20h6M12 16.5V20" /></svg>;
    default: return null;
  }
}
