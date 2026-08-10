import { useState, useEffect, useMemo, useCallback } from 'react';
import './AdminDashboard.css';
import { DEFAULT_CONTENT, SCHEMA, IMAGE_GROUP_LABELS } from '../content/defaults';
import { CONTENT_DOC, getPath, setPath, mergeContent, findImagePaths, describeImagePath } from '../content/store';

/* ══════════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD

   Edits one Firestore document, site/content, which the live site merges
   over its defaults. The editor is driven entirely by SCHEMA in
   content/defaults.js — adding a field there adds it here.

   Everything Firebase is imported dynamically. This page is code-split,
   and the auth SDK in particular should never reach a visitor who is only
   looking at the portfolio.
   ══════════════════════════════════════════════════════════════════════ */

/* The account this dashboard is for, prefilled so signing in is one click.
   These are a convenience only — the real credential lives in Firebase
   Auth, and changing them here does not change what Firebase accepts.

   NOTE: Firebase enforces a six-character minimum on passwords, so 'ck24'
   cannot itself be the account password. Set the console password to a
   padded form (ck2424, ck24!!, …) and put that same value here. */
const ADMIN_EMAIL = 'krazykishore2004@gmail.com';
const ADMIN_PASSCODE = 'ck2424';

/* Firebase's own messages describe the API, not what you have to go and do.
   Nearly every failure here is a console setting rather than a typo, so
   each one says which setting. */
const AUTH_ERRORS = {
  // No Identity Toolkit config exists — Authentication has never been
  // switched on for this project. This is the one people hit first.
  'auth/configuration-not-found':
    'Authentication is not switched on for this Firebase project. Open the Firebase console → Authentication → Get started, enable Email/Password, then add your user. Step 1 of ADMIN_SETUP.md.',
  'auth/operation-not-allowed':
    'Email/password sign-in is disabled. Firebase console → Authentication → Sign-in method → enable Email/Password.',
  'auth/invalid-credential':
    'No account matches that email and password. Check the user exists under Authentication → Users — and note Firebase rejects passwords under six characters, so a four-character one was never accepted.',
  'auth/wrong-password':
    'Wrong password for that account.',
  'auth/user-not-found':
    'No user with that email. Add it under Firebase console → Authentication → Users.',
  'auth/invalid-email':
    'That is not a valid email address.',
  'auth/too-many-requests':
    'Too many attempts. Wait a minute and try again.',
  'auth/network-request-failed':
    'Could not reach Firebase. Check the connection, and whether an ad blocker is blocking it.',
  'auth/unauthorized-domain':
    'This domain is not in the authorised list. Firebase console → Authentication → Settings → Authorised domains.',
};

