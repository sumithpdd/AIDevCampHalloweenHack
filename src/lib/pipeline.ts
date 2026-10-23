import { ensureSignedIn } from './firebase';
import { expandPrompt } from './promptExpansion';
import { generateAvatar, type Orientation } from './avatar';
import { blobToInlineImage, downscaleImage, inlineImageToBlob, toDataUrl } from './media';
import { ghoulPath, uploadToStorage } from './storage';
import { startVideo, waitForVideo } from './video';
import type { GhoulBrief } from './briefPrompt';
import type { Scene } from './scenes';

/**
 * The whole kiosk pipeline — the React/Firebase version of the Formula E
 * lab's run_kiosk_pipeline() FastAPI background task, but running in the browser.
 */
export type StageId = 'upload' | 'brief' | 'avatar' | 'video';
export type StageState = 'idle' | 'running' | 'done' | 'error';

export interface PipelineState {
  stages: Record<StageId, { state: StageState; detail?: string }>;
  brief?: GhoulBrief;
  avatarDataUrl?: string;
  videoUrl?: string;
  error?: string;
  todoChallenge?: number;
}

export const initialPipeline = (): PipelineState => ({
  stages: {
    upload: { state: 'idle' },
    brief: { state: 'idle' },
    avatar: { state: 'idle' },
    video: { state: 'idle' },
  },
});

export async function runPipeline(
  photo: Blob,
  scene: Scene,
  orientation: Orientation,
  update: (fn: (s: PipelineState) => PipelineState) => void,
): Promise<void> {
  let current: StageId = 'upload';
  const set = (id: StageId, state: StageState, detail?: string) => {
    current = id;
    update((s) => ({ ...s, stages: { ...s.stages, [id]: { state, detail } } }));
  };

  try {
    // ── Stage 0: sign in + upload the selfie to Firebase Storage ──────────
    set('upload', 'running', 'Summoning an anonymous Firebase user…');
    const user = await ensureSignedIn();
    const jobId = crypto.randomUUID();
    const small = await downscaleImage(photo);
    await uploadToStorage(ghoulPath(user.uid, jobId, 'selfie.jpg'), small);
    const selfie = await blobToInlineImage(small);
    set('upload', 'done', `ghouls/${user.uid.slice(0, 6)}…/${jobId.slice(0, 8)}/selfie.jpg`);

    // ── Challenge 2: Gemini 3.8 Flash prompt expansion ────────────────────
    set('brief', 'running', 'Gemini 3.8 Flash is studying your face (thinking: high)…');
    const brief = await expandPrompt(selfie, scene);
    update((s) => ({ ...s, brief }));
    set('brief', 'done', brief.ghoulName);

    // ── Challenge 3: Nano Banana 2 avatar ─────────────────────────────────
    set('avatar', 'running', 'Nano Banana 2 is stitching your costume…');
    const avatar = await generateAvatar(brief, selfie, orientation);
    update((s) => ({ ...s, avatarDataUrl: toDataUrl(avatar) }));
    await uploadToStorage(ghoulPath(user.uid, jobId, 'avatar.png'), inlineImageToBlob(avatar));
    set('avatar', 'done', 'Saved avatar.png to Firebase Storage');

    // ── Challenge 4: Gemini Omni video (Vercel Function) ─────────────────
    set('video', 'running', 'Waking Gemini Omni in the crypt…');
    const interactionId = await startVideo(jobId, brief.videoPrompt, orientation);
    const videoUrl = await waitForVideo(jobId, interactionId, {
      onTick: (t) => set('video', 'running', `Gemini Omni is animating your ghoul… ${t}s`),
    });
    update((s) => ({ ...s, videoUrl }));
    set('video', 'done', 'Saved video.mp4 to Firebase Storage');
  } catch (err) {
    const e = err as Error & { challenge?: number };
    const todoMatch = /Challenge (\d) is still a TODO/.exec(e.message);
    set(current, 'error', e.message);
    update((s) => ({
      ...s,
      error: e.message,
      todoChallenge: e.challenge ?? (todoMatch ? Number(todoMatch[1]) : undefined),
    }));
  }
}
