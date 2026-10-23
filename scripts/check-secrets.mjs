#!/usr/bin/env node
/**
 * 🔐 Secret scan — run before every commit:   npm run check:secrets
 * Fails if a file that would be committed looks like it contains a credential.
 * Uses `git ls-files` (tracked + untracked-but-not-ignored) when git is available.
 */
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.vercel', '.firebase']);
const SKIP_FILES = new Set(['package-lock.json', 'scripts/check-secrets.mjs']);

function listFiles() {
  try {
    const out = execSync('git ls-files --cached --others --exclude-standard', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] });
    const files = out.toString().split('\n').filter(Boolean);
    if (files.length) return files;
  } catch {}
  const walk = (dir) =>
    readdirSync(dir).flatMap((name) => {
      const p = join(dir, name);
      if (SKIP_DIRS.has(name)) return [];
      return statSync(p).isDirectory() ? walk(p) : [relative(root, p).replaceAll('\\', '/')];
    });
  return walk(root);
}

const FORBIDDEN_NAMES = [/(^|\/)\.env(\.[^/]*)?$/, /service.?account.*\.json$/i, /\.pem$/, /\.p12$/];
const ALLOWED_NAMES = [/(^|\/)\.env\.example$/];
const PATTERNS = [
  ['Google API key', /AIza[0-9A-Za-z_-]{35}/],
  ['Private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['Service account JSON', /"type"\s*:\s*"service_account"/],
  ['OAuth client secret', /GOCSPX-[0-9A-Za-z_-]{20,}/],
  ['GitHub token', /gh[pousr]_[0-9A-Za-z]{30,}/],
  ['Vercel token', /\bvercel_[0-9A-Za-z]{20,}/i],
  ['Base64 service account', /ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudC|eyJ0eXBlIjoic2VydmljZV9hY2NvdW50/],
  ['Filled-in secret env var', /^(GEMINI_API_KEY|FIREBASE_SERVICE_ACCOUNT_BASE64|VITE_APPCHECK_DEBUG_TOKEN)=[^<\s]\S*/m],
];

const problems = [];
for (const file of listFiles()) {
  if (SKIP_FILES.has(file)) continue;
  if (FORBIDDEN_NAMES.some((r) => r.test(file)) && !ALLOWED_NAMES.some((r) => r.test(file))) {
    problems.push(`${file}: this file must never be committed (add it to .gitignore)`);
    continue;
  }
  let text;
  try {
    text = readFileSync(join(root, file), 'utf8');
  } catch {
    continue;
  }
  for (const [label, re] of PATTERNS) if (re.test(text)) problems.push(`${file}: looks like a ${label}`);
}

if (problems.length) {
  console.error('\n🚨 Possible secrets found — nothing was committed or built:\n');
  for (const p of problems) console.error('  • ' + p);
  console.error('\nMove the value into .env.local (local) or Vercel env vars (deploy), then re-run.\n');
  process.exit(1);
}
console.log('🔐 Secret scan passed — no credentials in files that would be committed.');