// ── Auth gate ────────────────────────────────────────────────────────
function LoginScreen({ onSignedIn }) {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [pass, setPass] = useState(ADMIN_PASSCODE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const [{ getAuth, signInWithEmailAndPassword }, { app }] = await Promise.all([
        import('firebase/auth'),
        import('../firebase'),
      ]);
      const cred = await signInWithEmailAndPassword(getAuth(app), email.trim(), pass);
      onSignedIn(cred.user);
    } catch (err) {
      setError(AUTH_ERRORS[err?.code] || err?.message || 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      <form className="adm-login-card" onSubmit={submit}>
        <h1>Site admin</h1>
        <p className="adm-login-sub">Sign in to edit the portfolio content.</p>

        <label htmlFor="adm-email">Email</label>
        <input id="adm-email" type="email" value={email} autoComplete="username"
          onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="adm-pass">Password</label>
        <input id="adm-pass" type="password" value={pass} autoComplete="current-password"
          onChange={(e) => setPass(e.target.value)} required />

        {error && <p className="adm-error" role="alert">{error}</p>}

        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

// ── One editable field ───────────────────────────────────────────────
function Field({ field, value, defaultValue, onChange }) {
  const dirty = value !== defaultValue;
  const id = `f-${field.path.replace(/\./g, '-')}`;

  return (
    <div className={`adm-field${dirty ? ' adm-field--dirty' : ''}`}>
      <div className="adm-field-head">
        <label htmlFor={id}>{field.label}</label>
        {dirty && (
          <button type="button" className="adm-revert" onClick={() => onChange(field.path, defaultValue)}>
            revert
          </button>
        )}
      </div>

      {field.type === 'multiline' ? (
        <textarea id={id} rows={3} value={value ?? ''} onChange={(e) => onChange(field.path, e.target.value)} />
      ) : (
        <input id={id} type="text" value={value ?? ''} onChange={(e) => onChange(field.path, e.target.value)} />
      )}

      {field.hint && <p className="adm-hint">{field.hint}</p>}

      {field.type === 'image' && (
        <div className="adm-preview">
          {value
            ? <img src={value} alt="" loading="lazy" onError={(e) => { e.currentTarget.dataset.broken = 'true'; }} />
            : <span className="adm-preview-empty">no image</span>}
        </div>
      )}

      <code className="adm-path">{field.path}</code>
    </div>
  );
}

/* Every image on the site, found by walking the content tree rather than
   listed by hand. Registry entries are grouped by where they appear; the
   handful that already have their own SCHEMA fields (hero plates, about
   cards, the logo) are gathered under one heading so this view really is
   all of them in one place. */
const MEDIA_ID = '__media';

function buildMediaGroups(content) {
  const groups = new Map();
  for (const path of findImagePaths(content)) {
    const parts = path.split('.');
    const key   = parts[0] === 'images' ? parts[1] : 'Elsewhere on the site';
    const title = parts[0] === 'images' ? (IMAGE_GROUP_LABELS[key] || key) : key;
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title).push({
      path,
      label: describeImagePath(path, IMAGE_GROUP_LABELS),
      type: 'image',
    });
  }
  return [...groups].map(([title, fields]) => ({ title, fields }));
}

// ── Dashboard ────────────────────────────────────────────────────────
function Editor({ user, onSignOut, onExit }) {
  // `draft` is the full merged tree being edited. `saved` is what is
  // currently in Firestore, so the dirty count compares against the real
  // stored state rather than against the defaults.
  const [draft, setDraft] = useState(DEFAULT_CONTENT);
  const [saved, setSaved] = useState(DEFAULT_CONTENT);
  const [group, setGroup] = useState(SCHEMA[0].id);
  const [state, setState] = useState('loading');  // loading | idle | saving | saved | error
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ doc, getDoc }, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('../firebase'),
        ]);
        const snap = await getDoc(doc(db, CONTENT_DOC.collection, CONTENT_DOC.id));
        if (cancelled) return;
        const merged = snap.exists() ? mergeContent(DEFAULT_CONTENT, snap.data()) : DEFAULT_CONTENT;
        setDraft(merged);
        setSaved(merged);
        setState('idle');
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || 'Could not load content.');
        setState('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const change = useCallback((path, value) => {
    setDraft((d) => setPath(d, path, value));
    setState((s) => (s === 'saved' ? 'idle' : s));
  }, []);

  const mediaGroups = useMemo(() => buildMediaGroups(draft), [draft]);

  const allFields = useMemo(() => [
    ...SCHEMA.flatMap((g) => g.fields.map((f) => ({ ...f, group: g.id }))),
    ...mediaGroups.flatMap((g) => g.fields.map((f) => ({ ...f, group: MEDIA_ID }))),
  ], [mediaGroups]);

  const dirtyPaths = useMemo(
    () => allFields.filter((f) => getPath(draft, f.path) !== getPath(saved, f.path)).map((f) => f.path),
    [allFields, draft, saved],
  );

  // Search cuts across every group; with no query you get the selected one.
  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const all = [...SCHEMA.map((g) => ({ ...g })), ...mediaGroups.map((g) => ({ ...g, id: MEDIA_ID }))];
    if (!q) {
      if (group === MEDIA_ID) return mediaGroups;
      const g = SCHEMA.find((x) => x.id === group);
      return g ? [{ title: g.title, fields: g.fields }] : [];
    }
    return all
      .map((g) => ({
        title: g.title,
        fields: g.fields.filter((f) =>
          f.label.toLowerCase().includes(q) ||
          f.path.toLowerCase().includes(q) ||
          String(getPath(draft, f.path) ?? '').toLowerCase().includes(q)),
      }))
      .filter((g) => g.fields.length > 0);
  }, [filter, group, draft, mediaGroups]);

  const save = async () => {
    if (state === 'saving' || dirtyPaths.length === 0) return;
    setState('saving');
    setError('');
    try {
      const [{ doc, setDoc, serverTimestamp }, { db }] = await Promise.all([
        import('firebase/firestore'),
        import('../firebase'),
      ]);
      // The whole tree is written, not a patch. It is a few kB, and it
      // keeps the stored document a complete, readable snapshot rather
      // than a sparse diff that only makes sense next to this build.
      await setDoc(
        doc(db, CONTENT_DOC.collection, CONTENT_DOC.id),
        { ...draft, _updatedAt: serverTimestamp(), _updatedBy: user.email || user.uid },
        { merge: true },
      );
      setSaved(draft);
      setState('saved');
    } catch (err) {
      setError(
        err?.code === 'permission-denied'
          ? 'Firestore rules rejected the write. Check the rules in ADMIN_SETUP.md.'
          : err?.message || 'Save failed.',
      );
      setState('error');
    }
  };

  const resetAll = () => {
    if (!window.confirm('Discard every unsaved change on this page?')) return;
    setDraft(saved);
  };

  // Warn before losing edits to a refresh or a closed tab.
  useEffect(() => {
    if (dirtyPaths.length === 0) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirtyPaths.length]);

  if (state === 'loading') return <div className="adm-loading">Loading content…</div>;

  return (
    <div className="adm">
      <header className="adm-bar">
        <div className="adm-bar-left">
          <strong>Site admin</strong>
          <span className="adm-user">{user.email}</span>
        </div>

        <div className="adm-bar-right">
          <span className={`adm-status adm-status--${state}`}>
            {state === 'saving' ? 'Saving…'
              : state === 'saved' ? 'Saved'
                : state === 'error' ? 'Error'
                  : dirtyPaths.length > 0 ? `${dirtyPaths.length} unsaved` : 'Up to date'}
          </span>
          <button className="adm-btn" onClick={resetAll} disabled={dirtyPaths.length === 0}>Discard</button>
          <button className="adm-btn adm-btn--primary" onClick={save} disabled={dirtyPaths.length === 0 || state === 'saving'}>
            Save changes
          </button>
          <button className="adm-btn" onClick={onExit}>View site</button>
          <button className="adm-btn" onClick={onSignOut}>Sign out</button>
        </div>
      </header>

      {error && <p className="adm-error adm-error--bar" role="alert">{error}</p>}

      <div className="adm-body">
        <nav className="adm-side" aria-label="Content sections">
          <input
            className="adm-search"
            type="search"
            placeholder="Search all fields…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <ul>
            <li>
              <button
                className={`adm-side-btn adm-side-btn--media${!filter && group === MEDIA_ID ? ' adm-side-btn--on' : ''}`}
                onClick={() => { setGroup(MEDIA_ID); setFilter(''); }}
              >
                All images
                <span className="adm-count">{mediaGroups.reduce((n, g) => n + g.fields.length, 0)}</span>
              </button>
            </li>
            {SCHEMA.map((g) => {
              const n = g.fields.filter((f) => dirtyPaths.includes(f.path)).length;
              return (
                <li key={g.id}>
                  <button
                    className={`adm-side-btn${!filter && group === g.id ? ' adm-side-btn--on' : ''}`}
                    onClick={() => { setGroup(g.id); setFilter(''); }}
                  >
                    {g.title}
                    {n > 0 && <span className="adm-badge">{n}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="adm-main">
          {visible.length === 0 && <p className="adm-empty">Nothing matches “{filter}”.</p>}
          {visible.map((g) => (
            <section key={g.title} className="adm-group">
              <h2>{g.title}</h2>
              <div className="adm-grid">
                {g.fields.map((f) => (
                  <Field
                    key={f.path}
                    field={f}
                    value={getPath(draft, f.path)}
                    defaultValue={getPath(DEFAULT_CONTENT, f.path)}
                    onChange={change}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────
export default function AdminDashboard({ onExit }) {
  const [user, setUser] = useState(null);
  const [checking, setCheck] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsub = null;
    (async () => {
      try {
        const [{ getAuth, onAuthStateChanged }, { app }] = await Promise.all([
          import('firebase/auth'),
          import('../firebase'),
        ]);
        if (cancelled) return;
        unsub = onAuthStateChanged(getAuth(app), (u) => {
          if (cancelled) return;
          setUser(u);
          setCheck(false);
        });
      } catch {
        if (!cancelled) setCheck(false);
      }
    })();
    return () => { cancelled = true; unsub?.(); };
  }, []);

  const signOut = useCallback(async () => {
    const [{ getAuth, signOut: fbSignOut }, { app }] = await Promise.all([
      import('firebase/auth'),
      import('../firebase'),
    ]);
    await fbSignOut(getAuth(app));
    setUser(null);
  }, []);

  if (checking) return <div className="adm-loading">Checking session…</div>;
  if (!user) return <LoginScreen onSignedIn={setUser} />;
  return <Editor user={user} onSignOut={signOut} onExit={onExit} />;
}
