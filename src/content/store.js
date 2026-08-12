import { createContext, useContext } from 'react';
import { DEFAULT_CONTENT, IMAGE_GROUP_LABELS } from './defaults.js';

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

/* Turns `images.team.3` into "Syndicate — members · 4", and
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

/* Ordered so the tabs read down the page rather than in whatever order the
   registry happens to be declared in. Anything not listed keeps its
   discovered position at the end, so a new registry key still shows up
   without touching this. */
const MEDIA_ORDER = [
  'hero.sections', 'nav.logo', 'aboutMe', 'about.cards', 'about.extraCards',
  'team', 'bentoCards', 'banners', 'deck',
  'widgetPlates', 'finderWorks', 'netflixHero', 'netflixGrid',
  'music', 'musicPlate', 'dock', 'videoThumbs', 'skillPacks',
  'aiGallery', 'certs', 'lanyard', 'warning',
];

/* Images that live in the content tree rather than the registry — hero
   plates, the About cards, the AI gallery. Without this they all landed in
   one "Elsewhere" bucket, which is exactly the pile this split was meant
   to break up. Longest prefix wins. */
const PATH_GROUPS = [
  ['hero.sections',    'Hero — backgrounds'],
  ['nav.logo',         'Island logo'],
  ['about.extraCards', 'About — reveal grid'],
  ['about.cards',      'About — card stack'],
  ['aiGallery',        'AI Images gallery'],
];

export function buildMediaGroups(content) {
  const groups = new Map();
  for (const path of findImagePaths(content)) {
    const parts = path.split('.');
    const inRegistry = parts[0] === 'images';
    const hit = inRegistry ? null : PATH_GROUPS.find(([prefix]) => path.startsWith(prefix));
    const key   = inRegistry ? parts[1] : (hit ? hit[0] : '__elsewhere');
    const title = inRegistry
      ? (IMAGE_GROUP_LABELS[key] || key)
      : (hit ? hit[1] : 'Elsewhere on the site');
    if (!groups.has(key)) groups.set(key, { id: `img:${key}`, key, title, fields: [] });
    groups.get(key).fields.push({
      path,
      label: describeImagePath(path, IMAGE_GROUP_LABELS),
      type: 'image',
    });
  }
  const rank = (g) => {
    const i = MEDIA_ORDER.indexOf(g.key);
    return i === -1 ? MEDIA_ORDER.length + (g.key === '__elsewhere' ? 1 : 0) : i;
  };
  return [...groups.values()].sort((a, b) => rank(a) - rank(b));
}
