// Encrypts scripts/tracker-content.html into public/progress.html using a
// password. Only AES-GCM ciphertext ships in the output — the plaintext and
// the password never touch the repo.
//
// Usage:
//   TRACKER_PASSWORD='your-strong-password' node scripts/encrypt-tracker.mjs
//   (or)  node scripts/encrypt-tracker.mjs 'your-strong-password'
//
// Re-run any time you change tracker-content.html or want a new password.

import { webcrypto as crypto } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ITERATIONS = 250000;

const password = process.env.TRACKER_PASSWORD || process.argv[2];
if (!password) {
  console.error("Missing password.\nUsage: TRACKER_PASSWORD='your-password' node scripts/encrypt-tracker.mjs");
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password should be at least 8 characters (longer = harder to brute-force).');
  process.exit(1);
}

const content = readFileSync(join(__dirname, 'tracker-content.html'), 'utf8');
const template = readFileSync(join(__dirname, 'progress.template.html'), 'utf8');

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));

const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
  keyMaterial,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt']
);
const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(content));

const b64 = (buf) => Buffer.from(buf).toString('base64');
const payload = {
  salt: b64(salt),
  iv: b64(iv),
  iter: ITERATIONS,
  ct: b64(new Uint8Array(ct)),
};

if (!template.includes('/*__PAYLOAD__*/null')) {
  console.error('Template is missing the /*__PAYLOAD__*/null marker.');
  process.exit(1);
}

// Optional shared-comments backend (Supabase). Injected from env so keys are
// never committed. If unset, comments fall back to per-browser localStorage.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

let out = template
  .replace('/*__PAYLOAD__*/null', () => JSON.stringify(payload))
  .replace('__SUPABASE_URL__', () => supabaseUrl)
  .replace('__SUPABASE_ANON_KEY__', () => supabaseKey);

writeFileSync(join(ROOT, 'public', 'progress.html'), out);

console.log('✓ Wrote public/progress.html');
console.log('  ciphertext:', payload.ct.length, 'base64 chars, PBKDF2 iterations:', ITERATIONS);
console.log('  comments backend:', supabaseUrl ? 'Supabase (shared)' : 'localStorage (per-browser fallback)');
console.log('  Plaintext and password are NOT in the output file.');
