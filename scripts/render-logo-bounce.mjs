// Renders a DVD-screensaver-style bounce of the FADE logo to video.
// Deterministic, seamless 12s loop with corner hits at t=0,6,12s.
// Pipeline: SVG per frame -> rsvg-convert -> ffmpeg. Usage:
//   node scripts/render-logo-bounce.mjs <square|landscape|vertical> <solid|alpha>
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const FMT = process.argv[2] || 'landscape';
const MODE = process.argv[3] || 'solid';
const FPS = 30;
const LOOP = 12;                 // seconds; corner hits at 0,6,12
const N = FPS * LOOP;            // render 0..N-1 (frame N == frame 0)

const SIZES = {
  square:    { W: 1080, H: 1080, frac: 0.30 },
  landscape: { W: 1920, H: 1080, frac: 0.22 },
  vertical:  { W: 1080, H: 1920, frac: 0.34 },
};
const { W, H, frac } = SIZES[FMT];
const w = Math.round(W * frac);
const h = w * 170 / 840;
const Lx = W - w, Ly = H - h;
const Tx = 4, Ty = 3;            // periods -> corners coincide every 6s
const PALETTE = ['#ffffff', '#3b82f6', '#22d3ee', '#4ade80', '#fbbf24', '#f87171', '#a855f7', '#60a5fa'];

// triangle wave 0..L with period T, starting at 0 going up
function tri(t, L, T) {
  const half = T / 2;
  const k = Math.floor(t / half);
  const frac = t / half - k;
  return (k % 2 === 0) ? frac * L : (1 - frac) * L;
}
// color index = number of wall-hit events so far (corners count once)
function colorIndex(t) {
  const eps = 1e-6;
  const nx = Math.floor((t + eps) / (Tx / 2));
  const ny = Math.floor((t + eps) / (Ty / 2));
  const nc = Math.floor((t + eps) / 6);   // corner coincidences
  return ((nx + ny - nc) % PALETTE.length + PALETTE.length) % PALETTE.length;
}
function isCornerNear(t) {
  const m = t % 6;
  return (m < 0.18 || m > 5.82);
}

const GLYPHS = [
  '<polygon points="207,458.6 197.7,487.8 275.6,488.4 254.3,511 190.1,511 169.9,573.7 103.7,573.7 151.8,426.3 333.8,426.3 303.2,458.9"/>',
  '<polygon points="231.7,573.7 370,426.3 430.5,426.3 468.8,573.7 348.9,573.7 348.9,541.4 403.7,541.4 390,488.4 304,573.7"/>',
  '<path d="M684,426.3H517l-48.2,147.4H634l22.9-14.7l36.9-113.3L684,426.3z M596.5,541.8H547l26.9-82.6h49.5L596.5,541.8z"/>',
  '<polygon points="775.7,459.1 766.2,488.2 848.3,488.2 840.5,511.8 758.5,511.8 748.7,541.8 858.7,541.8 848.3,573.7 674.4,573.7 722.4,426.3 896.3,426.3 885.6,459.1"/>',
].join('');

function frameSVG(t) {
  const x = tri(t, Lx, Tx);
  const y = tri(t, Ly, Ty);
  const color = PALETTE[colorIndex(t)];
  const bg = MODE === 'alpha' ? '' : `<rect width="${W}" height="${H}" fill="#000000"/>`;
  const glow = isCornerNear(t)
    ? `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" opacity="0.5"><svg width="${w}" height="${h.toFixed(1)}" viewBox="80 420 840 170"><g fill="${color}" filter="url(#b)">${GLYPHS}</g></svg></g>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><filter id="b" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9"/></filter></defs>
${bg}
${glow}
<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h.toFixed(1)}" viewBox="80 420 840 170">
<g fill="${color}">${GLYPHS}</g>
</svg>
</svg>`;
}

const tmp = join('renders', `_b_${FMT}_${MODE}`);
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync('renders', { recursive: true });

console.log(`Bounce: ${N} frames @ ${W}x${H} (${FMT}/${MODE})...`);
for (let f = 0; f < N; f++) {
  const t = f / FPS;
  const svgPath = join(tmp, `f${String(f).padStart(4, '0')}.svg`);
  const pngPath = join(tmp, `f${String(f).padStart(4, '0')}.png`);
  writeFileSync(svgPath, frameSVG(t));
  const r = spawnSync('rsvg-convert', ['-w', String(W), '-h', String(H), svgPath, '-o', pngPath]);
  if (r.status !== 0) { console.error('rsvg failed @', f, r.stderr?.toString()); process.exit(1); }
}
console.log('Encoding...');
const base = `renders/fade-logo-bounce-${FMT}`;
let r;
if (MODE === 'solid') {
  r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(tmp, 'f%04d.png'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', `${base}.mp4`], { stdio: 'inherit' });
  console.log('Wrote', `${base}.mp4`);
} else {
  r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(tmp, 'f%04d.png'),
    '-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', `${base}-alpha.mov`], { stdio: 'inherit' });
  console.log('Wrote', `${base}-alpha.mov`);
}
rmSync(tmp, { recursive: true, force: true });
if (r.status !== 0) process.exit(1);
