# Advanced level · From codelab to event booth

> 🚀 **Advanced** — after the core codelab ([11 steps](../README.md#codelab-walkthrough)). ⏱️ 45 min to read and set up.
> Inspired by the [Google I/O Connect 2026 photo booth](https://github.com/sumithpdd/GoogleIOConnect2026).

The codelab ends with a working pipeline. An event booth needs more: a quick flow for queues, branded output,
captions people actually post, a printer, an admin who can clean up, and a cost meter. Everything below is already in
the repo. This page explains each piece and the one-time setup it needs.

| Feature | Files | Setup |
|---|---|---|
| 1. Curated scenes + 4-step flow | `src/data/*.ts`, `src/components/StepNav.tsx`, `ScenePicker.tsx`, `DetailsForm.tsx` | none |
| 2. Logo watermark on photo **and** video | `src/lib/branding.ts`, `src/lib/watermark.ts`, `public/branding/` | **Storage CORS** (§2) |
| 3. Postcard printing | `src/lib/print.ts` | a printer 🖨️ |
| 4. AI caption with event hashtags | `src/lib/caption.ts` | none |
| 5. Saved captions per email | `src/lib/social-posts-storage.ts`, `SavedPosts.tsx` | none |
| 6. Social sharing | `src/lib/share.ts`, `SharePanel.tsx` | none |
| 7. Token count per generation | `src/lib/usage.ts`, `TokenSummary.tsx`, `Progress.tsx` | none |
| 8. Admin area | `src/admin/AdminPage.tsx`, `api/admin/*`, `server/adminAuth.ts` | **`ADMIN_SECRET`** (§8) |
| 9. Delete my photos + `meta.json` | `src/lib/storage.ts`, `storage.rules` | **redeploy rules** (§9) |

## 0. One-time setup checklist

```bash
# 1. New storage rules (branded video + meta.json)
npm run firebase:deploy-rules

# 2. Bucket CORS so the browser can re-encode the video with logos
#    Edit storage.cors.json first: put YOUR Vercel domain in "origin".
gcloud storage buckets update gs://<your-bucket> --cors-file=storage.cors.json

# 3. Admin password (server only) — add to .env.local AND Vercel env vars
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
#    → ADMIN_SECRET=<that value>
```

## 1. Curated scenes and a 4-step flow

A queue at a booth can't wait while every guest reads eight options and fiddles with settings. The flow is now
**You → Scene → Details → Result**, with a step bar on top (`StepNav.tsx`).

Scenes are split into two reusable lists and one curated pairing, like the I/O Connect booth:

```
src/data/backgrounds.ts   WHERE   Tower Bridge, the Last Tube, AI DevCamp hack night, Gemini portal…
src/data/prompts.ts       WHO     vampire, ghost, witch, zombie developer, Gemini wizard…
src/data/booth-scenes.ts  PAIRS   "Vampire of Tower Bridge" = tower-bridge-midnight × vampire  (featured ★)
```

`composeScene(backgroundId, promptId)` turns a pair into the same `Scene` (`costume`, `setting`, `motion`) that the
pipeline already understands. Challenges 2–4 don't change. Guests who want more control tap **🧪 Mix your own** and
pick any backdrop × character.

> ✏️ Add a scene: one entry in `backgrounds.ts` and/or `prompts.ts`, then a pair in `booth-scenes.ts`. Gemini CLI:
> `/hack:scene a werewolf DJ at a Camden rave`.

## 2. Logo watermark on the photo and the video

`src/lib/branding.ts` is the single place for the event name, the logo files and the hashtags. The logos live in
`public/branding/` (`aidevcamp-2026.webp`, `gdg-london.png`).

**Photo.** `brandImage()` draws the Nano Banana portrait onto a `<canvas>` and adds a footer: a dark gradient, both
logos on dark "stickers" (so GDG London's white text stays readable) and the event line. The result is saved as
`avatar-branded.jpg`. Omni still animates the **clean** `avatar.png`, so the logos don't get warped into the video.

**Video.** No ffmpeg and no server: `brandVideo()` downloads the Omni clip, plays it into a canvas, draws the same
footer on every frame, and re-records it with `MediaRecorder`. The audio is routed through Web Audio into the
recording, not to the speakers. Chrome and Edge produce **MP4**; other browsers produce WebM. It runs in real time
(about 8 s) and is saved as `video-branded.mp4`.

**Why CORS matters.** To read the video's pixels, the browser has to `fetch()` it from Firebase Storage. That
needs a CORS rule on the bucket. Without it, the "Add event logos" stage shows *Skipped* and the player falls
back to the clean video with the logos overlaid in HTML. Edit `storage.cors.json` so `origin` lists `http://localhost:5173`
and your exact Vercel domain (GCS does **not** support `*.vercel.app` wildcards), then run the `gcloud` command from §0.

## 3. Printing postcards

`printPortrait()` opens the branded portrait in a hidden iframe with `@page { size: 100mm 148mm; margin: 0 }`
(148 × 100 mm for landscape) and calls `print()`. That's the Canon SELPHY / photo-kiosk postcard size. In the
print dialog choose **borderless** and **100 %** scale. For a hands-off kiosk, run Chrome with `--kiosk-printing`
so it prints to the default printer without the dialog.

## 4. AI caption with event hashtags

While Omni renders the video (the slowest stage), `generateCaption()` asks **Gemini 3.8 Flash** (the same Firebase
AI Logic client as Challenge 2, thinking `LOW`, temperature `0.9`) for a short first-person post. The prompt includes
the guest's first name, the ghoul name and the scene. `ensureHashtags()` then appends any required tag the model
forgot:

```
#AIDevCamp #GDGLondon #BuildWithAI #BuildWithGemini #HalloweenHack   (+ up to 2 of #GeminiOmni #NanoBanana …)
```

The caption is editable, and **✨ New caption** asks for another one.

## 5. Saved captions, keyed by email

If the guest types an email in step 3, every caption is saved in **this browser's** `localStorage`, keyed by the
normalised email (max 40 per email). **💾 Saved captions** lets them reuse an earlier caption without another Gemini
call, delete one, or forget them all. The email never leaves the device, and it's not in `meta.json`.

## 6. Social sharing

| Button | How |
|---|---|
| 📲 Share… | Web Share API **with files** (branded video + photo) → Instagram, WhatsApp, LinkedIn apps on phones |
| LinkedIn / X / Bluesky / WhatsApp | Intent URLs with the caption + a link to the branded video |
| ⬇️ Photo / ⬇️ Video | Download the branded files to attach manually |
| 🖨️ Print postcard | §3 |

LinkedIn's web share link can't attach files, so the LinkedIn button also copies the caption to the clipboard.

## 7. Token count for every generation

Each Firebase AI Logic response carries `usageMetadata` (`promptTokenCount`, `candidatesTokenCount`,
`thoughtsTokenCount`, `totalTokenCount`). The Omni interaction carries `usage` (`total_input_tokens`,
`total_output_tokens`, `total_tokens`). One line in each challenge reports it:

```ts
recordUsage('brief', result.response.usageMetadata);        // Challenge 2
recordUsage('avatar', result.response.usageMetadata);       // Challenge 3
return { status: 'completed', video, usage: interaction.usage };  // Challenge 4b → recordInteractionUsage('video', …)
```

The UI shows tokens under each stage, plus a table (in / out / thinking / total) and the grand total. The same numbers
go into `meta.json`, so the admin page can total them for the whole event. Multiply by your models' prices to
estimate spend.

## 8. Admin area — `/admin`

- **Login.** The browser sends the password to `POST /api/admin/login`. The server compares it with `ADMIN_SECRET`
  in constant time and returns an **HMAC-signed token valid for 8 hours**, kept in `sessionStorage`. The secret itself
  is never stored in the browser, and it has no `VITE_` prefix.
- **List.** `GET /api/admin/ghouls` walks `ghouls/` with the Admin SDK and returns every job, newest first: the
  `meta.json` (scene, ghoul name, first name, caption, tokens, status) and **1-hour signed URLs** for the photo and
  video.
- **Delete.** `DELETE /api/admin/ghouls?uid=…&jobId=…` removes the whole job folder.
- The page shows totals (ghouls, completed, failed, tokens), a search filter, and a Delete button on each card.

Without `ADMIN_SECRET` (or with one under 16 characters), the admin API answers `503 Admin is disabled`.
`vercel.json` rewrites `/admin` to the SPA and adds `X-Robots-Tag: noindex`.

## 9. Delete my photos + `meta.json`

`storage.rules` now allows each guest's own folder to hold images (≤ 10 MB), `video-branded.mp4|webm` (≤ 60 MB) and
`meta.json` (≤ 100 KB), and lets the owner delete. **🗑️ Delete my photos** on the result screen removes the selfie,
portrait, videos and metadata straight away. That's the promise in the consent text of step 3.

## ✅ Checkpoint
Run one guest end to end. You should see five stages with token counts, a branded portrait and video, a caption with
the five hashtags, and the job on `/admin`. Delete it from `/admin` and confirm the folder is gone in the Firebase
console.

---
[📋 All steps](../README.md#codelab-walkthrough) · [Hack extensions](10-hack-extensions.md) · [Make your own](13-make-your-own.md) · [Troubleshooting](11-troubleshooting.md)
