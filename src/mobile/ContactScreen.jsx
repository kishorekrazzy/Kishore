import { useState, useRef, useCallback, useEffect } from 'react';
import { useContent } from '../content/store';
import { trackEvent } from '../services/analytics';
import { tap } from './mobileUtils';
import { Icon, Reveal } from './ui';

/* ══════════════════════════════════════════════════════════════════════
   CONTACT

   Same form as the desktop, same Firestore collection, same two quiet
   bot checks. Rebuilt rather than reused because the desktop version is
   a two-column layout wrapped around a 16:9 section, and none of that
   survives the trip down here.

   Firebase is imported inside the submit handler, exactly as the desktop
   does it — the SDK is a large download and nobody who never sends a
   message should pay for it. On a phone connection that matters more,
   not less.
   ══════════════════════════════════════════════════════════════════════ */

const DEFAULT_EMAIL = 'krazykishore2004@gmail.com';
const LIMITS = { name: 80, email: 120, message: 2000 };

/* Deliberately permissive — over-strict address patterns reject valid
   mailboxes, and the real test is whether the reply bounces. */
const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

function Field({ id, label, error, show, children, count }) {
  return (
    <div className={`mb-field${show && error ? ' mb-field--bad' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {count != null && <span className="mb-field-count">{count}</span>}
      {show && error && <span className="mb-field-err" role="alert">{error}</span>}
    </div>
  );
}

export default function ContactScreen({ onGo }) {
  const copy   = useContent('contact', {});
  const footer = useContent('footer', {});
  const EMAIL  = copy.email || DEFAULT_EMAIL;
  const facts  = copy.facts || {};
  const marks  = footer.marks || [];

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [touched, setTouched] = useState({});
  const [state, setState] = useState('idle');   // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const trapRef = useRef(null);
  /* When the form became fillable. Stamped in an effect rather than in
     the ref initialiser: reading the clock during render is impure, and
     under StrictMode's double render it would be stamped twice. */
  const openedAt = useRef(0);
  const copyTimer = useRef(null);
  useEffect(() => {
    openedAt.current = Date.now();
    return () => clearTimeout(copyTimer.current);
  }, []);

  const errors = {
    name: form.name.trim().length < 2 ? 'Tell me what to call you.' : '',
    email: !looksLikeEmail(form.email) ? 'I need a working address to reply to.' : '',
    message: form.message.trim().length < 10 ? 'A sentence or two is plenty.' : '',
  };
  const valid = !errors.name && !errors.email && !errors.message;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value.slice(0, LIMITS[k]) }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const copyEmail = useCallback(async () => {
    tap();
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard permission, or an insecure context — fall back to
      // the thing the visitor was going to do with the address anyway.
      window.location.href = `mailto:${EMAIL}`;
    }
  }, [EMAIL]);

  async function submit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (!valid || state === 'sending') return;

    // A field no human can see, and the fact that scripts fill forms
    // faster than people read them. Both report success rather than
    // failure — a bot that knows it was caught tries something else.
    if (trapRef.current?.value) { setState('sent'); return; }
    if (Date.now() - openedAt.current < 2500) { setState('sent'); return; }

    setState('sending');
    setErrorMsg('');
    try {
      const { saveContact } = await import('../firebaseService');
      await saveContact({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setState('sent');
      tap(20);
      setForm({ name: '', email: '', message: '' });
      setTouched({});
      trackEvent('contactSent');
    } catch (err) {
      setState('error');
      setErrorMsg(
        err?.code === 'permission-denied'
          ? 'The form is not accepting messages right now.'
          : 'That did not go through. Email me directly and it will reach me.',
      );
    }
  }

  return (
    <>
      <section className="mb-sec mb-contact" data-section="Say hello" style={{ paddingTop: 'calc(var(--mb-safe-t) + var(--mb-top) + 12px)' }}>
        <div className="mb-head">
          <Reveal as="p" className="mb-eyebrow">{copy.eyebrow || 'Contact'}</Reveal>
          <Reveal as="h1" className="mb-h1" delay={50}>
            {copy.title || "Let's build"} <span className="mb-accent">{copy.titleAccent || 'something.'}</span>
          </Reveal>
          <Reveal as="p" className="mb-body" delay={90}>{copy.lede}</Reveal>
        </div>

        <Reveal delay={120}>
          <button className={`mb-email mb-press${copied ? ' mb-email--done' : ''}`} onClick={copyEmail}>
            <span className="mb-email-ic"><Icon name={copied ? 'check' : 'mail'} size={18} /></span>
            <span className="mb-email-txt">
              <b>{EMAIL}</b>
              <span>{copied ? 'Copied' : 'Tap to copy'}</span>
            </span>
            <Icon name="copy" size={17} style={{ color: 'var(--ink-faint)' }} />
          </button>
        </Reveal>

        <Reveal delay={150}>
          <div className="mb-facts">
            <div className="mb-fact">
              <Icon name="pin" size={17} />
              <span>{facts.basedLabel || 'Based'}</span>
              <b>{facts.basedValue || 'India · IST'}</b>
            </div>
            <div className="mb-fact">
              <Icon name="clock" size={17} />
              <span>{facts.repliesLabel || 'Replies'}</span>
              <b>{facts.repliesValue || 'Within 2 days'}</b>
            </div>
            <div className="mb-fact">
              <Icon name="bolt" size={17} />
              <span>{facts.statusLabel || 'Status'}</span>
              <b>{facts.statusValue || 'Open for work'}</b>
            </div>
          </div>
        </Reveal>

        {state === 'sent' ? (
          <div className="mb-sent">
            <span className="mb-sent-ic"><Icon name="check" size={28} /></span>
            <h2 className="mb-h3">{copy.doneTitle || 'Message sent'}</h2>
            <p className="mb-body" style={{ maxWidth: '30ch' }}>
              {copy.doneBody || "It landed. I'll come back to you at the address you gave."}
            </p>
            <button className="mb-btn mb-btn--ghost" onClick={() => { setState('idle'); openedAt.current = Date.now(); }}>
              Write another
            </button>
          </div>
        ) : (
          <Reveal as="form" delay={180} onSubmit={submit} noValidate style={{ position: 'relative' }}>
            {/* Off-screen rather than display:none — some bots skip
                hidden fields but happily fill positioned ones. */}
            <input
              ref={trapRef}
              className="mb-trap"
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            {state === 'error' && <p className="mb-form-err" role="alert">{errorMsg}</p>}

            <Field id="mb-name" label="Your name" error={errors.name} show={touched.name}>
              <input
                id="mb-name"
                type="text"
                value={form.name}
                onChange={set('name')}
                onBlur={blur('name')}
                placeholder="Who is this?"
                autoComplete="name"
                enterKeyHint="next"
              />
            </Field>

            <Field id="mb-email" label="Email" error={errors.email} show={touched.email}>
              <input
                id="mb-email"
                /* type=email gives the phone the @ keyboard; the
                   autocapitalize and autocorrect switches stop iOS from
                   turning an address into a sentence. */
                type="email"
                inputMode="email"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
                value={form.email}
                onChange={set('email')}
                onBlur={blur('email')}
                placeholder="you@example.com"
                autoComplete="email"
                enterKeyHint="next"
              />
            </Field>

            <Field
              id="mb-msg"
              label="Message"
              error={errors.message}
              show={touched.message}
              count={`${form.message.length}/${LIMITS.message}`}
            >
              <textarea
                id="mb-msg"
                value={form.message}
                onChange={set('message')}
                onBlur={blur('message')}
                placeholder="A brief, a half-formed idea, or a question."
                enterKeyHint="send"
              />
            </Field>

            <button
              type="submit"
              className="mb-btn mb-btn--fill mb-btn--wide"
              disabled={state === 'sending'}
            >
              {state === 'sending' ? 'Sending…' : (copy.submitLabel || 'Send message')}
              {state !== 'sending' && <Icon name="arrow" size={17} />}
            </button>

            <p className="mb-small" style={{ marginTop: 12, textAlign: 'center' }}>{copy.note}</p>
          </Reveal>
        )}
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════ */}
      <footer className="mb-footer" data-section="The Wrap">
        <div>
          <p className="mb-eyebrow">{footer.badge || 'Available for freelance work'}</p>
          <h2 className="mb-h2" style={{ marginTop: 14 }}>
            {footer.title1 || 'Let’s make something'}<br />
            <span className="mb-accent">{footer.title2 || 'worth watching'}</span><br />
            {footer.title3 || 'together'}
          </h2>
          <p className="mb-body" style={{ marginTop: 14 }}>{footer.sub}</p>
        </div>

        <div className="mb-footer-links">
          {[
            ['Home', 'home'],
            ['Work', 'work'],
            ['Notes', 'notes'],
            ['Studio', 'studio'],
          ].map(([label, id]) => (
            <button key={id} onClick={() => { tap(); onGo(id); }}>
              {label}
              <Icon name="chev" size={15} />
            </button>
          ))}
        </div>

        {/* The tool strip. Names rather than logos: the desktop resolves
            these against an icon set, and pulling a 38KB icon module onto
            a phone to draw twenty-six small marks is not a trade worth
            making. */}
        <div>
          <p className="mb-small" style={{ marginBottom: 10 }}>{footer.marksLabel || 'Tools I work in every day'}</p>
          <div className="mb-marquee" aria-hidden="true">
            {[0, 1].map((k) => (
              <div className="mb-marquee-track" key={k} style={{ '--dur': '30s', '--gap': '18px' }}>
                {marks.map((m) => (
                  <span key={m} style={{
                    fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em',
                    textTransform: 'capitalize', color: 'var(--ink-faint)', whiteSpace: 'nowrap',
                  }}>{m}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-socials">
          {[
            ['Instagram', 'https://instagram.com/kishoreditx'],
            ['YouTube',   'https://youtube.com/@kishoreditx'],
            ['X',         'https://x.com/kishoreditx'],
          ].map(([label, href]) => (
            <a
              className="mb-social mb-press"
              key={label}
              href={href}
              target="_blank"
              /* noopener is the security half — without it the opened tab
                 gets a handle on this one through window.opener. */
              rel="noopener noreferrer"
            >
              {label}
              <Icon name="arrow" size={13} />
            </a>
          ))}
        </div>

        <div className="mb-footer-bottom">
          <p className="mb-wordmark">{footer.logo || 'KishoreditX'}</p>
          <p className="mb-small" style={{ textAlign: 'center' }}>{footer.copyright}</p>
        </div>
      </footer>
    </>
  );
}
