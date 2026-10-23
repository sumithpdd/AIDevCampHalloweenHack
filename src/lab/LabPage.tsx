import { useEffect, useState } from 'react';
import { EVENT } from '../lib/branding';
import { ArchDiagram } from './ArchDiagram';
import { IDE_PROMPT } from './idePrompt';

const STEPS = [
  { id: 'picture', label: 'The picture' },
  { id: 'ideas', label: 'The ideas' },
  { id: 'locks', label: 'The locks' },
  { id: 'prompt', label: 'The prompt' },
  { id: 'specialists', label: 'Four specialists' },
  { id: 'page', label: 'One page' },
  { id: 'ship', label: 'Ship it' },
  { id: 'done', label: 'You raised it' },
] as const;

const DOCS = 'https://github.com/sumithpdd/AIDevCampHalloweenHack/blob/main/docs';

export function LabPage() {
  const [step, setStep] = useState(() => stepFromHash());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onHash = () => setStep(stepFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, next));
    window.location.hash = String(clamped);
    setStep(clamped);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(IDE_PROMPT);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="page">
      <div className="fog" aria-hidden />
      <header className="header">
        <a className="brand" href="/">
          {EVENT.logos.map((src) => (
            <img key={src} src={src} alt="" className="brand-logo" />
          ))}
          <span>Raise Your Own Haunt</span>
        </a>
        <a className="badge" href="/">
          Back to the booth
        </a>
      </header>

      <main className="main wide lab">
        <p className="lab-kicker">Build it yourself · concepts first</p>
        <h1 className="lab-title">Raise Your Own Haunt</h1>
        <p className="lab-lead">
          A step-by-step twin of the Formula E GenMedia codelab. Same four ideas — a brief, a portrait, a video job,
          and a lock on the key. This booth uses React, Firebase, and Vercel. You scaffold your own app from a prompt.
        </p>

        <ol className="lab-nav">
          {STEPS.map((item, i) => (
            <li key={item.id}>
              <button type="button" className={i === step ? 'on' : ''} onClick={() => go(i)} aria-current={i === step ? 'step' : undefined}>
                <span>{i}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ol>

        <article className="card lab-step">
          {step === 0 && <Intro />}
          {step === 1 && <Ideas />}
          {step === 2 && <Locks />}
          {step === 3 && <Prompt onCopy={copyPrompt} copied={copied} />}
          {step === 4 && <Specialists />}
          {step === 5 && <OnePage />}
          {step === 6 && <Ship />}
          {step === 7 && <Done />}
        </article>

        <div className="lab-pager">
          <button type="button" className="btn ghost" disabled={step === 0} onClick={() => go(step - 1)}>
            Back
          </button>
          <span>
            Step {step} of {STEPS.length - 1}
          </span>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn" onClick={() => go(step + 1)}>
              Next
            </button>
          ) : (
            <a className="btn" href="/">
              Open the booth
            </a>
          )}
        </div>
      </main>
    </div>
  );
}

function Intro() {
  return (
    <>
      <h2>0 · What you are raising</h2>
      <p>
        A guest uploads a photo of one person or a group, picks a scene, and gets a name, a portrait, and an
        eight-second video. The people in the photo stay the same people. Clothes, props, and the room change.
      </p>
      <p className="concept">
        Concept — one photo, three jobs. You do not ask one model to “make me a vampire.” A text model writes a
        brief, an image model edits the photo, a video model animates that portrait.
      </p>
      <ArchDiagram />
      <TechStrip />
      <p>
        This page is the short path. The same story lives in the repo docs, starting at{' '}
        <a href={`${DOCS}/00-overview.md`}>the overview</a> and the{' '}
        <a href={`${DOCS}/15-workshop.md`}>workshop</a>. The inspiration is Google’s{' '}
        <a href="https://codelabs.developers.google.com/formula-e-genmedia-lab-codelab?hl=en#0">Formula E GenMedia codelab</a>.
      </p>
    </>
  );
}

