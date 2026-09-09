// Validates the Fade Media access code and sets the gate cookie.
const CODE = 'fade2026';

function fields(req) {
  const b = req.body;
  if (!b) return {};
  if (typeof b === 'object') return b;
  const out = {};
  new URLSearchParams(String(b)).forEach((v, k) => { out[k] = v; });
  return out;
}

export default function handler(req, res) {
  const f = req.method === 'POST' ? fields(req) : (req.query || {});
  const code = String(f.code || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  let next = String(f.next || '/fademedia');
  if (!next.startsWith('/') || next.startsWith('//')) next = '/fademedia';

  if (code === CODE) {
    res.setHeader('Set-Cookie', 'fmgate=ok; Path=/; Max-Age=604800; SameSite=Lax');
    res.statusCode = 302;
    res.setHeader('Location', next);
    res.end();
    return;
  }
  res.statusCode = 302;
  res.setHeader('Location', '/gate?err=1&next=' + encodeURIComponent(next));
  res.end();
}
