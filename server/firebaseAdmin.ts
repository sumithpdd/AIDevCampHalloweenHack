import { randomUUID } from 'node:crypto';
import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { HttpError } from './http.js';

/**
 * Firebase Admin SDK for the Vercel Functions.
 * Credentials come from FIREBASE_SERVICE_ACCOUNT_BASE64 (see .env.example).
 */
function adminApp(): App {
  if (getApps().length) return getApp();
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const bucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET;
  if (!b64) throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 is not set');
  if (!bucket) throw new Error('FIREBASE_STORAGE_BUCKET is not set');
  const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  return initializeApp({ credential: cert(serviceAccount), storageBucket: bucket });
}

const bucket = () => getStorage(adminApp()).bucket();

/** Verifies the Firebase ID token sent by the browser and returns the uid. */
export async function requireUser(req: Request): Promise<string> {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new HttpError(401, 'Missing Firebase ID token');
  try {
    const decoded = await getAuth(adminApp()).verifyIdToken(token);
    return decoded.uid;
  } catch {
    throw new HttpError(401, 'Invalid Firebase ID token');
  }
}

export async function downloadFile(path: string): Promise<{ bytes: Buffer; mimeType: string }> {
  const file = bucket().file(path);
  const [exists] = await file.exists();
  if (!exists) throw new HttpError(404, `Storage object not found: ${path}`);
  const [[bytes], [meta]] = await Promise.all([file.download(), file.getMetadata()]);
  return { bytes, mimeType: (meta.contentType as string) || 'image/png' };
}

function publicDownloadUrl(path: string, token: string): string {
  const b = bucket().name;
  return `https://firebasestorage.googleapis.com/v0/b/${b}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

/** Returns a download URL if the object exists (makes the status endpoint idempotent). */
export async function existingDownloadUrl(path: string): Promise<string | null> {
  const file = bucket().file(path);
  const [exists] = await file.exists();
  if (!exists) return null;
  const [meta] = await file.getMetadata();
  let token = (meta.metadata?.firebaseStorageDownloadTokens as string | undefined)?.split(',')[0];
  if (!token) {
    token = randomUUID();
    await file.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });
  }
  return publicDownloadUrl(path, token);
}

/** Uploads bytes to Firebase Storage and returns a token download URL. */
export async function saveFile(path: string, bytes: Buffer, contentType: string): Promise<string> {
  const token = randomUUID();
  await bucket().file(path).save(bytes, {
    resumable: false,
    contentType,
    metadata: { contentType, metadata: { firebaseStorageDownloadTokens: token } },
  });
  return publicDownloadUrl(path, token);
}
