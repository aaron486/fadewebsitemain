/* Procedural film-grain tile, generated once and reused as a Konva fill
 * pattern image. Subtle monochrome noise on transparent so it can overlay the
 * near-black background at low opacity. */
import { GRAIN } from './config.js';

let cachedTile = null;
let cachedPromise = null;

function buildTile() {
  const size = GRAIN.tile;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    // Deterministic-ish speckle: Math.random is fine here, it's a static tile.
    const v = (Math.random() * GRAIN.intensity) | 0;
    data[i] = 255; // store as white speck...
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = v; // ...with low alpha for subtle grain
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/* Returns a loaded HTMLImageElement of the grain tile (cached). */
export function getGrainImage() {
  if (cachedTile) return Promise.resolve(cachedTile);
  if (cachedPromise) return cachedPromise;
  cachedPromise = new Promise((resolve) => {
    const canvas = buildTile();
    const im = new Image();
    im.onload = () => {
      cachedTile = im;
      resolve(im);
    };
    im.src = canvas.toDataURL('image/png');
  });
  return cachedPromise;
}
