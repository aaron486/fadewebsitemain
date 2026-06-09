/* ============================================================================
 * FADE DECK BUILDER — CENTRAL CONFIG
 * ----------------------------------------------------------------------------
 * Everything tunable lives here: design tokens, fonts, the logo, layout
 * defaults, the caption engine's voice (hooks / CTAs / hashtags / footer) and
 * the per-platform caption rules. Change voice & styling in ONE place.
 *
 * Swapping the brand assets later:
 *   - HEADLINE FONT:  drop your .woff2/.otf into  src/deck/fonts/  and point
 *                     FONTS.headline.src + .family at it (see notes there).
 *   - LOGO:           drop your file into  src/deck/assets/  and set
 *                     LOGO.mode = 'image' + LOGO.src. Until then the real FADE
 *                     wordmark (vector) renders via LOGO.mode = 'wordmark'.
 * ==========================================================================*/

/* ---------------------------------------------------------------------------
 * CANVAS / EXPORT
 * Slides are authored against a logical canvas and exported at 2x. Layouts are
 * resolution-independent (everything is expressed relative to W/H + margins),
 * so the SAME slide renders correctly at both aspect ratios.
 * ------------------------------------------------------------------------- */
export const CANVAS = {
  // Selectable working/export aspect ratios.
  ratios: {
    '4:5': { key: '4:5', label: '4:5 — Portrait', w: 1080, h: 1350 },
    '1:1': { key: '1:1', label: '1:1 — Square', w: 1080, h: 1080 },
  },
  defaultRatio: '4:5',
  exportScale: 2, // 1080 logical -> 2160px exported PNG
};

/* ---------------------------------------------------------------------------
 * COLORS / DESIGN TOKENS
 * accentGreen is the placeholder — confirm exact hex and change here only.
 * ------------------------------------------------------------------------- */
export const COLORS = {
  bg: '#0D0D0D', // near-black slide background
  bgPanel: '#141414', // tweet cards / inset panels
  accentGreen: '#39FF14', // PLACEHOLDER — confirm exact brand green
  accentRed: '#FF3B3B', // punchy red for loss / negative callouts
  white: '#FFFFFF',
  offWhite: '#F4F1EA', // warm headline white (matches reference decks)
  textMuted: '#9A9A9A', // kickers, @handles, captions
  divider: '#FFFFFF',
  arrow: '#6E6E6E', // comparison-row arrows
  verified: '#1DA1F2', // tweet verified check
};

/* ---------------------------------------------------------------------------
 * FONTS
 * Headline = heavy condensed, ALL CAPS. Body = Inter.
 *
 * To use YOUR custom headline font:
 *   1. Put the file at e.g. src/deck/fonts/Fade-Display.woff2
 *   2. import it for bundling:  import fadeDisplay from './fonts/Fade-Display.woff2'
 *   3. set headline.src = fadeDisplay  and  headline.family = 'Fade Display'
 * The loader (fonts.js) registers it as a FontFace and Konva re-renders once
 * it's ready. Until you swap, Anton (Google Fonts) stands in.
 * ------------------------------------------------------------------------- */
export const FONTS = {
  headline: {
    family: 'Anton', // PLACEHOLDER headline family
    // Remote stand-in so it works with zero local files. Set `src` to a local
    // import to override (local always wins in fonts.js).
    googleHref:
      'https://fonts.googleapis.com/css2?family=Anton&display=swap',
    src: null, // e.g. import result of your local .woff2
    weight: '400',
    style: 'normal',
    uppercase: true, // headlines force ALL CAPS
    letterSpacing: 0.5,
    lineHeight: 0.98,
  },
  body: {
    family: 'Inter',
    googleHref:
      'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap',
    src: null,
    lineHeight: 1.28,
  },
};

/* ---------------------------------------------------------------------------
 * LOGO — locked top-right, consistent size + margin on every slide.
 * mode: 'wordmark' draws the real FADE vector. 'image' draws LOGO.src.
 * ------------------------------------------------------------------------- */
export const LOGO = {
  mode: 'wordmark', // 'wordmark' | 'image'
  src: null, // set when mode === 'image'
  // Height as a fraction of canvas height; box sits in the top-right safe area.
  heightFrac: 0.028,
  // Subtle rounded container behind the mark.
  container: {
    show: true,
    fill: 'rgba(255,255,255,0.04)',
    cornerRadius: 10,
    padX: 18,
    padY: 12,
  },
};

/* ---------------------------------------------------------------------------
 * LAYOUT / SAFE AREA
 * marginFrac = outer safe margin as a fraction of the SHORT edge (width).
 * ------------------------------------------------------------------------- */
export const LAYOUT = {
  marginFrac: 0.066, // ~71px @ 1080 — consistent safe area on all slides
  dividerWidthFrac: 0.16, // short rule above headlines
  dividerThickness: 5,
  // Headline auto-size search range (as fraction of canvas height). The renderer
  // shrinks the headline until it fits the available width/lines.
  headlineMaxFrac: 0.115,
  headlineMinFrac: 0.05,
  // Per-slide headline size nudge step (multiplier applied on top of auto-size).
  headlineStep: 0.06,
};

/* ---------------------------------------------------------------------------
 * GRAIN — subtle procedural film-grain overlay on the near-black bg.
 * Generated once (grain.js) and tiled. Tune intensity/scale here.
 * ------------------------------------------------------------------------- */
export const GRAIN = {
  enabled: true,
  tile: 160, // px size of the generated noise tile
  opacity: 0.05, // overlay opacity (kept low / subtle)
  intensity: 22, // 0-255 max per-pixel brightness of noise specks
};

