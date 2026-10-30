/**
 * POST /api/admin/retry  { uid, jobId }
 * Resumes a failed run from the saved photo. Call again until status is completed or failed.
 *   brief  → name written, call again for the portrait
 *   avatar → portrait saved, call again to start the video
 *   video  → still rendering; wait a few seconds and call again
 */
import { requireAdmin } from '../../server/adminAuth.js';
import { retryJob } from '../../server/retryJob.js';
import { assertJobId, errorResponse, HttpError, json } from '../../server/http.js';

export async function POST(req: Request): Promise<Response> {
  try {
    requireAdmin(req);
    const body = (await req.json()) as { uid?: string; jobId?: string };
    const uid = body.uid ?? '';
    if (!/^[A-Za-z0-9_-]{6,128}$/.test(uid)) throw new HttpError(400, 'Invalid uid');
    const jobId = assertJobId(body.jobId ?? null);
    return json(await retryJob(uid, jobId));
  } catch (err) {
    return errorResponse(err);
  }
}
