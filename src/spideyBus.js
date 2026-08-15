/* ══════════════════════════════════════════════════════════════════════
   SPIDEY — the shared dangler bus

   Four different things ask for the same figure now: hovering an About
   card, hovering the bot, scrolling into Inside The Mind, and `spidey`
   in the terminal. They live in unrelated corners of the tree, so
   instead of threading callbacks the whole way down they publish here
   and <Spidey /> renders whatever wins.

   Three layers, not one slot — because they genuinely outlive each
   other. A scroll reveal lasts as long as you are in the section, and a
   hover happens *during* it; collapsing both into one variable meant
   releasing the hover deleted the reveal underneath it, and he would
   not come back until you scrolled out and in again.

     pinned  the terminal. Deliberate, so nothing may evict it.
     over    a hover. Momentary, and falls back to base on release.
     base    a scroll reveal. Ambient, held while the section is in view.
   ══════════════════════════════════════════════════════════════════════ */

let pinned = null;
let over = null;
let base = null;

const subs = new Set();
const current = () => pinned || over || base;
const emit = () => { const c = current(); for (const fn of subs) fn(c); };

export function subscribeSpidey(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export const readSpidey = () => current();

/** A hover begins. */
export function showSpidey(req) { over = req; emit(); }

/** A hover ends — revealing whatever was underneath it, if anything. */
export function hideSpidey() { over = null; emit(); }

/** A section scrolls in (req) or out (null). */
export function setSpideyBase(req) { base = req; emit(); }

/** Terminal. Returns true if he is now hanging, false if sent home. */
export function toggleSpidey(req) {
  pinned = pinned ? null : { ...req, pinned: true };
  emit();
  return !!pinned;
}
