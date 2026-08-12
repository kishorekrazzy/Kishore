/* ══════════════════════════════════════════════════════════════════════
   OPENROUTER

   Two ways to reach the model, tried in that order:

     1. /api/chat — the Netlify function in netlify/functions/chat.mjs.
        The key lives in Netlify's environment and never reaches the
        browser. This is the path every deployed visitor takes.

     2. A direct call using VITE_OPENROUTER_API_KEY from .env.local, for
        working locally under plain `vite` where no function is running.

   Why the proxy exists: Vite inlines every VITE_* variable into the client
   bundle at build time. A key configured that way is readable by anyone
   who opens the deployed JavaScript — it is not a secret however the
   hosting dashboard labels it. Path 2 is a local-development convenience
   and nothing else.

   The model fallback chain stays here rather than in the function, so both
   paths get it.
   ══════════════════════════════════════════════════════════════════════ */

const PROXY    = '/api/chat';
const DIRECT   = 'https://openrouter.ai/api/v1/chat/completions';
/* Gated on DEV so the key is not merely absent from a Netlify build but
   impossible to put into any production build. Vite replaces
   import.meta.env.DEV with false when building, the ternary folds to
   undefined, and the literal never reaches the output — even on this
   machine, where .env.local exists and would otherwise be inlined. */
const LOCAL_KEY = import.meta.env.DEV ? import.meta.env.VITE_OPENROUTER_API_KEY : undefined;

/* Free-tier slugs get retired and rate-limited constantly — the original
   llama-3.3 slug went paid-only and started 404ing. These were verified
   against a live key; the chain is tried in order so one being unavailable
   or rate-limited falls through instead of failing the whole request. */
const MODELS = [
  import.meta.env.VITE_OPENROUTER_MODEL,
  'openai/gpt-oss-20b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
].filter(Boolean);

/* Whether the proxy is there is not knowable without asking it, so it is
   assumed present and remembered once proved otherwise. Under plain vite
   there is no function and the first call 404s; from then on the direct
   path is used with no repeated wasted round trip. */
let proxyAvailable = true;

/* Kept for callers that want to warn ahead of time. It can only ever
   answer for the local path — a deployed site has no way to know whether
   the server has a key until it asks — so the UI should surface the error
   from a failed send rather than guessing up front. */
export const hasKey = () => Boolean(LOCAL_KEY) || proxyAvailable;

/* Streams the reply, calling onToken with each chunk so the UI can type it
   out. Returns the complete text. */
export async function askOpenRouter({ messages, system, signal, onToken }) {
  let lastError;

  for (const model of MODELS) {
    try {
      return await streamOne({ model, messages, system, signal, onToken });
    } catch (err) {
      // Only fall through for "this model is unusable right now".
      if (err.name === 'AbortError' || !err.retryable) throw err;
      lastError = err;
    }
  }

  throw lastError || new Error('No free model is responding right now.');
}

async function streamOne({ model, messages, system, signal, onToken }) {
  let res;

  if (proxyAvailable) {
    res = await fetch(PROXY, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, system, messages }),
    });

    /* No function at that path: a plain vite dev server answers with the
       index page, so a 404 — or an HTML body where JSON was expected — is
       the tell. Fall through to the direct call for the rest of the
       session. */
    const contentType = res.headers.get('content-type') || '';
    if (res.status === 404 || contentType.includes('text/html')) {
      proxyAvailable = false;
      res = null;
    } else if (res.status === 503) {
      // The function is deployed but was never given a key.
      const body = await res.json().catch(() => ({}));
      if (body.error === 'not_configured') {
        const err = new Error(
          body.message
          || 'The chat is not configured on this deploy. Add OPENROUTER_API_KEY in Netlify → Site configuration → Environment variables, then redeploy.',
        );
        err.retryable = false;   // trying another model cannot fix a missing key
        throw err;
      }
    }
  }

  if (!res) {
    if (!LOCAL_KEY) {
      const err = new Error(
        'No route to the model. Locally, add VITE_OPENROUTER_API_KEY to .env.local and restart the dev server. '
        + 'On Netlify, set OPENROUTER_API_KEY in the site’s environment variables and redeploy.',
      );
      err.retryable = false;
      throw err;
    }

    res = await fetch(DIRECT, {
      method: 'POST',
      signal,
      headers: {
        Authorization: `Bearer ${LOCAL_KEY}`,
        'Content-Type': 'application/json',
        // OpenRouter uses these for its rankings page; both are optional.
        'HTTP-Referer': window.location.origin,
        'X-Title': 'KishoreditX Portfolio',
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [{ role: 'system', content: system }, ...messages],
      }),
    });
  }

  if (!res.ok) {
    /* The proxy reports the upstream status in its JSON body so the
       fallback chain keeps working through it; a direct call carries it on
       the response itself. */
    let status = res.status;
    let detail = '';
    const body = await res.text().catch(() => '');
    try {
      const parsed = JSON.parse(body);
      if (parsed.status) status = parsed.status;
      detail = parsed.message || parsed.error?.message || '';
    } catch { detail = body; }

    const err = new Error(
      status === 401 ? 'OpenRouter rejected the key.'
      : status === 402 ? 'Free allowance used up for now.'
      : status === 429 ? 'Rate limited.'
      : status === 404 ? 'That model is no longer free.'
      : `OpenRouter error ${status}. ${String(detail).slice(0, 140)}`,
    );
    // 404 / 429 / 402 all mean "try the next model"; 401 does not.
    err.retryable = [402, 404, 429, 502, 503].includes(status);
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line; a chunk can split one.
    const frames = buffer.split('\n');
    buffer = frames.pop() ?? '';

    for (const line of frames) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') return full;
      try {
        const token = JSON.parse(payload).choices?.[0]?.delta?.content;
        if (token) { full += token; onToken?.(token); }
      } catch { /* keep-alive comment or a partial frame */ }
    }
  }
  return full;
}
