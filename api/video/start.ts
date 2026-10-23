/**
 * POST /api/video/start
 * Body: { jobId, prompt, aspectRatio }
 * Header: Authorization: Bearer <Firebase ID token>
 *
 * 1. Verifies the (anonymous) Firebase user
 * 2. Reads the Nano Banana avatar the browser uploaded to Firebase Storage
 * 3. Starts a background Gemini Omni interaction (Challenge 4a)
 * → { interactionId }
 */
import { requireUser, downloadFile } from '../../server/firebaseAdmin.js';
import { assertJobId, errorResponse, ghoulPath, HttpError, json } from '../../server/http.js';
import { startOmniVideo } from '../../server/omni.js';

export async function POST(req: Request): Promise<Response> {
  try {
    const uid = await requireUser(req);
    const body = (await req.json()) as { jobId?: string; prompt?: string; aspectRatio?: string };
    const jobId = assertJobId(body.jobId);
    const prompt = (body.prompt ?? '').toString().slice(0, 2000);
    if (!prompt) throw new HttpError(400, 'prompt is required');
    const aspectRatio = body.aspectRatio === '16:9' ? '16:9' : '9:16';

    const avatar = await downloadFile(ghoulPath(uid, jobId, 'avatar.png'));
    const interactionId = await startOmniVideo({
      prompt,
      aspectRatio,
      image: { base64: avatar.bytes.toString('base64'), mimeType: avatar.mimeType },
    });

    return json({ interactionId });
  } catch (err) {
    return errorResponse(err);
  }
}
