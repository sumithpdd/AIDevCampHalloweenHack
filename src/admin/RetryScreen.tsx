import { useEffect, useState } from 'react';
import { Progress } from '../components/Progress';
import type { GhoulBrief } from '../lib/briefPrompt';
import type { PipelineState, StageId, StageState } from '../lib/pipeline';

export interface RetryView {
  code?: string;
  sceneTitle?: string;
  firstName?: string;
  selfieUrl?: string;
  portraitUrl?: string;
  videoUrl?: string;
  brief?: GhoulBrief;
  stages: PipelineState['stages'];
  error?: string;
  running: boolean;
  videoStartedAt?: number;
  onClose: () => void;
}

const idle = (detail?: string): { state: StageState; detail?: string } => ({ state: 'idle', detail });

export function freshStages(): PipelineState['stages'] {
  return {
    upload: { state: 'done', detail: 'Photo already saved' },
    brief: { state: 'running', detail: 'Gemini 3.8 Flash is studying the photo…' },
    avatar: idle(),
    video: idle(),
    brand: idle(),
  };
}

export function RetryScreen({ run }: { run: RetryView }) {
  const [seconds, setSeconds] = useState(0);
  const videoRunning = run.stages.video.state === 'running';

  useEffect(() => {
    if (!videoRunning || !run.videoStartedAt) return;
    const tick = () => setSeconds(Math.max(0, Math.round((Date.now() - run.videoStartedAt!) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [videoRunning, run.videoStartedAt]);

  const stages = { ...run.stages };
  if (videoRunning) {
    stages.video = { state: 'running', detail: `Gemini Omni is animating your ghoul… ${seconds}s` };
  }
  const state: PipelineState = {
    stages,
    brief: run.brief,
    sourceUrl: run.selfieUrl,
    avatarDataUrl: run.portraitUrl,
    videoUrl: run.videoUrl,
    code: run.code,
    error: run.error,
    usage: {},
  };

  return (
    <div className="wall">
      <div className="wall-bar">
        <span>
          Retry {run.code ? `· ${run.code}` : ''} {run.running ? '· working' : run.error ? '· failed' : '· done'}
        </span>
        <button type="button" className="btn small ghost" onClick={run.onClose}>
          Close
        </button>
      </div>
      <div className="retry-screen">
        <div className="card">
          <h2>{run.brief?.ghoulName ?? 'The ritual has begun…'}</h2>
          <p className="muted">
            {run.sceneTitle ?? 'Saved photo'}
            {run.firstName ? ` · ${run.firstName}` : ''}
            {run.code ? ` · ${run.code}` : ''}
          </p>
          {run.brief?.personDescription && <p className="muted">{run.brief.personDescription}</p>}

          <Progress state={state} />

          {run.error && (
            <div className="alert">
              <p>{run.error}</p>
            </div>
          )}

          <div className="results portrait">
            {run.selfieUrl && (
              <figure>
                <img src={run.selfieUrl} alt="Photo used" />
                <figcaption>Photo used</figcaption>
              </figure>
            )}
            {run.portraitUrl && (
              <figure>
                <img src={run.portraitUrl} alt="Portrait" />
                <figcaption>Nano Banana 2 avatar</figcaption>
              </figure>
            )}
            {run.videoUrl && (
              <figure className="video-wrap">
                <video src={run.videoUrl} controls autoPlay loop playsInline />
                <figcaption>Gemini Omni video</figcaption>
              </figure>
            )}
          </div>

          {run.brief && (
            <details className="prompts">
              <summary>See the prompts Gemini wrote</summary>
              <h3>Avatar prompt → Nano Banana 2</h3>
              <p>{run.brief.avatarPrompt}</p>
              <h3>Video prompt → Gemini Omni</h3>
              <p>{run.brief.videoPrompt}</p>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

export function markStage(
  stages: PipelineState['stages'],
  id: StageId,
  state: StageState,
  detail?: string,
): PipelineState['stages'] {
  return { ...stages, [id]: { state, detail } };
}
