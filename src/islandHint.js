/* ══════════════════════════════════════════════════════════════════════
   ISLAND HINT

   Lets anything on the page put a transient label in the Dynamic Island —
   currently the DJ console, which announces itself there on hover instead
   of printing a pill on its own card.

   An external store rather than a context: the island sits at the top of
   App and the music card is several levels down inside the widgets
   section, so a provider would have to wrap the whole tree and re-render
   it on every hover. This re-renders the island and nothing else.
   ══════════════════════════════════════════════════════════════════════ */

let hint = null;
const subscribers = new Set();

export function setIslandHint(text) {
  const next = text || null;
  if (next === hint) return;
  hint = next;
  subscribers.forEach((fn) => fn());
}

/* Only clears if the caller is still the one showing — otherwise a slow
   mouseleave can wipe a hint another element has just set. */
export function clearIslandHint(text) {
  if (hint === text) setIslandHint(null);
}

export function subscribeIslandHint(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export const getIslandHint = () => hint;
