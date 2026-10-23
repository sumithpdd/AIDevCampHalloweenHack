import { EVENT } from '../lib/branding';
import { ArchDiagram } from './ArchDiagram';
import { IDE_PROMPT } from './idePrompt';

const DOCS = 'https://github.com/sumithpdd/AIDevCampHalloweenHack/blob/main/docs';

export const STEPS = [
  { id: 'picture', label: 'Picture', icon: '🕯️' },
  { id: 'kit', label: 'Your kit', icon: '🔮' },
  { id: 'scene', label: 'The scene', icon: '📜' },
  { id: 'project', label: 'Firebase', icon: '🔥' },
  { id: 'services', label: 'Services', icon: '🕷️' },
  { id: 'keys', label: 'Keys', icon: '🗝️' },
  { id: 'c1', label: 'Challenge 1', icon: '👻' },
  { id: 'c2', label: 'Challenge 2', icon: '🦇' },
  { id: 'c3', label: 'Challenge 3', icon: '🧛' },
  { id: 'c4', label: 'Challenge 4', icon: '💀' },
  { id: 'page', label: 'One page', icon: '📖' },
  { id: 'prompt', label: 'The prompt', icon: '🩸' },
  { id: 'ship', label: 'Ship', icon: '⚰️' },
  { id: 'done', label: 'Done', icon: '🎃' },
] as const;

export function LabStep({
  step,
  onCopy,
  copied,
}: {
  step: number;
  onCopy: () => void;
  copied: boolean;
}) {
  if (step === 0) return <Intro />;
  if (step === 1) return <Kit />;
  if (step === 2) return <Scene />;
  if (step === 3) return <Project />;
  if (step === 4) return <Services />;
  if (step === 5) return <Keys />;
  if (step === 6) return <Challenge1 />;
  if (step === 7) return <Challenge2 />;
  if (step === 8) return <Challenge3 />;
  if (step === 9) return <Challenge4 />;
  if (step === 10) return <OnePage />;
  if (step === 11) return <Prompt onCopy={onCopy} copied={copied} />;
  if (step === 12) return <Ship />;
  return <Done />;
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
        Concept — one photo, three jobs. A text model writes a brief, an image model edits the photo, a video model
        animates that portrait. You set each job up on its own. The single Generate button comes after all four
        challenges already work.
      </p>
      <ArchDiagram />
      <TechStrip />
      <p>Do the steps in order. Each one ends with a checkpoint you can see before you continue.</p>
      <ol className="lab-list">
        <li>Your kit, then a scene written in three sentences.</li>
        <li>A Firebase project, the services, and a filled <code>.env.local</code>. Still no page.</li>
        <li>Challenge 1 signs a guest in. Challenge 2 returns JSON. Challenge 3 returns a portrait. Challenge 4 returns a video.</li>
        <li>Only then do you put those four calls behind one button and deploy.</li>
      </ol>
      <p>
        The same path is written in <a href={`${DOCS}/16-raise-your-own-haunt.md`}>the lab notes</a>. The inspiration
        is Google’s{' '}
        <a href="https://codelabs.developers.google.com/formula-e-genmedia-lab-codelab?hl=en#0">Formula E GenMedia codelab</a>.
      </p>
    </>
  );
}

function Kit() {
  return (
    <>
      <h2>1 · Get the kit before you create a project</h2>
      <p>You need accounts and three tools. The app folder comes later.</p>
      <h3>Accounts</h3>
      <ol className="lab-list">
        <li>
          A Google account that can open the <a href="https://console.firebase.google.com">Firebase console</a> and{' '}
          <a href="https://aistudio.google.com">Google AI Studio</a>.
        </li>
        <li>
          Firebase on the <b>Blaze</b> plan. Storage will not create a bucket on the free plan. Set a budget alert.
          £10 is enough for a hack.
        </li>
        <li>
          <b>Prepay credits</b> in AI Studio. Blaze pays for Storage. It does not pay for Gemini. A balance of $0
          makes the brief return <code>429</code>. The smallest purchase is $5.
        </li>
        <li>A Vercel account and a GitHub account, for the last step. You do not need them yet.</li>
      </ol>
      <h3>On your laptop</h3>
      <ol className="lab-list">
        <li>Node.js 20 or newer. Check with <code>node -v</code>.</li>
        <li>Git.</li>
        <li>
          One assistant: Cursor, VS Code, Claude, Gemini, or Antigravity. It will write files. It must not invent
          keys, and you must not paste keys into the chat.
        </li>
        <li>
          Firebase CLI: <code>npm install -g firebase-tools</code>, then <code>firebase login</code>.
        </li>
      </ol>
      <p className="lab-check">
        Checkpoint — <code>node -v</code> prints v20 or newer, <code>firebase --version</code> prints a version, and
        you can open both consoles while signed in.
      </p>
    </>
  );
}

