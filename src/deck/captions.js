/* Deterministic, client-side caption generator. No API, no randomness at call
 * time — the same deck + same hook/CTA selection always produces the same copy.
 * Generates one caption SET for the whole carousel (carousels post as a unit),
 * per platform, following CAPTION_RULES. The FOOTER_BLOCK is always appended. */
import {
  HOOK_LIBRARY,
  CTA_LIBRARY,
  HASHTAGS,
  FOOTER_BLOCK,
  CAPTION_RULES,
  PLATFORM_ORDER,
} from './config.js';

// Tiny stable string hash (FNV-1a-ish) for deterministic default picks.
export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function deckFingerprint(deck) {
  const parts = [deck.name || ''];
  (deck.slides || []).forEach((s) => {
    const d = s.data || {};
    parts.push(d.headline || '', d.subhead || '', d.kicker || '', d.subkicker || '');
    (d.rows || []).forEach((r) => parts.push(r.label || '', r.result || ''));
    (d.tweets || []).forEach((t) => parts.push(t.name || '', t.body || ''));
  });
  return parts.join('|');
}

function clean(str) {
  return (str || '').replace(/\s+/g, ' ').trim();
}

// A readable, sentence-cased version of an ALL-CAPS headline.
function sentenceCase(str) {
  const s = clean(str).toLowerCase();
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Gather support snippets from across the deck (deduped, in order).
function collectSupport(deck) {
  const out = [];
  const seen = new Set();
  const push = (v) => {
    const c = clean(v).replace(/\n/g, ' ');
    if (c && !seen.has(c.toLowerCase())) {
      seen.add(c.toLowerCase());
      out.push(c);
    }
  };
  (deck.slides || []).forEach((s) => {
    const d = s.data || {};
    push(d.kicker);
    push(d.subkicker);
    if (d.subhead) d.subhead.split('\n').forEach(push);
  });
  return out;
}

// Pick `count` hashtags deterministically, rotating by seed.
function pickHashtags(count, seed) {
  if (count <= 0) return [];
  const tags = [];
  const used = new Set();
  let i = seed % HASHTAGS.length;
  while (tags.length < Math.min(count, HASHTAGS.length)) {
    if (!used.has(i)) {
      used.add(i);
      tags.push(HASHTAGS[i]);
    }
    i = (i + 1) % HASHTAGS.length;
  }
  return tags;
}

/* Generate the full caption set.
 * opts: { hookIndex, ctaIndex } — when omitted, picked deterministically. */
export function generateCaptions(deck, opts = {}) {
  const fp = deckFingerprint(deck);
  const seed = hashString(fp);

  const hookIndex =
    Number.isInteger(opts.hookIndex) ? opts.hookIndex : seed % HOOK_LIBRARY.length;
  const ctaIndex =
    Number.isInteger(opts.ctaIndex) ? opts.ctaIndex : (seed >> 3) % CTA_LIBRARY.length;

  const hook = HOOK_LIBRARY[((hookIndex % HOOK_LIBRARY.length) + HOOK_LIBRARY.length) % HOOK_LIBRARY.length];
  const cta = CTA_LIBRARY[((ctaIndex % CTA_LIBRARY.length) + CTA_LIBRARY.length) % CTA_LIBRARY.length];

  const firstHeadline = sentenceCase(
    (deck.slides || []).map((s) => s.data?.headline).find(Boolean) || deck.name || ''
  );
  const support = collectSupport(deck);

  const out = {};
  for (const platform of PLATFORM_ORDER) {
    const rule = CAPTION_RULES[platform];
    const lines = [];

    // Hook line
    lines.push(hook);

    // Headline as the lead beat (X keeps it tight)
    if (firstHeadline) {
      if (platform === 'x') lines[0] = `${hook} ${firstHeadline}.`;
      else lines.push(firstHeadline + '.');
    }

    // Support lines
    const supportSlice = support.slice(0, rule.maxSupportLines);
    supportSlice.forEach((s) => lines.push(s));

    // CTA
    if (rule.includeCTA) lines.push(cta);

    // Hashtags
    const tags = pickHashtags(rule.hashtags, seed + platform.length);
    const body = lines.filter(Boolean).join('\n');
    const tagLine = tags.length ? '\n\n' + tags.join(' ') : '';

    // Footer block — ALWAYS appended.
    const footer = `\n\n${FOOTER_BLOCK}`;

    out[platform] = `${body}${tagLine}${footer}`.trim();
  }

  return { captions: out, hookIndex, ctaIndex };
}
