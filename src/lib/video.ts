import { auth } from './firebase';
import type { Orientation } from './avatar';

/** Thin client for the Vercel Functions in /api/video/*. */
async function authedFetch(input: string, init: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  const token = await user.getIdToken();
  const res = await fetch(input, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
  });
  const text = await res.text();
  let body: any;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`API ${res.status}: ${text.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(body.error ?? `API error ${res.status}`);
  return body;
}

export async function startVideo(jobId: string, prompt: string, aspectRatio: Orientation): Promise<string> {
  const { interactionId } = await authedFetch('/api/video/start', {
    method: 'POST',
    body: JSON.stringify({ jobId, prompt, aspectRatio }),
  });
  return interactionId as string;
}

/**
 * Polls /api/video/status every `intervalMs` until Omni finishes.
 * This is the browser-side version of the Python lab's `while True:` loop.
 */
export async function waitForVideo(
  jobId: string,
  interactionId: string,
  { intervalMs = 5000, timeoutMs = 10 * 60_000, onTick }: { intervalMs?: number; timeoutMs?: number; onTick?: (elapsedS: number) => void } = {},
): Promise<string> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const q = new URLSearchParams({ jobId, interactionId });
    const res = await authedFetch(`/api/video/status?${q}`);
    if (res.status === 'completed') return res.videoUrl as string;
    if (res.status === 'failed') throw new Error(res.error ?? 'Video generation failed');
    onTick?.(Math.round((Date.now() - started) / 1000));
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Timed out waiting for Gemini Omni');
}
