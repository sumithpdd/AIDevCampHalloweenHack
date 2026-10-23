# Step 8 · Challenge 4 — Video generation with Gemini Omni 1.1 Flash

> 🧭 **Reference lab, not the workshop.** The concept is [workshop step 6](15-workshop.md#step-6--video-is-a-job-not-a-request-15-min).
> ⏱️ 20 min · Formula E codelab: *3 · Challenge 4 — video generation*

> Formula E equivalent:
> ```python
> interaction = client.interactions.create(model="gemini-omni-1.1-flash-preview", input=[…], background=True)
> while True:
>     status_check = client.interactions.get(interaction.id)
>     if status_check.status == "completed": return base64.b64decode(status_check.output_video.data)
>     time.sleep(5)
> ```

## The concept
Omni animates the **portrait you already saved**, using `brief.videoPrompt` as the shot description.
`buildVideoInstruction()` wraps that prompt so the clip animates the portrait without redesigning anyone: camera, cloth, and background may move, faces must not morph, and nobody may appear or disappear.
Family-friendly, no on-screen text. The function reads `avatar.png` from Storage with the Admin SDK, because
`storage.rules` only let the browser upload images. It will only do that after the Firebase ID token's uid
matches the folder.

The Interactions API takes `GEMINI_API_KEY`, so this file runs on the server. A function cannot hold a
`while` loop open for the minute Omni needs, so **4a starts** the job and **4b checks once**. The browser
is the loop.

## Why this one is on the server
Gemini Omni is reached through the **Interactions API** with a Gemini API key. That key stays in
`GEMINI_API_KEY` (no `VITE_` prefix). This challenge lives in `server/omni.ts`, called by two Vercel Functions:

| Function | Does | Calls |
|---|---|---|
| `POST /api/video/start` | verifies the Firebase ID token, reads `avatar.png` from Storage | **4a** `startOmniVideo()` |
| `GET /api/video/status` | returns early if `video.mp4` already exists; otherwise | **4b** `checkOmniVideo()` → saves `video.mp4` |

During `npm run dev` these run inside Vite (see `vite.config.ts`) — no `vercel dev`, no Python.

> 🔁 **The big design change:** a serverless function can't sit in a `while True` loop for minutes. So
> **4a** starts the job with `background: true` and returns immediately, and **4b** checks *once*. The loop lives
> in the browser: `waitForVideo()` in `src/lib/video.ts` calls `/api/video/status` every 5 s.

## 4a — start the background interaction

```ts
const interaction = undefined as { id: string } | undefined; // REPLACE THIS LINE
if (!interaction) throw new ChallengeTodo(4, 'start a background Gemini Omni interaction (4a)');
...
return interaction.id;
```

Hints:
1. `getGenAI()` returns a `GoogleGenAI` from `@google/genai`; the method is `interactions.create({...})`.
2. Interactions API fields are **snake_case**: `mime_type`, `response_format`, `aspect_ratio`.
3. `input` is an array of content blocks: an `image` block (the avatar) and a `text` block
   (`buildVideoInstruction(prompt)`).
4. `response_format: { type: 'video', aspect_ratio, resolution: '720p' }` and — the important one — `background: true`.

<details>
<summary>💡 Solution 4a</summary>

```ts
const interaction = await getGenAI().interactions.create({
  model: OMNI_MODEL, // 'gemini-omni-1.1-flash'
  input: [
    { type: 'image', data: image.base64, mime_type: image.mimeType },
    { type: 'text', text: buildVideoInstruction(prompt) },
  ],
  response_format: { type: 'video', aspect_ratio: aspectRatio, resolution: '720p' },
  background: true,
});

return interaction.id;
```
Remove the `void …` lines that follow the gap.
</details>

## 4b — check the interaction once

```ts
void interactionId;
void FAILED;
throw new ChallengeTodo(4, 'poll the Omni interaction with interactions.get() (4b)');
```

Hints:
1. `await getGenAI().interactions.get(interactionId)`
2. `interaction.status` is one of `in_progress`, `completed`, `failed`, `cancelled`, … (`FAILED` is a `Set` of the bad ones).
3. Include `usage: interaction.usage` in the completed result. The UI shows it as the video's token count.
4. The video is in `interaction.output_video` — either inline base64 `data` or a `uri`. The given helper
   `videoToBuffer()` handles both.

<details>
<summary>💡 Solution 4b</summary>

```ts
const interaction = await getGenAI().interactions.get(interactionId);

if (interaction.status === 'completed') {
  const video = interaction.output_video;
  if (!video) return { status: 'failed', error: 'Omni finished but returned no video' };
  return { status: 'completed', video: await videoToBuffer(video), usage: interaction.usage }; // 🔢 tokens
}
if (FAILED.has(interaction.status)) {
  return { status: 'failed', error: `Omni ${interaction.status}: ${JSON.stringify(interaction.errors ?? [])}` };
}
return { status: 'in_progress' };
```
</details>

## What happens next (already written)
`api/video/status.ts` takes the bytes, saves them to **Firebase Storage** at
`ghouls/{uid}/{jobId}/video.mp4` with a download token, and returns the URL. The React app plays it.

> ⚠️ Server code changes: Vite reloads `/api` modules on each request, but if something looks stale,
> restart `npm run dev`.

## Model ID note
The [Gemini Omni docs](https://ai.google.dev/gemini-api/docs/omni) list `gemini-omni-1.1-flash`; the Formula E lab
used `gemini-omni-1.1-flash-preview`. Set `OMNI_MODEL` in `.env.local` to whichever your key can use.

## ✅ Checkpoint
Run the whole pipeline. The video stage shows a timer (`Gemini Omni is animating your ghoul… 35s`) and then your
video plays. 🎉 You've rebuilt the Formula E kiosk — with no Python.

---
[⬅️ Challenge 3](06-challenge-3-nano-banana-avatar.md) · [📋 All steps](../README.md#codelab-walkthrough) · [Assemble & run ➡️](08-run-and-test.md)
