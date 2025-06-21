export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  // Parse cookies for CSRF token
  const csrfHeader = request.headers.get('x-csrf-token');
  const cookie = Object.fromEntries((request.headers.get('cookie') || '').split('; ').map(c => c.split('=')));
  const csrfCookie = cookie['csrfToken'];

  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), { status: 403 });
  }

  const HB_API_KEY = process.env.HYPERBEAM_API_KEY;
  try {
    const apiRes = await fetch('https://engine.hyperbeam.com/v0/vm', {
      method: 'POST',
      headers: { Authorization: `Bearer ${HB_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await apiRes.json();
    if (!apiRes.ok) {
      return new Response(JSON.stringify({ error: 'Hyperbeam error', details: data }), { status: 502 });
    }
    return new Response(JSON.stringify({
      embed_url: data.embed_url,
      session_id: data.id,
      admin_token: data.admin_token
    }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: String(err) }), { status: 500 });
  }
}
