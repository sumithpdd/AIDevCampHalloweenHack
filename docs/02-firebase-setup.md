# Step 3 · Firebase setup

> 🧭 **Codelab step 3 of 11** · ⏱️ 25 min · Formula E codelab: *2 · Environment setup (APIs, bucket, service account)*

## 2.1 Create the project
1. Open the [Firebase console](https://console.firebase.google.com) → **Create a project** → name it e.g. `haunted-kiosk-<yourname>`.
2. Google Analytics is optional (you can skip it).
3. Bottom-left **Upgrade** → **Blaze** plan (needed for Firebase Storage buckets). Set a budget alert — £10 is plenty for a hack.

## 2.2 Register the web app
1. Project overview → **</> Web** → nickname `haunted-kiosk-web` → *don't* tick Firebase Hosting (we use Vercel) → **Register app**.
2. Copy the `firebaseConfig` values into `.env.local`:

```bash
cp .env.example .env.local          # PowerShell: Copy-Item .env.example .env.local
```

```dotenv
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=haunted-kiosk-xyz.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=haunted-kiosk-xyz
VITE_FIREBASE_STORAGE_BUCKET=haunted-kiosk-xyz.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abc123
```

> ℹ️ The Firebase web `apiKey` is **not a secret** — it only identifies your project. Security comes from
> Auth + Security Rules + App Check.

## 2.3 Turn on Firebase AI Logic (the "Firebase gen AI service")
1. Left menu → **AI** → **AI Logic** → **Get started**.
2. Choose **Gemini Developer API** (works with the `GoogleAIBackend` you'll use in Challenge 1).
3. Firebase enables the APIs and creates a Gemini API key *for Firebase's use only*. **Do not** copy that key into
   your code — Firebase AI Logic attaches it server-side for you.

> Want Vertex AI / Gemini Enterprise instead? Pick **Vertex AI Gemini API** here and use
> `new AgentPlatformBackend('global')` in Challenge 1. Everything else stays the same.

## 2.4 Enable Anonymous Authentication
**Build → Authentication → Get started → Sign-in method → Anonymous → Enable → Save.**

Every guest silently gets a uid. We use it to:
- give each guest their own folder in Storage (`ghouls/{uid}/…`), and
- prove to the Vercel Function that the request came from our app (Firebase ID token).

## 2.5 Create Firebase Storage + deploy the rules
1. **Build → Storage → Get started** → location **`europe-west2` (London)** 🇬🇧 → *Start in production mode*.
2. Deploy the rules in this repo (`storage.rules`):

```bash
firebase login
cp .firebaserc.example .firebaserc     # PowerShell: Copy-Item .firebaserc.example .firebaserc
# edit .firebaserc → "default": "<your-project-id>"
npm run firebase:deploy-rules          # = firebase deploy --only storage
```

What the rules do:

```
ghouls/{uid}/{jobId}/{fileName}
  read            → only the owner (request.auth.uid == uid)
  create/update   → only the owner, images only, < 10 MB
  video.mp4       → written by the Vercel Function with the Admin SDK (bypasses rules)
everything else   → denied
```

## 2.6 Service account for the Vercel Function
The server needs to **verify ID tokens**, **read `avatar.png`** and **write `video.mp4`**.

1. ⚙️ **Project settings → Service accounts → Generate new private key** → downloads a JSON file.
2. Base64-encode it on one line and paste into `.env.local`:

```bash
# macOS / Linux
base64 -i service-account.json | tr -d '\n'
```
```powershell
# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json")) | Set-Clipboard
```

```dotenv
FIREBASE_SERVICE_ACCOUNT_BASE64=<one-line base64 of the JSON>
FIREBASE_STORAGE_BUCKET=haunted-kiosk-xyz.firebasestorage.app
```

3. Move the JSON file **out of this folder** (for example into your home directory). `.gitignore` skips `*service*account*.json`, and `.vercelignore` does too, because a `vercel` upload can still pack a gitignored file. The app only needs the base64 line in `.env.local`.

## 2.7 Gemini API key for Gemini Omni (server only)
1. Open [Google AI Studio → API keys](https://aistudio.google.com/apikey) → **Create API key** → choose your Firebase
   project's Google Cloud project.
2. Turn on billing for that key's project, then buy **Prepay credits** in AI Studio
   ([billing guide](https://ai.google.dev/gemini-api/docs/billing#prepay)). The Firebase **Blaze** plan pays for
   Storage. It does not pay for Gemini. When the Prepay balance hits $0, the brief stage returns
   `429 Your prepayment credits are depleted`. The minimum purchase is $5.
3. Add to `.env.local` — **no `VITE_` prefix**, so it never reaches the browser:

```dotenv
GEMINI_API_KEY=<your AI Studio key — server only>
OMNI_MODEL=gemini-omni-1.1-flash
```

## 2.8 App Check — required for Firebase AI Logic

Firebase AI Logic is a proxy (`firebasevertexai.googleapis.com`). Before it spends your Gemini quota on the
brief (Challenge 2) or the portrait (Challenge 3), it checks an **App Check** token. New projects get this
enforcement switched on when AI Logic is enabled. Without a token, the selfie upload still works (Storage
checks Anonymous Auth, not App Check), but the next stage fails with:

```text
[401] Firebase App Check token is invalid.
```

`src/lib/firebase.ts` already contains the App Check code. It turns on only when one of these two variables is set:

| Where | Variable | Provider used |
|---|---|---|
| `npm run dev` on your laptop | `VITE_APPCHECK_DEBUG_TOKEN` | Debug token (read **only** in dev builds) |
| Vercel / any shared URL | `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` | reCAPTCHA Enterprise |

### 2.8.1 Localhost — debug token
1. Firebase console → **App Check** → **Apps** → your web app → register **reCAPTCHA Enterprise** (you need
   a provider registered before debug tokens are accepted — create the site key now, you'll reuse it in 2.8.2).
2. Same screen → ⋮ → **Manage debug tokens** → **Add debug token** → **Generate token** → name it
   `my-laptop` → copy the UUID.
3. Paste it into `.env.local` (never into `.env.example`, never on Vercel):

```dotenv
VITE_APPCHECK_DEBUG_TOKEN=<the UUID you just generated>
```

4. Restart `npm run dev`. The code sets `FIREBASE_APPCHECK_DEBUG_TOKEN` before `initializeAppCheck`, so the
   SDK swaps that UUID for a real App Check token.

> 🔐 A debug token is a password for your machine. It is read inside `if (import.meta.env.DEV)`, so Vite strips
> it from production builds. If it ever leaks, delete it in **Manage debug tokens**.

### 2.8.2 Shared URL — reCAPTCHA Enterprise
1. **App Check → Apps → your web app → reCAPTCHA Enterprise**. The site key's domain list must include
   `localhost` and your Vercel domain (`<project>.vercel.app`, plus any custom domain).
2. Set `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` in `.env.local` and later in Vercel. A site key is public: it ships
   in the bundle by design.
3. **App Check → APIs → Firebase AI Logic** should say **Enforced**. Leave it on.

Official guide: [App Check for Firebase AI Logic](https://firebase.google.com/docs/ai-logic/app-check).

## 2.9 Storage CORS (for the logo-branded video)
The booth burns the event logos into the Omni video **in the browser**, so the browser must be allowed to download
the video from Firebase Storage. Edit `storage.cors.json` (exact origins only, no wildcards) and apply it once:

```bash
gcloud storage buckets update gs://<your-bucket> --cors-file=storage.cors.json
```

Skipped it? Everything still works. The "Add event logos" stage just says *Skipped*, and the logos are overlaid in the
page instead of burned into the file. Details: [Advanced level §2](14-advanced-level.md#2-logo-watermark-on-the-photo-and-the-video).

## 2.10 Admin password
Add `ADMIN_SECRET` to `.env.local` (server only, no `VITE_`, at least 6 characters) to turn on the `/admin` page. A long random value is safer:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
```

## ✅ Checkpoint
```bash
npm run dev
```
Open http://localhost:5173 — the "Firebase isn't configured" banner should be gone. Upload a photo and press
**Summon my ghoul**: the *Upload photo* stage should turn 🎃 and the next stage should stop with
**"Challenge 1 is still a TODO"**. Perfect — that's your next job.

---
[⬅️ Prerequisites](01-prerequisites.md) · [📋 All steps](../README.md#codelab-walkthrough) · [Gemini CLI ➡️](03-gemini-cli.md)
