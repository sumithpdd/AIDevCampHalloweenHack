#!/usr/bin/env node
/**
 * Vercel build entry (see vercel.json → buildCommand).
 *
 * The repo ships the CODELAB version: the four challenge files contain TODOs.
 *   • Participants deploying their own fork → leave DEPLOY_WITH_SOLUTIONS unset; their own code is built.
 *   • A live demo of the finished kiosk     → set DEPLOY_WITH_SOLUTIONS=true in Vercel env vars;
 *                                              the reference solutions are copied in before building.
 * Either way the secret scan runs first and fails the build if a credential is committed.
 */
import { execSync } from 'node:child_process';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

run('node scripts/check-secrets.mjs');
if (process.env.DEPLOY_WITH_SOLUTIONS === 'true') {
  console.log('🎃 DEPLOY_WITH_SOLUTIONS=true → building the completed kiosk');
  run('node scripts/solve.mjs all');
} else {
  console.log('🕸️  Building the code as committed (set DEPLOY_WITH_SOLUTIONS=true for the finished demo)');
}
run('npm run build');
