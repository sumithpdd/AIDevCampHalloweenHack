import { getGenerativeModel, ThinkingLevel } from 'firebase/ai';
import { getHalloweenAI } from './firebase';
import { MODELS } from './models';
import { EVENT } from './branding';
import { recordUsage } from './usage';

export interface CaptionInput {
  name?: string;
  ghoulName: string;
  sceneTitle: string;
  personDescription?: string;
}

/** Makes sure every required event hashtag is present exactly once, on the last line. */
export function ensureHashtags(caption: string): string {
  const body = caption.replace(/\s+$/, '');
  const present = new Set((body.match(/#[\p{L}\p{N}_]+/gu) ?? []).map((t) => t.toLowerCase()));
  const missing = EVENT.hashtags.filter((t) => !present.has(t.toLowerCase()));
  return missing.length ? `${body}\n\n${missing.join(' ')}` : body;
}

/**
 * ✍️ AI social caption — Gemini 3.8 Flash via Firebase AI Logic (same client as Challenge 2).
 * Returns text ready for LinkedIn / X / Instagram with the event hashtags.
 */
export async function generateCaption(input: CaptionInput): Promise<string> {
  const model = getGenerativeModel(getHalloweenAI(), {
    model: MODELS.prompt,
    generationConfig: { temperature: 0.9, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } },
  });

  const prompt = `Write a short, fun social media post (max 60 words + hashtags) for a guest of ${EVENT.name} (${EVENT.edition}).
They used an AI Halloween photo booth built with Gemini 3.8 Flash, Nano Banana 2 and Gemini Omni (React + Firebase + Vercel).
${input.name ? `Guest first name: ${input.name}. Write in first person as the guest.` : 'Write in first person as the guest.'}
They became "${input.ghoulName}" in the scene "${input.sceneTitle}".
Tone: playful, spooky, proud of building with AI. 1-2 emojis max. No quotes around the post.
End with a line of hashtags. Always include: ${EVENT.hashtags.join(' ')}. You may add up to two of: ${EVENT.extraHashtags.join(' ')}.`;

  const result = await model.generateContent(prompt);
  recordUsage('caption', result.response.usageMetadata);
  return ensureHashtags(result.response.text().trim());
}
