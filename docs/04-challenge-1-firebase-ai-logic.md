# Step 5 · Challenge 1 — Initialise Firebase AI Logic

> 🧭 **Codelab step 5 of 11** · ⏱️ 5 min · Formula E codelab: *3 · Challenge 1 — client initialisation*

> Formula E equivalent: `client = genai.Client(enterprise=True, project=…, location=…)`

## The concept
Firebase AI Logic is a proxy. The browser asks your Firebase project, the proxy attaches Gemini access for
that project, and App Check decides whether the call is allowed to spend quota. `getAI()` is that client.
`GoogleAIBackend` selects the Gemini Developer API (the switch you enabled in
[02 §2.3](02-firebase-setup.md)). The brief and the portrait use it. Video does not: Omni goes through the
Interactions API on the server, where `GEMINI_API_KEY` is allowed to live.

## Goal
Create the Firebase AI Logic client that Challenges 2 and 3 use to call Gemini from the browser.

## The gap

```ts
function createAI(firebaseApp: FirebaseApp): AI {
  // REPLACE THIS LINE WITH YOUR CODE
  throw new ChallengeTodo(1, 'create the Firebase AI Logic client with getAI() + GoogleAIBackend');
}
```

Everything else in the file is done for you: `initializeApp`, the App Check block (debug token in dev via
`VITE_APPCHECK_DEBUG_TOKEN`, reCAPTCHA Enterprise via `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` — see [02 §2.8](02-firebase-setup.md#28-app-check--required-for-firebase-ai-logic)),
`getAuth`, `getStorage`, `ensureSignedIn()` (anonymous sign-in) and a cached `getHalloweenAI()` getter.

## Hints
1. Both helpers are already imported from `'firebase/ai'`.
2. `getAI(app, options)` — the option you need is `backend`.
3. The Gemini Developer API backend class is `GoogleAIBackend` (you enabled it in [02](02-firebase-setup.md#23-turn-on-firebase-ai-logic-the-firebase-gen-ai-service)).

<details>
<summary>💡 Solution & explanation</summary>

```ts
function createAI(firebaseApp: FirebaseApp): AI {
  return getAI(firebaseApp, { backend: new GoogleAIBackend() });
}
```

- `getAI()` returns an `AI` instance bound to your Firebase app.
- `GoogleAIBackend` routes requests through Firebase to the **Gemini Developer API**. Firebase adds the key and
  (if enabled) verifies App Check — the browser never sees a Gemini key.
- Using Vertex AI / Gemini Enterprise? `new AgentPlatformBackend('global')` — the rest of the lab is unchanged.

Remove the two `void getAI; void GoogleAIBackend;` lines at the bottom of the file — they only existed to keep
the linter quiet. (Or run `npm run solve -- 1`.)
</details>

## ✅ Checkpoint
Save the file — Vite hot-reloads. Press **Summon my ghoul** again: the error should now say
**"Challenge 2 is still a TODO"**.

---
[⬅️ Gemini CLI](03-gemini-cli.md) · [📋 All steps](../README.md#codelab-walkthrough) · [Challenge 2 ➡️](05-challenge-2-prompt-expansion.md)
