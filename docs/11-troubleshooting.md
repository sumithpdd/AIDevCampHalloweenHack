# Bonus · Troubleshooting — when the ghosts bite back

> 🎁 **Bonus** — after the core codelab ([11 steps](../README.md#codelab-walkthrough))

| Symptom | Likely cause | Fix |
|---|---|---|
| Banner "Firebase isn't configured yet" | `.env.local` missing / dev server not restarted | Fill `VITE_FIREBASE_*`, restart `npm run dev` |
| `auth/admin-restricted-operation` | Anonymous auth disabled | Authentication → Sign-in method → Anonymous → Enable |
| `auth/unauthorized-domain` (prod) | Vercel domain not authorised | Authentication → Settings → Authorized domains |
| `storage/unauthorized` | Rules not deployed or wrong path | `npm run firebase:deploy-rules`; paths must be `ghouls/{uid}/…` |
| `storage/unknown` / bucket not found | Storage not created / wrong bucket name | Build → Storage → Get started; copy the exact bucket into both env vars |
| `401` `Firebase App Check token is invalid` on the brief or portrait | Firebase AI Logic is enforcing App Check and the call had no valid token. With both `VITE_APPCHECK_DEBUG_TOKEN` and `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` empty, `initializeAppCheck` never runs. The selfie upload can still succeed. | Localhost: generate a debug token in **Manage debug tokens** and set `VITE_APPCHECK_DEBUG_TOKEN` ([02 §2.8.1](02-firebase-setup.md#281-localhost--debug-token)). Vercel: set `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` and add the Vercel domain to the site key ([02 §2.8.2](02-firebase-setup.md#282-shared-url--recaptcha-enterprise)) |
| `403` `To access this model, you must enforce Firebase App Check` | That model is blocked until Firebase AI Logic enforcement is on | App Check → APIs → Firebase AI Logic → Enforced, then send a real token as in [02 §2.8](02-firebase-setup.md#28-app-check--required-for-firebase-ai-logic) |
| `AI Logic API has not been used in project…` | Firebase AI Logic not enabled | AI → AI Logic → Get started → Gemini Developer API |
| `Property 'type' is missing … TextPart` (TS) | Firebase JS SDK v13 parts | Use `{ type: 'text', text }` / `{ type: 'inlineData', inlineData }` |
| `model not found` for `gemini-3.8-flash` / `gemini-3.1-flash-image` | Model not available in your project/region | Set `VITE_PROMPT_MODEL` / `VITE_IMAGE_MODEL` to a model listed in Firebase AI Logic → Models |
| "Nano Banana returned no image" | Safety filter or a non-face photo | Use a clear front-facing photo, try another scene |
| `GEMINI_API_KEY is not set` | Server env missing | Add to `.env.local` (no `VITE_`) / Vercel env; restart |
| `FIREBASE_SERVICE_ACCOUNT_BASE64 is not set` / JSON parse error | Missing or multi-line base64 | Re-encode on one line (see docs/02 §2.6) |
| `Invalid Firebase ID token` | Service account from a *different* project | Generate the key in the same Firebase project |
| Omni `404` / permission denied | Model ID or tier | Try `OMNI_MODEL=gemini-omni-1.1-flash-preview`; enable billing on the key's project |
| Omni `failed` with safety error | Prompt/image blocked | Keep it family-friendly; try another scene |
| Video stage stuck > 10 min | Omni queue | The browser times out at 10 min; retry. Check the interaction in AI Studio logs |
| Camera black / blocked | Permission or HTTP on phone | Allow camera; on phones use the HTTPS Vercel URL |
| App Check `401` only on Vercel | Debug tokens are ignored in production builds; reCAPTCHA key missing or domain not allowed | Set `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` on Vercel, add `<project>.vercel.app` to the key's domains, redeploy |
| Vercel shows "Challenge N is still a TODO" | Repo ships the TODO version | Set `DEPLOY_WITH_SOLUTIONS=true` in Vercel env vars, or solve the challenges and push |
| Works locally, `/api` 404 on Vercel | Files moved out of `/api` | Keep handlers at `api/video/*.ts` |
| `ERR_MODULE_NOT_FOUND …/server/x.js` on Vercel | Import without `.js` | Server/API imports use `.js` extensions (ESM) — keep them |

Still stuck? In Gemini CLI: *"Here's my error: … — what's wrong?"*, or ask a GDG London mentor. 🎃

---
[📋 All steps](../README.md#codelab-walkthrough) · [Hack extensions](10-hack-extensions.md) · [Make your own](13-make-your-own.md)
