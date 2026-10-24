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
    try {
      return json(createAdminToken(password));
    } catch (err) {
      // Slow down password guessing: every wrong attempt costs ~1.5 s.
      if (err instanceof HttpError && err.status === 401) await new Promise((r) => setTimeout(r, 1500));
      throw err;
    }
  } catch (err) {
    return errorResponse(err);
  }
}
