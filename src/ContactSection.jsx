import { useState, useRef, useEffect, useCallback } from 'react';
import ScrollReveal from './ScrollReveal';
import './ContactSection.css';
import { useContent } from './content/store';

/* ══════════════════════════════════════════════════════════════════════
   CONTACT — a real form, writing to Firestore.

   The nav has always had a "Contact" link pointing at #contact, and
   nothing has ever been there. This is that target.

   Firebase is deliberately NOT imported at the top of this file. It is
   ~148 MB installed and a large chunk in the bundle, and it is only
   needed the moment somebody presses Submit — so it is dynamically
   imported inside the handler. Importing it statically here would drag
   the whole SDK back into the first-load bundle for every visitor,
   undoing the code-splitting work.
   ══════════════════════════════════════════════════════════════════════ */

const DEFAULT_EMAIL = 'krazykishore2004@gmail.com';

/* Deliberately permissive. Over-strict email regexes reject valid
   addresses; the real validation is whether the reply bounces. */
const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

const LIMITS = { name: 80, email: 120, message: 2000 };

export default function ContactSection() {
  const EMAIL   = useContent('contact.email', DEFAULT_EMAIL);
  const copy    = useContent('contact', {});
  const t = (k, fallback) => (copy[k] === undefined || copy[k] === '' ? fallback : copy[k]);
  const facts   = copy.facts || {};

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [touched, setTouched] = useState({});
  const [state, setState] = useState('idle');      // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const sectionRef = useRef(null);
  const trapRef = useRef(null);                    // honeypot
  const openedAt = useRef(Date.now());
  const copyTimer = useRef(null);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('ct-in'); obs.disconnect(); } },
      { threshold: 0, rootMargin: '0px 0px -60px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
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
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  }, [EMAIL]);

  async function submit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (!valid || state === 'sending') return;

    // Two quiet bot checks: a field no human can see, and the fact that
    // scripts fill forms far faster than people read them.
    if (trapRef.current?.value) { setState('sent'); return; }
    if (Date.now() - openedAt.current < 2500) { setState('sent'); return; }

    setState('sending');
    setErrorMsg('');
    try {
      const { saveContact } = await import('./firebaseService');
      await saveContact({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setState('sent');
      setForm({ name: '', email: '', message: '' });
      setTouched({});
    } catch (err) {
      setState('error');
      setErrorMsg(
        err?.code === 'permission-denied'
          ? 'The form is not accepting messages right now.'
          : 'That did not go through. Email me directly and it will reach me.',
      );
    }
  }

  const field = (k) => (touched[k] && errors[k] ? 'ct-field ct-field--bad' : 'ct-field');

  return (
    <section ref={sectionRef} className="ct-section" id="contact" aria-label="Contact">
      {/* Decorative overlay — pointer-events:none keeps every form element clickable */}
      <div className="ct-overlay" aria-hidden="true">
        <img src="/deadpool_overlay.png" alt="" draggable="false" />
      </div>
      <div className="ct-inner">

        <div className="ct-left">
          <div className="ct-head-row">
            <div className="ct-head-line" />
            <span className="ct-head-eyebrow">{t('eyebrow', 'Contact')}</span>
          </div>
          <h2 className="ct-title">
            {t('title', "Let's build")}<br /><span className="ct-title-accent">{t('titleAccent', 'something.')}</span>
          </h2>
          <ScrollReveal
            as="div"
            containerClassName="sr-plain"
            textClassName="ct-lede sr-plain"
            baseOpacity={0.12}
            baseRotation={2}
            blurStrength={5}
          >
            {t('lede', 'Briefs, half-formed ideas and "is this even possible" all welcome. I read everything and reply to anything real.')}
          </ScrollReveal>

          <button className="ct-email" onClick={copyEmail}>
            <span className="ct-email-label">{copied ? 'Copied to clipboard' : EMAIL}</span>
            <span className="ct-email-icon" aria-hidden="true">{copied ? '✓' : '⧉'}</span>
          </button>

          <dl className="ct-facts">
            <div><dt>{facts.basedLabel || 'Based'}</dt><dd>{facts.basedValue || 'India · IST'}</dd></div>
            <div><dt>{facts.repliesLabel || 'Replies'}</dt><dd>{facts.repliesValue || 'Within 2 days'}</dd></div>
            <div><dt>{facts.statusLabel || 'Status'}</dt><dd className="ct-open">{facts.statusValue || 'Open for work'}</dd></div>
          </dl>
        </div>

        <div className="ct-right">
          {state === 'sent' ? (
            <div className="ct-done" role="status">
              <div className="ct-done-mark" aria-hidden="true">✓</div>
              <h3>{t('doneTitle', 'Message sent')}</h3>
              <p>{t('doneBody', "It landed. I'll come back to you at the address you gave.")}</p>
              <button className="ct-again" onClick={() => { setState('idle'); openedAt.current = Date.now(); }}>
                Send another
              </button>
            </div>
          ) : (
            <form className="ct-form" onSubmit={submit} noValidate>
              {/* Honeypot — off-screen, not display:none, so bots fill it. */}
              <input
                ref={trapRef}
                className="ct-trap"
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div className={field('name')}>
                <label htmlFor="ct-name">Name</label>
                <input
                  id="ct-name" type="text" value={form.name}
                  onChange={set('name')} onBlur={blur('name')}
                  autoComplete="name" placeholder="Your name"
                  aria-invalid={Boolean(touched.name && errors.name)}
                  aria-describedby={touched.name && errors.name ? 'ct-name-err' : undefined}
                />
                {touched.name && errors.name && <span id="ct-name-err" className="ct-err">{errors.name}</span>}
              </div>

              <div className={field('email')}>
                <label htmlFor="ct-email">Email</label>
                <input
                  id="ct-email" type="email" value={form.email}
                  onChange={set('email')} onBlur={blur('email')}
                  autoComplete="email" placeholder="you@studio.com"
                  aria-invalid={Boolean(touched.email && errors.email)}
                  aria-describedby={touched.email && errors.email ? 'ct-email-err' : undefined}
                />
                {touched.email && errors.email && <span id="ct-email-err" className="ct-err">{errors.email}</span>}
              </div>

              <div className={field('message')}>
                <label htmlFor="ct-msg">
                  Message
                  <span className="ct-count">{form.message.length}/{LIMITS.message}</span>
                </label>
                <textarea
                  id="ct-msg" rows={5} value={form.message}
                  onChange={set('message')} onBlur={blur('message')}
                  placeholder="What are you making, and where does it need help?"
                  aria-invalid={Boolean(touched.message && errors.message)}
                  aria-describedby={touched.message && errors.message ? 'ct-msg-err' : undefined}
                />
                {touched.message && errors.message && <span id="ct-msg-err" className="ct-err">{errors.message}</span>}
              </div>

              {state === 'error' && (
                <p className="ct-fail" role="alert">
                  {errorMsg} <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                </p>
              )}

              <button className="ct-submit" type="submit" disabled={state === 'sending'}>
                {state === 'sending' ? (
                  <><span className="ct-spin" aria-hidden="true" /> Sending…</>
                ) : (
                  <>{t('submitLabel', 'Send message')} <span aria-hidden="true">→</span></>
                )}
              </button>

              <p className="ct-note">
                {t('note', 'Goes straight to my inbox. No list, no newsletter, no follow-up sequence.')}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
