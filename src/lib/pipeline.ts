import { ensureSignedIn } from './firebase';
import { expandPrompt } from './promptExpansion';
import { generateAvatar, type Orientation } from './avatar';
import { blobToInlineImage, downscaleImage, inlineImageToBlob, toDataUrl } from './media';
import { ghoulPath, uploadToStorage, writeJobMeta, type JobMeta } from './storage';
import { startVideo, waitForVideo } from './video';
import { brandImage, brandVideo, videoExtension } from './watermark';
import { generateCaption } from './caption';
import { onUsage, recordInteractionUsage, totalTokens, type UsageReport } from './usage';
import { findPostForJob, saveSocialPost } from './social-posts-storage';
import type { GhoulBrief } from './briefPrompt';
import type { Scene } from './scenes';

/**
 * The whole kiosk pipeline — the React/Firebase version of the Formula E
 * lab's run_kiosk_pipeline() FastAPI background task, but running in the browser.
 *
 *   upload → brief (C2) → avatar (C3) → video (C4) → logos
 *                  └──── caption (runs in parallel with the video) ────┘
 */
export type StageId = 'upload' | 'brief' | 'avatar' | 'video' | 'brand';
export type StageState = 'idle' | 'running' | 'done' | 'error';

export interface GuestDetails {
  firstName?: string;
  /** Only used in this browser to save captions (never uploaded). */
  email?: string;
}

export interface PipelineState {
  jobId?: string;
  uid?: string;
  stages: Record<StageId, { state: StageState; detail?: string }>;
  brief?: GhoulBrief;
  avatarDataUrl?: string;
  brandedImageBlob?: Blob;
  brandedImageUrl?: string;
  videoUrl?: string;
  brandedVideoBlob?: Blob;
  brandedVideoUrl?: string;
  caption?: string;
  captionState?: 'running' | 'done' | 'error';
  usage: UsageReport;
  error?: string;
  todoChallenge?: number;
}

export const initialPipeline = (): PipelineState => ({
  stages: {
    upload: { state: 'idle' },
    brief: { state: 'idle' },
    avatar: { state: 'idle' },
    video: { state: 'idle' },
    brand: { state: 'idle' },
  },
  usage: {},
});

