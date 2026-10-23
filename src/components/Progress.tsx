import type { PipelineState, StageId } from '../lib/pipeline';
import { MODELS } from '../lib/models';
import { describeUsage, type UsageStage } from '../lib/usage';

const STAGES: { id: StageId; title: string; model: string; challenge?: number; usage?: UsageStage }[] = [
  { id: 'upload', title: 'Upload photo', model: 'Firebase Auth + Storage' },
  { id: 'brief', title: 'Write the ghoul brief', model: MODELS.prompt, challenge: 2, usage: 'brief' },
  { id: 'avatar', title: 'Render the avatar', model: `Nano Banana 2 · ${MODELS.image}`, challenge: 3, usage: 'avatar' },
  { id: 'video', title: 'Animate the video', model: MODELS.video, challenge: 4, usage: 'video' },
  { id: 'brand', title: 'Add event logos', model: 'Canvas + MediaRecorder (in your browser)' },
];

const ICON = { idle: '⚪', running: '🔮', done: '🎃', error: '💀' } as const;

export function Progress({ state }: { state: PipelineState }) {
  return (
    <ol className="stages">
      {STAGES.map((s) => {
        const st = state.stages[s.id];
        const tokens = s.usage ? describeUsage(state.usage[s.usage]) : '';
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
              {tokens && <div className="stage-tokens">🔢 {tokens}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
