import { initializeApp, type FirebaseApp } from 'firebase/app';
import { CustomProvider, initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAuth, signInAnonymously, type User } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAI, GoogleAIBackend, type AI } from 'firebase/ai';
import { ChallengeTodo } from './todo';

// ─────────────────────────────────────────────────────────────
// Firebase web config — comes from .env.local (see .env.example)
// ─────────────────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Placeholder values keep the UI rendering (with a setup banner) before .env.local exists.
export const app: FirebaseApp = initializeApp(
  isFirebaseConfigured ? firebaseConfig : { ...firebaseConfig, apiKey: 'not-configured', projectId: 'not-configured' },
);

// Firebase AI Logic rejects calls that arrive without a valid App Check token.
// Local dev uses a debug token (VITE_APPCHECK_DEBUG_TOKEN), registered in
// App Check → Apps → Manage debug tokens. A public site uses reCAPTCHA Enterprise.
const recaptchaKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY;
let debugToken: string | undefined;
if (import.meta.env.DEV) {
  debugToken = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;
  if (debugToken) {
    (globalThis as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string }).FIREBASE_APPCHECK_DEBUG_TOKEN =
      debugToken;
  }
}
if (debugToken || recaptchaKey) {
  initializeAppCheck(app, {
    provider: debugToken
      ? new CustomProvider({
          getToken: () =>
            Promise.resolve({ token: 'unused-in-debug-mode', expireTimeMillis: Date.now() + 3_600_000 }),
        })
      : new ReCaptchaEnterpriseProvider(recaptchaKey as string),
    isTokenAutoRefreshEnabled: true,
  });
}

export const auth = getAuth(app);
export const storage = getStorage(app);

// =====================================================================
// ✅ SOLUTION — Challenge 1: create the Firebase AI Logic client
// Firebase AI Logic lets the browser call Gemini directly — no Python,
// no FastAPI, no API key in your bundle. The Gemini Developer API
// backend (GoogleAIBackend) is free-tier friendly; swap to
// AgentPlatformBackend('global') to use Vertex AI / Gemini Enterprise instead.
// =====================================================================
function createAI(firebaseApp: FirebaseApp): AI {
  return getAI(firebaseApp, { backend: new GoogleAIBackend() });
}

let aiInstance: AI | undefined;
/** Lazily create (and cache) the Firebase AI Logic client. */
export function getHalloweenAI(): AI {
  aiInstance ??= createAI(app);
  return aiInstance;
}

/** Every visitor gets an anonymous Firebase user so Storage rules can scope files per user. */
export async function ensureSignedIn(): Promise<User> {
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}

// Keeps the import used in both starter and solution files.
void ChallengeTodo;
