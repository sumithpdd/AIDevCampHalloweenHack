# Step 7 · Challenge 3 — Avatar generation with Nano Banana 2

> 🧭 **Reference lab, not the workshop.** The concept is [workshop step 5](15-workshop.md#step-5--the-portrait-is-image-to-image-10-min).
> ⏱️ 15 min · Formula E codelab: *3 · Challenge 3 — avatar generation*

> Formula E equivalent: `client.models.generate_content(model="gemini-3.1-flash-image", contents=[text, image, car],
> config=GenerateContentConfig(response_modalities=["IMAGE"], image_config=ImageConfig(aspect_ratio="16:9")))`

## The concept
This is image-to-image on the same Firebase AI Logic client as Challenge 2, with a different model and a
different response type. The selfie arrives as pixels (`inlineData`). `brief.avatarPrompt` arrives as the
direction. `responseModalities` includes `IMAGE`, so the model may return a picture. `imageConfig.aspectRatio`
is the frame the guest picked (`9:16` or `16:9`). One person or a group stays recognisable because the photograph is an
input, and because `promptText` locks faces and only allows clothing, props, background, and lighting. If a safety filter blocks the
picture, `inlineDataParts()` is empty and the thrown error includes any text the model did return.

## Goal
Send the photo and `brief.avatarPrompt` to **Nano Banana 2 (`gemini-3.1-flash-image`)** through
Firebase AI Logic and get back a portrait in the orientation the guest picked (9:16 for a phone,
16:9 for a big screen).

The pipeline then uploads it to `ghouls/{uid}/{jobId}/avatar.png` in Firebase Storage — that's the file
Gemini Omni animates in Challenge 4.

## The gap

```ts
const imagePart = undefined as { inlineData: { data: string; mimeType: string } } | undefined; // REPLACE THIS LINE
const result = { response: { text: () => '', usageMetadata: undefined } } as const; // REPLACE THIS LINE (it's the generateContent result)
if (!imagePart) throw new ChallengeTodo(3, 'generate the avatar with gemini-3.1-flash-image');
```

## Hints
1. Same `getGenerativeModel` as Challenge 2, but `model: MODELS.image`.
2. Ask for images: `responseModalities: [ResponseModality.TEXT, ResponseModality.IMAGE]`.
3. Aspect ratio lives in `imageConfig: { aspectRatio }`. `orientation` is already `'9:16' | '16:9'`
   (cast it to `ImageConfigAspectRatio`).
4. Images come back as inline data: `result.response.inlineDataParts()?.[0]`.

<details>
<summary>💡 Solution & explanation</summary>

```ts
const model = getGenerativeModel(getHalloweenAI(), {
  model: MODELS.image, // 'gemini-3.1-flash-image' — Nano Banana 2
  generationConfig: {
    responseModalities: [ResponseModality.TEXT, ResponseModality.IMAGE],
    imageConfig: { aspectRatio: orientation as ImageConfigAspectRatio },
  },
});

const result = await model.generateContent([
  { type: 'text', text: promptText },
  { type: 'inlineData', inlineData: { data: selfie.base64, mimeType: selfie.mimeType } },
]);

const imagePart = result.response.inlineDataParts()?.[0];
// (given, below the gap) recordUsage('avatar', result.response.usageMetadata) — 🔢 tokens for the UI
```

- Passing the **photo as a part** is what makes it image-to-image — Nano Banana keeps the people and changes the wardrobe and the room.
- `promptText` (given) wraps `brief.avatarPrompt` with an identity lock: same people, same faces, no text, no watermark. If the brief asks to alter a face, that part is ignored.
- If safety filters block the image, `inlineDataParts()` is empty; the code below the gap throws a readable error
  including any text the model returned.
</details>

## ✅ Checkpoint
You should see your **avatar** appear, and in the Firebase console → Storage →
`ghouls/<uid>/<job>/` you'll find `selfie.jpg` and `avatar.png`. Next error: **"Challenge 4 is still a TODO"**.

🧪 Bonus (like the Formula E lab's Gen4 car reference): add a **second reference image** — e.g. a photo of your
local GDG venue or a Halloween prop — as another `inlineData` part and mention it in the prompt.

---
[⬅️ Challenge 2](05-challenge-2-prompt-expansion.md) · [📋 All steps](../README.md#codelab-walkthrough) · [Challenge 4 ➡️](07-challenge-4-omni-video.md)
