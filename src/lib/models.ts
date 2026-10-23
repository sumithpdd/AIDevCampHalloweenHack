/** Model IDs — override in .env.local if your project has access to newer ones. */
export const MODELS = {
  /** Challenge 2 — prompt expansion (text + image in, JSON out). */
  prompt: import.meta.env.VITE_PROMPT_MODEL || 'gemini-3.8-flash',
  /** Challenge 3 — Nano Banana 2 image-to-image avatar. */
  image: import.meta.env.VITE_IMAGE_MODEL || 'gemini-3.1-flash-image',
  /** Challenge 4 — runs on the server; this label is only for the UI. */
  video: 'Gemini Omni 1.1 Flash',
} as const;
