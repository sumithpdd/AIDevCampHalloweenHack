/**
 * Admin-only (Authorization: Bearer <admin token from /api/admin/login>)
 *   GET    /api/admin/ghouls                       → { jobs: AdminJob[] }  newest first, signed URLs (1 h)
 *   DELETE /api/admin/ghouls?uid=…&jobId=…         → { deleted: number }
 */
import { requireAdmin } from '../../server/adminAuth.js';
import { deleteJobFolder, listAllJobs } from '../../server/firebaseAdmin.js';
import { assertJobId, errorResponse, HttpError, json } from '../../server/http.js';

export async function GET(req: Request): Promise<Response> {
  try {
    requireAdmin(req);
    return json({ jobs: await listAllJobs() });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request): Promise<Response> {
  try {
    requireAdmin(req);
    const url = new URL(req.url);
    const uid = url.searchParams.get('uid') ?? '';
    if (!/^[A-Za-z0-9_-]{6,128}$/.test(uid)) throw new HttpError(400, 'Invalid uid');
    const jobId = assertJobId(url.searchParams.get('jobId'));
    return json({ deleted: await deleteJobFolder(uid, jobId) });
  } catch (err) {
    return errorResponse(err);
  }
}
