import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import './AdminDashboard.css';
import { DEFAULT_CONTENT, SCHEMA } from '../content/defaults';
import { CONTENT_DOC, getPath, setPath, mergeContent, buildMediaGroups } from '../content/store';

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
    <div className="ad-login">
      <form className="ad-login-card" onSubmit={submit}>
        <h1>Site admin</h1>
        <p className="ad-login-sub">Sign in to edit the portfolio content.</p>

        <label htmlFor="adm-email">Email</label>
        <input id="adm-email" type="email" value={email} autoComplete="username"
          onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="adm-pass">Password</label>
        <input id="adm-pass" type="password" value={pass} autoComplete="current-password"
          onChange={(e) => setPass(e.target.value)} required />

        {error && <p className="ad-error" role="alert">{error}</p>}

        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

// ── One editable field ───────────────────────────────────────────────
/* A row, not a card. Label and description on the left, the control on
   the right — the System Settings pattern. Rows sit in a grouped inset
   list, so scanning down a column of labels is the primary way you find
   something rather than reading a grid of boxes. */
/* Hoisted: defining this inside Field would mint a new component type on
   every render, which remounts the inputs and drops focus mid-typing. */
function Row({ id, field, dirty, wide, onReset, children }) {
  return (
    <div className={`ad-row${dirty ? ' is-dirty' : ''}${wide ? ' ad-row--wide' : ''}`}>
      <div className="ad-row-lead">
        <label htmlFor={id}>{field.label}</label>
        {field.hint && <p>{field.hint}</p>}
        {dirty && <button type="button" className="ad-reset" onClick={onReset}>Reset</button>}
      </div>
      <div className="ad-row-ctl">{children}</div>
    </div>
  );
}

function Field({ field, value, defaultValue, onChange }) {
  const dirty = value !== defaultValue;
  const id = `f-${field.path.replace(/\./g, '-')}`;
  const reset = () => onChange(field.path, defaultValue);

  if (field.type === 'hue') {
    const h = Number(value ?? 0);
    return (
      <Row id={id} field={field} dirty={dirty} onReset={reset}>
        <span className="ad-swatch" style={{ background: `oklch(75% 0.18 ${h})` }} />
        <input
          id={id} className="ad-hue" type="range" min={0} max={360} step={1}
          value={h} onChange={(e) => onChange(field.path, Number(e.target.value))}
        />
        <input
          className="ad-num" type="number" min={0} max={360}
          value={h} onChange={(e) => onChange(field.path, Number(e.target.value))}
        />
      </Row>
    );
  }

  if (field.type === 'range') {
    const v = Number(value ?? 0);
    return (
      <Row id={id} field={field} dirty={dirty} onReset={reset}>
        <input
          id={id} className="ad-range" type="range"
          min={field.min} max={field.max} step={field.step ?? 1}
          value={v} onChange={(e) => onChange(field.path, Number(e.target.value))}
        />
        <span className="ad-val">{v}{field.unit || ''}</span>
      </Row>
    );
  }

  if (field.type === 'color') {
    return (
      <Row id={id} field={field} dirty={dirty} onReset={reset}>
        <input className="ad-color" type="color" value={value || '#000000'}
               onChange={(e) => onChange(field.path, e.target.value)} />
        <input id={id} className="ad-input ad-input--mono" type="text" value={value ?? ''}
               onChange={(e) => onChange(field.path, e.target.value)} />
      </Row>
    );
  }

  /* Image rows lead with the thumbnail so you identify the picture by
     sight, and show the file name rather than the whole URL — the full
     address is in the input beneath, which is where you edit it. */
  if (field.type === 'image') {
    const file = String(value || '').split('/').pop()?.split('?')[0] || '';
    return (
      <div className={`ad-row ad-row--media${dirty ? ' is-dirty' : ''}`}>
        <span className="ad-thumb">
          {value
            ? <img src={value} alt="" loading="lazy" onError={(e) => { e.currentTarget.dataset.broken = 'true'; }} />
            : <i />}
        </span>
        <div className="ad-media-body">
          <div className="ad-media-head">
            <label htmlFor={id}>{field.label}</label>
            <span className="ad-file" title={value || ''}>{file || 'not set'}</span>
          </div>
          <input id={id} className="ad-input ad-input--mono" type="text" value={value ?? ''}
                 placeholder="https://…"
                 onChange={(e) => onChange(field.path, e.target.value)} />
          {field.hint && <p className="ad-media-hint">{field.hint}</p>}
        </div>
        {dirty && (
          <button type="button" className="ad-reset ad-reset--media" onClick={() => onChange(field.path, defaultValue)}>
            Reset
          </button>
        )}
      </div>
    );
  }

  if (field.type === 'multiline') {
    return (
      <Row id={id} field={field} dirty={dirty} onReset={reset} wide>
        <textarea id={id} className="ad-input" rows={3} value={value ?? ''}
                  onChange={(e) => onChange(field.path, e.target.value)} />
      </Row>
    );
  }

  return (
    <Row id={id} field={field} dirty={dirty} onReset={reset}>
      <input id={id} className="ad-input" type="text" value={value ?? ''}
             onChange={(e) => onChange(field.path, e.target.value)} />
    </Row>
  );
}

