import type { PipelineState, StageId } from '../lib/pipeline';
import { MODELS } from '../lib/models';

const STAGES: { id: StageId; title: string; model: string; challenge?: number }[] = [
  { id: 'upload', title: 'Upload selfie', model: 'Firebase Auth + Storage' },
  { id: 'brief', title: 'Write the ghoul brief', model: MODELS.prompt, challenge: 2 },
  { id: 'avatar', title: 'Render the avatar', model: `Nano Banana 2 · ${MODELS.image}`, challenge: 3 },
  { id: 'video', title: 'Animate the video', model: MODELS.video, challenge: 4 },
];

const ICON = { idle: '⚪', running: '🔮', done: '🎃', error: '💀' } as const;

export function Progress({ state }: { state: PipelineState }) {
  return (
    <ol className="stages">
      {STAGES.map((s) => {
        const st = state.stages[s.id];
        return (
          <li key={s.id} className={`stage ${st.state}`}>
            <span className="stage-icon" aria-hidden>
              {ICON[st.state]}
            </span>
            <div>
              <div className="stage-title">
                {s.title}
                {s.challenge && <span className="chip">Challenge {s.challenge}</span>}
              </div>
              <div className="stage-model">{s.model}</div>
              {st.detail && <div className="stage-detail">{st.detail}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
