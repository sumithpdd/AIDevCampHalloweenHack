import { getGenerativeModel, Schema, ThinkingLevel } from 'firebase/ai';
import { getHalloweenAI } from './firebase';
import { MODELS } from './models';
import { buildBriefInstruction, type GhoulBrief } from './briefPrompt';
import type { InlineImage } from './media';
import type { Scene } from './scenes';
import { ChallengeTodo } from './todo';
import { recordUsage } from './usage';

/** JSON schema Gemini must follow — Firebase AI Logic "structured output". */
const ghoulBriefSchema = Schema.object({
  properties: {
    ghoulName: Schema.string({ description: 'Playful spooky name, max 6 words' }),
    personDescription: Schema.string({ description: 'One neutral sentence about the visible people, one person or a group' }),
    avatarPrompt: Schema.string({ description: 'Detailed Nano Banana image prompt' }),
    videoPrompt: Schema.string({ description: 'About 6 seconds, one continuous shot, cinematic Gemini Omni direction' }),
  },
});

/**
 * Challenge 2 — Prompt expansion with Gemini 3.8 Flash (via Firebase AI Logic).
 * Python lab equivalent: client.interactions.create(model="gemini-3.8-flash", …)
 */
export async function expandPrompt(selfie: InlineImage, scene: Scene): Promise<GhoulBrief> {
  // =====================================================================
  // ✅ SOLUTION — Challenge 2
  // =====================================================================
  const model = getGenerativeModel(getHalloweenAI(), {
    model: MODELS.prompt,
    generationConfig: {
      temperature: 0.2,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: ghoulBriefSchema,
    },
  });

  const result = await model.generateContent([
    { type: 'text', text: buildBriefInstruction(scene) },
    { type: 'inlineData', inlineData: { data: selfie.base64, mimeType: selfie.mimeType } },
  ]);

  recordUsage('brief', result.response.usageMetadata); // 🔢 token count shown in the UI
  return JSON.parse(result.response.text()) as GhoulBrief;
}

void ChallengeTodo;