/* ---------------------------------------------------------------------------
 * LAYOUTS — selectable per slide. `fields` drives the Inspector form and the
 * caption engine. `subjectAnchor` is the auto-fit default drop position.
 * ------------------------------------------------------------------------- */
export const LAYOUTS = {
  bigHeadline: {
    key: 'bigHeadline',
    label: 'Big Headline + Cutout',
    subjectAnchor: { x: 0.5, y: 0.4, scale: 0.78 }, // center/upper, large
    fields: [
      { key: 'kicker', label: 'Kicker (italic, optional)', type: 'text' },
      { key: 'headline', label: 'Headline', type: 'headline' },
      { key: 'subkicker', label: 'Sub-kicker beneath (optional)', type: 'text' },
    ],
  },
  comparison: {
    key: 'comparison',
    label: 'Comparison — label → result',
    subjectAnchor: { x: 0.5, y: 0.42, scale: 0.7 }, // behind the rows
    fields: [
      { key: 'headline', label: 'Headline', type: 'headline' },
      { key: 'rows', label: 'Rows (label → result)', type: 'rows' },
    ],
  },
  tweet: {
    key: 'tweet',
    label: 'Tweet Repackage',
    subjectAnchor: { x: 0.5, y: 0.74, scale: 0.62 }, // lower portion
    fields: [
      { key: 'headline', label: 'Headline (above cards)', type: 'headline' },
      { key: 'tweets', label: 'Tweet cards', type: 'tweets' },
    ],
  },
  statHero: {
    key: 'statHero',
    label: 'Stat Hero',
    subjectAnchor: { x: 0.5, y: 0.66, scale: 0.62 }, // centered lower
    fields: [
      { key: 'headline', label: 'Giant stat / claim', type: 'headline' },
      { key: 'subhead', label: 'Supporting subhead (2 lines)', type: 'textarea' },
    ],
  },
};
export const LAYOUT_ORDER = ['bigHeadline', 'comparison', 'tweet', 'statHero'];

/* ===========================================================================
 * CAPTION ENGINE — deterministic, client-side, no API.
 * =========================================================================*/

// Editable hook library (seeded).
export const HOOK_LIBRARY = [
  'The pattern nobody wants to talk about.',
  "Sharps already know. The public's about to find out.",
  "This isn't a meme anymore. It's a signal.",
  'Everyone saw it. Almost nobody bet it.',
  "The data doesn't care about your favorite player.",
  'There’s a reason the smart money moved early.',
  "Save this. You'll want it next time.",
  'The tell was there the whole time.',
];

// Editable CTA library (seeded).
export const CTA_LIBRARY = [
  'Tap the link in bio — join as a founding member.',
  'Fade with us. Link in bio.',
  'See who your friends are betting. Link in bio.',
  'Founding member access is open. Bio link.',
  'Get in before launch. Link in bio.',
  'Follow the money on Fade. Link in bio.',
];

// Hashtag pool the engine draws from (deterministically) per platform.
export const HASHTAGS = [
  '#Fade',
  '#FadeApp',
  '#SportsBetting',
  '#BettingTwitter',
  '#GamblingTwitter',
  '#SportsBettingPicks',
  '#BetTogether',
  '#DrakeCurse',
  '#SportsTok',
  '#BettingTok',
  '#FreePicks',
  '#SportsBettingX',
];

/* The always-appended footer block. Editable, but ALWAYS rendered in output.
 * PLACEHOLDER wording — set final compliance copy here. */
export const FOOTER_BLOCK = '21+. Available in select states. Please gamble responsibly.';

/* Per-platform caption structure rules. The generator (captions.js) reads these.
 *   X      = punchy 1–2 lines, 1 hashtag
 *   IG     = hook + 1–2 support lines + CTA + 5–8 hashtags
 *   TikTok = hook + CTA + 3–4 hashtags
 * Footer is appended on every platform. */
export const CAPTION_RULES = {
  x: { label: 'X / Twitter', maxSupportLines: 1, hashtags: 1, includeCTA: false },
  instagram: { label: 'Instagram', maxSupportLines: 2, hashtags: 7, includeCTA: true },
  tiktok: { label: 'TikTok', maxSupportLines: 0, hashtags: 4, includeCTA: true },
};
export const PLATFORM_ORDER = ['x', 'instagram', 'tiktok'];

/* ---------------------------------------------------------------------------
 * STARTER DECK — pre-populated so the app shows something working on load.
 * Three slides across three different layouts.
 * ------------------------------------------------------------------------- */
export const STARTER_DECK = {
  name: 'The Drake Curse',
  ratio: '4:5',
  slides: [
    {
      layout: 'statHero',
      subject: null,
      data: {
        headline: 'THE DRAKE CURSE IS OFFICIALLY OUT OF HAND',
        greenWords: ['CURSE'],
        subhead: "He's never beating the allegations.\nThe receipts keep stacking.",
      },
    },
    {
      layout: 'comparison',
      subject: null,
      data: {
        headline: 'WHEN DRAKE BACKS A FAVORITE',
        greenWords: [],
        rows: [
          { label: 'McGregor', result: 'L', color: 'red' },
          { label: 'Argentina', result: 'WIN', color: 'green' },
          { label: 'Alabama (CFP)', result: 'L', color: 'red' },
        ],
      },
    },
    {
      layout: 'bigHeadline',
      subject: null,
      data: {
        kicker: 'Drake will post again.',
        headline: 'WILL YOU BE READY',
        greenWords: ['READY'],
        subkicker: 'The next jersey photo is a signal. Know what to do.',
      },
    },
  ],
};
