# Raise Your Own Haunt

> Build it yourself. About 2 hours.
> The same steps are on the booth at `/build`.
> You set up Firebase, then prove each challenge on its own. The single Generate button is step 10.

## 0 · What you are raising

A guest uploads a photo of one person or a group, picks a scene, and gets a name, a portrait, and an eight-second video. Clothes, props, and the room change. The people stay the same people.

**Concept — one photo, three jobs.** A text model writes a brief, an image model edits the photo, a video model animates that portrait.

Order of the lab:

1. Kit, then a scene written in three sentences.
2. A Firebase project, the services, and a filled `.env.local`. Still no page.
3. Challenge 1 signs a guest in. Challenge 2 returns JSON. Challenge 3 returns a portrait. Challenge 4 returns a video.
4. Only then do you put those four calls behind one button and deploy.

## 1 · Get the kit

Accounts: a Google account, Firebase on **Blaze** (Storage), **Prepay credits** in AI Studio (Blaze does not pay for Gemini), plus Vercel and GitHub for the last step.

On the laptop: Node 20+, Git, one of Cursor / VS Code / Claude / Gemini / Antigravity, and `firebase-tools` (`firebase login`).

**Checkpoint.** `node -v` is v20 or newer, and both consoles open while you are signed in.

## 2 · Write one scene

Three sentences. Costume is clothing, not a new face.

| Field | Write | Leave out |
|---|---|---|
| costume | cape and evening clothes, natural skin | pale skin, skull paint, a different person |
| setting | a place, light, weather | a new face |
| motion | camera and cloth for 8 seconds | a morphing face, a person walking in |

Save them. You will paste them in step 11.

## 3 · Create the Firebase project

