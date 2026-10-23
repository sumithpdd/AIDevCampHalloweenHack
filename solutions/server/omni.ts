import { GoogleGenAI } from '@google/genai';
import { ChallengeTodo } from './todo.js';

/**
 * Challenge 4 — Video generation with Gemini Omni 1.1 Flash.
 *
 * Runs ONLY on the server (Vercel Function) because it needs GEMINI_API_KEY.
 * Gemini Omni lives behind the Interactions API, which we call with the
 * official Node SDK (@google/genai) — no Python, no FastAPI.
 */
export const OMNI_MODEL = process.env.OMNI_MODEL || 'gemini-omni-1.1-flash';

let client: GoogleGenAI | undefined;
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set (add it to .env.local or Vercel env vars)');
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export interface OmniStartInput {
  prompt: string;
  image: { base64: string; mimeType: string };
  aspectRatio: '9:16' | '16:9';
}

/** Token usage reported by the Interactions API (shown in the UI). */
export interface OmniUsage {
  total_input_tokens?: number;
  total_output_tokens?: number;
  total_thought_tokens?: number;
  total_tokens?: number;
}

export type OmniStatus =
  | { status: 'in_progress' }
  | { status: 'completed'; video: { bytes: Buffer; mimeType: string }; usage?: OmniUsage }
  | { status: 'failed'; error: string };

const FAILED = new Set(['failed', 'cancelled', 'incomplete', 'budget_exceeded']);

/** Builds the final text instruction sent to Omni together with the avatar. */
export function buildVideoInstruction(prompt: string): string {
  return (
    `Animate the character in the attached image into one continuous 8-second cinematic Halloween shot. ` +
    `Keep the character's face and costume consistent with the image. ${prompt} ` +
    `Spooky, atmospheric, family-friendly. No on-screen text.`
  );
}

/**
 * 4a — start an asynchronous (background) Omni interaction and return its id.
 * Serverless functions are short-lived, so we DON'T wait here: the browser polls.
 */
export async function startOmniVideo({ prompt, image, aspectRatio }: OmniStartInput): Promise<string> {
  // =====================================================================
  // ✅ SOLUTION — Challenge 4a
  // =====================================================================
  const interaction = await getGenAI().interactions.create({
    model: OMNI_MODEL,
    input: [
      { type: 'image', data: image.base64, mime_type: image.mimeType },
      { type: 'text', text: buildVideoInstruction(prompt) },
    ],
    response_format: { type: 'video', aspect_ratio: aspectRatio, resolution: '720p' },
    background: true,
  });

  return interaction.id;
}

/**
 * 4b — check ONE time on a background interaction.
 * (The Python lab used a `while True: … time.sleep(5)` loop on the server;
 *  on Vercel the loop moves to the browser — see src/lib/video.ts.)
 */
export async function checkOmniVideo(interactionId: string): Promise<OmniStatus> {
  // =====================================================================
  // ✅ SOLUTION — Challenge 4b
  // =====================================================================
  const interaction = await getGenAI().interactions.get(interactionId);

  if (interaction.status === 'completed') {
    const video = interaction.output_video;
    if (!video) return { status: 'failed', error: 'Omni finished but returned no video' };
    return { status: 'completed', video: await videoToBuffer(video), usage: interaction.usage };
  }
  if (FAILED.has(interaction.status)) {
    return { status: 'failed', error: `Omni ${interaction.status}: ${JSON.stringify(interaction.errors ?? [])}` };
  }
  return { status: 'in_progress' };
}

/** Helper (given): turn an Omni video block (inline base64 OR uri) into bytes. */
export async function videoToBuffer(video: {
  data?: string;
  uri?: string;
  mime_type?: string;
}): Promise<{ bytes: Buffer; mimeType: string }> {
  const mimeType = video.mime_type || 'video/mp4';
  if (video.data) return { bytes: Buffer.from(video.data, 'base64'), mimeType };
  if (video.uri) {
    const res = await fetch(video.uri, { headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY ?? '' } });
    if (!res.ok) throw new Error(`Could not download Omni video (${res.status})`);
    return { bytes: Buffer.from(await res.arrayBuffer()), mimeType };
  }
  throw new Error('Omni video block had neither data nor uri');
}

void ChallengeTodo;
