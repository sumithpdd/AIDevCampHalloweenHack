# GEMINI.md — context for Gemini CLI 🎃

You are pair-programming with a hacker at **AI DevCamp × GDG London — Halloween Hack (winner lab)**.
The project is **The Haunted Kiosk**: a photo of one person or a group → a portrait and an 8-second video, with faces locked to the photo. It is a React + Firebase + Vercel
re-imagining of Google's *Formula E GenMedia* codelab (which used Python/FastAPI/Cloud Run).

## Hard rules
- **No Python, no FastAPI, no Docker.** TypeScript only: React (Vite) in the browser, Vercel Functions in `/api`.
- `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_BASE64` and `ADMIN_SECRET` are **server-only**. Never import `server/*` from `src/*`,
  never prefix secrets with `VITE_`.
- Browser AI calls go through **Firebase AI Logic** (`firebase/ai`), not `@google/genai`.
- Gemini Omni (video) goes through the **Interactions API** with `@google/genai` on the server, `background: true`.
- `firebase` is v13: content parts are discriminated — `{ type: 'text', text }`, `{ type: 'inlineData', inlineData: { data, mimeType } }`.
- Never print, commit or paste the values in `.env.local` or the service-account JSON. Run `npm run check:secrets` before any commit.
- Files are stored in **Firebase Storage** under `ghouls/{uid}/{jobId}/` (`selfie.jpg`, `avatar.png`, `video.mp4`).
- Identity lock: edit clothing, props, background, and lighting. Do not change faces or drop people from a group. The rules live in `src/lib/briefPrompt.ts`, `src/lib/avatar.ts`, `src/data/prompts.ts`, and `server/omni.ts`.
- `/build` is **Raise Your Own Haunt** (`src/lab/`). `/admin` needs `ADMIN_SECRET` of at least 6 characters.

## Map
| Path | What |
|---|---|
| `src/lib/firebase.ts` | **Challenge 1** – Firebase app, Auth, Storage, `getHalloweenAI()` |
| `src/lib/promptExpansion.ts` | **Challenge 2** – `gemini-3.8-flash` prompt expansion → JSON `GhoulBrief` |
| `src/lib/avatar.ts` | **Challenge 3** – Nano Banana 2 (`gemini-3.1-flash-image`) image-to-image |
| `server/omni.ts` | **Challenge 4** – Gemini Omni 1.1 Flash: 4a `startOmniVideo`, 4b `checkOmniVideo` |
| `src/lib/pipeline.ts` | Orchestrates the stages in the browser (upload → brief → avatar → video → logos, caption in parallel) |
| `src/data/backgrounds.ts`, `prompts.ts`, `booth-scenes.ts` | Curated scenes (backdrop × character) |
| `src/lib/branding.ts`, `watermark.ts`, `print.ts` | Event logos on photo + video (canvas/MediaRecorder), postcard print |
| `src/lib/caption.ts`, `social-posts-storage.ts`, `share.ts` | AI caption + hashtags, saved captions per email (localStorage), sharing |
| `src/lib/usage.ts` | Token counts per generation |
| `src/lib/pickup.ts`, `PickupPage.tsx`, `api/pickup.ts` | 6-char pickup code + QR; `/r/CODE` reads ONE card via the function. `codes/` is never readable or listable in Storage |
| `src/admin/AdminPage.tsx`, `api/admin/*`, `server/adminAuth.ts` | `/admin` (ADMIN_SECRET → signed token; list/delete jobs) |
| `api/video/start.ts`, `api/video/status.ts` | Vercel Functions (Web `Request`/`Response` handlers) |
| `vite.config.ts` | Runs `/api/*` locally during `npm run dev` |
| `starter/`, `solutions/` | Pristine TODO files and reference solutions |
| `src/lab/` | Raise Your Own Haunt, route `/build` |
| `docs/` | Step-by-step lab, including `docs/16-raise-your-own-haunt.md` |

## How to help during challenges
1. When asked for a **hint**, give the *smallest* nudge first (which function / which config key). Only show the
   full solution if the hacker explicitly asks, and never copy from `solutions/` unless asked.
2. After editing, run `npm run typecheck`.
3. Keep the spooky-but-family-friendly tone of the prompts (no gore).

## Commands
- `npm run dev` — app + local API on http://localhost:5173
- `npm run typecheck` / `npm run build`
- `npm run solve -- <1-4|all>` / `npm run reset-challenges`
- `npm run check:secrets` — fails if a credential would be committed
