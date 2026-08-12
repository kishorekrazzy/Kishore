/* ══════════════════════════════════════════════════════════════════════
   CHAT PROXY

   Stands between the browser and OpenRouter so the API key never reaches
   the browser at all.

   This exists because of how Vite works: every VITE_* variable is inlined
   into the client bundle at build time, so a key configured that way is
   readable by anyone who opens the deployed site's JavaScript. It is not
   a secret, whatever the hosting dashboard calls it. Read here from
   process.env instead, the key stays on Netlify's servers.

   A Functions v2 handler: takes a Request, returns a Response. The
   upstream body is passed straight through undecoded, so tokens reach the
   browser as they are produced rather than after the whole reply lands.
   ══════════════════════════════════════════════════════════════════════ */

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

/* Bound to /api/chat rather than the default
   /.netlify/functions/chat — the client should not have to know what host
   it is deployed on. */
export const config = { path: '/api/chat' };

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export default async function handler(request) {
  if (request.method !== 'POST') return json(405, { error: 'POST only.' });

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    /* A distinct status so the client can tell "this deploy was never
       configured" apart from "OpenRouter is having a bad day", and say
       something useful instead of a generic failure. */
    return json(503, {
      error: 'not_configured',
      message:
        'The chat is not configured on this deploy. Add OPENROUTER_API_KEY under '
        + 'Netlify → Site configuration → Environment variables, then redeploy.',
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: 'Body must be JSON.' });
  }

  const { model, messages, system } = payload || {};
  if (!model || !Array.isArray(messages)) {
    return json(400, { error: 'Expected { model, messages, system }.' });
  }

  /* Only the fields this proxy is willing to forward are forwarded. The
     browser cannot talk the endpoint into doing something else by adding
     keys to the body. */
  let upstream;
  try {
    upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.URL || 'https://kishoreditx.netlify.app',
        'X-Title': 'KishoreditX Portfolio',
      },
      body: JSON.stringify({
        model,
        stream: true,
        // Netlify caps how long a function may run. Left unbounded a
        // rambling model can outlive the request and the reply is cut off
        // mid-sentence with no explanation.
        max_tokens: 800,
        messages: [
          ...(system ? [{ role: 'system', content: String(system) }] : []),
          ...messages
            .filter((m) => m && typeof m.content === 'string')
            .map((m) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content.slice(0, 8000),
            })),
        ],
      }),
    });
  } catch (err) {
    return json(502, { error: 'upstream_unreachable', message: String(err?.message || err) });
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    // The status is preserved so the client's model-fallback chain can
    // still tell a rate limit from a retired model.
    return json(upstream.status, {
      error: 'upstream_error',
      status: upstream.status,
      message: detail.slice(0, 300),
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  });
}
