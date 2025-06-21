export const config = { runtime: 'edge' };

function randomToken(len = 32) {
  return Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map((v) => v.toString(16).padStart(2, '0')).join('');
}

export default function handler(request) {
  const csrfToken = randomToken(16);
  return new Response(JSON.stringify({ csrfToken }), {
    status: 200,
    headers: {
      'Set-Cookie': `csrfToken=${csrfToken}; Path=/; SameSite=Strict; HttpOnly`,
      'Content-Type': 'application/json'
    }
  });
}
