import { getGenerativeModel, Schema, ThinkingLevel } from 'firebase/ai';
import { getHalloweenAI } from './firebase';
import { MODELS } from './models';
import { buildBriefInstruction, type GhoulBrief } from './briefPrompt';
import type { InlineImage } from './media';
import type { Scene } from './scenes';
import { ChallengeTodo } from './todo';
import { recordUsage, type AiLogicUsageMetadata } from './usage';

/** JSON schema Gemini must follow — Firebase AI Logic "structured output". */
const ghoulBriefSchema = Schema.object({
  properties: {
    ghoulName: Schema.string({ description: 'Playful spooky name, max 6 words' }),
    personDescription: Schema.string({ description: 'One neutral sentence about visible features' }),
    avatarPrompt: Schema.string({ description: 'Detailed Nano Banana image prompt' }),
    videoPrompt: Schema.string({ description: '8-second cinematic Gemini Omni video direction' }),
  },
});

/**
 * Challenge 2 — Prompt expansion with Gemini 3.8 Flash (via Firebase AI Logic).
 * Python lab equivalent: client.interactions.create(model="gemini-3.8-flash", …)
 */
export async function expandPrompt(selfie: InlineImage, scene: Scene): Promise<GhoulBrief> {
  // =====================================================================
  // 🎃 TODO — Challenge 2: expand the selfie into a full Halloween brief
  // ---------------------------------------------------------------------
  // 1. Create a model with getGenerativeModel(getHalloweenAI(), { … })
  //      model:            MODELS.prompt            ("gemini-3.8-flash")
  //      generationConfig: temperature 0.2,
  //                        thinkingConfig { thinkingLevel: ThinkingLevel.HIGH },
  //                        responseMimeType 'application/json',
  //                        responseSchema ghoulBriefSchema
  // 2. Call model.generateContent([...]) with TWO parts (firebase v13 parts need a `type`):
  //      { type: 'text', text: buildBriefInstruction(scene) }
  //      { type: 'inlineData', inlineData: { data: selfie.base64, mimeType: selfie.mimeType } }
  // 3. Keep the result in a const called `result` — the return line below
  //    parses result.response.text() as JSON.
  //
  // Stuck? docs/05-challenge-2-prompt-expansion.md  or  `npm run solve -- 2`
  // =====================================================================
  const result: { response: { text(): string; usageMetadata?: AiLogicUsageMetadata } } = null as never; // REPLACE THIS LINE
  if (!result) throw new ChallengeTodo(2, 'call gemini-3.8-flash with the selfie + scene brief');

  recordUsage('brief', result.response.usageMetadata); // 🔢 token count shown in the UI
  return JSON.parse(result.response.text()) as GhoulBrief;
}

// Silence 'unused' warnings until you solve the challenge.
void getGenerativeModel;
void ThinkingLevel;
void ghoulBriefSchema;
void MODELS;
void getHalloweenAI;
void buildBriefInstruction;
