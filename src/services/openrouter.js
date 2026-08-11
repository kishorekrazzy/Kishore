/* ══════════════════════════════════════════════════════════════════════
   OPENROUTER

   One call, streamed. The key comes from .env.local — see the warning
   there: Vite inlines VITE_* into the bundle, so this key is visible to
   anyone who reads the deployed JS. It needs a spend limit on it.

   Moving this behind a Firebase Function later is a change to this file
   only: swap the URL and drop the Authorization header.
   ══════════════════════════════════════════════════════════════════════ */

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const KEY   = import.meta.env.VITE_OPENROUTER_API_KEY;
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

export const hasKey = () => Boolean(KEY);

/* Streams the reply, calling onToken with each chunk so the UI can type it
   out. Returns the complete text. */
export async function askOpenRouter({ messages, system, signal, onToken }) {
  if (!KEY) throw new Error('No OpenRouter key. Add VITE_OPENROUTER_API_KEY to .env.local and restart the dev server.');

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
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${KEY}`,
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

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    const err = new Error(
      res.status === 401 ? 'OpenRouter rejected the key.'
      : res.status === 402 ? 'Free allowance used up for now.'
      : res.status === 429 ? 'Rate limited.'
      : res.status === 404 ? 'That model is no longer free.'
      : `OpenRouter error ${res.status}. ${detail.slice(0, 140)}`
    );
    // 404 / 429 / 402 all mean "try the next model"; 401 does not.
    err.retryable = [402, 404, 429, 502, 503].includes(res.status);
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
