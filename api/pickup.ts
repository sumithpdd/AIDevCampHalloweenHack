/**
 * GET /api/pickup?code=K7P2QX  → the pickup card JSON for /r/CODE, or 404.
 *
 * Cards live at codes/{CODE}.json. Storage rules block direct reads and listing, so the only way
 * to see a card is to already know its 6-character code (32^6 ≈ 1 billion combinations).
 */
import { readPickupCard } from '../server/firebaseAdmin.js';
import { errorResponse, HttpError, json } from '../server/http.js';

export async function GET(req: Request): Promise<Response> {
  try {
    const code = (new URL(req.url).searchParams.get('code') ?? '').toUpperCase();
    if (!/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(code)) throw new HttpError(400, 'Invalid code');
    const card = await readPickupCard(code);
    if (!card) throw new HttpError(404, 'No card for this code');
    return json(card);
  } catch (err) {
    return errorResponse(err);
  }
}
