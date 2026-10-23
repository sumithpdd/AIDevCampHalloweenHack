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
- Count the people. Every clearly visible person must appear in the portrait and the video. Do not merge faces, do not drop anyone, and do not invent extra people.
- If it is a group, keep them together in one frame, in the same left-to-right arrangement as the photo.
- Preserve each person's identity: face shape, skin tone, hairstyle, facial hair, glasses and expression must stay recognisable.
- Spooky but family-friendly: no gore, no blood dripping, no weapons pointed at camera.
- avatarPrompt: 80-160 words, one cinematic shot of the whole group (or the single person), describe each person, lighting, lens, wardrobe, makeup, background and colour palette.
- videoPrompt: 50-100 words, one continuous 8-second shot of everyone together: camera movement, what each person does, atmosphere and ambient sound (wind, bats, organ music…).
- ghoulName: playful, max 6 words, may reference London. For a group, name the group, not just one person.
- personDescription: one neutral sentence about the visible people (a single person or the group). No guesses about age, ethnicity or other sensitive traits.`;
}
