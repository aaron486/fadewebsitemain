/* Font loading. Canvas (Konva) only paints text once the font is actually
 * available, so we load both fonts up front and resolve when ready, then the
 * app forces one re-render. Local custom fonts (FONTS.*.src) take precedence
 * over the Google stand-in. */
import { FONTS } from './config.js';

let readyPromise = null;

function injectGoogle(href) {
  if (!href) return;
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

async function registerLocal(spec) {
  // spec.src is a bundler URL to a .woff2/.otf/.ttf
  if (!spec.src) return;
  try {
    const face = new FontFace(spec.family, `url(${spec.src})`, {
      weight: spec.weight || '400',
      style: spec.style || 'normal',
    });
    await face.load();
    document.fonts.add(face);
  } catch (e) {
    console.warn(`[fonts] could not load local "${spec.family}"`, e);
  }
}

export function loadFonts() {
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    // Prefer local files when provided; otherwise pull the Google stand-in.
    if (FONTS.headline.src) await registerLocal(FONTS.headline);
    else injectGoogle(FONTS.headline.googleHref);

    if (FONTS.body.src) await registerLocal(FONTS.body);
    else injectGoogle(FONTS.body.googleHref);

    // Nudge the browser to actually fetch the families we care about.
    const probes = [
      `400 64px "${FONTS.headline.family}"`,
      `400 24px "${FONTS.body.family}"`,
      `700 24px "${FONTS.body.family}"`,
    ];
    try {
      await Promise.all(probes.map((p) => document.fonts.load(p)));
      await document.fonts.ready;
    } catch {
      /* non-fatal — fall back to system fonts */
    }
  })();

  return readyPromise;
}
