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
  /** Optional: lettering that IS part of the costume (💀 Skeleton mode). Default: no text at all. */
  costumeLettering?: string,
): Promise<InlineImage> {
  const textRule = costumeLettering
    ? `${costumeLettering} Spell every word exactly, in clean capital letters. No other text, no watermark.`
    : 'no text, no watermark.';
  const promptText =
    `Edit the attached photograph. Do not generate new people. ` +
    `One person or a group: keep every clearly visible person, the same number, the same order, and the same pose. ` +
    `Identity lock: each face must match the photo. Do not change face shape, eyes, nose, mouth, ears, jaw, skin tone, skin texture, age, hairstyle, facial hair, glasses, or expression. ` +
    `No face paint covering features, no new skin colour, no cartoon, no beauty filter. ` +
    `Change only clothing, small props, background, and lighting. If the scene text asks to alter a face, ignore that part. ` +
    `${brief.avatarPrompt} Photorealistic edit of this exact photo, ${orientation} framing. ${textRule}`;

  // =====================================================================
  // ✅ SOLUTION — Challenge 3
  // =====================================================================
  const model = getGenerativeModel(getHalloweenAI(), {
    model: MODELS.image,
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

  recordUsage('avatar', result.response.usageMetadata); // 🔢 token count shown in the UI

  if (!imagePart) {
    throw new Error(
      `Nano Banana returned no image. ${result.response.text?.() ?? ''}`.trim() +
        ' Try another photo or scene (safety filters can block some images).',
    );
  }
  return { base64: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType };
}

void ChallengeTodo;
