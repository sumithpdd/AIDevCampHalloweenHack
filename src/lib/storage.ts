import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Firebase Storage replaces the Formula E lab's Cloud Storage bucket +
 * upload_to_gcs() helper. Layout per user + job:
 *   ghouls/{uid}/{jobId}/selfie.jpg   ← browser
 *   ghouls/{uid}/{jobId}/avatar.png   ← browser (Nano Banana output)
 *   ghouls/{uid}/{jobId}/video.mp4    ← Vercel function (Gemini Omni output)
 */
export const ghoulPath = (uid: string, jobId: string, file: string) => `ghouls/${uid}/${jobId}/${file}`;

export async function uploadToStorage(path: string, blob: Blob): Promise<string> {
  const objectRef = ref(storage, path);
  await uploadBytes(objectRef, blob, { contentType: blob.type });
  return getDownloadURL(objectRef);
}
