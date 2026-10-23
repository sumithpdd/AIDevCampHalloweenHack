#!/usr/bin/env node
/**
 * 🧙 Challenge helper
 *   npm run solve -- 2          copy the solution for Challenge 2 into place
 *   npm run solve -- all        copy every solution
 *   npm run reset-challenges    put every starter (TODO) file back
 *   npm run reset-challenges -- 3   reset just Challenge 3
 *
 * Tip: try it yourself (or with Gemini CLI: /hack:hint 2) before peeking!
 */
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = {
  1: ['src/lib/firebase.ts'],
  2: ['src/lib/promptExpansion.ts'],
  3: ['src/lib/avatar.ts'],
  4: ['server/omni.ts'],
};

const args = process.argv.slice(2);
const reset = args.includes('--reset');
const target = args.find((a) => !a.startsWith('--')) ?? (reset ? 'all' : undefined);

if (!target || (target !== 'all' && !FILES[target])) {
  console.log('Usage: npm run solve -- <1|2|3|4|all>   |   npm run reset-challenges [-- <1|2|3|4>]');
  process.exit(1);
}

const challenges = target === 'all' ? Object.keys(FILES) : [target];
const from = reset ? 'starter' : 'solutions';
for (const c of challenges) {
  for (const file of FILES[c]) {
    const src = join(root, from, file);
    if (!existsSync(src)) throw new Error(`Missing ${src}`);
    copyFileSync(src, join(root, file));
    console.log(`${reset ? '↩️  reset' : '✅ solved'}  Challenge ${c}: ${file}`);
  }
}
console.log(reset ? '\n🕸️  Back to the TODOs. Good luck!' : '\n🎃 Done. Vite will hot-reload; restart `npm run dev` for server changes if needed.');
