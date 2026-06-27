export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { urls } = await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (const { href, title, addDate } of urls) {
        const result = await checkUrl(href);

        const payload =
          JSON.stringify({ href, title, addDate, ...result }) + '\n';
        controller.enqueue(encoder.encode(payload));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}

async function checkUrl(href) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(href, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    clearTimeout(timeout);

    const finalUrl = res.url;
    const redirected = finalUrl !== href;
    const text = await res.text();

    const status = classifyResponse(res.status, finalUrl, text, href);

    return {
      status,
      httpStatus: res.status,
      finalUrl: redirected ? finalUrl : null,
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { status: 'timeout', httpStatus: null, finalUrl: null };
    }
    return { status: 'dead', httpStatus: null, finalUrl: null };
  }
}

function classifyResponse(httpStatus, finalUrl, body, originalUrl) {
  const lower = body.toLowerCase();

  // Domain squatting / hijack detection
  const squatSignals = [
    'casino',
    'casinos',
    'poker',
    'slots',
    'betting',
    'gambling',
    'viagra',
    'cialis',
    'payday loan',
    'crypto',
    'bitcoin',
    'buy now',
    'click here to win',
  ];
  if (squatSignals.some((s) => lower.includes(s))) return 'squatted';

  if (httpStatus === 200) {
    // Soft 404 detection — page returned 200 but is clearly an error page

    const soft404Signals = [
      'page not found',
      '404 not found',
      "this page doesn't exist",
      'no longer available',
      'has been removed',
    ];
    if (soft404Signals.some((s) => lower.includes(s))) return 'soft-404';

    // Login wall detection
    const loginSignals = [
      'sign in',
      'log in',
      'login required',
      'please login',
      'create an account',
    ];
    if (loginSignals.some((s) => lower.includes(s))) return 'login-wall';

    return 'alive';
  }

  if (httpStatus === 401 || httpStatus === 403) return 'blocked';
  if (httpStatus === 404) {
    try {
      const originalDomain = new URL(originalUrl).hostname;
      const finalDomain = new URL(finalUrl).hostname;
      if (originalDomain !== finalDomain) return 'squatted';
    } catch {}
    return 'not-found';
  }
  if (httpStatus === 429) return 'blocked';
  if (httpStatus >= 300 && httpStatus < 400) return 'redirect';
  if (httpStatus >= 500) return 'server-error';

  return 'unknown';
}
