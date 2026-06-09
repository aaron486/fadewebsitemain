/* Text measurement + layout helpers used at *layout time* so the scene renderer
 * stays dumb (it only ever draws simple text nodes). This is where headline
 * word-wrapping, auto-sizing, and the per-keyword green toggle happen. */
import { COLORS, FONTS } from './config.js';

// Shared offscreen 2d context for measuring.
let measureCtx = null;
function ctx() {
  if (!measureCtx) {
    const c = document.createElement('canvas');
    measureCtx = c.getContext('2d');
  }
  return measureCtx;
}

export function fontString({ family, size, weight = '400', style = 'normal' }) {
  return `${style} ${weight} ${size}px "${family}"`;
}

// Width of a string including approximate letter-spacing.
export function measure(text, font, letterSpacing = 0) {
  const c = ctx();
  c.font = font;
  const w = c.measureText(text).width;
  const ls = letterSpacing * Math.max(0, text.length - 1);
  return w + ls;
}

/* Word-wrap into lines that each fit `maxWidth` at the given font. */
function wrapLines(words, font, letterSpacing, maxWidth) {
  const lines = [];
  let line = [];
  for (const word of words) {
    const trial = [...line, word].join(' ');
    if (measure(trial, font, letterSpacing) <= maxWidth || line.length === 0) {
      line.push(word);
    } else {
      lines.push(line);
      line = [word];
    }
  }
  if (line.length) lines.push(line);
  return lines;
}

/* Build positioned, per-word text nodes for a headline.
 * - Auto-sizes the font down until it fits `maxWidth` and `maxLines`.
 * - Words listed in `greenWords` (case-insensitive) render in accentGreen.
 * Returns { nodes, fontSize, height, lineCount }.
 */
export function buildHeadline({
  text,
  greenWords = [],
  x,
  y,
  maxWidth,
  align = 'left',
  maxLines = 4,
  maxFontSize,
  minFontSize,
  fill = COLORS.offWhite,
  greenFill = COLORS.accentGreen,
}) {
  const family = FONTS.headline.family;
  const ls = FONTS.headline.letterSpacing;
  const lineHeightMul = FONTS.headline.lineHeight;
  const raw = FONTS.headline.uppercase ? (text || '').toUpperCase() : text || '';
  const words = raw.split(/\s+/).filter(Boolean);
  const greenSet = new Set(
    greenWords
      .filter(Boolean)
      .map((w) => (FONTS.headline.uppercase ? w.toUpperCase() : w).trim())
  );

  if (words.length === 0) {
    return { nodes: [], fontSize: minFontSize, height: 0, lineCount: 0 };
  }

  // Search largest font size that fits width + line budget.
  let chosen = minFontSize;
  let chosenLines = [[...words]];
  for (let size = Math.round(maxFontSize); size >= minFontSize; size -= 2) {
    const font = fontString({ family, size });
    const lines = wrapLines(words, font, ls, maxWidth);
    const fits =
      lines.length <= maxLines &&
      lines.every((ln) => measure(ln.join(' '), font, ls) <= maxWidth);
    if (fits) {
      chosen = size;
      chosenLines = lines;
      break;
    }
    chosenLines = lines; // keep last (smallest) as fallback
    chosen = size;
  }

  const fontSize = chosen;
  const lineH = fontSize * lineHeightMul;
  const font = fontString({ family, size: fontSize });
  const spaceW = measure(' ', font, ls);
  const nodes = [];

  chosenLines.forEach((lineWords, li) => {
    const lineText = lineWords.join(' ');
    const lineW = measure(lineText, font, ls);
    let cursor = align === 'center' ? x + (maxWidth - lineW) / 2 : x;
    const lineY = y + li * lineH;
    lineWords.forEach((word) => {
      const wWidth = measure(word, font, ls);
      const isGreen = greenSet.has(word.replace(/[^\p{L}\p{N}]/gu, ''));
      nodes.push({
        type: 'text',
        x: cursor,
        y: lineY,
        text: word,
        fontFamily: family,
        fontSize,
        letterSpacing: ls,
        fill: isGreen ? greenFill : fill,
        listening: false,
      });
      cursor += wWidth + spaceW;
    });
  });

  return {
    nodes,
    fontSize,
    height: chosenLines.length * lineH,
    lineCount: chosenLines.length,
  };
}
