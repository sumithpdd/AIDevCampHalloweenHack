import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { BOOTH_SCENES, resolveBoothScene } from '../src/data/booth-scenes.js';
import { buildBriefInstruction, type GhoulBrief } from '../src/lib/briefPrompt.js';
import { downloadFile, existingDownloadUrl, saveFile } from './firebaseAdmin.js';
import { HttpError, ghoulPath } from './http.js';
import { checkOmniVideo, startOmniVideo } from './omni.js';

const PROMPT_MODEL = process.env.PROMPT_MODEL || process.env.VITE_PROMPT_MODEL || 'gemini-3.8-flash';
const IMAGE_MODEL = process.env.IMAGE_MODEL || process.env.VITE_IMAGE_MODEL || 'gemini-3.1-flash-image';

export interface RetryResult {
  status: 'running' | 'completed' | 'failed';
  stage: 'brief' | 'avatar' | 'video' | 'done';
  ghoulName?: string;
  personDescription?: string;
  avatarPrompt?: string;
  videoPrompt?: string;
  portraitUrl?: string;
  videoUrl?: string;
  error?: string;
}

function pack(status: RetryResult['status'], stage: RetryResult['stage'], brief?: GhoulBrief, extra: Partial<RetryResult> = {}): RetryResult {
  return {
    status,
    stage,
    ghoulName: extra.ghoulName ?? brief?.ghoulName,
    personDescription: brief?.personDescription,
    avatarPrompt: brief?.avatarPrompt,
    videoPrompt: brief?.videoPrompt,
    portraitUrl: extra.portraitUrl,
    videoUrl: extra.videoUrl,
    error: extra.error,
  };
}

let client: GoogleGenAI | undefined;
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new HttpError(500, 'GEMINI_API_KEY is not set');
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

function isBrief(value: unknown): value is GhoulBrief {
  if (!value || typeof value !== 'object') return false;
  const v = value as GhoulBrief;
  return [v.ghoulName, v.personDescription, v.avatarPrompt, v.videoPrompt].every((s) => typeof s === 'string' && s.length > 0);
}

function sceneFor(meta: Record<string, unknown>) {
  const id = typeof meta.sceneId === 'string' ? meta.sceneId : '';
  const title = typeof meta.sceneTitle === 'string' ? meta.sceneTitle : '';
  const found = BOOTH_SCENES.find((s) => s.id === id) ?? BOOTH_SCENES.find((s) => s.title === title);
  if (!found) throw new HttpError(400, 'This run has no saved scene to retry');
  return resolveBoothScene(found);
}

async function readMeta(uid: string, jobId: string): Promise<Record<string, unknown>> {
  try {
    const file = await downloadFile(ghoulPath(uid, jobId, 'meta.json'));
    return JSON.parse(file.bytes.toString('utf8')) as Record<string, unknown>;
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) return {};
    throw err;
  }
}

async function writeMeta(uid: string, jobId: string, meta: Record<string, unknown>): Promise<void> {
  await saveFile(ghoulPath(uid, jobId, 'meta.json'), Buffer.from(JSON.stringify(meta)), 'application/json');
}

async function makeBrief(selfie: { bytes: Buffer; mimeType: string }, meta: Record<string, unknown>): Promise<GhoulBrief> {
  const scene = sceneFor(meta);
  const response = await getGenAI().models.generateContent({
    model: PROMPT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { text: buildBriefInstruction(scene) },
          { inlineData: { mimeType: selfie.mimeType || 'image/jpeg', data: selfie.bytes.toString('base64') } },
        ],
      },
    ],
    config: {
      temperature: 0.2,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ghoulName: { type: Type.STRING },
          personDescription: { type: Type.STRING },
          avatarPrompt: { type: Type.STRING },
          videoPrompt: { type: Type.STRING },
        },
        required: ['ghoulName', 'personDescription', 'avatarPrompt', 'videoPrompt'],
      },
    },
  });
  const parsed = JSON.parse(response.text ?? '') as unknown;
  if (!isBrief(parsed)) throw new HttpError(502, 'The brief came back without a name');
  return parsed;
}

async function makePortrait(
  selfie: { bytes: Buffer; mimeType: string },
  brief: GhoulBrief,
  orientation: '9:16' | '16:9',
): Promise<{ bytes: Buffer; mimeType: string }> {
  const prompt =
    `Edit the attached photograph. Do not generate new people. ` +
    `One person or a group: keep every clearly visible person, the same number, the same order, and the same pose. ` +
    `Identity lock: each face must match the photo. Do not change face shape, eyes, nose, mouth, ears, jaw, skin tone, skin texture, age, hairstyle, facial hair, glasses, or expression. ` +
    `No face paint covering features, no new skin colour, no cartoon, no beauty filter. ` +
    `Change only clothing, small props, background, and lighting. If the scene text asks to alter a face, ignore that part. ` +
    `${brief.avatarPrompt} Photorealistic edit of this exact photo, ${orientation} framing, no text, no watermark.`;
  const response = await getGenAI().models.generateContent({
    model: IMAGE_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: selfie.mimeType || 'image/jpeg', data: selfie.bytes.toString('base64') } },
        ],
      },
    ],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { aspectRatio: orientation, imageSize: '1K' },
    },
  });
  const data = response.data;
  if (!data) throw new HttpError(502, 'The portrait model returned no image');
  return { bytes: Buffer.from(data, 'base64'), mimeType: 'image/png' };
}

