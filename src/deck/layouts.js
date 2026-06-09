/* Layout engine. Each layout is a pure function: (slide, ctx) -> SceneNode[].
 * The array order IS the z-order. A `{type:'subject'}` marker reserves the
 * subject's z-position; the renderer/exporter paint the actual cutout there
 * using the slide's normalized transform. Both the editor and the PNG exporter
 * consume this same scene, so there is one source of truth for every layout. */
import { COLORS, FONTS, LAYOUT, GRAIN } from './config.js';
import { buildHeadline, fontString, measure } from './text.js';
import { logoNode } from './logo.js';

// ---- shared scaffolding ----------------------------------------------------
function baseContext(slide, canvasW, canvasH) {
  const margin = Math.round(LAYOUT.marginFrac * canvasW);
  return {
    canvasW,
    canvasH,
    margin,
    contentW: canvasW - margin * 2,
    headlineScale: slide.headlineScale || 1, // per-slide size nudge
  };
}

function background(ctx) {
  const nodes = [
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: ctx.canvasW,
      height: ctx.canvasH,
      fill: COLORS.bg,
      name: 'bg', // editor uses this to deselect on click
    },
  ];
  if (GRAIN.enabled) {
    nodes.push({
      type: 'grain',
      x: 0,
      y: 0,
      width: ctx.canvasW,
      height: ctx.canvasH,
      opacity: GRAIN.opacity,
      listening: false,
    });
  }
  return nodes;
}

function divider(x, y, ctx, color = COLORS.divider) {
  return {
    type: 'line',
    points: [x, y, x + ctx.canvasW * LAYOUT.dividerWidthFrac, y],
    stroke: color,
    strokeWidth: LAYOUT.dividerThickness,
    lineCap: 'round',
    listening: false,
  };
}

function bodyText(props) {
  return {
    type: 'text',
    fontFamily: FONTS.body.family,
    lineHeight: FONTS.body.lineHeight,
    fill: COLORS.white,
    listening: false,
    ...props,
  };
}

function headlineSizes(ctx) {
  return {
    maxFontSize: LAYOUT.headlineMaxFrac * ctx.canvasH * ctx.headlineScale,
    minFontSize: LAYOUT.headlineMinFrac * ctx.canvasH,
  };
}

// ---- LAYOUT 1: Big Headline + Cutout --------------------------------------
function bigHeadline(slide, ctx) {
  const d = slide.data || {};
  const nodes = [...background(ctx), { type: 'subject' }];
  const { canvasH, canvasW, margin, contentW } = ctx;
  const { maxFontSize, minFontSize } = headlineSizes(ctx);
  const gap = canvasH * 0.02;

  let bottom = canvasH - margin;

  // sub-kicker (italic body) pinned lowest
  if (d.subkicker) {
    const fs = canvasH * 0.026;
    nodes.push(
      bodyText({
        x: margin,
        y: bottom - fs * 1.3,
        width: contentW,
        text: d.subkicker,
        fontSize: fs,
        fontStyle: 'italic',
        fill: COLORS.textMuted,
      })
    );
    bottom = bottom - fs * 1.3 - gap;
  }

  // headline (built first to know its height, then placed bottom-up)
  const hl = buildHeadline({
    text: d.headline || '',
    greenWords: d.greenWords,
    x: margin,
    y: 0,
    maxWidth: contentW,
    align: 'left',
    maxLines: 4,
    maxFontSize,
    minFontSize,
  });
  const headlineY = bottom - hl.height;
  hl.nodes.forEach((n) => nodes.push({ ...n, y: n.y + headlineY }));
  bottom = headlineY - gap * 0.8;

  // kicker (italic body) above headline
  if (d.kicker) {
    const fs = canvasH * 0.03;
    nodes.push(
      bodyText({
        x: margin,
        y: bottom - fs * 1.2,
        width: contentW,
        text: d.kicker,
        fontSize: fs,
        fontStyle: 'italic',
        fill: COLORS.offWhite,
      })
    );
    bottom = bottom - fs * 1.2 - gap * 0.6;
  }

  // divider above everything
  nodes.push(divider(margin, bottom - LAYOUT.dividerThickness, ctx));

  nodes.push(logoNode({ canvasW, canvasH, margin, image: ctx.logoImage }));
  return nodes;
}