function Scene() {
  return (
    <>
      <h2>2 · Write one scene, still on paper</h2>
      <p>Three short strings are the whole recipe. Costume is clothing. It is not a new face.</p>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Write this</th>
            <th>Leave this out</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>costume</td>
            <td>high-collared cape and evening clothes, natural skin</td>
            <td>pale skin, skull paint, a different person</td>
          </tr>
          <tr>
            <td>setting</td>
            <td>Tower Bridge at midnight, fog, a red moon</td>
            <td>a new face in the fog</td>
          </tr>
          <tr>
            <td>motion</td>
            <td>slow push-in, the cape billows, bats cross the fog</td>
            <td>the face morphs, someone walks into frame</td>
          </tr>
        </tbody>
      </table>
      <p>Write three of your own, for a theme you care about. Halloween can stay, or pick another theme. Save them. You will paste them into the prompt near the end.</p>
      <p>
        Later, Gemini 3.8 Flash looks at the photo and those three strings and returns <b>ghoulName</b>,{' '}
        <b>personDescription</b>, <b>avatarPrompt</b>, and <b>videoPrompt</b>. A group photo keeps every clearly
        visible person, in the same left-to-right order.
      </p>
      <p className="lab-check">Checkpoint — you have three sentences saved. You have not created a React file.</p>
    </>
  );
}

function Project() {
  return (
    <>
      <h2>3 · Create the Firebase project</h2>
      <p>This is a console task. Do it yourself. The assistant does not have your Google login.</p>
      <ol className="lab-list">
        <li>
          <a href="https://console.firebase.google.com">Firebase console</a> → <b>Create a project</b>. Name it{' '}
          <code>haunted-kiosk-</code> plus your name. Analytics is optional.
        </li>
        <li>
          Bottom left <b>Upgrade</b> → <b>Blaze</b>. Set a budget alert before you continue.
        </li>
        <li>
          Project overview → the <b>{'</>'}</b> Web icon. Nickname <code>haunted-kiosk-web</code>. Leave Firebase
          Hosting unticked. You will use Vercel. Click <b>Register app</b>.
        </li>
        <li>
          Copy the six <code>firebaseConfig</code> values into a note: apiKey, authDomain, projectId, storageBucket,
          messagingSenderId, appId. The web apiKey identifies the project. It is not a Gemini key.
        </li>
      </ol>
      <p className="lab-check">
        Checkpoint — the project overview shows a web app, the plan says Blaze, and the six values are written down.
        You still have no app folder.
      </p>
      <p>
        Click path with screenshots in mind: <a href={`${DOCS}/02-firebase-setup.md`}>Firebase setup §2.1–2.2</a>.
      </p>
    </>
  );
}

