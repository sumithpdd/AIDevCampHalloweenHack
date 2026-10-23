/**
 * POST /api/admin/login   Body: { password }
 * → { token, expiresAt }   (signed with ADMIN_SECRET, valid 8 h)
 */
import { createAdminToken } from '../../server/adminAuth.js';
import { errorResponse, HttpError, json } from '../../server/http.js';

export async function POST(req: Request): Promise<Response> {
  try {
    const { password } = (await req.json().catch(() => ({}))) as { password?: string };
    if (!password) throw new HttpError(400, 'password is required');
    return json(createAdminToken(password));
  } catch (err) {
    return errorResponse(err);
  }
}