export async function runPipeline(
  photo: Blob,
  scene: Scene,
  orientation: Orientation,
  guest: GuestDetails,
  update: (fn: (s: PipelineState) => PipelineState) => void,
): Promise<void> {
  let current: StageId = 'upload';
  const set = (id: StageId, state: StageState, detail?: string) => {
    current = id;
    update((s) => ({ ...s, stages: { ...s.stages, [id]: { state, detail } } }));
  };

  // 🔢 Collect token usage from every Gemini call in this run.
  const usage: UsageReport = {};
  const stopUsage = onUsage((stage, u) => {
    usage[stage] = u;
    update((s) => ({ ...s, usage: { ...usage } }));
  });

  const jobId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  let uid = '';
  const meta = (patch: Partial<JobMeta>): JobMeta => ({
    jobId,
    createdAt,
    updatedAt: new Date().toISOString(),
    sceneId: scene.id,
    sceneTitle: scene.title,
    orientation,
    firstName: guest.firstName || undefined,
    usage: { ...usage },
    totalTokens: totalTokens(usage),
    status: 'running',
    ...patch,
  });
  const saveMeta = (patch: Partial<JobMeta>) => (uid ? writeJobMeta(uid, meta(patch)).catch(() => undefined) : undefined);

  let brief: GhoulBrief | undefined;
  let caption: string | undefined;

  try {
    // ── Stage 0: sign in + upload the selfie to Firebase Storage ──────────
    set('upload', 'running', 'Summoning an anonymous Firebase user…');
    const user = await ensureSignedIn();
    uid = user.uid;
    update((s) => ({ ...s, jobId, uid }));
    const small = await downscaleImage(photo);
    await uploadToStorage(ghoulPath(uid, jobId, 'selfie.jpg'), small);
    const selfie = await blobToInlineImage(small);
    set('upload', 'done', `ghouls/${uid.slice(0, 6)}…/${jobId.slice(0, 8)}/selfie.jpg`);

    // ── Challenge 2: Gemini 3.8 Flash prompt expansion ────────────────────
    set('brief', 'running', 'Gemini 3.8 Flash is studying your face (thinking: high)…');
    brief = await expandPrompt(selfie, scene);
    const theBrief = brief;
    update((s) => ({ ...s, brief: theBrief }));
    set('brief', 'done', brief.ghoulName);

    // ✍️ Caption runs in parallel while the slow image + video stages work.
    update((s) => ({ ...s, captionState: 'running' }));
    const captionTask = generateCaption({
      name: guest.firstName,
      ghoulName: brief.ghoulName,
      sceneTitle: scene.title,
      personDescription: brief.personDescription,
    })
      .then((c) => {
        caption = c;
        update((s) => ({ ...s, caption: c, captionState: 'done' }));
        if (guest.email) saveSocialPost(guest.email, { caption: c, jobId, ghoulName: theBrief.ghoulName, sceneTitle: scene.title });
      })
      .catch(() => update((s) => ({ ...s, captionState: 'error' })));

    // ── Challenge 3: Nano Banana 2 avatar ─────────────────────────────────
    set('avatar', 'running', 'Nano Banana 2 is stitching your costume…');
    const avatar = await generateAvatar(brief, selfie, orientation);
    const avatarDataUrl = toDataUrl(avatar);
    update((s) => ({ ...s, avatarDataUrl }));
    await uploadToStorage(ghoulPath(uid, jobId, 'avatar.png'), inlineImageToBlob(avatar));
    // 💧 Branded copy (logos) for sharing & printing — Omni still animates the clean avatar.
    const brandedImageBlob = await brandImage(avatarDataUrl, brief.ghoulName);
    const brandedImageUrl = await uploadToStorage(ghoulPath(uid, jobId, 'avatar-branded.jpg'), brandedImageBlob);
    update((s) => ({ ...s, brandedImageBlob, brandedImageUrl }));
    set('avatar', 'done', 'Saved avatar.png + avatar-branded.jpg');
    void saveMeta({ ghoulName: brief.ghoulName });

    // ── Challenge 4: Gemini Omni video (Vercel Function) ─────────────────
    set('video', 'running', 'Waking Gemini Omni in the crypt…');
    const interactionId = await startVideo(jobId, brief.videoPrompt, orientation);
    const { videoUrl, usage: omniUsage } = await waitForVideo(jobId, interactionId, {
      onTick: (t) => set('video', 'running', `Gemini Omni is animating your ghoul… ${t}s`),
    });
    recordInteractionUsage('video', omniUsage);
    update((s) => ({ ...s, videoUrl }));
    set('video', 'done', 'Saved video.mp4 to Firebase Storage');

    // ── Logos on the video (browser re-encode) ────────────────────────────
    set('brand', 'running', 'Adding the AI DevCamp + GDG London logos…');
    try {
      const brandedVideoBlob = await brandVideo(videoUrl, (p) => set('brand', 'running', `Adding event logos… ${p}%`));
      const brandedVideoUrl = await uploadToStorage(
        ghoulPath(uid, jobId, `video-branded.${videoExtension(brandedVideoBlob)}`),
        brandedVideoBlob,
      );
      update((s) => ({ ...s, brandedVideoBlob, brandedVideoUrl }));
      set('brand', 'done', 'Saved branded video');
    } catch (err) {
      // Not fatal: the clean video still plays (with an on-screen logo overlay).
      set('brand', 'error', `Skipped: ${(err as Error).message}. See docs/14 → storage CORS.`);
    }

    await captionTask;
    await saveMeta({ status: 'completed', ghoulName: brief.ghoulName, caption });
  } catch (err) {
    const e = err as Error & { challenge?: number };
    const todoMatch = /Challenge (\d) is still a TODO/.exec(e.message);
    set(current, 'error', e.message);
    update((s) => ({
      ...s,
      error: e.message,
      todoChallenge: e.challenge ?? (todoMatch ? Number(todoMatch[1]) : undefined),
    }));
    await saveMeta({ status: 'failed', error: e.message.slice(0, 500), ghoulName: brief?.ghoulName, caption });
  } finally {
    stopUsage();
  }
}

/** Re-generate just the caption (e.g. the guest didn't like it). */
export async function regenerateCaption(
  state: PipelineState,
  sceneTitle: string,
  guest: GuestDetails,
): Promise<string> {
  const c = await generateCaption({
    name: guest.firstName,
    ghoulName: state.brief?.ghoulName ?? 'a Halloween ghoul',
    sceneTitle,
  });
  if (guest.email && state.jobId) {
    saveSocialPost(guest.email, { caption: c, jobId: state.jobId, ghoulName: state.brief?.ghoulName, sceneTitle });
  }
  return c;
}

export { findPostForJob };