1. [Firebase console](https://console.firebase.google.com) → **Create a project**.
2. **Upgrade** → **Blaze**, with a budget alert.
3. **</> Web** → register `haunted-kiosk-web`. Leave Hosting unticked.
4. Copy the six `firebaseConfig` values. The web apiKey is not a Gemini key.

**Checkpoint.** The plan says Blaze, and the six values are written down. Details: [02 §2.1–2.2](02-firebase-setup.md).

## 4 · Turn on the three services

1. **AI Logic → Get started → Gemini Developer API.** Do not copy Firebase’s internal Gemini key into the page.
2. **Authentication → Anonymous → Enable.**
3. **Storage → Get started**, location `europe-west2`, production mode.
4. Deploy rules that let the signed-in owner read and write images under `ghouls/{uid}/…` (under 10 MB). `video.mp4` is written by the Admin SDK.

**Checkpoint.** AI Logic, Anonymous, and a London bucket are all on.

## 5 · Fill `.env.local`

Create `my-light-kiosk/` and put the env file there. Gitignore it. Do not paste it into the assistant.

Browser values from step 3: `VITE_FIREBASE_API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`.

App Check, or the brief returns 401:

1. Register **reCAPTCHA Enterprise** on the web app. Add `localhost` now.
2. **Manage debug tokens → Generate.** Put the UUID in `VITE_APPCHECK_DEBUG_TOKEN`.
3. Put the site key in `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`. The debug token never goes on Vercel.
4. Firebase AI Logic stays **Enforced**.

Server secrets:

1. **Service accounts → Generate new private key.** Base64 on one line → `FIREBASE_SERVICE_ACCOUNT_BASE64`. Move the JSON out of the folder.
2. `FIREBASE_STORAGE_BUCKET` is the bucket name, with no `VITE_` prefix.
3. [AI Studio API key](https://aistudio.google.com/apikey) on this Cloud project, after Prepay credits → `GEMINI_API_KEY`. No `VITE_` prefix.
4. `OMNI_MODEL=gemini-omni-1.1-flash`.

**Checkpoint.** Restart the dev server after every edit to this file.

## 6 · Challenge 1 — the client

No Gemini call yet.

1. `npm install firebase`.
2. `initializeApp` from the six env values. If one is empty, show a banner and stop.
3. App Check: debug token only when `import.meta.env.DEV`; otherwise `ReCaptchaEnterpriseProvider`.
4. Anonymous sign-in, Storage, and `getAI(app, { backend: new GoogleAIBackend() })`.
5. One button, **Sign in**, that prints the uid.

**Checkpoint.** Authentication shows an anonymous user. Reference: [Challenge 1](04-challenge-1-firebase-ai-logic.md).

## 7 · Challenge 2 — a brief

A file input and **Write the brief**. Do not generate an image.

1. Downscale so the long edge is at most 1920.
2. `gemini-3.8-flash`, temperature `0.2`, thinking high, `application/json` plus a four-field schema: `ghoulName`, `personDescription`, `avatarPrompt`, `videoPrompt`.
3. Send the instruction (your scene plus the identity lock) and the photo as `inlineData`.
4. Parse the JSON and show the four fields.

`401` means App Check (step 5). `429` means Prepay credits.

**Checkpoint.** A real photo produces a name and two prompts. Reference: [Challenge 2](05-challenge-2-prompt-expansion.md).

## 8 · Challenge 3 — the portrait

**Make the portrait**, using `avatarPrompt`. Do not start video.

1. `gemini-3.1-flash-image`, image response, `9:16` or `16:9`.
2. Text starts “Edit the attached photograph. Do not generate new people.” Then the identity lock, then `avatarPrompt`.
3. Send that text and the same photo bytes.
4. Show the image and upload `ghouls/{uid}/{jobId}/avatar.png`.
5. If a face was replaced, fix the instruction and run this step again.

**Checkpoint.** The portrait still looks like the people in the photo. Reference: [Challenge 3](06-challenge-3-nano-banana-avatar.md).

## 9 · Challenge 4 — video is a job

**Animate** the portrait already in Storage. The Gemini key stays on the server.

1. Restart after the server env vars are set.
2. The browser sends `Authorization: Bearer` with the Firebase ID token. The server checks it, then uses the uid.
3. `POST /api/video/start` reads `avatar.png`, calls `interactions.create` with `background: true`, and returns `interactionId`. It does not loop.
4. `GET /api/video/status` checks once. When the clip is ready it writes `video.mp4` and returns the URL.
5. The page polls every 5 seconds and plays the URL. Faces must not morph.

**Checkpoint.** An 8-second clip plays. Reference: [Challenge 4](07-challenge-4-omni-video.md).

## 10 · One page

Replace the four buttons with one **Generate** button:

1. Sign in.
2. Upload `selfie.jpg`.
3. Brief. Show the name.
4. Portrait. Show the image.
5. Start video, poll, play.

Keep a file or camera input, three scenes, and a status line per stage. Leave logos, captions, print, share, and `/admin` in the reference booth.

**Checkpoint.** One photo run produces the name, the portrait, and a playing video.

## 11 · Optional prompt

After steps 1–5, paste the brief from `/build` step 11 into your IDE. Attach the three scene sentences. Do not attach `.env.local`. Tell the assistant to stop after each checkpoint.

## 12 · Ship

1. Locally, run one single-person photo and one group photo.
2. Deploy to Vercel. Secrets: `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_BASE64`. Config: the `VITE_` values, including the reCAPTCHA site key. No debug token.
3. Add the Vercel hostname to Firebase **Authorized domains** and to the reCAPTCHA key.
4. Redeploy after any `VITE_` change. Vite inlines those at build time.
5. A public 401 is App Check. A 429 is Prepay. See [troubleshooting](11-troubleshooting.md) and [deploy](09-deploy-vercel.md).

## Congratulations

You raised a haunt. The reference booth is the other tab. Yours is the one you set up one challenge at a time.

---

[⬅️ Workshop](15-workshop.md) · [Overview](00-overview.md) · [Troubleshooting](11-troubleshooting.md)
