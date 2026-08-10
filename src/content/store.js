import { createContext, useContext } from 'react';
import { DEFAULT_CONTENT } from './defaults';

/* Content store internals: the context object, the path helpers and the
   read hooks. Kept out of ContentContext.jsx because that file exports a
   component, and a component module may not also export plain functions
   without breaking fast refresh. */

export const CONTENT_DOC = { collection: 'site', id: 'content' };

// ── path helpers ──
export function getPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

export function setPath(obj, path, value) {
  const keys = path.split('.');
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  let cursor = clone;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    const next = cursor[key];
    cursor[key] = Array.isArray(next) ? [...next] : { ...next };
    cursor = cursor[key];
  }
  cursor[keys[keys.length - 1]] = value;
  return clone;
}

/* Overrides merge onto defaults key by key. Arrays merge per index rather
   than replacing wholesale, so editing one card's caption in the admin
   does not blank out the other five. */
export function mergeContent(base, override) {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base)) {
    if (!Array.isArray(override)) return override;
    return base.map((item, i) => (i in override ? mergeContent(item, override[i]) : item));
  }
  if (typeof base === 'object' && base !== null && typeof override === 'object' && !Array.isArray(override)) {
    const out = { ...base };
    for (const key of Object.keys(override)) out[key] = mergeContent(base[key], override[key]);
    return out;
  }
  return override;
}

export const ContentCtx = createContext({ content: DEFAULT_CONTENT, ready: false });

/* Read one value. The fallback is what the component would have hardcoded,
   so a path that does not exist yet still renders something sensible. */
export function useContent(path, fallback) {
  const { content } = useContext(ContentCtx);
  const value = getPath(content, path);
  return value === undefined || value === null ? fallback : value;
}

export function useContentReady() {
  return useContext(ContentCtx).ready;
}

/* Overlays CMS image URLs onto a local list by index. The local objects
   keep their icons, handlers and everything else; only `key` is swapped,
   and only when a stored URL actually exists at that index. */
export function withImages(items, urls, key = 'src') {
  if (!Array.isArray(urls)) return items;
  return items.map((item, i) => (urls[i] ? { ...item, [key]: urls[i] } : item));
}

/* ── Image discovery ───────────────────────────────────────────────────
   Walks the content tree and returns a path for every value that is an
   image. This is what lets the dashboard manage all ~130 URLs without a
   hand-written SCHEMA entry per image: add a URL anywhere in the content
   and it appears in the editor by itself.

   A leaf counts as an image if it is a string under an image-ish key
   (src, img, image, icon, logo, thumb, art, front, back, poster, cover,
   avatar, banner, plates…) or it sits inside an `images` bucket. Values
   that merely look like URLs are not enough — a link href is not a
   picture. */
const IMAGE_KEYS = new Set([
  'src', 'img', 'image', 'icon', 'logo', 'thumb', 'thumbnail', 'art',
  'front', 'back', 'poster', 'cover', 'avatar', 'banner', 'photo', 'plate',
]);

const looksLikeImage = (v) =>
  typeof v === 'string' &&
  /^(https?:\/\/|\/|data:image)/.test(v) &&
  !/^#/.test(v);

export function findImagePaths(node, path = '', inImages = false, out = []) {
  if (node === null || node === undefined) return out;

  if (Array.isArray(node)) {
    node.forEach((item, i) => {
      const next = path ? `${path}.${i}` : String(i);
      if (inImages && looksLikeImage(item)) out.push(next);
      else findImagePaths(item, next, inImages, out);
    });
    return out;
  }

  if (typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('_')) continue;
      const next = path ? `${path}.${key}` : key;
      const bucket = inImages || key === 'images';
      if (looksLikeImage(value) && (bucket || IMAGE_KEYS.has(key))) out.push(next);
      else findImagePaths(value, next, bucket, out);
    }
  }
  return out;
}

/* Turns `images.aiHero.3` into "AI Images — hero strip · 4", and
   `hero.sections.0.image` into "hero › sections 1 › image". */
export function describeImagePath(path, groupLabels = {}) {
  const parts = path.split('.');
  if (parts[0] === 'images') {
    const label = groupLabels[parts[1]] || parts[1];
    return `${label} · ${Number(parts[2]) + 1}`;
  }
  return parts
    .map((p) => (/^\d+$/.test(p) ? `${Number(p) + 1}` : p))
    .join(' › ');
}
