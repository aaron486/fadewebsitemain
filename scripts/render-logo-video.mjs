// Renders the FADE logo reveal animation to a video, deterministically.
// Pipeline: build one SVG per frame -> rasterize with rsvg-convert -> encode with ffmpeg.
// No browser required. Usage:
//   node scripts/render-logo-video.mjs <square|landscape|vertical> <solid|alpha>
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const FMT = process.argv[2] || 'square';
const MODE = process.argv[3] || 'solid';     // solid bg (mp4) or alpha (mov/webm)
const FPS = 30;
const DUR = 4.6;                              // seconds
const N = Math.round(FPS * DUR);

const SIZES = {
  square:    { W: 1080, H: 1080, WMW: 820 },
  landscape: { W: 1920, H: 1080, WMW: 1180 },
  vertical:  { W: 1080, H: 1920, WMW: 900 },
};
const { W, H, WMW } = SIZES[FMT];
const WMH = WMW * 170 / 840;
const wmx = (W - WMW) / 2;
const wmy = (H - WMH) / 2 - H * 0.045;
const tagY = wmy + WMH + H * 0.075;
const tagFont = Math.round(WMW * 0.030);
const tagLS = (tagFont * 0.42).toFixed(1);

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3);
const easeInOutSine = (p) => -(Math.cos(Math.PI * p) - 1) / 2;
const lerp = (a, b, p) => a + (b - a) * p;

// FADE glyphs (left to right) with approx centers for scale origin.
const GLYPHS = [
  { c: 218, tag: 'polygon', d: 'points="207,458.6 197.7,487.8 275.6,488.4 254.3,511 190.1,511 169.9,573.7 103.7,573.7 151.8,426.3 333.8,426.3 303.2,458.9"' },
  { c: 350, tag: 'polygon', d: 'points="231.7,573.7 370,426.3 430.5,426.3 468.8,573.7 348.9,573.7 348.9,541.4 403.7,541.4 390,488.4 304,573.7"' },
  { c: 580, tag: 'path', d: 'd="M684,426.3H517l-48.2,147.4H634l22.9-14.7l36.9-113.3L684,426.3z M596.5,541.8H547l26.9-82.6h49.5L596.5,541.8z"' },
  { c: 785, tag: 'polygon', d: 'points="775.7,459.1 766.2,488.2 848.3,488.2 840.5,511.8 758.5,511.8 748.7,541.8 858.7,541.8 848.3,573.7 674.4,573.7 722.4,426.3 896.3,426.3 885.6,459.1"' },
];
const CY = 500;

const introStart = [0.15, 0.33, 0.51, 0.69];
const introDur = 0.75;
const sheenStart = 1.7, sheenDur = 1.5;
const ripStart = [2.0, 2.14, 2.28, 2.42], ripDur = 0.75, ripDepth = 0.72;
const tagStart = 1.5, tagDur = 0.85;

function frameSVG(t) {
  const glow = 0.30 + 0.60 * easeOutCubic(clamp(t / 1.0, 0, 1));
  // sheen
  const sp = clamp((t - sheenStart) / sheenDur, 0, 1);
  const sx = lerp(40, 980, easeInOutSine(sp));
  let so = 0;
  if (sp > 0 && sp < 1) so = sp < 0.12 ? sp / 0.12 : sp > 0.88 ? (1 - sp) / 0.12 : 1;
  so = clamp(so, 0, 1);
  // tagline
  const tagO = easeOutCubic(clamp((t - tagStart) / tagDur, 0, 1));

  let glyphG = '';
  for (let i = 0; i < 4; i++) {
    const p = clamp((t - introStart[i]) / introDur, 0, 1);
    const e = easeOutCubic(p);
    const dy = (1 - e) * 22;
    const s = 0.92 + 0.08 * e;
    const rp = clamp((t - ripStart[i]) / ripDur, 0, 1);
    const rf = 1 - ripDepth * Math.sin(Math.PI * rp);
    const op = (e * rf).toFixed(3);
    const cx = GLYPHS[i].c;
    const tr = `translate(0 ${dy.toFixed(2)}) translate(${cx} ${CY}) scale(${s.toFixed(4)}) translate(${-cx} ${-CY})`;
    glyphG += `<g opacity="${op}" transform="${tr}"><${GLYPHS[i].tag} ${GLYPHS[i].d}/></g>`;
  }

  const clip = GLYPHS.map(g => `<${g.tag} ${g.d}/>`).join('');
  const sheenG = so > 0
    ? `<g clip-path="url(#wm)"><rect x="${(sx - 110).toFixed(1)}" y="410" width="220" height="190" fill="url(#sheen)" opacity="${so.toFixed(3)}"/></g>`
    : '';

  const bg = MODE === 'alpha' ? '' :
    `<rect width="${W}" height="${H}" fill="#050507"/><rect width="${W}" height="${H}" fill="url(#bgglow)" opacity="${glow.toFixed(3)}"/>`;

  const tagline = tagO > 0.01
    ? `<text x="${W/2}" y="${tagY.toFixed(0)}" text-anchor="middle" fill="#60a5fa" font-family="Helvetica,Arial,sans-serif" font-size="${tagFont}" font-weight="700" letter-spacing="${tagLS}" opacity="${tagO.toFixed(3)}">BET TOGETHER</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
<radialGradient id="bgglow" cx="50%" cy="${((wmy+WMH/2)/H*100).toFixed(0)}%" r="55%">
<stop offset="0" stop-color="#3b82f6" stop-opacity="0.30"/><stop offset="45%" stop-color="#3b82f6" stop-opacity="0.06"/><stop offset="70%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
<clipPath id="wm">${clip}</clipPath>
<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#dbe7ff" stop-opacity="0"/><stop offset="0.5" stop-color="#eef4ff" stop-opacity="0.9"/><stop offset="1" stop-color="#dbe7ff" stop-opacity="0"/>
</linearGradient>
</defs>
${bg}
<svg x="${wmx.toFixed(1)}" y="${wmy.toFixed(1)}" width="${WMW}" height="${WMH.toFixed(1)}" viewBox="80 420 840 170" overflow="visible">
<g fill="#ffffff">${glyphG}</g>
${sheenG}
</svg>
${tagline}
</svg>`;
}

// ---- render ----
const tmp = join('renders', `_frames_${FMT}_${MODE}`);
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync('renders', { recursive: true });

console.log(`Rendering ${N} frames @ ${W}x${H} (${FMT}/${MODE})...`);
for (let f = 0; f < N; f++) {
  const t = f / FPS;
  const svg = frameSVG(t);
  const svgPath = join(tmp, `f${String(f).padStart(4, '0')}.svg`);
  const pngPath = join(tmp, `f${String(f).padStart(4, '0')}.png`);
  writeFileSync(svgPath, svg);
  const r = spawnSync('rsvg-convert', ['-w', String(W), '-h', String(H), svgPath, '-o', pngPath]);
  if (r.status !== 0) { console.error('rsvg failed at frame', f, r.stderr?.toString()); process.exit(1); }
}
console.log('Frames rasterized. Encoding...');

const base = `renders/fade-logo-reveal-${FMT}`;
if (MODE === 'solid') {
  const out = `${base}.mp4`;
  const r = spawnSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', join(tmp, 'f%04d.png'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-movflags', '+faststart', out], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(1);
  console.log('Wrote', out);
} else {
  const out = `${base}-alpha.mov`;
  const r = spawnSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', join(tmp, 'f%04d.png'),
    '-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', out], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(1);
  console.log('Wrote', out);
}
rmSync(tmp, { recursive: true, force: true });
