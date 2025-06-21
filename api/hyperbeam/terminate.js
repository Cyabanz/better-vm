export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }
  const { sessionId, uid } = body || {};

  // CSRF
  const csrfHeader = request.headers.get('x-csrf-token');
  const cookie = Object.fromEntries((request.headers.get('cookie') || '').split('; ').map(c => c.split('=')));
  const csrfCookie = cookie['csrfToken'];

  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), { status: 403 });
  }

  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Missing sessionId' }), { status: 400 });
  }

  const HB_API_KEY = process.env.HYPERBEAM_API_KEY;
  const res = await fetch(`https://engine.hyperbeam.com/v0/vm/${sessionId}/terminate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${HB_API_KEY}` }
  });

  if (res.ok) {
    return new Response(JSON.stringify({ message: 'Session terminated' }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ error: 'Failed to terminate session' }), { status: 502 });
  }
}
