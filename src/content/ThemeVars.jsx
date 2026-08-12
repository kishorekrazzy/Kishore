import { useEffect } from 'react';
import { useContent } from './store';

/* ══════════════════════════════════════════════════════════════════════
   THEME VARS

   Writes the CMS theme values onto :root as CSS custom properties, which
   is all it takes to recolour the site — theme.css already composes every
   accent, glow and tint from these numbers in OKLCH.

   Written as inline custom properties on the root element, so they beat
   the stylesheet without !important and revert cleanly when a value is
   cleared.
   ══════════════════════════════════════════════════════════════════════ */
export default function ThemeVars() {
  const t = useContent('theme', null);

  useEffect(() => {
    if (!t) return undefined;
    const root = document.documentElement;
    const set = [];

    const put = (name, value) => {
      if (value === undefined || value === null || value === '') return;
      root.style.setProperty(name, String(value));
      set.push(name);
    };

    Object.entries(t.hues || {}).forEach(([k, v]) => put(`--h-${k}`, v));

    put('--l-acc',  t.accentLightDark  != null ? `${t.accentLightDark}%`  : null);
    put('--c-acc',  t.accentChromaDark);
    put('--l-bg',   t.bgLightnessDark  != null ? `${t.bgLightnessDark}%`  : null);
    put('--grain-opacity', t.grain);
    put('--seam',   t.seam);

    /* Light-theme scalars live in a different block, so they need their own
       rule rather than a root variable — otherwise the dark values would
       leak into light mode. */
    const id = 'cms-theme-light';
    let tag = document.getElementById(id);
    if (!tag) { tag = document.createElement('style'); tag.id = id; document.head.appendChild(tag); }
    tag.textContent = `
      :root[data-theme='light'] {
        ${t.accentLightLight  != null ? `--l-acc: ${t.accentLightLight}%;` : ''}
        ${t.accentChromaLight != null ? `--c-acc: ${t.accentChromaLight};` : ''}
        ${t.bgLightnessLight  != null ? `--l-bg: ${t.bgLightnessLight}%;`  : ''}
      }`;

    return () => { set.forEach((n) => root.style.removeProperty(n)); };
  }, [t]);

  return null;
}