/* Every image on the site, found by walking the content tree rather than
   listed by hand. Registry entries are grouped by where they appear; the
   handful that already have their own SCHEMA fields (hero plates, about
   cards, the logo) are gathered under one heading so this view really is
   all of them in one place. */
const MEDIA_ALL = '__media';
const ANALYZE_ID = '__analyze';

/* Code-split: charts, the heat canvas and two live subscriptions have no
   business loading for someone who only came here to change a caption. */
const Analyze = lazy(() => import('./Analyze'));

/* The sidebar badge. A separate, deliberately tiny subscription so the
   count is there without the Analyze panel — and its whole chunk — having
   to be open. Rows are aged out locally: a tab killed by the OS never gets
   to delete its own live document. */
function useLiveCount() {
  const [n, setN] = useState(0);

  useEffect(() => {
    let unsub = null;
    let cancelled = false;
    let rows = [];
    const recount = () => setN(rows.filter((r) => Date.now() - (r.lastSeen || 0) < 45000).length);
    const timer = setInterval(recount, 5000);

    (async () => {
      try {
        const [m, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('../firebase'),
        ]);
        if (cancelled) return;
        unsub = m.onSnapshot(m.collection(db, 'analytics_live'), (snap) => {
          rows = snap.docs.map((d) => d.data());
          recount();
        }, () => { /* rules not published yet — the badge just stays at 0 */ });
      } catch { /* offline */ }
    })();

    return () => { cancelled = true; clearInterval(timer); unsub?.(); };
  }, []);

  return n;
}

/* Mirrors ThemeVars so a drag previews instantly. Kept here rather than
   imported so the dashboard chunk does not pull the site's provider in. */
