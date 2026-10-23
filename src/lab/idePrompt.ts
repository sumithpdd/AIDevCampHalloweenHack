/** Pasted into Cursor, VS Code, Claude, Gemini, or Antigravity to scaffold a light booth. */
export const IDE_PROMPT = `Build a light photo booth I can deploy on Vercel. I will choose the stack: Vite + React, or Next.js. Use Firebase for auth and storage, Firebase AI Logic in the browser, and one server route for video.

The photo may be one person or a group. Edit that photo. Do not invent new people.

Pipeline, in this order:
1. Anonymous Firebase sign-in.
2. Upload the photo to Firebase Storage at ghouls/{uid}/{jobId}/selfie.jpg (images only, under 10 MB).
3. gemini-3.8-flash via Firebase AI Logic. Input: my scene (costume, setting, motion) plus the photo bytes. Structured JSON only: ghoulName, personDescription, avatarPrompt, videoPrompt. Temperature 0.2, thinking high.
4. Identity lock in the brief and the portrait: same people, same count, same order. Do not change face shape, eyes, nose, mouth, skin tone, hair, glasses, or expression. Change only clothing, small props, background, and lighting.
5. gemini-3.1-flash-image (Nano Banana 2) via Firebase AI Logic. Input: avatarPrompt plus the same photo bytes. Return an image, 9:16 or 16:9.
6. Upload that portrait to ghouls/{uid}/{jobId}/avatar.png.
7. A server route starts Gemini Omni (gemini-omni-1.1-flash) with background: true using GEMINI_API_KEY (no VITE_ prefix). The page polls every 5 seconds. When the mp4 is ready, save it with the Admin SDK and play it. Faces in the video must not morph.

UI: one page. File or camera input, three scene buttons, one Generate button, status lines for upload, brief, portrait, and video, then the name, the portrait, and the video. No admin page, no watermarks, no print, no share sheet.

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