// ---- LAYOUT 2: Comparison (label -> result) -------------------------------
function comparison(slide, ctx) {
  const d = slide.data || {};
  const nodes = [...background(ctx), { type: 'subject' }];
  const { canvasH, canvasW, margin, contentW } = ctx;
  const { maxFontSize, minFontSize } = headlineSizes(ctx);

  // headline near top
  nodes.push(divider(margin, margin + canvasH * 0.05, ctx));
  const hl = buildHeadline({
    text: d.headline || '',
    greenWords: d.greenWords,
    x: margin,
    y: margin + canvasH * 0.075,
    maxWidth: contentW,
    align: 'left',
    maxLines: 3,
    maxFontSize: maxFontSize * 0.7,
    minFontSize,
  });
  hl.nodes.forEach((n) => nodes.push(n));

  // rows centered in the lower 55% of the canvas
  const rows = Array.isArray(d.rows) ? d.rows.slice(0, 4) : [];
  const rowFont = fontString({ family: FONTS.headline.family, size: canvasH * 0.058 });
  const rowFs = canvasH * 0.058;
  const arrowFont = fontString({ family: FONTS.body.family, size: canvasH * 0.05, weight: '400' });
  const arrowFs = canvasH * 0.05;
  const rowH = canvasH * 0.11;
  const blockH = rows.length * rowH;
  const areaTop = margin + canvasH * 0.075 + hl.height + canvasH * 0.04;
  const areaBottom = canvasH - margin;
  let startY = areaTop + Math.max(0, (areaBottom - areaTop - blockH) / 2);

  rows.forEach((row, i) => {
    const label = (row.label || '').toUpperCase();
    const result = (row.result || '').toUpperCase();
    const arrow = '→';
    const labelW = measure(label, rowFont, FONTS.headline.letterSpacing);
    const arrowW = measure(`  ${arrow}  `, arrowFont);
    const resultW = measure(result, rowFont, FONTS.headline.letterSpacing);
    const total = labelW + arrowW + resultW;
    let x = ctx.canvasW / 2 - total / 2;
    const y = startY + i * rowH;
    const resultColor = row.color === 'green' ? COLORS.accentGreen : COLORS.accentRed;

    nodes.push({
      type: 'text',
      x,
      y,
      text: label,
      fontFamily: FONTS.headline.family,
      fontSize: rowFs,
      letterSpacing: FONTS.headline.letterSpacing,
      fill: COLORS.offWhite,
      listening: false,
    });
    x += labelW;
    nodes.push({
      type: 'text',
      x,
      y: y + (rowFs - arrowFs) * 0.55,
      text: `  ${arrow}  `,
      fontFamily: FONTS.body.family,
      fontSize: arrowFs,
      fill: COLORS.arrow,
      listening: false,
    });
    x += arrowW;
    nodes.push({
      type: 'text',
      x,
      y,
      text: result,
      fontFamily: FONTS.headline.family,
      fontSize: rowFs,
      letterSpacing: FONTS.headline.letterSpacing,
      fill: resultColor,
      listening: false,
    });
  });

  nodes.push(logoNode({ canvasW, canvasH, margin, image: ctx.logoImage }));
  return nodes;
}

// ---- LAYOUT 3: Tweet Repackage --------------------------------------------
function tweetRepackage(slide, ctx) {
  const d = slide.data || {};
  // subject sits lowest (behind cards)
  const nodes = [...background(ctx), { type: 'subject' }];
  const { canvasH, canvasW, margin, contentW } = ctx;
  const { maxFontSize, minFontSize } = headlineSizes(ctx);

  // headline above the cards
  const hl = buildHeadline({
    text: d.headline || '',
    greenWords: d.greenWords,
    x: margin,
    y: margin + canvasH * 0.04,
    maxWidth: contentW,
    align: 'left',
    maxLines: 2,
    maxFontSize: maxFontSize * 0.62,
    minFontSize,
  });
  hl.nodes.forEach((n) => nodes.push(n));

  let cardY = margin + canvasH * 0.04 + hl.height + canvasH * 0.03;
  const tweets = Array.isArray(d.tweets) ? d.tweets.slice(0, 2) : [];
  const pad = canvasW * 0.04;
  const avatarR = canvasH * 0.028;
  const nameFs = canvasH * 0.026;
  const handleFs = canvasH * 0.022;
  const bodyFs = canvasH * 0.03;

  tweets.forEach((t) => {
    const bodyTextStr = t.body || '';
    // estimate wrapped body height
    const bodyFont = fontString({ family: FONTS.body.family, size: bodyFs });
    const innerW = contentW - pad * 2;
    const approxLines = Math.max(
      1,
      Math.ceil(measure(bodyTextStr, bodyFont) / innerW)
    );
    const headerH = avatarR * 2;
    const cardH = pad * 2 + headerH + canvasH * 0.018 + approxLines * bodyFs * FONTS.body.lineHeight;

    // card panel
    nodes.push({
      type: 'rect',
      x: margin,
      y: cardY,
      width: contentW,
      height: cardH,
      fill: COLORS.bgPanel,
      cornerRadius: canvasW * 0.022,
      stroke: 'rgba(255,255,255,0.08)',
      strokeWidth: 1.5,
      listening: false,
    });
    // avatar
    nodes.push({
      type: 'circle',
      x: margin + pad + avatarR,
      y: cardY + pad + avatarR,
      radius: avatarR,
      fill: '#2A2A2A',
      listening: false,
    });
    // name
    const nameX = margin + pad + avatarR * 2 + canvasW * 0.025;
    nodes.push({
      type: 'text',
      x: nameX,
      y: cardY + pad,
      text: t.name || 'Display Name',
      fontFamily: FONTS.body.family,
      fontStyle: '700',
      fontSize: nameFs,
      fill: COLORS.white,
      listening: false,
    });
    // verified check
    if (t.verified) {
      const vx = nameX + measure(t.name || 'Display Name', fontString({ family: FONTS.body.family, size: nameFs, weight: '700' })) + canvasW * 0.012;
      nodes.push({
        type: 'circle',
        x: vx + nameFs * 0.45,
        y: cardY + pad + nameFs * 0.45,
        radius: nameFs * 0.5,
        fill: COLORS.verified,
        listening: false,
      });
      nodes.push({
        type: 'text',
        x: vx + nameFs * 0.18,
        y: cardY + pad + nameFs * 0.1,
        text: '✓',
        fontFamily: FONTS.body.family,
        fontSize: nameFs * 0.6,
        fill: COLORS.white,
        listening: false,
      });
    }
    // handle
    nodes.push({
      type: 'text',
      x: nameX,
      y: cardY + pad + nameFs * 1.25,
      text: t.handle || '@handle',
      fontFamily: FONTS.body.family,
      fontSize: handleFs,
      fill: COLORS.textMuted,
      listening: false,
    });
    // body
    nodes.push({
      type: 'text',
      x: margin + pad,
      y: cardY + pad + headerH + canvasH * 0.018,
      width: innerW,
      text: bodyTextStr,
      fontFamily: FONTS.body.family,
      fontSize: bodyFs,
      lineHeight: FONTS.body.lineHeight,
      fill: COLORS.offWhite,
      listening: false,
    });

    cardY += cardH + canvasH * 0.022;
  });

  nodes.push(logoNode({ canvasW, canvasH, margin, image: ctx.logoImage }));
  return nodes;
}

