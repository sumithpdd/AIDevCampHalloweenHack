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

Look carefully at the attached selfie and write a production brief that turns THIS person into:
  Costume: ${scene.costume}
  Setting: ${scene.setting}
  Video action: ${scene.motion}

Rules:
- Preserve the person's identity: face shape, skin tone, hairstyle, facial hair, glasses and expression must stay recognisable.
- Spooky but family-friendly: no gore, no blood dripping, no weapons pointed at camera.
- avatarPrompt: 80-140 words, a single cinematic portrait shot, describe lighting, lens, wardrobe details, makeup, background and colour palette.
- videoPrompt: 50-90 words, describe one continuous 8-second shot: camera movement, the character's action, atmosphere and ambient sound (wind, bats, organ music…).
- ghoulName: playful, max 6 words, may reference London.
- personDescription: one neutral sentence about visible features only (no guesses about age, ethnicity or other sensitive traits).`;
}
