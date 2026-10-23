# Step 9 · Assemble & run the full pipeline

> 🧭 **Codelab step 9 of 11** · ⏱️ 15 min · Formula E codelab: *4 · Assembling the application*

> Formula E codelab section 4, "Assembling Main Application & Frontend", had you paste `main.py`, a Dockerfile,
> `App.tsx` and an nginx config. In this lab those pieces already exist. This step walks through what they do,
> then runs the four challenges end to end.

## 8.1 Tour of the pieces you didn't write

| Formula E file | Haunted Kiosk file | What it does |
|---|---|---|
| `backend/app/main.py` → `run_kiosk_pipeline()` | `src/lib/pipeline.ts` → `runPipeline()` | Runs the stages in order: upload → brief → portrait → video. Updates the progress UI after each one. |
| `POST /api/process-driver` | `api/video/start.ts` | Checks the Firebase ID token, reads `avatar.png` from Storage, calls **4a**. |
| `GET /api/job/{job_id}` + `jobs_db` | `api/video/status.ts` | Calls **4b** once. When the clip is ready, saves `video.mp4` and returns its URL. |
| `upload_to_gcs()` | `src/lib/storage.ts`, `server/firebaseAdmin.ts` | Browser uploads images; the server writes the video with the Admin SDK. |
| `pollJob()` in `App.tsx` | `waitForVideo()` in `src/lib/video.ts` | The 5-second polling loop, in the browser. |
| `App.tsx` (camera, upload, select) | `src/App.tsx`, `src/components/PhotoInput.tsx`, `Progress.tsx` | Camera or upload, scene grid, orientation, four-stage progress, results. |
| `index.css` (Formula E brand) | `src/index.css` | The Halloween theme. |
| (not in the Formula E lab) | `src/data/*`, `watermark.ts`, `caption.ts`, `src/admin/` | Event-booth extras: curated scenes, logos, captions, sharing, printing, tokens, admin. See [Advanced level](14-advanced-level.md). |
| `Dockerfile`, `nginx.conf` | `vite.config.ts`, `vercel.json` | No containers. During `npm run dev`, a small Vite plugin runs `/api/*` locally; Vercel runs the same files in production. |

Ask Gemini CLI for the guided version: `/hack:explain`.

## 8.2 Run it

```bash
npm run typecheck     # or /hack:check in Gemini CLI
npm run dev           # http://localhost:5173
```

1. Allow the camera (or switch to **Upload a photo**). One person or a group. Use a well-lit photo where every face is visible.
2. Pick a nightmare and an orientation.
3. **Summon my ghoul** and watch the four stages:

| Stage | Model / service | Typical time |
|---|---|---|
| 🎃 Upload photo | Firebase Auth + Storage | < 2 s |
| 🎃 Write the ghoul brief | `gemini-3.8-flash` (thinking: high) | 5–15 s |
| 🎃 Render the avatar | Nano Banana 2 `gemini-3.1-flash-image` | 10–30 s |
| 🎃 Animate the video | Gemini Omni 1.1 Flash | 30–120 s |
| 🎃 Add event logos | Canvas + MediaRecorder in the browser | ≈ clip length (8 s) |

4. Open **Firebase console → Storage → ghouls/** and find the three files for your job.

Any stage that turns 💀 shows its error inline. The usual causes are in [Troubleshooting](11-troubleshooting.md).

## 8.3 Smoke-test the API

```bash
curl -X POST http://localhost:5173/api/video/start -d '{}'
# → {"error":"Missing Firebase ID token"}   ✅ the function is running and requires sign-in
```

## 8.4 Production build

```bash
npm run build && npm run preview
```
`preview` serves only the static app. The `/api` routes run under `npm run dev` or on Vercel.

## ✅ Checkpoint
You have a working kiosk on localhost that matches the finished Formula E kiosk: photo in, portrait and video out.

---
[⬅️ Challenge 4](07-challenge-4-omni-video.md) · [📋 All steps](../README.md#codelab-walkthrough) · [Deploy ➡️](09-deploy-vercel.md)
