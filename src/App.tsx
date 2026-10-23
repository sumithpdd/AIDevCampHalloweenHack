import { useEffect, useState } from 'react';
import { PhotoInput } from './components/PhotoInput';
import { Progress } from './components/Progress';
import { StepNav } from './components/StepNav';
import { ScenePicker } from './components/ScenePicker';
import { DetailsForm } from './components/DetailsForm';
import { SharePanel } from './components/SharePanel';
import { PickupCard } from './components/PickupCard';
import { SavedPosts } from './components/SavedPosts';
import { TokenSummary } from './components/TokenSummary';
import { SCENES, type Scene } from './lib/scenes';
import { initialPipeline, regenerateCaption, runPipeline, type GuestDetails, type PipelineState } from './lib/pipeline';
import { isFirebaseConfigured } from './lib/firebase';
import { CHALLENGE_DOCS } from './lib/todo';
import { EVENT } from './lib/branding';
import { deleteJob } from './lib/storage';
import { isValidEmail } from './lib/social-posts-storage';
import { onUsage } from './lib/usage';
import type { Orientation } from './lib/avatar';

const GUEST_KEY = 'haunted_kiosk_guest_v1';
const loadGuest = (): GuestDetails => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) ?? '{}');
  } catch {
    return {};
  }
};

