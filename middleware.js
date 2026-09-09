// Server-side access gate for the Fade Media section.
export const config = { matcher: ['/fademedia', '/fade-media', '/article'] };

export default function middleware(req) {
  const cookie = req.headers.get('cookie') || '';
  if (cookie.includes('fmgate=ok')) return;
  const url = new URL(req.url);
  const next = encodeURIComponent(url.pathname + url.search);
  return Response.redirect(new URL('/gate?next=' + next, req.url), 302);
}
