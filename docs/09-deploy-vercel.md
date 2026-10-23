# Step 10 · Push to GitHub & deploy to Vercel

> 🧭 **Codelab step 10 of 11** · ⏱️ 15 min · Formula E codelab: *5 · Deploying + 6 · Testing*

> Formula E codelab section 5 ran `gcloud run deploy` twice: backend, then frontend. Here a single Vercel
> project builds the Vite app **and** turns every file in `/api` into a serverless function.

## 9.1 Make sure no secret leaves your laptop

```bash
npm run check:secrets
```

This fails if any file that would be committed looks like a credential: a `.env*` file other than
`.env.example`, a service-account JSON, a Google API key, a private key, or a filled-in `GEMINI_API_KEY` /
`FIREBASE_SERVICE_ACCOUNT_BASE64` / `VITE_APPCHECK_DEBUG_TOKEN`. The Vercel build runs the same scan first and
stops if it finds anything.

What is safe to be public, and what is not:

| Value | Public? | Why |
|---|---|---|
| `VITE_FIREBASE_*` | ✅ yes | Identifies your Firebase project. Access is controlled by Auth, rules and App Check. |
| `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` | ✅ yes | Site keys are designed to be shipped to browsers. |
| `VITE_APPCHECK_DEBUG_TOKEN` | ❌ **no** | Localhost only. Never set it on Vercel. Delete it in the console if it leaks. |
| `GEMINI_API_KEY` | ❌ **no** | Server only, no `VITE_` prefix. |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` / the JSON file | ❌ **no** | Full admin access to your project. |

`.gitignore` already excludes `.env.local`, `*service*account*.json`, `.firebaserc` and `.vercel`.

## 9.2 Push to GitHub

```bash
git init -b main
git add .
npm run check:secrets          # one more time, now against what git will commit
git status                     # .env.local and the service-account JSON must NOT appear
git commit -m "Haunted Kiosk: React + Firebase + Vercel Gemini codelab"
git remote add origin https://github.com/<you>/AIDevCampHalloweenHack.git
git push -u origin main
```

> If the service-account JSON or `.env.local` ever shows in `git status`, stop. Fix `.gitignore` first. If a
> secret was already pushed, rotate it (new key, delete the old one). Deleting the commit isn't enough.

## 9.3 Import into Vercel
1. [vercel.com/new](https://vercel.com/new) → choose your team → **Import** the GitHub repo.
   Framework preset: **Vite** (auto-detected). `vercel.json` already sets the build command
   (`node scripts/vercel-build.mjs`), the output directory and a 60 s function timeout.
2. **Environment Variables**: open `.env.local`, copy everything **except** `VITE_APPCHECK_DEBUG_TOKEN`, and paste
   it into the first key field. Vercel splits a pasted `.env` block into separate variables.
3. Choose which version to deploy:

| You want… | Set |
|---|---|
| The **finished** kiosk as a live demo | `DEPLOY_WITH_SOLUTIONS=true` (copies `solutions/` in before building) |
| Your **own** solved code | leave it unset, and commit your solved challenge files |

4. **Deploy**.

### Or with the Vercel CLI
```bash
npm i -g vercel
vercel login
vercel link                            # pick your team + project
# Pipe each value. Skip VITE_APPCHECK_DEBUG_TOKEN — production builds ignore it, and it must not be uploaded.
# Set DEPLOY_WITH_SOLUTIONS=true only on the live demo. A participant fork leaves it unset.
vercel env add GEMINI_API_KEY production --value "..." --yes --force
vercel env add FIREBASE_SERVICE_ACCOUNT_BASE64 production --value "..." --yes --force
vercel env add DEPLOY_WITH_SOLUTIONS production --value "true" --yes --force
vercel --prod
```

## 9.4 After the first deploy (don't skip)
1. **Firebase → Authentication → Settings → Authorized domains → Add domain**: `<project>.vercel.app`
   (and any custom domain). Without it, anonymous sign-in fails in production.
2. **reCAPTCHA Enterprise site key → Domains**: add the same domain. Without it, App Check returns `401` on the
   brief stage.
3. Redeploy if you changed any env var (Vercel → Deployments → ⋯ → Redeploy).

## 9.5 Experience the kiosk
> Formula E codelab section 6, "Testing & Experiencing", on your phone.

1. Open the Vercel URL on your phone. HTTPS means the camera works.
2. Take a selfie, pick **Ghost of the Last Tube**, choose **Portrait 9:16**.
3. Watch Gemini 3.8 Flash → Nano Banana 2 → Gemini Omni work through the stages.
4. Play the video, download it, share it. 👻

## Function limits
- Request and response bodies are capped at about 4.5 MB. That's why the avatar travels through Firebase Storage
  and the video is saved to Storage instead of being returned in the response.
- `maxDuration: 60` is plenty: each call only *starts* or *checks* Omni.

---
[⬅️ Assemble & run](08-run-and-test.md) · [📋 All steps](../README.md#codelab-walkthrough) · [Conclusion & clean-up ➡️](12-cleanup.md)
