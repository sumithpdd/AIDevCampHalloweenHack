import { useState } from 'react';
import { BOOTH_SCENES, composeScene, resolveBoothScene } from '../data/booth-scenes';
import { BACKGROUNDS, getBackgroundById } from '../data/backgrounds';
import { PROMPTS } from '../data/prompts';
import type { Scene } from '../lib/scenes';
import type { Orientation } from '../lib/avatar';

type Mode = 'curated' | 'mix';

export function ScenePicker({
  scene,
  onScene,
  orientation,
  onOrientation,
}: {
  scene: Scene;
  onScene: (s: Scene) => void;
  orientation: Orientation;
  onOrientation: (o: Orientation) => void;
}) {
  const [mode, setMode] = useState<Mode>(scene.id.startsWith('mix-') ? 'mix' : 'curated');
  const [bgId, setBgId] = useState(BACKGROUNDS[0].id);
  const [promptId, setPromptId] = useState(PROMPTS[0].id);

  const mix = (b: string, p: string) => {
    setBgId(b);
    setPromptId(p);
    onScene(composeScene(b, p));
  };

  return (
    <div>
      <div className="tabs">
        <button className={`tab ${mode === 'curated' ? 'active' : ''}`} onClick={() => setMode('curated')}>
          🎬 Curated scenes
        </button>
        <button
          className={`tab ${mode === 'mix' ? 'active' : ''}`}
          onClick={() => {
            setMode('mix');
            mix(bgId, promptId);
          }}
        >
          🧪 Mix your own
        </button>
      </div>

      {mode === 'curated' ? (
        <div className="scenes">
          {BOOTH_SCENES.map((s) => {
            const bg = getBackgroundById(s.backgroundId);
            return (
              <button
                key={s.id}
                className={`scene ${scene.id === s.id ? 'selected' : ''}`}
                onClick={() => onScene(resolveBoothScene(s))}
                aria-pressed={scene.id === s.id}
              >
                <span className="scene-art" style={{ background: bg?.preview }}>
                  <span className="scene-emoji">{s.emoji}</span>
                  {s.featured && <span className="scene-badge">★ Featured</span>}
                </span>
                <span className="scene-title">{s.title}</span>
                <span className="scene-desc">{s.description}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <h3 className="mini-title">Backdrop</h3>
          <div className="chips">
            {BACKGROUNDS.map((b) => (
              <button key={b.id} className={`chip-btn ${bgId === b.id ? 'active' : ''}`} onClick={() => mix(b.id, promptId)}>
                <span className="chip-swatch" style={{ background: b.preview }} /> {b.emoji} {b.name}
              </button>
            ))}
          </div>
          <h3 className="mini-title">Character</h3>
          <div className="chips">
            {PROMPTS.map((p) => (
              <button key={p.id} className={`chip-btn ${promptId === p.id ? 'active' : ''}`} onClick={() => mix(bgId, p.id)}>
                {p.emoji} {p.title}
              </button>
            ))}
          </div>
        </>
      )}

      <h3 className="mini-title">Screen</h3>
      <div className="row center">
        {(['9:16', '16:9'] as Orientation[]).map((o) => (
          <button key={o} className={`tab ${orientation === o ? 'active' : ''}`} onClick={() => onOrientation(o)}>
            {o === '9:16' ? '📱 Portrait 9:16 (Reels, Stories, print)' : '🖥️ Landscape 16:9'}
          </button>
        ))}
      </div>
    </div>
  );
}