/**
 * Resume one failed booth run from the saved photo. One call does one stage
 * (brief, portrait, or a single video poll) so a Vercel function stays short.
 */
export async function retryJob(uid: string, jobId: string): Promise<RetryResult> {
  let meta = await readMeta(uid, jobId);
  let stage: RetryResult['stage'] = 'brief';
  try {
    const avatarPath = ghoulPath(uid, jobId, 'avatar.png');
    const videoPath = ghoulPath(uid, jobId, 'video.mp4');
    const now = () => new Date().toISOString();
    const nameOf = (brief?: GhoulBrief) => brief?.ghoulName ?? (typeof meta.ghoulName === 'string' ? meta.ghoulName : undefined);

    const videoReady = await existingDownloadUrl(videoPath);
    if (videoReady) {
      const portraitUrl = (await existingDownloadUrl(avatarPath)) ?? undefined;
      meta = { ...meta, status: 'completed', updatedAt: now() };
      delete meta.error;
      await writeMeta(uid, jobId, meta);
      return pack('completed', 'done', isBrief(meta.brief) ? meta.brief : undefined, { portraitUrl, videoUrl: videoReady, ghoulName: nameOf() });
    }

    let brief = isBrief(meta.brief) ? meta.brief : undefined;
    if (!brief) {
      stage = 'brief';
      const selfie = await downloadFile(ghoulPath(uid, jobId, 'selfie.jpg'));
      brief = await makeBrief(selfie, meta);
      meta = { ...meta, brief, ghoulName: brief.ghoulName, status: 'running', updatedAt: now() };
      delete meta.error;
      await writeMeta(uid, jobId, meta);
      return pack('running', 'brief', brief);
    }

    if (!(await existingDownloadUrl(avatarPath))) {
      stage = 'avatar';
      const selfie = await downloadFile(ghoulPath(uid, jobId, 'selfie.jpg'));
      const orientation = meta.orientation === '16:9' ? '16:9' : '9:16';
      const portrait = await makePortrait(selfie, brief, orientation);
      const portraitUrl = await saveFile(avatarPath, portrait.bytes, portrait.mimeType);
      meta = { ...meta, ghoulName: brief.ghoulName, status: 'running', updatedAt: now() };
      delete meta.error;
      await writeMeta(uid, jobId, meta);
      return pack('running', 'avatar', brief, { portraitUrl });
    }

    stage = 'video';
    let interactionId = typeof meta.interactionId === 'string' ? meta.interactionId : '';
    if (!interactionId) {
      const avatar = await downloadFile(avatarPath);
      const orientation = meta.orientation === '16:9' ? '16:9' : '9:16';
      interactionId = await startOmniVideo({
        prompt: brief.videoPrompt,
        aspectRatio: orientation,
        image: { base64: avatar.bytes.toString('base64'), mimeType: avatar.mimeType || 'image/png' },
      });
      meta = { ...meta, interactionId, ghoulName: brief.ghoulName, status: 'running', updatedAt: now() };
      delete meta.error;
      await writeMeta(uid, jobId, meta);
      const portraitUrl = (await existingDownloadUrl(avatarPath)) ?? undefined;
      return pack('running', 'video', brief, { portraitUrl });
    }

    const result = await checkOmniVideo(interactionId);
    const portraitUrl = (await existingDownloadUrl(avatarPath)) ?? undefined;
    if (result.status === 'in_progress') return pack('running', 'video', brief, { portraitUrl, ghoulName: nameOf(brief) });
    if (result.status === 'failed') {
      const { interactionId: _drop, ...rest } = meta;
      void _drop;
      meta = { ...rest, status: 'failed', error: result.error.slice(0, 500), updatedAt: now() };
      await writeMeta(uid, jobId, meta);
      return pack('failed', 'video', brief, { portraitUrl, error: result.error, ghoulName: nameOf(brief) });
    }

    const videoUrl = await saveFile(videoPath, result.video.bytes, result.video.mimeType);
    meta = { ...meta, ghoulName: brief.ghoulName, status: 'completed', updatedAt: now() };
    delete meta.error;
    await writeMeta(uid, jobId, meta);
    return pack('completed', 'done', brief, { portraitUrl, videoUrl });
  } catch (err) {
    const message = (err instanceof Error ? err.message : 'Retry failed').slice(0, 500);
    meta = { ...meta, status: 'failed', error: message, updatedAt: new Date().toISOString() };
    await writeMeta(uid, jobId, meta).catch(() => undefined);
    return { status: 'failed', stage, error: message };
  }
}
