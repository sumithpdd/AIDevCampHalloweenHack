import { getGenerativeModel, ResponseModality, type ImageConfigAspectRatio } from 'firebase/ai';
import { getHalloweenAI } from './firebase';
import { MODELS } from './models';
import type { GhoulBrief } from './briefPrompt';
import type { InlineImage } from './media';
import { ChallengeTodo } from './todo';
import { recordUsage } from './usage';

export type Orientation = '9:16' | '16:9';

/**
 * Challenge 3 — Avatar generation with Nano Banana 2 (gemini-3.1-flash-image)
 * through the GenerateContent API in Firebase AI Logic.
 * Image-to-image: we send the original selfie + the expanded prompt.
 */
export async function generateAvatar(
  brief: GhoulBrief,
  selfie: InlineImage,
  orientation: Orientation,
): Promise<InlineImage> {
  const promptText =
    `Transform everyone in the attached photo into this Halloween scene, keeping every face clearly recognisable. ` +
    `If the photo shows a group, include the whole group together in one frame, in the same arrangement. ` +
    `Do not merge people into one face and do not leave anyone out. ` +
    `${brief.avatarPrompt} Photorealistic cinematic portrait, ${orientation} framing, no text, no watermark.`;

  // =====================================================================
  // 🎃 TODO — Challenge 3: render the ghoul avatar with Nano Banana 2
  // ---------------------------------------------------------------------
  // 1. getGenerativeModel(getHalloweenAI(), { … }) with
  //      model:            MODELS.image             ("gemini-3.1-flash-image")
  //      generationConfig: responseModalities [ResponseModality.TEXT, ResponseModality.IMAGE]
  //                        imageConfig { aspectRatio: orientation }
  // 2. model.generateContent([...]) with TWO parts (firebase v13 parts need a `type`):
  //      { type: 'text', text: promptText }
  //      { type: 'inlineData', inlineData: { data: selfie.base64, mimeType: selfie.mimeType } }
  //    → image-to-image: the selfie is the reference!
  // 3. Grab the first image:  result.response.inlineDataParts()?.[0]
  //    and assign it to `imagePart` below.
  //
  // Stuck? docs/06-challenge-3-nano-banana-avatar.md  or  `npm run solve -- 3`
  // =====================================================================
  const imagePart = undefined as { inlineData: { data: string; mimeType: string } } | undefined; // REPLACE THIS LINE
  const result = { response: { text: () => '', usageMetadata: undefined } } as const; // REPLACE THIS LINE (it's the generateContent result)
  if (!imagePart) throw new ChallengeTodo(3, 'generate the avatar with gemini-3.1-flash-image');

  recordUsage('avatar', result.response.usageMetadata); // 🔢 token count shown in the UI

  if (!imagePart) {
    throw new Error(
      `Nano Banana returned no image. ${result.response.text?.() ?? ''}`.trim() +
        ' Try another photo or scene (safety filters can block some images).',
    );
  }
  return { base64: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType };
}

// Silence 'unused' warnings until you solve the challenge.
void getGenerativeModel;
void ResponseModality;
void MODELS;
void getHalloweenAI;
