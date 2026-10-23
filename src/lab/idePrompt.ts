/** Pasted into Cursor, VS Code, Claude, Gemini, or Antigravity to scaffold a light booth. */
export const IDE_PROMPT = `I already created the Firebase project, turned on Anonymous Auth, Storage, and Firebase AI Logic (Gemini Developer API), and filled .env.local. Do not invent keys. Do not print secrets. Build a light photo booth on Vercel. I will choose the stack: Vite + React, or Next.js. Use Firebase for auth and storage, Firebase AI Logic in the browser, and one server route for video.

Stop after each checkpoint and tell me how to try it before you write the next file.

The photo may be one person or a group. Edit that photo. Do not invent new people.

Build in this order:

Checkpoint A — client only. initializeApp from the VITE_FIREBASE_* values. In dev, initializeAppCheck with the debug token. In production, use ReCaptchaEnterpriseProvider with the site key. Anonymous sign-in. getAI(app, { backend: new GoogleAIBackend() }). A button that signs in and prints the uid. No Gemini call yet.

Checkpoint B — the brief only. gemini-3.8-flash via Firebase AI Logic. Input: my scene (costume, setting, motion) plus the photo bytes. Structured JSON only: ghoulName, personDescription, avatarPrompt, videoPrompt. Temperature 0.2, thinking high, responseMimeType application/json plus a schema. Show the four fields on the page. Do not generate an image yet.

Checkpoint C — the portrait only. gemini-3.1-flash-image (Nano Banana 2) via Firebase AI Logic. Input: avatarPrompt plus the same photo bytes. Return an image, 9:16 or 16:9. Upload it to ghouls/{uid}/{jobId}/avatar.png and show it. Identity lock: same people, same count, same order. Do not change face shape, eyes, nose, mouth, skin tone, hair, glasses, or expression. Change only clothing, small props, background, and lighting. Do not start video yet.

Checkpoint D — video only. A server route starts Gemini Omni (gemini-omni-1.1-flash) with background: true using GEMINI_API_KEY (no VITE_ prefix). The page polls every 5 seconds. When the mp4 is ready, save it with the Admin SDK and play it. Faces in the video must not morph. The function must not loop.

Checkpoint E — one page. File or camera input, three scene buttons, one Generate button, status lines for upload, brief, portrait, and video, then the name, the portrait, and the video. Upload the photo to ghouls/{uid}/{jobId}/selfie.jpg (images only, under 10 MB) before the brief. No admin page, no watermarks, no print, no share sheet.

Read config from .env.local only:
VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID,
VITE_APPCHECK_DEBUG_TOKEN (dev only), VITE_RECAPTCHA_ENTERPRISE_SITE_KEY (production),
GEMINI_API_KEY, FIREBASE_SERVICE_ACCOUNT_BASE64, FIREBASE_STORAGE_BUCKET.
Initialize App Check in dev when the debug token is set, and with reCAPTCHA Enterprise when the site key is set.
Never hard-code keys. Gitignore .env.local and any service-account JSON.

Scene to use:
<paste costume, setting, and motion>
`;