// ---- LAYOUT 4: Stat Hero ---------------------------------------------------
function statHero(slide, ctx) {
  const d = slide.data || {};
  const nodes = [...background(ctx), { type: 'subject' }];
  const { canvasH, canvasW, margin, contentW } = ctx;
  const { maxFontSize, minFontSize } = headlineSizes(ctx);

  // giant headline across top
  const hl = buildHeadline({
    text: d.headline || '',
    greenWords: d.greenWords,
    x: margin,
    y: margin + canvasH * 0.03,
    maxWidth: contentW,
    align: 'center',
    maxLines: 4,
    maxFontSize: maxFontSize * 1.05,
    minFontSize,
  });
  hl.nodes.forEach((n) => nodes.push(n));

  // 2-line subhead below
  if (d.subhead) {
    const fs = canvasH * 0.028;
    nodes.push(
      bodyText({
        x: margin,
        y: margin + canvasH * 0.03 + hl.height + canvasH * 0.025,
        width: contentW,
        text: d.subhead,
        fontSize: fs,
        align: 'center',
        fill: COLORS.textMuted,
      })
    );
  }

  nodes.push(logoNode({ canvasW, canvasH, margin, image: ctx.logoImage }));
  return nodes;
}

const BUILDERS = {
  bigHeadline,
  comparison,
  tweet: tweetRepackage,
  statHero,
};

/* Build the scene for one slide. extra = { logoImage } (optional). */
export function buildScene(slide, canvasW, canvasH, extra = {}) {
  const ctx = { ...baseContext(slide, canvasW, canvasH), ...extra };
  const builder = BUILDERS[slide.layout] || bigHeadline;
  return builder(slide, ctx);
}

/* Compute the subject's pixel box from its normalized transform. */
export function subjectBox(transform, image, canvasW, canvasH) {
  if (!transform || !image) return null;
  const aspect = image.width / image.height || 1;
  const width = transform.wFrac * canvasW;
  const height = width / aspect;
  return {
    width,
    height,
    x: transform.cx * canvasW - width / 2,
    y: transform.cy * canvasH - height / 2,
  };
}

/* Default normalized transform when a subject is dropped onto a layout. */
export function defaultTransform(layoutKey, image, canvasW, canvasH) {
  const anchor =
    (
      {
        bigHeadline: { x: 0.5, y: 0.4, scale: 0.78 },
        comparison: { x: 0.5, y: 0.42, scale: 0.7 },
        tweet: { x: 0.5, y: 0.74, scale: 0.62 },
        statHero: { x: 0.5, y: 0.66, scale: 0.62 },
      }[layoutKey]
    ) || { x: 0.5, y: 0.5, scale: 0.7 };
  const aspect = image.width / image.height || 1;
  const heightPx = anchor.scale * canvasH;
  const widthPx = heightPx * aspect;
  return {
    cx: anchor.x,
    cy: anchor.y,
    wFrac: widthPx / canvasW,
    flipX: false,
  };
}
