# Workshop — concepts first, the app last

> 🧭 **This is the path for the room.** About 2 hours.
> The React kiosk in this repo is the reference and the event booth. You build a **light** version at the end, with Claude, Gemini, or Antigravity.

Do not open `src/App.tsx` until [Step 7](#step-7--build-the-light-app). The first six steps are the ideas. The last step is the product.

## What "light" means

| Keep | Leave for later (this repo already has them) |
|---|---|
| One screen, one button | Multi-step booth, curated scene mixer |
| 3 scenes you write yourself | Logos burned onto photo and video |
| Selfie → JSON brief → portrait → 8s video | Captions, hashtags, print, share sheet |
| Anonymous user + Storage folder per person | `/admin`, token dashboards |

Halloween can stay, or pick another theme. The pipeline does not change.

## Tools you may use to write the app

Use one. They all get the same brief in Step 7.

| Tool | Where |
|---|---|
| **Claude** | [claude.ai](https://claude.ai) or Claude Code |
| **Gemini** | [gemini.google.com](https://gemini.google.com) or the [Gemini CLI](03-gemini-cli.md) |
| **Antigravity** | Google Antigravity, the agent-first IDE |

You still create the Firebase project and the keys yourself. The assistant must not invent keys, and you must not paste keys into the chat.

---

## Step 1 · One photo, three jobs (10 min)

> **Concept — a scene is a recipe, a brief is a script.**
> You do not ask one model to "make a video of me as a vampire." You give three specialists a contract.

A scene is three short strings:

| Field | Example |
|---|---|
| **costume** | elegant Victorian vampire, high collar, subtle fangs |
| **setting** | Tower Bridge at midnight, fog, red moon |
| **motion** | slow push-in, cape billows, bats burst from the fog |

A text model looks at the **photo** and those three strings and writes a **brief**:

| Brief field | Who uses it |
|---|---|
| `ghoulName` | The screen, as the title |
| `personDescription` | The screen, so the guest sees what the model noticed |
| `avatarPrompt` | The image model |
| `videoPrompt` | The video model |

**Checkpoint.** On paper or in the assistant chat, write one scene (costume, setting, motion) for a theme you care about. Do not write React.

---

## Step 2 · Accounts (10 min)

Follow [Prerequisites](01-prerequisites.md) for Node, Git, and accounts.

You need a Google account, Firebase on the **Blaze** plan (Storage), and **Prepay credits** in AI Studio for Gemini. Blaze does not pay for Gemini. When the Prepay balance is $0 the brief call returns `429`. Details: [02 §2.7](02-firebase-setup.md#27-gemini-api-key-for-gemini-omni-server-only) and the [billing guide](https://ai.google.dev/gemini-api/docs/billing#prepay).

---

## Step 3 · Firebase, still no UI (25 min)

Follow [Firebase setup](02-firebase-setup.md) through App Check. Stop at the checkpoint. The "Challenge 1 is still a TODO" message is for people filling gaps in **this** repo. In this workshop you have not created an app yet, so an empty folder plus a filled `.env.local` is the right stopping point.

> **Concept — two doors into Gemini.**
>
> | Call | Where it runs | Credential |
> |---|---|---|
> | Brief and portrait | Browser, through **Firebase AI Logic** | The Firebase project. App Check must pass. No Gemini key in the page. |
> | Video | A server function, **Interactions API** | `GEMINI_API_KEY`, no `VITE_` prefix |
>
> **Concept — a guest is a uid.** Anonymous sign-in gives each person a folder, `ghouls/{uid}/{jobId}/`. The browser may upload images only. The server writes `video.mp4` with the Admin SDK after it checks the Firebase ID token.
>
> **Concept — App Check is the lock on the Gemini proxy.** No valid token, and the brief returns `401`, even when the selfie upload worked.

Put secrets only in `.env.local`. Never in source, never in the assistant chat.

---

## Step 4 · Prompt expansion (15 min)

> **Concept — structured output.**
> The text model must return JSON, not an essay. The next steps read fields.

Model: `gemini-3.8-flash` (override with `VITE_PROMPT_MODEL`).

- Send **text** (the art-director rules + the scene) and the **selfie as image bytes**.
- `temperature` about `0.2` so the face description stays close to the photo.
- Thinking level **high** so the model looks before it writes.
- `responseMimeType: 'application/json'` and a schema with the four fields above.
- Rules to include in the instruction: keep the face recognisable (shape, hair, glasses, facial hair), stay family-friendly, no on-screen text.

**Checkpoint.** Ask your assistant: *"Given this scene and a selfie, what JSON should `gemini-3.8-flash` return, and which generation settings force that shape?"* Save the answer. You will paste it into the build brief.

The reference call, if you want to read it later, is [Challenge 2](05-challenge-2-prompt-expansion.md).

---

## Step 5 · The portrait is image-to-image (10 min)

> **Concept — the photograph stays in the request.**
> Describing a face in words and hoping the image model invents the same person is a different product. Send the selfie as pixels next to `avatarPrompt`.

Model: `gemini-3.1-flash-image` (Nano Banana 2). Ask for an image back (`responseModalities` includes image) and set the frame (`9:16` or `16:9`).

**Checkpoint.** One sentence you will require in the portrait prompt: the person's face stays recognisable, no text, no watermark.

Reference: [Challenge 3](06-challenge-3-nano-banana-avatar.md).

---

## Step 6 · Video is a job, not a request (15 min)

> **Concept — short functions, long videos.**
> Omni often takes a minute. A serverless function cannot sit in `while (true)`. Start the job with `background: true`, return the id, and let the page ask "done yet?" every few seconds.

Model: `gemini-omni-1.1-flash` (`OMNI_MODEL`). Input is the **portrait you already saved**, plus `videoPrompt` wrapped as one 8-second shot. The Gemini key stays on the server.

Flow:

1. `POST /api/video/start` — check the Firebase ID token, read `avatar.png`, start Omni, return `interactionId`.
2. `GET /api/video/status` — check **once**. If the mp4 is already in Storage, return its URL.
3. The page loops on step 2.

Reference: [Challenge 4](07-challenge-4-omni-video.md).

---

## Step 7 · Build the light app

Now you write software. Create an empty folder (not this repo):

```text
my-light-kiosk/
```

Open it in Claude, Gemini, or Antigravity and paste the brief below. Attach your scene from Step 1. Do not attach `.env.local`.

### Brief to paste

```text
Build a light single-page photo booth. Stack: Vite + React + Firebase AI Logic + one server route for video (Vite middleware in dev is enough; Vercel functions are fine if you know them).

Pipeline, in this order:
1. Anonymous Firebase sign-in.
2. Upload the selfie to Firebase Storage at ghouls/{uid}/{jobId}/selfie.jpg (images only).
3. gemini-3.8-flash via Firebase AI Logic. Input: my scene (costume, setting, motion) plus the selfie bytes. Structured JSON only: ghoulName, personDescription, avatarPrompt, videoPrompt. Temperature 0.2, thinking high. Keep the face recognisable and the result family-friendly.
4. gemini-3.1-flash-image via Firebase AI Logic. Input: avatarPrompt + the same selfie bytes. Return a portrait, 9:16.
5. Upload the portrait to ghouls/{uid}/{jobId}/avatar.png.
6. A server route starts Gemini Omni (gemini-omni-1.1-flash) with background:true using GEMINI_API_KEY (no VITE_ prefix). The page polls every 5s. When the mp4 is ready, save it to Storage and play it.

UI: one page. File or camera input, three scene buttons, one Generate button, four status lines (upload, brief, portrait, video), the name, the portrait, the video. No admin, no watermarks, no printing, no social share, no caption generator.

Read config from .env.local only:
VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID,
VITE_APPCHECK_DEBUG_TOKEN (dev only), GEMINI_API_KEY, FIREBASE_SERVICE_ACCOUNT_BASE64,
FIREBASE_STORAGE_BUCKET.
Initialize App Check in dev when VITE_APPCHECK_DEBUG_TOKEN is set.
Never hard-code keys. Add .env.local and service-account JSON to .gitignore.

Scene to use:
<paste costume, setting, motion>
```

### Done when

- A selfie of you produces a name, a portrait that still looks like you, and a playing video.
- The repo has no API key, no private key, and no debug token in source.
- You can explain, without looking at the UI, why the video call is on the server and the brief call is not.

If a stage fails, use [Troubleshooting](11-troubleshooting.md). The usual ones are App Check `401` and Prepay `429`.

### After it works

Skim this repo's [overview](00-overview.md) and the four challenge files. They are the same pipeline, with the event-booth extras listed in the [advanced guide](14-advanced-level.md). Steal ideas. Do not start over from `App.tsx`.

Optional: [deploy the light app](09-deploy-vercel.md). Add the Vercel domain to Firebase Auth **Authorized domains**, and use a reCAPTCHA Enterprise site key for App Check. The debug token stays on your laptop.

---

[⬅️ Overview](00-overview.md) · [📋 Workshop steps](../README.md#workshop) · [Troubleshooting](11-troubleshooting.md)
