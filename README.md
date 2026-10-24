# 🎃 The Haunted Kiosk — a Gemini photo booth you can reskin

Upload a photo of one person or a group. A text model writes a production brief. An image model edits
that photo into a portrait. A video model turns the portrait into an 8-second clip. The people stay
recognisable: clothes, props, and the room change, faces do not. Halloween is the sample theme. The
pipeline is the thing you keep.

This is a **React + Firebase + Vercel** version of Google's
[Formula E GenMedia codelab](https://codelabs.developers.google.com/formula-e-genmedia-lab-codelab).
The four challenges are the same. There is no Python, FastAPI, Docker, or Cloud Run.

In the [workshop](docs/15-workshop.md) you learn those ideas first, then ask **Claude**, **Gemini**, or **Antigravity** to build a light one-page app. The same path is on the booth as **[Raise Your Own Haunt](docs/16-raise-your-own-haunt.md)** (`/build`). The React kiosk in this repository is the reference, and the full event booth.

Live reference: [aidevcamp-halloween-hack.vercel.app](https://aidevcamp-halloween-hack.vercel.app) · [the lab](https://aidevcamp-halloween-hack.vercel.app/build)

```
 Browser (React + Vite)                                   Vercel Functions (/api, TypeScript)
 ┌──────────────────────────────────────────────┐        ┌───────────────────────────────────┐
 │ 📷 photo ───► Firebase Storage (selfie.jpg) │        │ POST /api/video/start             │
 │      │                                       │        │   verify Firebase ID token        │
 │      ▼  Firebase AI Logic                    │        │   read avatar.png from Storage    │
 │ Challenge 2: gemini-3.8-flash → JSON brief   │        │   Challenge 4a: Omni, background  │
 │      ▼  Firebase AI Logic                    │  ───►  │ GET  /api/video/status (polled)   │
 │ Challenge 3: Nano Banana 2 → avatar.png      │  ◄───  │   Challenge 4b: interactions.get  │
 │      ▼                                       │        │   save video.mp4 → Storage        │
 │ ▶️ play video.mp4 from Firebase Storage      │        └───────────────────────────────────┘
 └──────────────────────────────────────────────┘
```

## Event-booth features

On top of the four codelab challenges, the app is ready for a real event booth. The
[Advanced level](docs/14-advanced-level.md) guide walks through each one.

| | |
|---|---|
| 🎬 **Curated scenes, 4-step flow** | You → Scene → Details → Result. `src/data/booth-scenes.ts` pairs a backdrop with a character; **Mix your own** for any combination |
| 💧 **Event logos on photo *and* video** | AI DevCamp 2026 + GDG London logos burned in by the browser (canvas + MediaRecorder, no ffmpeg) |
| ✍️ **AI caption + hashtags** | Gemini 3.8 Flash writes the post. `#AIDevCamp #GDGLondon #BuildWithAI #BuildWithGemini #HalloweenHack` are always included |
| 💾 **Saved captions per email** | Reuse earlier captions without another Gemini call. Stored in this browser only |
| 📣 **Share & 🖨️ print** | Web Share with files, LinkedIn / X / Bluesky / WhatsApp, downloads, 100×148 mm postcard print |
| 🔢 **Token count per generation** | Brief, avatar, caption and video. In / out / thinking / total, plus the grand total |
| 🛡️ **Admin area** (`/admin`) | `ADMIN_SECRET` login → every ghoul with photo, video, caption and tokens. Delete any of them |
| 🗑️ **Delete my photos** | Guests can wipe their own files from the result screen |
| 👥 **One person or a group** | The same photo is edited. Every visible person stays, in the same order. Faces, skin, hair, and glasses stay |
| 📖 **Raise Your Own Haunt** (`/build`) | In-app codelab: kit, Firebase, keys, then Challenges 1–4 one at a time, then one page |

## The ideas

The [workshop](docs/15-workshop.md) teaches these ideas before any React. [docs/00-overview.md](docs/00-overview.md) is the same map, tied to this repo's files.

**One photo, three jobs.** A scene is a short recipe: costume, place, and camera move (`src/data/booth-scenes.ts` pairs a backdrop from `backgrounds.ts` with a character from `prompts.ts`).
Costume is clothing and props. It is not a new face.
Gemini 3.8 Flash looks at everyone in the photo and expands that recipe into a name, an image prompt, and a video prompt.
Nano Banana 2 (`gemini-3.1-flash-image`) edits the photo into the portrait. Gemini Omni animates that portrait. Each model
does the job it is good at. The brief is the contract between them.

**The photo is pixels, not a caption.** Challenge 2 and Challenge 3 both receive the photo as image data.
One person or a group: the same people, the same count, the same order. `src/lib/briefPrompt.ts` and the
wrapper in `src/lib/avatar.ts` lock face shape, eyes, skin, hair, glasses, and expression. The video
instruction in `server/omni.ts` says faces must not morph. Family-friendly stays.

**Structured output.** The text model must return JSON with four fields (`ghoulName`, `personDescription`,
`avatarPrompt`, `videoPrompt`). The next stages read those fields. They do not parse an essay.

**Two doors into Gemini.** The brief and the portrait go through **Firebase AI Logic** in the browser
(`getAI` + `GoogleAIBackend`). Firebase holds the Gemini access for those calls, checks App Check, and the
bundle never contains that key. Omni uses the **Interactions API**, which needs `GEMINI_API_KEY`. That key
lives only in the server function (`server/omni.ts`). Anything named `VITE_` is public. The Gemini key has
no `VITE_` prefix.

**Short functions, long videos.** Omni often takes a minute. A Vercel function cannot sit in a loop that
long, so Challenge 4a starts the job with `background: true` and returns an id. The browser asks
`/api/video/status` every 5 seconds (`src/lib/video.ts`). When the clip is ready, the function saves
`video.mp4` with the Admin SDK.

**A guest is an anonymous user.** `signInAnonymously()` gives every visitor a uid. Storage rules allow that
uid to read and write only `ghouls/{uid}/…`, and the browser may upload images only. The video function
checks the Firebase ID token, then writes `video.mp4` with the Admin SDK, which bypasses those rules.
App Check is the other lock: Firebase AI Logic rejects a call that has no valid App Check token. Setup is
in [docs/02-firebase-setup.md](docs/02-firebase-setup.md#28-app-check--required-for-firebase-ai-logic).

## Make your own version

Theme, copy, and prompts live in a handful of files. Auth, Storage, and the video poll stay put.
The recipe is [docs/13-make-your-own.md](docs/13-make-your-own.md).

| You want to change… | Edit |
|---|---|
| Event name, logos, hashtags | `src/lib/branding.ts`, `public/branding/` |
| Backdrops, characters, curated pairs | `src/data/backgrounds.ts`, `prompts.ts`, `booth-scenes.ts` |
| The art-director rules (tone, identity, length) | `src/lib/briefPrompt.ts` |
| The one-line instruction wrapped around the portrait prompt | `src/lib/avatar.ts` |
| Titles, button, stage names | `src/App.tsx`, `src/components/Progress.tsx`, `index.html` |
| Colours and type | `src/index.css` |
| Model ids | `.env.local` (`VITE_PROMPT_MODEL`, `VITE_IMAGE_MODEL`, `OMNI_MODEL`) |

To reskin a working booth instead of solving the gaps, install the finished answers, then edit the files above:

```bash
npm install
npm run solve -- all
npm run dev    # http://localhost:5173
```

`npm run reset-challenges` puts the TODOs back in this reference repo. The workshop itself is a new folder: [docs/15-workshop.md](docs/15-workshop.md).

## Workshop

Follow [the workshop](docs/15-workshop.md), or open **[Raise Your Own Haunt](docs/16-raise-your-own-haunt.md)** on the booth at `/build`. About 2 hours. **Set up each challenge before the page is assembled.**
You build a light booth in an empty folder with **Claude**, **Gemini**, or **Antigravity** (Vite + React, or Next.js on Vercel). This repo is the reference, not the starting file.

| Step | Doc | Time | Concept | You do not touch React yet |
|---|---|---|---|---|
| 1 | [One photo, three jobs](docs/15-workshop.md#step-1--one-photo-three-jobs-10-min) | 10 min | A scene is a recipe. A brief is the contract between models. | Write one scene on paper |
| 2 | [Accounts](docs/01-prerequisites.md) | 10 min | Blaze pays for Storage. Prepay credits pay for Gemini. | — |
| 3 | [Firebase, no UI](docs/02-firebase-setup.md) | 25 min | Two doors into Gemini. A guest is a uid. App Check locks the proxy. | `.env.local` only |
| 4 | [Prompt expansion](docs/15-workshop.md#step-4--prompt-expansion-15-min) | 15 min | Structured JSON, low temperature, the selfie goes in as pixels. | Ask the assistant for the schema |
| 5 | [Portrait](docs/15-workshop.md#step-5--the-portrait-is-image-to-image-10-min) | 10 min | Image-to-image. The face stays because the photo is an input. | One sentence of prompt rules |
| 6 | [Video](docs/15-workshop.md#step-6--video-is-a-job-not-a-request-15-min) | 15 min | Start the job, poll from the page. The Gemini key stays on the server. | Draw the two routes |
| 7 | [Build the light app](docs/15-workshop.md#step-7--build-the-light-app) | 45–60 min | Same pipeline, one page, three scenes. | **Now** the assistant writes the UI |

**Light** means photo → brief → portrait → video, including a group photo and the identity lock. Logos, captions, print, share, and `/admin` stay in this repo. See the [advanced guide](docs/14-advanced-level.md) after your light app works.

### Reference lab (optional)

The files in this repo ship **solved**: the kiosk works out of the box. Run `npm run reset-challenges` to swap in
the four TODO files that match the [Formula E codelab](https://codelabs.developers.google.com/formula-e-genmedia-lab-codelab),
and `npm run solve -- all` to put the answers back. With the TODOs in, each AI stage stops with
**"Challenge N is still a TODO"** until you fill it.

| | Doc | Formula E section |
|---|---|---|
| Challenge 1 | [Firebase AI Logic client](docs/04-challenge-1-firebase-ai-logic.md) | TODO 1 |
| Challenge 2 | [JSON brief](docs/05-challenge-2-prompt-expansion.md) | TODO 2 |
| Challenge 3 | [Portrait](docs/06-challenge-3-nano-banana-avatar.md) | TODO 3 |
| Challenge 4 | [Omni, background + poll](docs/07-challenge-4-omni-video.md) | TODO 4a / 4b |
| Run | [Assemble & run](docs/08-run-and-test.md) | 4 · Assembling |
| Ship | [Push & deploy](docs/09-deploy-vercel.md) | 5 · Deploying |
| Done | [Clean-up](docs/12-cleanup.md) | 7 · Conclusion |

`npm run solve -- 2` drops in the answer for Challenge 2 (`all` for every challenge). `npm run reset-challenges` puts the TODOs back. In Gemini CLI: `/hack:hint 2`.

**Also:** [Raise Your Own Haunt](docs/16-raise-your-own-haunt.md) · [Hack extensions](docs/10-hack-extensions.md) · [Make your own theme](docs/13-make-your-own.md) ·
[Troubleshooting](docs/11-troubleshooting.md)

```bash
git clone https://github.com/sumithpdd/AIDevCampHalloweenHack.git
cd AIDevCampHalloweenHack
npm install
cp .env.example .env.local        # PowerShell: Copy-Item .env.example .env.local
npm run dev                       # http://localhost:5173
```

Fill `.env.local` from [Step 3](docs/02-firebase-setup.md) before the photo upload will work.

## Keys & secrets

Nothing secret is in this repo, and `npm run check:secrets` (also the first step of every Vercel build) keeps it
that way.

| Value | Where it lives | Public? |
|---|---|---|
| `VITE_FIREBASE_*`, `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` | `.env.local` / Vercel | Public by design (shipped to the browser) |
| `VITE_APPCHECK_DEBUG_TOKEN` | `.env.local` only | **Secret.** Used only by `npm run dev`; stripped from production builds |
| `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_BASE64`, `ADMIN_SECRET` | `.env.local` / Vercel | **Secret.** Server only, never prefixed `VITE_` |
| Service-account JSON | your disk, then delete it | **Secret.** Git-ignored (`*service*account*.json`) |

## Stack

| Layer | Formula E lab | **Haunted Kiosk** |
|---|---|---|
| Frontend | React (Vite) on Cloud Run + nginx | **React (Vite) on Vercel** |
| Backend | Python FastAPI on Cloud Run | **Vercel Functions (TypeScript)** — video only |
| Prompt expansion | `gemini-3.8-flash` via the Python Interactions API | **`gemini-3.8-flash` via Firebase AI Logic** in the browser |
| Portrait | Nano Banana 2 via Python `generate_content` | **Nano Banana 2 (`gemini-3.1-flash-image`) via Firebase AI Logic** |
| Video | Gemini Omni, Python `while True` poll | **Gemini Omni via `@google/genai`, `background: true`, browser polls** |
| Files | Cloud Storage + `upload_to_gcs()` | **Firebase Storage**, rules per user |
| Identity | none | **Firebase Anonymous Auth** |
| Dev tool | Cloud Shell Editor | **Gemini CLI** and `/hack:*` commands |

## Project layout

```
api/video/start.ts        POST — start Gemini Omni (Vercel Function)
api/video/status.ts       GET  — poll Omni, save video.mp4
server/omni.ts            Challenge 4 (start + one status check)
server/firebaseAdmin.ts   Verify the ID token, read and write Storage
src/lib/firebase.ts       Challenge 1 — Firebase AI Logic client
src/lib/promptExpansion.ts Challenge 2 — JSON brief
src/lib/avatar.ts         Challenge 3 — portrait
src/lib/briefPrompt.ts    Art-director instruction (edit this to change voice)
src/data/                 Curated scenes: backgrounds × prompts → booth-scenes
src/lib/branding.ts       Event name, logos, hashtags
src/lib/watermark.ts      Logos on photo + video (canvas, MediaRecorder)
src/lib/caption.ts        AI caption with event hashtags
src/lib/usage.ts          Token counts per generation
src/admin/, api/admin/    /admin: list + delete every ghoul
src/lib/pipeline.ts       Stage order: upload → brief → portrait → video → logos (caption in parallel)
src/lab/                 Raise Your Own Haunt (`/build`)
src/App.tsx, components/  Kiosk UI
starter/  solutions/      TODO files and reference answers
scripts/                  solve / reset, secret scan, Vercel build
storage.rules             Who may read and write ghouls/{uid}/…
docs/                     The lab and the reskin guide
```

## Model IDs

Set these in `.env.local`. The code falls back to the defaults.

| Purpose | Default | Env var |
|---|---|---|
| Prompt expansion | `gemini-3.8-flash` | `VITE_PROMPT_MODEL` |
| Portrait (Nano Banana 2) | `gemini-3.1-flash-image` | `VITE_IMAGE_MODEL` |
| Video (Gemini Omni) | `gemini-omni-1.1-flash` | `OMNI_MODEL` |

If Omni returns "model not found", set `OMNI_MODEL=gemini-omni-1.1-flash-preview`.

---

Built for AI DevCamp × GDG London · Halloween 2026 · Apache-2.0 for code samples.
