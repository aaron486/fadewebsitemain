/* Export: render every slide at every requested ratio at 2x using imperative
 * Konva (reusing the exact same scene graph as the editor), bundle the PNGs
 * plus a captions file into a single zip via JSZip. */
import Konva from 'konva';
import JSZip from 'jszip';
import { CANVAS, PLATFORM_ORDER, CAPTION_RULES } from './config.js';
import { buildScene, subjectBox } from './layouts.js';

// Cache of loaded HTMLImageElements by src (dataURL).
const imageCache = new Map();
export function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src));
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => {
      imageCache.set(src, im);
      resolve(im);
    };
    im.onerror = reject;
    im.src = src;
  });
}

function buildKonvaNode(node, { grainImage, subjectImage, subjectTransform, canvasW, canvasH }) {
  switch (node.type) {
    case 'rect':
      return new Konva.Rect({
        x: node.x, y: node.y, width: node.width, height: node.height,
        fill: node.fill, cornerRadius: node.cornerRadius, opacity: node.opacity,
        stroke: node.stroke, strokeWidth: node.strokeWidth,
      });
    case 'grain':
      return grainImage
        ? new Konva.Rect({
            x: node.x, y: node.y, width: node.width, height: node.height,
            fillPatternImage: grainImage, fillPatternRepeat: 'repeat', opacity: node.opacity,
          })
        : null;
    case 'text':
      return new Konva.Text({
        x: node.x, y: node.y, text: node.text, width: node.width,
        fontFamily: node.fontFamily, fontSize: node.fontSize, fontStyle: node.fontStyle,
        fill: node.fill, align: node.align, lineHeight: node.lineHeight,
        letterSpacing: node.letterSpacing, wrap: 'word',
      });
    case 'line':
      return new Konva.Line({
        points: node.points, stroke: node.stroke, strokeWidth: node.strokeWidth, lineCap: node.lineCap,
      });
    case 'path':
      return new Konva.Path({ data: node.data, x: node.x, y: node.y, fill: node.fill });
    case 'circle':
      return new Konva.Circle({
        x: node.x, y: node.y, radius: node.radius, fill: node.fill,
        stroke: node.stroke, strokeWidth: node.strokeWidth,
      });
    case 'image':
      return new Konva.Image({
        image: node.image, x: node.x, y: node.y, width: node.width, height: node.height,
      });
    case 'group': {
      const g = new Konva.Group({
        x: node.x, y: node.y, scaleX: node.scaleX, scaleY: node.scaleY, opacity: node.opacity,
      });
      (node.children || []).forEach((c) => {
        const kn = buildKonvaNode(c, { grainImage, subjectImage, subjectTransform, canvasW, canvasH });
        if (kn) g.add(kn);
      });
      return g;
    }
    case 'subject': {
      if (!subjectImage || !subjectTransform) return null;
      const box = subjectBox(subjectTransform, subjectImage, canvasW, canvasH);
      if (!box) return null;
      return new Konva.Image({
        image: subjectImage,
        x: box.x + box.width / 2,
        y: box.y + box.height / 2,
        width: box.width,
        height: box.height,
        offsetX: box.width / 2,
        offsetY: box.height / 2,
        scaleX: subjectTransform.flipX ? -1 : 1,
      });
    }
    default:
      return null;
  }
}

/* Render a single slide at one ratio to a PNG dataURL at 2x. */
async function renderSlidePNG(slide, ratioKey, { grainImage, logoImage }) {
  const { w, h } = CANVAS.ratios[ratioKey];
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  document.body.appendChild(container);

  const stage = new Konva.Stage({ container, width: w, height: h });
  const layer = new Konva.Layer();
  stage.add(layer);

  const subjectImage = slide.subject?.src ? await loadImage(slide.subject.src) : null;
  const scene = buildScene(slide, w, h, { logoImage });
  scene.forEach((node) => {
    const kn = buildKonvaNode(node, {
      grainImage, subjectImage, subjectTransform: slide.subject?.transform, canvasW: w, canvasH: h,
    });
    if (kn) layer.add(kn);
  });
  layer.draw();

  const dataURL = stage.toDataURL({ pixelRatio: CANVAS.exportScale, mimeType: 'image/png' });
  stage.destroy();
  container.remove();
  return dataURL;
}

function dataURLtoUint8(dataURL) {
  const b64 = dataURL.split(',')[1];
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function captionsText(deck, captions) {
  const lines = [`FADE CAROUSEL CAPTIONS — ${deck.name || 'Untitled'}`, '='.repeat(48), ''];
  for (const platform of PLATFORM_ORDER) {
    lines.push(`### ${CAPTION_RULES[platform].label}`);
    lines.push('');
    lines.push(captions[platform] || '');
    lines.push('');
    lines.push('-'.repeat(48));
    lines.push('');
  }
  return lines.join('\n');
}

function slugify(name) {
  return (name || 'fade-deck').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'fade-deck';
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* Export the whole deck. ratios = array of ratio keys e.g. ['4:5','1:1'].
 * onProgress(done, total) optional. */
export async function exportDeck(deck, { ratios, captions, grainImage, logoImage, onProgress } = {}) {
  const zip = new JSZip();
  const ratioKeys = ratios && ratios.length ? ratios : Object.keys(CANVAS.ratios);
  const total = deck.slides.length * ratioKeys.length;
  let done = 0;

  for (const ratioKey of ratioKeys) {
    const folderName = ratioKey.replace(':', 'x'); // 4x5 / 1x1
    const folder = zip.folder(folderName);
    for (let i = 0; i < deck.slides.length; i++) {
      const dataURL = await renderSlidePNG(deck.slides[i], ratioKey, { grainImage, logoImage });
      const idx = String(i + 1).padStart(2, '0');
      folder.file(`slide-${idx}.png`, dataURLtoUint8(dataURL));
      done++;
      onProgress?.(done, total);
    }
  }

  if (captions) {
    zip.file('captions.txt', captionsText(deck, captions));
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, `${slugify(deck.name)}.zip`);
}
