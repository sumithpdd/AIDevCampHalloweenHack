import { useState } from 'react';
import { PhotoInput } from './components/PhotoInput';
import { Progress } from './components/Progress';
import { SCENES, type Scene } from './lib/scenes';
import { initialPipeline, runPipeline, type PipelineState } from './lib/pipeline';
import { isFirebaseConfigured } from './lib/firebase';
import { CHALLENGE_DOCS } from './lib/todo';
import type { Orientation } from './lib/avatar';

export default function App() {
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [scene, setScene] = useState<Scene>(SCENES[0]);
  const [orientation, setOrientation] = useState<Orientation>('9:16');
  const [running, setRunning] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineState | null>(null);

  const start = async () => {
    if (!photo) return;
    setRunning(true);
    setPipeline(initialPipeline());
    await runPipeline(photo, scene, orientation, (fn) => setPipeline((s) => fn(s ?? initialPipeline())));
    setRunning(false);
  };

  const reset = () => {
    setPipeline(null);
    setPhoto(null);
  };

  return (
    <div className="page">
      <div className="fog" aria-hidden />
      <div className="bats" aria-hidden>
        <span>🦇</span>
        <span>🦇</span>
        <span>🦇</span>
      </div>

      <header className="header">
        <div className="brand">
          <span className="brand-mark">🎃</span>
          <span>
            AI DevCamp <span className="x">×</span> GDG London
          </span>
        </div>
        <span className="badge">Halloween Hack · Winner Lab</span>
      </header>

      <main className="main">
        <section className="hero">
          <h1>The Haunted Kiosk</h1>
          <p>
            Snap a selfie. <b>Gemini 3.8 Flash</b> writes your ghoul brief, <b>Nano Banana 2</b> fits the costume,
            and <b>Gemini Omni</b> brings you to life.
          </p>
          <p className="stack">React · Firebase AI Logic · Firebase Storage · Vercel Functions</p>
        </section>

        {!isFirebaseConfigured && (
          <div className="alert big">
            🔧 Firebase isn't configured yet. Copy <code>.env.example</code> to <code>.env.local</code>, fill in your
            Firebase web config and restart <code>npm run dev</code>. See <code>docs/02-firebase-setup.md</code>.
          </div>
        )}

        {!pipeline ? (
          <div className="card">
            <h2>
              <span className="step">1</span> Your face
            </h2>
            <PhotoInput photo={photo} onPhoto={setPhoto} />

            <h2>
              <span className="step">2</span> Your nightmare
            </h2>
            <div className="scenes">
              {SCENES.map((s) => (
                <button
                  key={s.id}
                  className={`scene ${scene.id === s.id ? 'selected' : ''}`}
                  onClick={() => setScene(s)}
                  aria-pressed={scene.id === s.id}
                >
                  <span className="scene-emoji">{s.emoji}</span>
                  <span className="scene-title">{s.title}</span>
                </button>
              ))}
            </div>

            <h2>
              <span className="step">3</span> Your screen
            </h2>
            <div className="row center">
              {(['9:16', '16:9'] as Orientation[]).map((o) => (
                <button key={o} className={`tab ${orientation === o ? 'active' : ''}`} onClick={() => setOrientation(o)}>
                  {o === '9:16' ? '📱 Portrait 9:16' : '🖥️ Landscape 16:9'}
                </button>
              ))}
            </div>

            <div className="row center cta">
              <button className="btn big" onClick={start} disabled={!photo || running}>
                🕯️ Summon my ghoul
              </button>
            </div>
          </div>
        ) : (
          <div className="card">
            <h2>{pipeline.brief?.ghoulName ?? 'The ritual has begun…'}</h2>
            {pipeline.brief?.personDescription && <p className="muted">{pipeline.brief.personDescription}</p>}

            <Progress state={pipeline} />

            {pipeline.error && (
              <div className="alert">
                <p>{pipeline.error}</p>
                {pipeline.todoChallenge && (
                  <p>
                    Open <code>{CHALLENGE_DOCS[pipeline.todoChallenge]}</code>, finish the TODO, save — Vite reloads
                    instantly. Or ask Gemini CLI: <code>/hack:hint {pipeline.todoChallenge}</code>
                  </p>
                )}
              </div>
            )}

            <div className={`results ${orientation === '9:16' ? 'portrait' : 'landscape'}`}>
              {pipeline.avatarDataUrl && (
                <figure>
                  <img src={pipeline.avatarDataUrl} alt="Your Halloween avatar" />
                  <figcaption>Nano Banana 2 avatar</figcaption>
                </figure>
              )}
              {pipeline.videoUrl && (
                <figure>
                  <video src={pipeline.videoUrl} controls autoPlay loop playsInline />
                  <figcaption>
                    Gemini Omni video ·{' '}
                    <a href={pipeline.videoUrl} target="_blank" rel="noreferrer">
                      open / download
                    </a>
                  </figcaption>
                </figure>
              )}
            </div>

            {pipeline.brief && (
              <details className="prompts">
                <summary>🔍 See the prompts Gemini wrote</summary>
                <h3>Avatar prompt → Nano Banana 2</h3>
                <p>{pipeline.brief.avatarPrompt}</p>
                <h3>Video prompt → Gemini Omni</h3>
                <p>{pipeline.brief.videoPrompt}</p>
              </details>
            )}

            {!running && (
              <div className="row center cta">
                <button className="btn ghost" onClick={() => setPipeline(null)}>
                  ↩︎ Try another scene
                </button>
                <button className="btn" onClick={reset}>
                  👻 New victim
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        Built with Gemini CLI at AI DevCamp × GDG London · Inspired by the Formula E GenMedia codelab
      </footer>
    </div>
  );
}
