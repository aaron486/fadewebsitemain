// CRT power-off render: logo -> bright line -> dot -> fade. Deterministic.
// node scripts/render-logo-tvoff.mjs <square|landscape|vertical> <solid|alpha>
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
const FMT = process.argv[2] || 'landscape';
const MODE = process.argv[3] || 'solid';
const FPS = 30, DUR = 2.0, N = Math.round(FPS * DUR);
const SIZES = { square:{W:1080,H:1080,frac:0.46}, landscape:{W:1920,H:1080,frac:0.34}, vertical:{W:1080,H:1920,frac:0.52} };
const { W, H, frac } = SIZES[FMT];
const w = Math.round(W*frac), h = w*170/840;
const cx = W/2, cy = H/2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,p)=>a+(b-a)*p;
const easeIn=(p)=>p*p*p;
const GLYPHS=['<polygon points="207,458.6 197.7,487.8 275.6,488.4 254.3,511 190.1,511 169.9,573.7 103.7,573.7 151.8,426.3 333.8,426.3 303.2,458.9"/>','<polygon points="231.7,573.7 370,426.3 430.5,426.3 468.8,573.7 348.9,573.7 348.9,541.4 403.7,541.4 390,488.4 304,573.7"/>','<path d="M684,426.3H517l-48.2,147.4H634l22.9-14.7l36.9-113.3L684,426.3z M596.5,541.8H547l26.9-82.6h49.5L596.5,541.8z"/>','<polygon points="775.7,459.1 766.2,488.2 848.3,488.2 840.5,511.8 758.5,511.8 748.7,541.8 858.7,541.8 848.3,573.7 674.4,573.7 722.4,426.3 896.3,426.3 885.6,459.1"/>'].join('');
// timeline in seconds (hold .55, collapse, dot, fade)
function state(t){
  const tHold=0.55, tLine=0.70, tDotW=0.86, tBloom=0.96, tFade=1.45;
  let sy=1, logoOp=1, beamOp=0, bw=w, bh=5, bloom=0;
  if(t<tHold){ sy=1; logoOp=1; beamOp=0; }
  else if(t<tLine){ const p=easeIn(clamp((t-tHold)/(tLine-tHold),0,1)); sy=lerp(1,0.016,p); logoOp=1; beamOp=clamp((t-tHold)/(tLine-tHold)*1.4,0,1); }
  else { sy=0.016; logoOp=0; beamOp=1;
    if(t<tDotW){ const p=clamp((t-tLine)/(tDotW-tLine),0,1); bw=lerp(w,22,p); bh=5; }
    else if(t<tBloom){ const p=clamp((t-tDotW)/(tBloom-tDotW),0,1); bw=lerp(22,26,p); bh=lerp(5,26,p); bloom=p; }
    else { const p=clamp((t-tBloom)/(tFade-tBloom),0,1); bw=lerp(26,8,p); bh=lerp(26,8,p); bloom=1-p; beamOp=1-p; }
  }
  return {sy,logoOp,beamOp,bw,bh,bloom};
}
function frameSVG(t){
  const s=state(t);
  const bg = MODE==='alpha' ? '' : `<rect width="${W}" height="${H}" fill="#000000"/>`;
  const logo = s.logoOp>0.001
    ? `<g opacity="${s.logoOp.toFixed(3)}" transform="translate(${cx} ${cy}) scale(1 ${s.sy.toFixed(4)}) translate(${-cx} ${-cy})"><svg x="${(cx-w/2).toFixed(1)}" y="${(cy-h/2).toFixed(1)}" width="${w}" height="${h.toFixed(1)}" viewBox="80 420 840 170"><g fill="#3b82f6">${GLYPHS}</g></svg></g>`
    : '';
  const blurR = (14 + s.bloom*34).toFixed(0);
  const beam = s.beamOp>0.001
    ? `<g opacity="${s.beamOp.toFixed(3)}"><rect x="${(cx-s.bw/2).toFixed(1)}" y="${(cy-s.bh/2).toFixed(1)}" width="${s.bw.toFixed(1)}" height="${s.bh.toFixed(1)}" rx="${Math.min(s.bw,s.bh)/2}" fill="#9fc6ff" filter="url(#g)"/><rect x="${(cx-s.bw/2).toFixed(1)}" y="${(cy-s.bh/2).toFixed(1)}" width="${s.bw.toFixed(1)}" height="${s.bh.toFixed(1)}" rx="${Math.min(s.bw,s.bh)/2}" fill="#eaf3ff"/></g>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><filter id="g" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur stdDeviation="${blurR}"/></filter></defs>
${bg}${logo}${beam}</svg>`;
}
const tmp=join('renders',`_tv_${FMT}_${MODE}`); rmSync(tmp,{recursive:true,force:true}); mkdirSync(tmp,{recursive:true}); mkdirSync('renders',{recursive:true});
console.log(`TV-off: ${N} frames @ ${W}x${H} (${FMT}/${MODE})`);
for(let f=0;f<N;f++){ const p=join(tmp,`f${String(f).padStart(4,'0')}`); writeFileSync(p+'.svg',frameSVG(f/FPS)); const r=spawnSync('rsvg-convert',['-w',String(W),'-h',String(H),p+'.svg','-o',p+'.png']); if(r.status!==0){console.error('rsvg fail',f,r.stderr?.toString());process.exit(1);} }
const base=`renders/fade-logo-tvoff-${FMT}`;
let r;
if(MODE==='solid'){ r=spawnSync('ffmpeg',['-y','-loglevel','error','-framerate',String(FPS),'-i',join(tmp,'f%04d.png'),'-c:v','libx264','-pix_fmt','yuv420p','-crf','17','-movflags','+faststart',`${base}.mp4`],{stdio:'inherit'}); console.log('Wrote',`${base}.mp4`); }
else { r=spawnSync('ffmpeg',['-y','-loglevel','error','-framerate',String(FPS),'-i',join(tmp,'f%04d.png'),'-c:v','prores_ks','-profile:v','4444','-pix_fmt','yuva444p10le',`${base}-alpha.mov`],{stdio:'inherit'}); console.log('Wrote',`${base}-alpha.mov`); }
rmSync(tmp,{recursive:true,force:true}); if(r.status!==0)process.exit(1);
