import type { Scene } from './scenes';

/** Structured output we ask Gemini 3.8 Flash for in Challenge 2. */
export interface GhoulBrief {
  /** A fun spooky name, e.g. "Count Sumith of the Thames". */
  ghoulName: string;
  /** One-line description of what Gemini saw in the photo (shown in the UI). */
  personDescription: string;
  /** Detailed prompt for Nano Banana 2 (Challenge 3). */
  avatarPrompt: string;
  /** Cinematic 8-second direction for Gemini Omni (Challenge 4). */
  videoPrompt: string;
}

/**
 * The "system brief" for prompt expansion — the Halloween twin of the
 * Formula E lab's "describe this person as a race driver" instruction.
 * Feel free to tune it; better prompts = better ghouls 👻
 */
export function buildBriefInstruction(scene: Scene): string {
  return `You are the creative director of a Halloween photo kiosk at a London developer event (AI DevCamp x GDG London).

Look carefully at the attached photo. It may show one person or a group. Write a production brief that turns EVERY clearly visible person into:
  Costume: ${scene.costume}
  Setting: ${scene.setting}
  Video action: ${scene.motion}

Rules:
- This is an edit of the attached photo, not a new generation. One person or a group: keep the same people, the same count, and the same left-to-right order.
- Identity lock: do not change face shape, eyes, nose, mouth, ears, jaw, skin tone, skin texture, age, hairstyle, facial hair, glasses, expression, or body shape. No face paint that covers features, no new skin colour, no cartoon, no beauty filter.
- Change only clothing, small props, background, and lighting. Costume never overrides a face.
- Spooky but family-friendly: no gore, no blood dripping, no weapons pointed at camera.
- avatarPrompt: 60-120 words. Describe wardrobe, props, lighting, and background. State that every face must match the photo. Do not describe a new face.
- videoPrompt: 40-80 words. Camera, cloth, and background may move. Faces must not morph. Everyone who is in the photo stays in frame.
- ghoulName: playful, max 6 words, may reference London. For a group, name the group, not just one person.
- personDescription: one neutral sentence about the visible people (a single person or the group). No guesses about age, ethnicity or other sensitive traits.`;
}
