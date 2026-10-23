import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';
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
}

export async function writeJobMeta(uid: string, meta: JobMeta): Promise<void> {
  const blob = new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' });
  await uploadBytes(ref(storage, ghoulPath(uid, meta.jobId, 'meta.json')), blob, { contentType: 'application/json' });
}

/** "Delete my photos" — removes every file of one job (rules allow the owner to delete). */
export async function deleteJob(uid: string, jobId: string): Promise<void> {
  await Promise.all(
    JOB_FILES.map((f) =>
      deleteObject(ref(storage, ghoulPath(uid, jobId, f))).catch((e: { code?: string }) => {
        if (e?.code !== 'storage/object-not-found') throw e;
      }),
    ),
  );
}
