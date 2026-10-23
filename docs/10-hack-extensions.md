# Bonus · Hack extensions — level up your ghoul 🧛

> 🎁 **Bonus** — after the core codelab ([11 steps](../README.md#codelab-walkthrough))

You've finished the core lab. A new theme (different worlds, different art direction, same pipeline) is
[Make your own](13-make-your-own.md). The ideas below add a feature on top of a booth that already runs.

## 🟢 Warm-ups (15 min)
- **New scenes** — `/hack:scene a werewolf DJ at a Camden rave`. Add a "random" button.
- **Spookier prompts** — edit `buildBriefInstruction()` for a consistent art style (claymation, 80s VHS horror,
  Studio-style watercolour).
- **Share sheet** — use `navigator.share({ url: videoUrl })` on mobile.
- **QR code** — show a QR of the video URL so kiosk guests can grab it on their phone.

## 🟠 Builders (30–60 min)
- **Haunted gallery** — save each job to **Cloud Firestore** (`ghouls/{jobId}`: name, scene, avatar/video paths,
  createdAt) and render a live wall of videos with `onSnapshot`. Update rules so only finished entries are public.
- **Second reference image** — like the Formula E lab's Gen4 car, pass a prop or venue photo to Nano Banana 2.
- **Conversational re-edit** — Gemini Omni supports multi-turn editing: call `interactions.create` with
  `previous_interaction_id` and a prompt like *"make it rain bats"*. Add a "Remix" button.
- **Separate photos, one scene** — the booth already edits a single group photo. The harder version is two or three separate uploads combined into one frame.

## 🔴 Boss level (60+ min)
- **Live narrator** — use the Gemini Live API (`firebase/ai` `getLiveGenerativeModel`) to have a spooky voice
  narrate while the video renders.
- **Streaming progress** — stream the Omni interaction (SSE) through a Vercel function instead of polling.
- **Vertex AI / Gemini Enterprise** — switch Challenge 1 to `AgentPlatformBackend('global')` and the server to
  `new GoogleGenAI({ vertexai: true, project, location })`.
- **Cost guardrails** — rate-limit per uid (Firestore counter or Upstash) and enforce App Check on the Vercel
  function (verify the `X-Firebase-AppCheck` token with the Admin SDK).

## 🏆 Judging suggestions
| Criteria | Weight |
|---|---|
| Wow factor of the generated ghoul | 30 % |
| Creative use of Gemini (prompts, multi-turn, multimodal) | 25 % |
| Working end-to-end on Vercel | 20 % |
| Responsible AI: identity-preserving, family-friendly, guarded keys | 15 % |
| Demo & storytelling | 10 % |

---
[📋 All steps](../README.md#codelab-walkthrough) · [Make your own](13-make-your-own.md) · [Troubleshooting](11-troubleshooting.md)