function Services() {
  return (
    <>
      <h2>4 · Turn on the three services</h2>
      <p>Stay in the same Firebase project. Turn these on before any code calls them.</p>
      <h3>Firebase AI Logic</h3>
      <ol className="lab-list">
        <li>Left menu → <b>AI Logic</b> → <b>Get started</b>.</li>
        <li>
          Choose <b>Gemini Developer API</b>. That is the backend <code>GoogleAIBackend</code> uses in Challenge 1.
        </li>
        <li>
          Firebase creates a Gemini key for its own proxy. Do not copy that key into your page. The browser never
          sees it.
        </li>
      </ol>
      <h3>Anonymous sign-in</h3>
      <ol className="lab-list">
        <li>
          <b>Build → Authentication → Get started → Sign-in method → Anonymous → Enable → Save.</b>
        </li>
        <li>
          Each guest becomes a uid. Their files live at <code>ghouls/&#123;uid&#125;/&#123;jobId&#125;/</code>.
        </li>
      </ol>
      <h3>Storage</h3>
      <ol className="lab-list">
        <li>
          <b>Build → Storage → Get started</b>. Location <b>europe-west2 (London)</b>. Start in production mode.
        </li>
        <li>
          Rules, once you have the Firebase CLI logged in: the owner may read and write images under their own{' '}
          <code>ghouls/&#123;uid&#125;/</code> folder, under 10 MB. Everything else is denied. <code>video.mp4</code>{' '}
          is written by the server with the Admin SDK, which bypasses rules.
        </li>
        <li>
          From a folder that contains <code>storage.rules</code> and a <code>.firebaserc</code> whose default project
          is yours: <code>npm run firebase:deploy-rules</code>.
        </li>
      </ol>
      <p className="lab-check">
        Checkpoint — AI Logic says Gemini Developer API, Anonymous is enabled, and Storage shows a bucket in
        europe-west2.
      </p>
    </>
  );
}

function Keys() {
  return (
    <>
      <h2>5 · Fill .env.local before the first line of UI</h2>
      <p>
        Create an empty folder, <code>my-light-kiosk</code>, and put this file in it. Gitignore it. Never paste it
        into the assistant.
      </p>
      <h3>Browser config, from step 3</h3>
      <pre className="lab-code">{`VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=`}</pre>
      <h3>App Check, or the brief will 401</h3>
      <ol className="lab-list">
        <li>
          Firebase → <b>App Check → Apps</b> → your web app → register <b>reCAPTCHA Enterprise</b>. Add{' '}
          <code>localhost</code> to the key’s domains now. You will add the Vercel hostname in the ship step.
        </li>
        <li>
          Same app → the menu → <b>Manage debug tokens → Add debug token → Generate</b>. Name it{' '}
          <code>my-laptop</code>. Copy the UUID into <code>VITE_APPCHECK_DEBUG_TOKEN</code>.
        </li>
        <li>
          Put the reCAPTCHA site key in <code>VITE_RECAPTCHA_ENTERPRISE_SITE_KEY</code>. A site key is public. The
          debug token is a password for your laptop. It stays out of Vercel.
        </li>
        <li>
          <b>App Check → APIs → Firebase AI Logic</b> should say <b>Enforced</b>. Leave it on.
        </li>
      </ol>
      <h3>Server secrets</h3>
      <ol className="lab-list">
        <li>
          Project settings → <b>Service accounts → Generate new private key</b>. Base64-encode the JSON on one line.
          On PowerShell:{' '}
          <code>[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))</code>. That line is{' '}
          <code>FIREBASE_SERVICE_ACCOUNT_BASE64</code>. Move the JSON file out of the project folder.
        </li>
        <li>
          <code>FIREBASE_STORAGE_BUCKET</code> is the same bucket name as <code>VITE_FIREBASE_STORAGE_BUCKET</code>,
          without a <code>VITE_</code> prefix.
        </li>
        <li>
          <a href="https://aistudio.google.com/apikey">AI Studio → API keys</a> → create a key on this Google Cloud
          project. Buy Prepay credits. Put the key in <code>GEMINI_API_KEY</code>. No <code>VITE_</code> prefix, or
          Vite will ship it to the browser.
        </li>
        <li>
          <code>OMNI_MODEL=gemini-omni-1.1-flash</code>
        </li>
      </ol>
      <p className="lab-check">
        Checkpoint — the file exists, the debug token is a UUID, <code>GEMINI_API_KEY</code> has no{' '}
        <code>VITE_</code> prefix, and the service-account JSON is not inside the folder. Restart the dev server
        after every edit to this file.
      </p>
    </>
  );
}