function Ideas() {
  return (
    <>
      <h2>1 · Learn the ideas before you open a file</h2>
      <p>Write one scene on paper. Three short strings are the whole recipe.</p>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>What it decides</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>costume</td>
            <td>What they wear. Not a new face.</td>
          </tr>
          <tr>
            <td>setting</td>
            <td>The room behind them.</td>
          </tr>
          <tr>
            <td>motion</td>
            <td>What the camera and the cloth do for 8 seconds.</td>
          </tr>
        </tbody>
      </table>
      <p>Gemini 3.8 Flash looks at the photo and those strings and returns a brief with four fields:</p>
      <ul>
        <li>
          <b>ghoulName</b> — the title on screen. A group gets a group name.
        </li>
        <li>
          <b>personDescription</b> — one neutral sentence about who is visible.
        </li>
        <li>
          <b>avatarPrompt</b> — instructions for the portrait.
        </li>
        <li>
          <b>videoPrompt</b> — instructions for the 8-second shot.
        </li>
      </ul>
      <p className="concept">
        Concept — structured output. Temperature about 0.2 and thinking set to high. The response is JSON with a
        schema, so the next step reads fields instead of an essay.
      </p>
      <p className="concept">
        Concept — the photograph stays in the request. The portrait call sends the photo bytes next to the prompt.
        Describing a face in words and hoping the image model invents the same person is a different product.
      </p>
      <p>
        Checkpoint: write costume, setting, and motion for a theme you care about. You will paste them into the
        prompt in step 3. Longer notes: <a href={`${DOCS}/05-challenge-2-prompt-expansion.md`}>Challenge 2</a>.
      </p>
    </>
  );
}

function Locks() {
  return (
    <>
      <h2>2 · Two doors, and a lock on each</h2>
      <table>
        <thead>
          <tr>
            <th>Call</th>
            <th>Where</th>
            <th>Credential</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Brief and portrait</td>
            <td>Browser, Firebase AI Logic</td>
            <td>The Firebase project. App Check must pass. No Gemini key in the page.</td>
          </tr>
          <tr>
            <td>Video</td>
            <td>Vercel function, Interactions API</td>
            <td>
              <code>GEMINI_API_KEY</code>, never prefixed with <code>VITE_</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="concept">
        Concept — a guest is a uid. Anonymous sign-in creates a folder, <code>ghouls/&#123;uid&#125;/&#123;jobId&#125;/</code>.
        The browser may upload images only. The function writes <code>video.mp4</code> with the Admin SDK after it
        checks the Firebase ID token.
      </p>
      <p className="concept">
        Concept — App Check is the lock on the Gemini proxy. A missing token returns 401 even when the photo upload
        worked. Localhost uses a debug token. A public URL uses a reCAPTCHA Enterprise site key. The debug token
        never goes on Vercel.
      </p>
      <ul>
        <li>Firebase on the Blaze plan, so Storage can be used.</li>
        <li>Gemini Prepay credits in AI Studio. Blaze does not pay for Gemini. An empty balance returns 429.</li>
        <li>
          Keys live in <code>.env.local</code> and in Vercel env. They never go in source or in the assistant chat.
        </li>
      </ul>
      <p>
        Walkthrough: <a href={`${DOCS}/02-firebase-setup.md`}>Firebase setup</a> and{' '}
        <a href={`${DOCS}/01-prerequisites.md`}>prerequisites</a>.
      </p>
    </>
  );
}

function Prompt({ onCopy, copied }: { onCopy: () => void; copied: boolean }) {
  return (
    <>
      <h2>3 · Start from a prompt in your IDE</h2>
      <p>
        Create an empty folder, not this repo. Open it in Cursor, VS Code, Claude, Gemini, or Antigravity. Paste the
        brief. Attach the scene you wrote in step 1. Do not attach <code>.env.local</code>.
      </p>
      <p>Tell the assistant which shell you want. Both are valid:</p>
      <ul>
        <li>
          <b>Vite + React</b> — the same shape as this booth.
        </li>
        <li>
          <b>Next.js on Vercel</b> — the video routes live in the app instead of a separate <code>api/</code> folder.
        </li>
      </ul>
      <div className="lab-codehead">
        <span>Brief to paste</span>
        <button type="button" className="btn" onClick={onCopy}>
          {copied ? 'Copied' : 'Copy prompt'}
        </button>
      </div>
      <pre className="lab-code">{IDE_PROMPT}</pre>
      <p className="concept">
        Concept — the assistant writes the app. You still create the Firebase project, the App Check key, and the
        Gemini key yourself. If it invents a key, throw that file away.
      </p>
    </>
  );
}

