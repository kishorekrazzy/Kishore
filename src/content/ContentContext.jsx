import { useEffect, useState } from 'react';
import { DEFAULT_CONTENT } from './defaults';
import { CONTENT_DOC, ContentCtx, mergeContent } from './store';

/* ══════════════════════════════════════════════════════════════════════
   CONTENT PROVIDER

   Holds the merged content tree and keeps it live. Firestore is loaded
   lazily — the whole SDK is ~250 kB, and the site must render immediately
   from defaults rather than waiting on a network round trip. The stored
   overrides arrive a moment later and swap in.
   ══════════════════════════════════════════════════════════════════════ */
export function ContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [ready, setReady]     = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;

    (async () => {
      try {
        const [{ doc, onSnapshot }, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('../firebase'),
        ]);
        if (cancelled) return;
        unsubscribe = onSnapshot(
          doc(db, CONTENT_DOC.collection, CONTENT_DOC.id),
          (snap) => {
            if (cancelled) return;
            setContent(snap.exists() ? mergeContent(DEFAULT_CONTENT, snap.data()) : DEFAULT_CONTENT);
            setReady(true);
          },
          // Offline, blocked, or rules deny reads — the site keeps the
          // defaults it is already showing. Never a blank page.
          (err) => {
            console.warn('[content] falling back to defaults:', err.code || err.message);
            if (!cancelled) setReady(true);
          },
        );
      } catch (err) {
        console.warn('[content] Firestore unavailable:', err);
        if (!cancelled) setReady(true);
      }
    })();

    return () => { cancelled = true; unsubscribe?.(); };
  }, []);

  return <ContentCtx.Provider value={{ content, ready }}>{children}</ContentCtx.Provider>;
}