function applyThemePreview(t) {
  if (!t) return;
  const root = document.documentElement;
  Object.entries(t.hues || {}).forEach(([k, v]) => root.style.setProperty(`--h-${k}`, String(v)));
  if (t.accentLightDark  != null) root.style.setProperty('--l-acc', `${t.accentLightDark}%`);
  if (t.accentChromaDark != null) root.style.setProperty('--c-acc', String(t.accentChromaDark));
  if (t.bgLightnessDark  != null) root.style.setProperty('--l-bg',  `${t.bgLightnessDark}%`);
  if (t.grain != null) root.style.setProperty('--grain-opacity', String(t.grain));
  if (t.seam  != null) root.style.setProperty('--seam', String(t.seam));
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
  const liveCount = useLiveCount();

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
    setDraft((d) => {
      const next = setPath(d, path, value);
      /* Theme edits paint immediately, before any save — dragging a hue
         with no feedback until you commit is unusable. Same properties
         ThemeVars writes, so the preview is the real thing. */
      if (path.startsWith('theme.')) applyThemePreview(next.theme);
      return next;
    });
    setState((s) => (s === 'saved' ? 'idle' : s));
  }, []);

  const mediaGroups = useMemo(() => buildMediaGroups(draft), [draft]);

  const allFields = useMemo(() => [
    ...SCHEMA.flatMap((g) => g.fields.map((f) => ({ ...f, group: g.id }))),
    ...mediaGroups.flatMap((g) => g.fields.map((f) => ({ ...f, group: g.id }))),
  ], [mediaGroups]);

  const mediaTotal = useMemo(
    () => mediaGroups.reduce((n, g) => n + g.fields.length, 0),
    [mediaGroups],
  );

  const dirtyPaths = useMemo(
    () => allFields.filter((f) => getPath(draft, f.path) !== getPath(saved, f.path)).map((f) => f.path),
    [allFields, draft, saved],
  );

  // Search cuts across every group; with no query you get the selected one.
  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const all = [...SCHEMA, ...mediaGroups];
    if (!q) {
      // The one overview tab: every image on the site, still grouped.
      if (group === MEDIA_ALL) return mediaGroups;
      if (group === ANALYZE_ID) return [];
      const g = all.find((x) => x.id === group);
      return g ? [g] : [];
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

  if (state === 'loading') return <div className="ad-boot">Loading…</div>;

  const total = allFields.length;

  /* One nav row, whatever the group is. The badge is a count normally and
     an amber dot when that group holds unsaved edits — you want to know
     *where* the changes are, not how many. */
  const navItem = (g) => {
    const n = g.fields.filter((f) => dirtyPaths.includes(f.path)).length;
    return (
      <button
        key={g.id}
        className={`ad-nav-item${!filter && group === g.id ? ' is-on' : ''}`}
        onClick={() => { setGroup(g.id); setFilter(''); }}
        title={g.title}
      >
        <span className="ad-nav-txt">{g.title}</span>
        {n > 0
          ? <span className="ad-nav-dot" aria-label={`${n} unsaved`} />
          : <span className="ad-nav-n">{g.fields.length}</span>}
      </button>
    );
  };

  const isAnalyze = !filter && group === ANALYZE_ID;

  const navBands = {
    appearance: SCHEMA.filter((g) => g.id === 'theme'),
    sections:   SCHEMA.filter((g) => g.id !== 'theme'),
  };

  return (
    <div className="ad">
      {/* ── Sidebar ── */}
      <aside className="ad-side">
        <div className="ad-brand">
          <span className="ad-brand-dot" aria-hidden="true" />
          <div>
            <strong>Studio</strong>
            <span>{user.email}</span>
          </div>
        </div>

        <div className="ad-search-wrap">
          <input
            className="ad-search"
            type="search"
            placeholder="Search all fields"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {/* Three bands: how it looks, what it says, and every picture —
            each image group its own tab, so you go straight to the set you
            mean instead of scrolling one list of two hundred URLs. */}
        <nav className="ad-nav" aria-label="Sections">
          <p className="ad-nav-label">Insights</p>
          <button
            className={`ad-nav-item${!filter && group === ANALYZE_ID ? ' is-on' : ''}`}
            onClick={() => { setGroup(ANALYZE_ID); setFilter(''); }}
          >
            <span className="ad-nav-txt">Analyze</span>
            {liveCount > 0
              ? <span className="ad-nav-live" title={`${liveCount} on the site now`}>{liveCount}</span>
              : <span className="ad-nav-n">live</span>}
          </button>

          <p className="ad-nav-label">Appearance</p>
          {navBands.appearance.map(navItem)}

          <p className="ad-nav-label">Sections</p>
          {navBands.sections.map(navItem)}

          <p className="ad-nav-label">Images</p>
          <button
            className={`ad-nav-item${!filter && group === MEDIA_ALL ? ' is-on' : ''}`}
            onClick={() => { setGroup(MEDIA_ALL); setFilter(''); }}
          >
            <span className="ad-nav-txt">All images</span>
            <span className="ad-nav-n">{mediaTotal}</span>
          </button>
          {mediaGroups.map(navItem)}
        </nav>

        <div className="ad-side-foot">
          <button onClick={onExit}>View site</button>
          <button onClick={onSignOut}>Sign out</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ad-main">
        {error && <p className="ad-error" role="alert">{error}</p>}

        {isAnalyze && (
          <Suspense fallback={<p className="ad-empty">Loading analytics…</p>}>
            <Analyze />
          </Suspense>
        )}

        {!isAnalyze && visible.length === 0 && <p className="ad-empty">Nothing matches “{filter}”.</p>}

        {!isAnalyze && visible.map((g) => (
          <section key={g.id || g.title} className="ad-sec">
            <header className="ad-sec-head">
              <h2>{g.title}</h2>
              {g.intro && <p>{g.intro}</p>}
              <span className="ad-sec-n">{g.fields.length} {g.fields.length === 1 ? 'field' : 'fields'}</span>
            </header>

            {/* Grouped inset list — one rounded container, hairline dividers. */}
            <div className="ad-list">
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

        {!isAnalyze && <div className="ad-main-foot">{total} fields · {SCHEMA.length} content sections · {mediaGroups.length} image sets</div>}
      </main>

      {/* ── Save bar — only present when there is something to save ── */}
      <div className={`ad-savebar${dirtyPaths.length ? ' is-up' : ''}`}>
        <span className="ad-savebar-txt">
          {state === 'saving' ? 'Saving…'
            : state === 'error' ? 'Could not save'
            : `${dirtyPaths.length} unsaved ${dirtyPaths.length === 1 ? 'change' : 'changes'}`}
        </span>
        <div className="ad-savebar-btns">
          <button className="ad-btn" onClick={resetAll}>Discard</button>
          <button className="ad-btn ad-btn--go" onClick={save} disabled={state === 'saving'}>
            {state === 'saving' ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {state === 'saved' && <div className="ad-toast">Saved</div>}
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

  if (checking) return <div className="ad-boot">Checking session…</div>;
  if (!user) return <LoginScreen onSignedIn={setUser} />;
  return <Editor user={user} onSignOut={signOut} onExit={onExit} />;
}