function Challenge1() {
  return (
    <>
      <h2>6 · Challenge 1 — the client, and nothing else</h2>
      <p>You are proving the door opens. Do not call Gemini in this step.</p>
      <p className="concept">
        Concept — Firebase AI Logic is a proxy. <code>getAI</code> plus <code>GoogleAIBackend</code> asks your
        project for Gemini. App Check decides whether the call may spend quota. The page never holds a Gemini key.
      </p>
      <h3>Create only these pieces</h3>
      <ol className="lab-list">
        <li>
          <code>npm install firebase</code>. Initialise Vite + React, or Next.js, if the folder is still empty.
        </li>
        <li>
          <code>initializeApp</code> with the six <code>VITE_FIREBASE_</code> values. If any value is empty, show a
          banner and stop. Do not call Firebase with blanks.
        </li>
        <li>
          App Check before any AI call. In <code>import.meta.env.DEV</code>, if the debug token is set, pass it to
          the debug provider. If the reCAPTCHA site key is set, use <code>ReCaptchaEnterpriseProvider</code>. A
          production build must not contain the debug token.
        </li>
        <li>
          <code>getAuth</code> and <code>signInAnonymously</code>. <code>getStorage</code>.{' '}
          <code>getAI(app, &#123; backend: new GoogleAIBackend() &#125;)</code>. Cache that AI object.
        </li>
        <li>
          One button on the page: <b>Sign in</b>. On click, sign in and show the uid. That is the whole UI for this
          challenge.
        </li>
      </ol>
      <p className="lab-check">
        Checkpoint — the button prints a uid, and the Firebase console → Authentication shows an anonymous user. If
        this fails, fix the env and restart. Do not start Challenge 2 on a broken client. Reference:{' '}
        <a href={`${DOCS}/04-challenge-1-firebase-ai-logic.md`}>Challenge 1</a>.
      </p>
    </>
  );
}

function Challenge2() {
  return (
    <>
      <h2>7 · Challenge 2 — a brief, and stop</h2>
      <p>Add a file input and a button, <b>Write the brief</b>. It must not generate an image.</p>
      <p className="concept">
        Concept — structured output. Temperature about 0.2 and thinking set to high. The reply is JSON with a
        schema, so the next challenge reads fields instead of an essay. The photo bytes go in the same request.
      </p>
      <h3>The call</h3>
      <ol className="lab-list">
        <li>Downscale the photo so the long edge is at most 1920 pixels. Keep the mime type, usually <code>image/jpeg</code>.</li>
        <li>
          Model <code>gemini-3.8-flash</code> through <code>getGenerativeModel</code> on the AI client from Challenge
          1.
        </li>
        <li>
          Generation config: <code>temperature: 0.2</code>, <code>thinkingConfig</code> with{' '}
          <code>ThinkingLevel.HIGH</code>, <code>responseMimeType: 'application/json'</code>, and a schema with
          exactly four strings: <code>ghoulName</code>, <code>personDescription</code>, <code>avatarPrompt</code>,{' '}
          <code>videoPrompt</code>.
        </li>
        <li>
          Send two parts: a text instruction, then the photo as <code>inlineData</code>. The instruction includes
          your costume, setting, and motion, plus the identity lock: same people, same count, same order, no new
          face, clothing and room only.
        </li>
        <li>
          <code>JSON.parse</code> the text. Render the four fields. If the parse throws, show the raw text and stop.
        </li>
      </ol>
      <h3>What a failure means</h3>
      <ul>
        <li>
          <b>401 App Check</b> — the debug token or the site key is missing. Upload can still succeed. Go back to
          step 5.
        </li>
        <li>
          <b>429 prepay</b> — AI Studio balance is empty. Buy credits. Blaze will not fix this.
        </li>
      </ul>
      <p className="lab-check">
        Checkpoint — a photo of you, or of a group, produces a name and two prompts, and the portrait button does
        not exist yet. Reference: <a href={`${DOCS}/05-challenge-2-prompt-expansion.md`}>Challenge 2</a>.
      </p>
    </>
  );
}

function Challenge3() {
  return (
    <>
      <h2>8 · Challenge 3 — the portrait, and stop</h2>
      <p>
        Add <b>Make the portrait</b>. It uses the <code>avatarPrompt</code> you already displayed. It does not start
        a video.
      </p>
      <p className="concept">
        Concept — the photograph stays in the request. Describing a face in words and hoping the model invents the
        same person is a different product. Send the photo bytes again, next to the prompt.
      </p>
      <ol className="lab-list">
        <li>
          Model <code>gemini-3.1-flash-image</code> (Nano Banana 2), same Firebase AI Logic client. Ask for an image
          back, and set the frame to <code>9:16</code> or <code>16:9</code>.
        </li>
        <li>
          The text starts with “Edit the attached photograph. Do not generate new people.” Then the identity lock,
          then <code>avatarPrompt</code>. If the brief asks to change a face, the portrait instruction says to
          ignore that part.
        </li>
        <li>Parts: that text, then the same photo bytes you sent in Challenge 2.</li>
        <li>
          Read the image part from the response. Show it on the page. Upload it to{' '}
          <code>ghouls/&#123;uid&#125;/&#123;jobId&#125;/avatar.png</code>.
        </li>
        <li>
          Look at the faces before you continue. Count the people. If someone was replaced, shortened, or painted
          over, fix the instruction and run this challenge again. Do not animate a bad portrait.
        </li>
      </ol>
      <p className="lab-check">
        Checkpoint — the portrait is on screen and in Storage, and it still looks like the people in the photo.
        Reference: <a href={`${DOCS}/06-challenge-3-nano-banana-avatar.md`}>Challenge 3</a>.
      </p>
    </>
  );
}

function Challenge4() {
  return (
    <>
      <h2>9 · Challenge 4 — video is a job</h2>
      <p>
        Add <b>Animate</b>. It reads the portrait you already saved. The Gemini key stays on the server.
      </p>
      <p className="concept">
        Concept — a serverless function cannot sit in a loop for a minute. Start Omni with{' '}
        <code>background: true</code>, return the id, and let the page ask “done yet?” every 5 seconds.
      </p>
      <h3>Before the first request</h3>
      <ol className="lab-list">
        <li>
          Confirm <code>GEMINI_API_KEY</code>, <code>FIREBASE_SERVICE_ACCOUNT_BASE64</code>, and{' '}
          <code>FIREBASE_STORAGE_BUCKET</code> are set, and that the dev server was restarted after you set them.
        </li>
        <li>
          The browser sends the Firebase ID token as <code>Authorization: Bearer</code>. The server checks the
          signature, the issuer, and the audience, then uses the uid. A missing token is a 401, not a crash.
        </li>
      </ol>
      <h3>Two routes</h3>
      <ol className="lab-list">
        <li>
          <code>POST /api/video/start</code> — verify the token, read <code>avatar.png</code> with the Admin SDK,
          call <code>interactions.create</code> on <code>gemini-omni-1.1-flash</code> with <code>background: true</code>,
          return <code>interactionId</code>. The instruction says: animate the attached portrait, do not redesign
          anyone, faces must not morph, nobody appears or disappears. Return immediately.
        </li>
        <li>
          <code>GET /api/video/status</code> — check once. If <code>video.mp4</code> is already in Storage, return
          its URL. Otherwise ask Omni once. When the clip is ready, write <code>video.mp4</code> with the Admin SDK
          and return the URL.
        </li>
        <li>
          The page calls start, then polls status every 5 seconds, and plays the URL. The function does not{' '}
          <code>while</code>.
        </li>
      </ol>
      <p className="lab-check">
        Checkpoint — Animate plays an 8-second clip of the portrait from Challenge 3, and the faces do not morph.
        Reference: <a href={`${DOCS}/07-challenge-4-omni-video.md`}>Challenge 4</a>.
      </p>
    </>
  );
}

function OnePage() {
  return (
    <>
      <h2>10 · Now put the four challenges on one page</h2>
      <p>
        The buttons from Challenges 1–4 already work. Replace them with one <b>Generate</b> button that runs the
        same calls in this order, and shows a status line for each.
      </p>
      <ol className="lab-list">
        <li>Anonymous sign-in, if there is no uid yet.</li>
        <li>Upload the photo to <code>selfie.jpg</code>.</li>
        <li>Challenge 2, the brief. Show the name as soon as the JSON arrives.</li>
        <li>Challenge 3, the portrait. Show the image as soon as it arrives.</li>
        <li>Challenge 4, start, then poll, then play the video.</li>
      </ol>
      <table>
        <thead>
          <tr>
            <th>On this page</th>
            <th>Leave for the reference booth</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>File or camera, three scene buttons, one Generate button</td>
            <td>The curated scene mixer</td>
          </tr>
          <tr>
            <td>A status line per stage, then the name, the portrait, and the video</td>
            <td>Logos, captions, print, share, /admin</td>
          </tr>
        </tbody>
      </table>
      <p className="lab-check">
        Checkpoint — one photo run, with no extra button clicks, produces the name, the portrait, and a playing
        video. If a stage fails, the status line names that stage. You do not start again from Challenge 1.
      </p>
    </>
  );
}

function Prompt({ onCopy, copied }: { onCopy: () => void; copied: boolean }) {
  return (
    <>
      <h2>11 · Optional — let the assistant write those files</h2>
      <p>
        Use this only after steps 1–5 are done. Open <code>my-light-kiosk</code> in Cursor, VS Code, Claude, Gemini,
        or Antigravity. Paste the brief. Attach the three scene sentences from step 2. Do not attach{' '}
        <code>.env.local</code>.
      </p>
      <p>
        Tell it to stop after each checkpoint. Try Sign in, then the brief, then the portrait, then Animate, before
        you let it build the single Generate button.
      </p>
      <div className="lab-codehead">
        <span>Brief to paste</span>
        <button type="button" className="btn" onClick={onCopy}>
          {copied ? 'Copied' : 'Copy prompt'}
        </button>
      </div>
      <pre className="lab-code">{IDE_PROMPT}</pre>
      <p className="concept">
        If the assistant invents a key, or prints one, delete that file. You already created the real keys in step
        5.
      </p>
    </>
  );
}

function Ship() {
  return (
    <>
      <h2>12 · Run it locally, then put that same build on Vercel</h2>
      <ol className="lab-list">
        <li>
          On localhost, run one photo of a single person and one group photo. Each run should show a name, a
          portrait of those same people, and a playing video.
        </li>
        <li>
          Deploy to Vercel. Set <code>GEMINI_API_KEY</code> and <code>FIREBASE_SERVICE_ACCOUNT_BASE64</code> as
          secrets. Set the <code>VITE_</code> values as config. Do not set <code>VITE_APPCHECK_DEBUG_TOKEN</code> on
          Vercel.
        </li>
        <li>
          Firebase → Authentication → Settings → <b>Authorized domains</b> → add your{' '}
          <code>*.vercel.app</code> hostname.
        </li>
        <li>
          Add that same hostname to the reCAPTCHA Enterprise key. <code>localhost</code> is not enough for the
          public site.
        </li>
        <li>
          Redeploy after any <code>VITE_</code> change. Vite inlines those values at build time. Editing the env in
          the dashboard does nothing until the next build.
        </li>
        <li>On the public URL, run one photo. A 401 on the brief means App Check. A 429 means Prepay credits.</li>
      </ol>
      <p>
        More on failures: <a href={`${DOCS}/11-troubleshooting.md`}>troubleshooting</a> and{' '}
        <a href={`${DOCS}/09-deploy-vercel.md`}>deploy notes</a>.
      </p>
      <p className="lab-check">
        Checkpoint — you can say, without looking at the page, why the video call is on the server and the brief
        call is not.
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
      <p>The booth in the other tab is the reference. Yours is the one you set up one challenge at a time.</p>
      <ul>
        <li>A scene is three sentences. A brief is the contract between three models.</li>
        <li>Firebase, the services, and the env file exist before the first Generate button.</li>
        <li>Challenge 1 is a uid. Challenge 2 is JSON. Challenge 3 is a portrait. Challenge 4 is a polled job.</li>
        <li>The photo stays in the request, so one person or a group stays recognisable.</li>
        <li>The browser may call Firebase AI Logic. Only the server holds the Gemini key.</li>
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