function Specialists() {
  return (
    <>
      <h2>4 · Four specialists, in order</h2>
      <ol className="lab-list">
        <li>
          <b>Firebase AI Logic client.</b> <code>getAI</code> with <code>GoogleAIBackend</code>. This is the browser
          door. Reference: <a href={`${DOCS}/04-challenge-1-firebase-ai-logic.md`}>Challenge 1</a>.
        </li>
        <li>
          <b>Gemini 3.8 Flash writes the brief.</b> Text plus the photo. JSON only. Identity lock: same people, same
          faces. Reference: <a href={`${DOCS}/05-challenge-2-prompt-expansion.md`}>Challenge 2</a>.
        </li>
        <li>
          <b>Nano Banana 2 edits the photo.</b> Model <code>gemini-3.1-flash-image</code>. Ask for an image, set 9:16
          or 16:9, send the original bytes again. Change clothing and the room. Reference:{' '}
          <a href={`${DOCS}/06-challenge-3-nano-banana-avatar.md`}>Challenge 3</a>.
        </li>
        <li>
          <b>Gemini Omni animates the portrait.</b> The function calls <code>interactions.create</code> with{' '}
          <code>background: true</code> and returns an id. The page polls <code>interactions.get</code> every 5
          seconds. A serverless function cannot sit in a loop. Reference:{' '}
          <a href={`${DOCS}/07-challenge-4-omni-video.md`}>Challenge 4</a>.
        </li>
      </ol>
      <p className="concept">
        Concept — video is a job, not a request. Start it, remember the id, ask “done yet?” until Storage has the
        mp4.
      </p>
    </>
  );
}

function OnePage() {
  return (
    <>
      <h2>5 · One page is enough</h2>
      <p>The light app is a single screen. This repo’s booth adds scenes, logos, captions, and an admin page later.</p>
      <table>
        <thead>
          <tr>
            <th>On the page</th>
            <th>Leave for this repo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Photo input, three scenes, one button</td>
            <td>Curated scene mixer</td>
          </tr>
          <tr>
            <td>Status for upload, brief, portrait, video</td>
            <td>Logos burned into the file</td>
          </tr>
          <tr>
            <td>Name, portrait, playing video</td>
            <td>Captions, print, share, /admin</td>
          </tr>
        </tbody>
      </table>
      <p>The stage order does not change: upload, brief, portrait, video. Anonymous auth and the storage path stay.</p>
      <p>
        When the light app works, read <a href={`${DOCS}/14-advanced-level.md`}>the advanced booth</a> if you want the
        extras. Do not start by copying <code>App.tsx</code>.
      </p>
    </>
  );
}

function Ship() {
  return (
    <>
      <h2>6 · Put it on Vercel and try a real photo</h2>
      <ol className="lab-list">
        <li>Run it locally. A photo of you, or of a group, should produce a name, a portrait, and a playing video.</li>
        <li>
          Confirm the portrait still looks like the people in the photo. If a face was replaced, the identity lock
          was dropped from the prompt.
        </li>
        <li>
          Deploy to Vercel. Set <code>GEMINI_API_KEY</code> and <code>FIREBASE_SERVICE_ACCOUNT_BASE64</code> as
          secrets. Set the <code>VITE_</code> values as config.
        </li>
        <li>
          Add the Vercel hostname under Firebase Authentication → Authorized domains, and on the reCAPTCHA Enterprise
          key. Redeploy after any <code>VITE_</code> change. Vite inlines those at build time.
        </li>
      </ol>
      <p>
        If a stage fails, the usual causes are App Check 401 and Prepay 429. See{' '}
        <a href={`${DOCS}/11-troubleshooting.md`}>troubleshooting</a> and{' '}
        <a href={`${DOCS}/09-deploy-vercel.md`}>deploy notes</a>.
      </p>
      <p className="concept">
        Done when you can explain, without looking at the UI, why the video call is on the server and the brief call
        is not.
      </p>
    </>
  );
}

function Done() {
  return (
    <div className="lab-done">
      <p className="lab-burst" aria-hidden>
        🎃
      </p>
      <h2>You raised a haunt</h2>
      <p>The booth in the other tab is the reference. Yours is the one you can explain.</p>
      <ul>
        <li>A scene is a recipe. A brief is the contract between three models.</li>
        <li>The photo stays in the request, so one person or a group stays recognisable.</li>
        <li>The browser may call Firebase AI Logic. Only the server may hold the Gemini key.</li>
        <li>Video is a background job. The page polls. The function does not wait.</li>
        <li>App Check is why a public site cannot burn your quota with a copied API key.</li>
      </ul>
      <p>
        <a className="btn" href="/">
          Try the reference booth
        </a>
      </p>
    </div>
  );
}

function TechStrip() {
  const chips = ['React', 'Vite or Next.js', 'Firebase', 'Gemini', 'Vercel'];
  return (
    <div className="tech">
      {EVENT.logos.map((src) => (
        <img key={src} src={src} alt="" className="brand-logo" />
      ))}
      {chips.map((name) => (
        <span key={name} className="tech-chip">
          {name}
        </span>
      ))}
    </div>
  );
}

function stepFromHash() {
  const n = Number(window.location.hash.replace('#', ''));
  return Number.isInteger(n) && n >= 0 && n < STEPS.length ? n : 0;
}