export default function App() {
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [scene, setScene] = useState<Scene>(SCENES[0]);
  const [orientation, setOrientation] = useState<Orientation>('9:16');
  const [guest, setGuest] = useState<GuestDetails>(loadGuest);
  const [consent, setConsent] = useState(false);
  const [running, setRunning] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineState | null>(null);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
    } catch {
      /* ignore */
    }
  }, [guest]);

  const detailsOk = consent && (!guest.email || isValidEmail(guest.email));
  const canGo = (i: number) => {
    if (running) return i === 3;
    if (i === 0) return true;
    if (i === 1) return !!photo;
    if (i === 2) return !!photo;
    return !!pipeline;
  };

  const update = (fn: (s: PipelineState) => PipelineState) => setPipeline((s) => fn(s ?? initialPipeline()));

  const start = async () => {
    if (!photo || !detailsOk) return;
    setStep(3);
    setRunning(true);
    setDeleted(false);
    setPipeline(initialPipeline());
    await runPipeline(photo, scene, orientation, guest, update);
    setRunning(false);
  };

  const newCaption = async () => {
    if (!pipeline) return;
    update((s) => ({ ...s, captionState: 'running' }));
    const stop = onUsage((stage, u) => update((s) => ({ ...s, usage: { ...s.usage, [stage]: u } })));
    try {
      const caption = await regenerateCaption(pipeline, scene.title, guest);
      update((s) => ({ ...s, caption, captionState: 'done' }));
    } catch {
      update((s) => ({ ...s, captionState: 'error' }));
    } finally {
      stop();
    }
  };

  const reset = () => {
    setPipeline(null);
    setPhoto(null);
    setConsent(false);
    setStep(0);
  };

  const removeMine = async () => {
    if (!pipeline?.uid || !pipeline.jobId) return;
    if (!window.confirm('Delete your selfie, portrait and video from our storage? This cannot be undone.')) return;
    await deleteJob(pipeline.uid, pipeline.jobId, pipeline.code);
    setDeleted(true);
  };

  const showVideo = pipeline?.brandedVideoUrl ?? pipeline?.videoUrl;
  const videoIsBranded = !!pipeline?.brandedVideoUrl;

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
          {EVENT.logos.map((src) => (
            <img key={src} src={src} alt="" className="brand-logo" />
          ))}
          <span className="sr-only">{EVENT.name}</span>
        </div>
        <span className="header-links">
          <a className="badge" href="/build">
            Raise your own haunt
          </a>
          <span className="badge">{EVENT.edition}</span>
        </span>
      </header>

      <main className="main">
        <section className="hero">
          <h1>The Haunted Kiosk</h1>
          <p>
            Snap a photo — one person or a group. <b>Gemini 3.8 Flash</b> writes your ghoul brief,{' '}
            <b>Nano Banana 2</b> fits the costumes, and <b>Gemini Omni</b> brings everyone to life.
          </p>
        </section>

        {!isFirebaseConfigured && (
          <div className="alert big">
            🔧 Firebase isn't configured yet. Copy <code>.env.example</code> to <code>.env.local</code>, fill in your
            Firebase web config and restart <code>npm run dev</code>. See <code>docs/02-firebase-setup.md</code>.
          </div>
        )}

        <StepNav step={step} onStep={setStep} canGo={canGo} />

        <div className="card">
          {step === 0 && (
            <>
              <h2>
                <span className="step">1</span> Your photo
              </h2>
              <PhotoInput photo={photo} onPhoto={setPhoto} />
              <div className="row center cta">
                <button className="btn big" disabled={!photo} onClick={() => setStep(1)}>
                  Next: pick a scene →
                </button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2>
                <span className="step">2</span> Your nightmare
              </h2>
              <ScenePicker scene={scene} onScene={setScene} orientation={orientation} onOrientation={setOrientation} />
              <div className="row center cta">
                <button className="btn ghost" onClick={() => setStep(0)}>
                  ← Back
                </button>
                <button className="btn big" onClick={() => setStep(2)}>
                  Next: your details →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2>
                <span className="step">3</span> Your details
              </h2>
              <p className="muted">
                {scene.emoji} <b>{scene.title}</b> · {orientation === '9:16' ? 'Portrait' : 'Landscape'}
              </p>
              <DetailsForm guest={guest} onGuest={setGuest} consent={consent} onConsent={setConsent} />
              <div className="row center cta">
                <button className="btn ghost" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="btn big" onClick={start} disabled={!detailsOk || running}>
                  🕯️ Summon my ghoul
                </button>
              </div>
            </>
          )}

          {step === 3 && pipeline && (
            <>
              <h2>{pipeline.brief?.ghoulName ?? 'The ritual has begun…'}</h2>
              {pipeline.brief?.personDescription && <p className="muted">{pipeline.brief.personDescription}</p>}

              <Progress state={pipeline} />

              {pipeline.code && !deleted && (
                <PickupCard code={pipeline.code} photoUrl={pipeline.brandedImageUrl} videoUrl={showVideo} />
              )}

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

              {deleted ? (
                <div className="alert ok">🧹 Your selfie, portrait and video were deleted from storage.</div>
              ) : (
                <div className={`results ${orientation === '9:16' ? 'portrait' : 'landscape'}`}>
                  {(pipeline.brandedImageUrl ?? pipeline.avatarDataUrl) && (
                    <figure>
                      <img src={pipeline.brandedImageUrl ?? pipeline.avatarDataUrl} alt="Your Halloween avatar" />
                      <figcaption>Nano Banana 2 avatar</figcaption>
                    </figure>
                  )}
                  {showVideo && (
                    <figure className="video-wrap">
                      <video src={showVideo} controls autoPlay loop playsInline />
                      {!videoIsBranded && (
                        <div className="video-logos" aria-hidden>
                          {EVENT.logos.map((src) => (
                            <img key={src} src={src} alt="" />
                          ))}
                        </div>
                      )}
                      <figcaption>Gemini Omni video{videoIsBranded ? ' · with event logos' : ''}</figcaption>
                    </figure>
                  )}
                </div>
              )}

              <TokenSummary usage={pipeline.usage} />

              {!deleted && (pipeline.brandedImageUrl || pipeline.caption) && (
                <SharePanel
                  caption={pipeline.caption ?? ''}
                  onCaption={(caption) => update((s) => ({ ...s, caption }))}
                  captionState={pipeline.captionState}
                  onRegenerate={newCaption}
                  imageBlob={pipeline.brandedImageBlob}
                  imageUrl={pipeline.brandedImageUrl}
                  videoBlob={pipeline.brandedVideoBlob}
                  videoUrl={showVideo}
                  orientation={orientation}
                />
              )}

              {guest.email && isValidEmail(guest.email) && (
                <SavedPosts
                  email={guest.email}
                  refreshKey={pipeline.caption}
                  onUse={(caption) => update((s) => ({ ...s, caption }))}
                />
              )}

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
                  <button
                    className="btn ghost"
                    onClick={() => {
                      setPipeline(null);
                      setStep(1);
                    }}
                  >
                    ↩︎ Try another scene
                  </button>
                  <button className="btn" onClick={reset}>
                    👻 Next guest
                  </button>
                  {pipeline.jobId && !deleted && (
                    <button className="btn ghost danger" onClick={removeMine}>
                      🗑️ Delete my photos
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        Built with Gemini CLI at AI DevCamp × GDG London · Inspired by the Formula E GenMedia codelab ·{' '}
        <a href="/build">Raise your own haunt</a> · <a href="/admin">Admin</a>
      </footer>
    </div>
  );
}
