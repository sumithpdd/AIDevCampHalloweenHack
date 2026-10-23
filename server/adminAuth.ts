import { createHmac, timingSafeEqual } from 'node:crypto';
import { HttpError } from './http.js';

/**
 * 🛡️ Admin auth — one shared ADMIN_SECRET (server env only, never VITE_).
 * Login exchanges the secret for a signed, expiring token; the raw secret is never stored in the browser.
 */
const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function secret(): string {
  const s = process.env.ADMIN_SECRET?.trim();
  if (!s || s.length < 16) throw new HttpError(503, 'Admin is disabled: set ADMIN_SECRET (16+ chars) in the server env');
  return s;
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('hex');

export function createAdminToken(password: string): { token: string; expiresAt: number } {
  if (!safeEqual(password, secret())) throw new HttpError(401, 'Wrong admin password');
  const expiresAt = Date.now() + TTL_MS;
  return { token: `${expiresAt}.${sign(`admin:${expiresAt}`)}`, expiresAt };
}

export function requireAdmin(req: Request): void {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const [exp, sig] = token.split('.');
  const expiresAt = Number(exp);
  if (!sig || !Number.isFinite(expiresAt) || Date.now() > expiresAt || !safeEqual(sig, sign(`admin:${expiresAt}`))) {
    throw new HttpError(401, 'Admin session expired — log in again');
  }
}
