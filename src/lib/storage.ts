import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, storage } from './firebase';
import type { PickupTicket } from './pickup';
import { isPickupCode } from './pickup';
import type { UsageReport } from './usage';

/**
 * Firebase Storage replaces the Formula E lab's Cloud Storage bucket +
 * upload_to_gcs() helper. Layout per user + job:
 *   ghouls/{uid}/{jobId}/selfie.jpg          ← browser
 *   ghouls/{uid}/{jobId}/avatar.png          ← browser (Nano Banana output, sent to Omni)
 *   ghouls/{uid}/{jobId}/avatar-branded.jpg  ← browser (with event logos — for sharing/printing)
 *   ghouls/{uid}/{jobId}/video.mp4           ← Vercel function (Gemini Omni output)
 *   ghouls/{uid}/{jobId}/video-branded.mp4|webm ← browser (with event logos)
 *   ghouls/{uid}/{jobId}/meta.json           ← browser (scene, caption, token counts — read by /admin)
 */
export const ghoulPath = (uid: string, jobId: string, file: string) => `ghouls/${uid}/${jobId}/${file}`;

export const JOB_FILES = [
  'selfie.jpg',
  'avatar.png',
  'avatar-branded.jpg',
  'video.mp4',
  'video-branded.mp4',
  'video-branded.webm',
  'meta.json',
];

export async function uploadToStorage(path: string, blob: Blob): Promise<string> {
  const objectRef = ref(storage, path);
  await uploadBytes(objectRef, blob, { contentType: blob.type });
  return getDownloadURL(objectRef);
}

/** What /admin shows for each job. No email or other personal data is stored here. */
export interface JobMeta {
  jobId: string;
  createdAt: string;
  updatedAt: string;
  sceneId: string;
  sceneTitle: string;
  orientation: '9:16' | '16:9';
  firstName?: string;
  ghoulName?: string;
  caption?: string;
  usage: UsageReport;
  totalTokens: number;
  status: 'running' | 'completed' | 'failed';
  error?: string;
  /** Short code staff type into /admin, and guests scan as /r/{code}. */
  code?: string;
}

export async function writeJobMeta(uid: string, meta: JobMeta): Promise<void> {
  const blob = new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' });
  await uploadBytes(ref(storage, ghoulPath(uid, meta.jobId, 'meta.json')), blob, { contentType: 'application/json' });
}

/** "Delete my photos" — removes every file of one job (rules allow the owner to delete). */
export async function writePickupTicket(ticket: PickupTicket): Promise<void> {
  if (!isPickupCode(ticket.code)) throw new Error('Invalid pickup code');
  const owner = auth.currentUser?.uid;
  if (!owner) throw new Error('Not signed in');
  const blob = new Blob([JSON.stringify(ticket)], { type: 'application/json' });
  // metadata.owner lets storage.rules allow only this guest to update or delete the card.
  await uploadBytes(ref(storage, `codes/${ticket.code}.json`), blob, {
    contentType: 'application/json',
    customMetadata: { owner },
  });
}

/**
 * Reads one card through the Vercel function (Admin SDK). Storage rules block direct reads so
 * nobody can list codes/, and this avoids needing bucket CORS for the /r/CODE page.
 */
export async function readPickupTicket(code: string): Promise<PickupTicket | null> {
  if (!isPickupCode(code)) return null;
  try {
    const res = await fetch(`/api/pickup?code=${encodeURIComponent(code)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as PickupTicket;
  } catch {
    return null;
  }
}

export async function deletePickupTicket(code: string): Promise<void> {
  if (!isPickupCode(code)) return;
  await deleteObject(ref(storage, `codes/${code}.json`)).catch((e: { code?: string }) => {
    if (e?.code !== 'storage/object-not-found') throw e;
  });
}

export async function deleteJob(uid: string, jobId: string, code?: string): Promise<void> {
  await Promise.all(
    JOB_FILES.map((f) =>
      deleteObject(ref(storage, ghoulPath(uid, jobId, f))).catch((e: { code?: string }) => {
        if (e?.code !== 'storage/object-not-found') throw e;
      }),
    ),
  );
  if (code) await deletePickupTicket(code);
}
