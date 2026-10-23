/**
 * GET /api/video/status?jobId=…&interactionId=…
 * Header: Authorization: Bearer <Firebase ID token>
 *
 * Checks the Omni interaction ONCE (Challenge 4b). When the video is ready it
 * is saved to Firebase Storage at ghouls/{uid}/{jobId}/video.mp4 and a
 * download URL is returned. The browser calls this every few seconds.
 * → { status: 'in_progress' | 'completed' | 'failed', videoUrl?, usage?, error? }
 */
import { existingDownloadUrl, requireUser, saveFile } from '../../server/firebaseAdmin.js';
import { assertJobId, errorResponse, ghoulPath, HttpError, json } from '../../server/http.js';
import { checkOmniVideo } from '../../server/omni.js';

export async function GET(req: Request): Promise<Response> {
  try {
    const uid = await requireUser(req);
    const url = new URL(req.url);
    const jobId = assertJobId(url.searchParams.get('jobId'));
    const interactionId = url.searchParams.get('interactionId');
    if (!interactionId) throw new HttpError(400, 'interactionId is required');

    const videoPath = ghoulPath(uid, jobId, 'video.mp4');

    // Already saved by an earlier poll? Just hand back the URL.
    const existing = await existingDownloadUrl(videoPath);
    if (existing) return json({ status: 'completed', videoUrl: existing });

    const result = await checkOmniVideo(interactionId);
    if (result.status === 'completed') {
      const videoUrl = await saveFile(videoPath, result.video.bytes, result.video.mimeType);
      return json({ status: 'completed', videoUrl, usage: result.usage });
    }
    return json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
