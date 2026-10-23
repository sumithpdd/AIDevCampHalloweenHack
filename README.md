# 🎃 The Haunted Kiosk — a Gemini photo booth you can reskin

Snap a selfie. A text model writes a production brief. An image model paints the portrait. A video model
turns that portrait into an 8-second clip. Halloween is the sample theme. The pipeline is the thing you keep.

This is a **React + Firebase + Vercel** version of Google's
[Formula E GenMedia codelab](https://codelabs.developers.google.com/formula-e-genmedia-lab-codelab).
The four challenges are the same. There is no Python, FastAPI, Docker, or Cloud Run.
You can follow the lab with the TODOs left in, or drop in the finished answers and change the theme.

```
 Browser (React + Vite)                                   Vercel Functions (/api, TypeScript)
 ┌──────────────────────────────────────────────┐        ┌───────────────────────────────────┐
 │ 📷 selfie ──► Firebase Storage (selfie.jpg)  │        │ POST /api/video/start             │
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

## The ideas

Read [docs/00-overview.md](docs/00-overview.md) for the full walkthrough. These six ideas are the whole app.

**One photo, three jobs.** A scene is a short recipe: costume, place, and camera move (`src/data/booth-scenes.ts` pairs a backdrop from `backgrounds.ts` with a character from `prompts.ts`).
Gemini 3.8 Flash looks at the face and expands that recipe into a name, an image prompt, and a video prompt.
Nano Banana 2 (`gemini-3.1-flash-image`) paints the portrait. Gemini Omni animates the portrait. Each model
does the job it is good at. The brief is the contract between them.

**The selfie is pixels, not a caption.** Challenge 2 and Challenge 3 both receive the photo as image data.
That is what keeps the face recognisable. The instruction in `src/lib/briefPrompt.ts` tells the text model
which features to preserve, and to stay family-friendly.

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

`npm run reset-challenges` puts the TODOs back when you want the workshop version.

## Codelab walkthrough

Follow these steps in order. They mirror the sections of the
[Formula E codelab](https://codelabs.developers.google.com/formula-e-genmedia-lab-codelab). Total time ≈ 2½ hours.
The app runs from the start: each AI stage stops with **"Challenge N is still a TODO"** until you fill that gap.

| Step | Doc | Time | Formula E section | What you do |
|---|---|---|---|---|
| 1 | [Introduction](docs/00-overview.md) | 10 min | 1 · Introduction | The pipeline, the concepts, the Formula E → Halloween mapping |
| 2 | [Prerequisites](docs/01-prerequisites.md) | 10 min | 2 · Environment setup | Node, accounts, CLIs, clone the repo |
| 3 | [Firebase setup](docs/02-firebase-setup.md) | 25 min | 2 · Environment setup | Project, AI Logic, Anonymous Auth, Storage + rules, service account, Gemini key, App Check |
| 4 | [Gemini CLI](docs/03-gemini-cli.md) | 10 min | 2 · (Cloud Shell Editor) | Install Gemini CLI, `GEMINI.md`, the `/hack:*` commands |
| 5 | [Challenge 1](docs/04-challenge-1-firebase-ai-logic.md) | 5 min | 3 · TODO 1 | Create the Firebase AI Logic client |
| 6 | [Challenge 2](docs/05-challenge-2-prompt-expansion.md) | 15 min | 3 · TODO 2 | `gemini-3.8-flash` turns selfie + scene into a JSON brief |
| 7 | [Challenge 3](docs/06-challenge-3-nano-banana-avatar.md) | 15 min | 3 · TODO 3 | Nano Banana 2 image-to-image portrait |
| 8 | [Challenge 4](docs/07-challenge-4-omni-video.md) | 20 min | 3 · TODO 4a/4b | Gemini Omni in the background, then poll |
| 9 | [Assemble & run](docs/08-run-and-test.md) | 15 min | 4 · Assembling | Tour of the provided pieces, run end to end |
| 10 | [Push & deploy](docs/09-deploy-vercel.md) | 15 min | 5 · Deploying + 6 · Testing | Secret scan, GitHub, Vercel, try it on your phone |
| 11 | [Conclusion & clean-up](docs/12-cleanup.md) | 5 min | 7 · Conclusion | Recap, rotate keys, delete resources |

**Advanced level:** [From codelab to event booth](docs/14-advanced-level.md) (curated scenes, logos on video, captions, sharing, printing, tokens, admin)

**Bonus:** [Hack extensions](docs/10-hack-extensions.md) · [Make your own theme](docs/13-make-your-own.md) ·
[Troubleshooting](docs/11-troubleshooting.md)

Stuck on a gap? `npm run solve -- 2` copies the answer for Challenge 2 (`all` for every challenge).
`npm run reset-challenges` puts the TODOs back. In Gemini CLI: `/hack:hint 2`.

```bash
git clone https://github.com/sumithpdd/AIDevCampHalloweenHack.git
cd AIDevCampHalloweenHack
npm install
cp .env.example .env.local        # PowerShell: Copy-Item .env.example .env.local
npm run dev                       # http://localhost:5173
```

Fill `.env.local` from [Step 3](docs/02-firebase-setup.md) before the selfie upload will work.

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
