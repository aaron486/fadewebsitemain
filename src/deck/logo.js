/* The real FADE wordmark as scene nodes. Vector path data lifted from
 * public/assets/fade-logo.svg (intrinsic art box: 840×170, origin offset
 * 80,420). We normalize to a 0,0 / 840×170 group and scale to fit. */
import { COLORS, LOGO } from './config.js';

// Four glyph shapes (F, A, D, E) as SVG path data in the original coord space.
const GLYPHS = [
  // A
  'M231.7,573.7 L370,426.3 L430.5,426.3 L468.8,573.7 L348.9,573.7 L348.9,541.4 L403.7,541.4 L390,488.4 L304,573.7 Z',
  // D
  'M684,426.3H517l-48.2,147.4H634l22.9-14.7l36.9-113.3L684,426.3z M596.5,541.8H547l26.9-82.6h49.5L596.5,541.8z',
  // E
  'M775.7,459.1 L766.2,488.2 L848.3,488.2 L840.5,511.8 L758.5,511.8 L748.7,541.8 L858.7,541.8 L848.3,573.7 L674.4,573.7 L722.4,426.3 L896.3,426.3 L885.6,459.1 Z',
  // F
  'M207,458.6 L197.7,487.8 L275.6,488.4 L254.3,511 L190.1,511 L169.9,573.7 L103.7,573.7 L151.8,426.3 L333.8,426.3 L303.2,458.9 Z',
];

const ART_W = 840;
const ART_H = 170;
const ORIGIN_X = 80;
const ORIGIN_Y = 420;

/* Returns the logo scene node (a group), locked to the top-right safe area. */
export function logoNode({ canvasW, canvasH, margin, image }) {
  const targetH = canvasH * LOGO.heightFrac;
  const scale = targetH / ART_H;
  const targetW = ART_W * scale;

  // Wordmark group: glyphs translated into 0,0 space, then scaled.
  const wordmark = {
    type: 'group',
    children: GLYPHS.map((d) => ({
      type: 'path',
      data: d,
      x: -ORIGIN_X,
      y: -ORIGIN_Y,
      fill: COLORS.white,
      listening: false,
    })),
  };

  let markNode;
  let markW = targetW;
  let markH = targetH;
  if (LOGO.mode === 'image' && image) {
    const aspect = image.width / image.height;
    markH = targetH;
    markW = targetH * aspect;
    markNode = {
      type: 'image',
      image,
      x: 0,
      y: 0,
      width: markW,
      height: markH,
      listening: false,
    };
  } else {
    markNode = { ...wordmark, scaleX: scale, scaleY: scale };
  }

  const c = LOGO.container;
  const boxW = markW + (c.show ? c.padX * 2 : 0);
  const boxH = markH + (c.show ? c.padY * 2 : 0);
  const boxX = canvasW - margin - boxW;
  const boxY = margin;

  const children = [];
  if (c.show) {
    children.push({
      type: 'rect',
      x: 0,
      y: 0,
      width: boxW,
      height: boxH,
      fill: c.fill,
      cornerRadius: c.cornerRadius,
      listening: false,
    });
  }
  children.push({
    ...markNode,
    x: (markNode.x || 0) + (c.show ? c.padX : 0),
    y: (markNode.y || 0) + (c.show ? c.padY : 0),
  });

  return { type: 'group', x: boxX, y: boxY, children, listening: false };
}
