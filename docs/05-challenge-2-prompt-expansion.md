# Step 6 · Challenge 2 — Prompt expansion with `gemini-3.8-flash`

> 🧭 **Reference lab, not the workshop.** The concept is [workshop step 4](15-workshop.md#step-4--prompt-expansion-15-min).
> ⏱️ 15 min · Formula E codelab: *3 · Challenge 2 — prompt expansion*

> Formula E equivalent: `client.interactions.create(model="gemini-3.8-flash", input=[text, image],
> generation_config={"thinking_level": "high", "temperature": 0.2})`

## The concept
A scene (`src/data/booth-scenes.ts`) resolves to three short strings: costume, setting, motion. This challenge is the
art director. Gemini 3.8 Flash sees those strings **and the photo** (one person or a group) and writes a brief the later models
can follow. **Structured output** (`responseSchema` plus `application/json`) makes the reply four fields,
so Challenge 3 reads `avatarPrompt` and Challenge 4 reads `videoPrompt`. Low temperature keeps the
description close to the photo. `ThinkingLevel.HIGH` is the time the model spends looking before it writes.
The rules it must follow — same people, same faces, family-friendly, word counts — live in `buildBriefInstruction()`
(`src/lib/briefPrompt.ts`), which is the file you rewrite when the booth gets a new theme. Costume text must not ask for a new skin colour or face paint that covers features.

## Goal
Show Gemini the selfie plus the chosen scene and get back a **structured brief**:

```ts
interface GhoulBrief {
  ghoulName: string;          // "Count Sumith of the Thames"
  personDescription: string;  // neutral, visible features only
  avatarPrompt: string;       // → Nano Banana 2 (Challenge 3)
  videoPrompt: string;        // → Gemini Omni (Challenge 4)
}
```

We go one step further than the Formula E lab: instead of free text we use **structured output**
(`responseSchema`) so the app can split the brief into an image prompt and a video prompt reliably.

## What's given
- `buildBriefInstruction(scene)` in `src/lib/briefPrompt.ts` — the creative-director instruction (identity
  preservation, family-friendly, word counts).
- `ghoulBriefSchema` — a Firebase AI Logic `Schema.object(...)`.
- `selfie` — `{ base64, mimeType }` of the down-scaled photo.

## The gap

```ts
const result: { response: { text(): string; usageMetadata?: AiLogicUsageMetadata } } = null as never; // REPLACE THIS LINE
if (!result) throw new ChallengeTodo(2, 'call gemini-3.8-flash with the selfie + scene brief');

recordUsage('brief', result.response.usageMetadata); // 🔢 given — token count for the UI
return JSON.parse(result.response.text()) as GhoulBrief;
```

## Hints
1. `getGenerativeModel(getHalloweenAI(), { model, generationConfig })`
2. Formula E's `thinking_level: "high"` becomes `thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }`.
3. Structured output needs **both** `responseMimeType: 'application/json'` and `responseSchema`.
4. Firebase JS SDK **v13** parts carry a `type`:
   `{ type: 'text', text }` and `{ type: 'inlineData', inlineData: { data, mimeType } }`.

<details>
<summary>💡 Solution & explanation</summary>

```ts
const model = getGenerativeModel(getHalloweenAI(), {
  model: MODELS.prompt, // 'gemini-3.8-flash'
  generationConfig: {
    temperature: 0.2,
    thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
    responseMimeType: 'application/json',
    responseSchema: ghoulBriefSchema,
  },
});

const result = await model.generateContent([
  { type: 'text', text: buildBriefInstruction(scene) },
  { type: 'inlineData', inlineData: { data: selfie.base64, mimeType: selfie.mimeType } },
]);

recordUsage('brief', result.response.usageMetadata); // 🔢 given — token count for the UI
return JSON.parse(result.response.text()) as GhoulBrief;
```

| Python (Formula E) | TypeScript (Haunted Kiosk) |
|---|---|
| `client.interactions.create(model=…)` | `getGenerativeModel(ai, { model })` + `generateContent()` |
| `{"type": "image", "bytes": b64, "mime_type": …}` | `{ type: 'inlineData', inlineData: { data: b64, mimeType } }` |
| `generation_config={"thinking_level": "high"}` | `thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }` |
| `interaction.output_text` | `result.response.text()` |
| (not shown) | `result.response.usageMetadata` → token counts in the UI |

Low `temperature` keeps the description faithful to the photo; `HIGH` thinking lets the model reason about
costume details before writing. Delete the `void …` lines at the bottom when done.
</details>

## ✅ Checkpoint
Run the pipeline: the card title becomes your **ghoul name**, and *🔍 See the prompts Gemini wrote* shows both
prompts. The next error is **"Challenge 3 is still a TODO"**.

🧪 Experiment: tweak `buildBriefInstruction()` — ask for a rhyming ghoul name, or force a London landmark.

---
[⬅️ Challenge 1](04-challenge-1-firebase-ai-logic.md) · [📋 All steps](../README.md#codelab-walkthrough) · [Challenge 3 ➡️](06-challenge-3-nano-banana-avatar.md)
