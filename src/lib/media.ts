export interface InlineImage {
  /** Raw base64 (no `data:` prefix). */
  base64: string;
  mimeType: string;
}

export async function blobToInlineImage(blob: Blob): Promise<InlineImage> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  const [, base64] = dataUrl.split(',');
  return { base64, mimeType: blob.type || 'image/jpeg' };
}

export function inlineImageToBlob({ base64, mimeType }: InlineImage): Blob {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: mimeType });
}

export const toDataUrl = ({ base64, mimeType }: InlineImage) => `data:${mimeType};base64,${base64}`;

/**
 * Downscale big phone photos before sending them to Gemini — faster, cheaper,
 * and keeps Storage uploads well under the 10 MB rule.
 */
export async function downscaleImage(file: Blob, maxSide = 1280): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode image'))), 'image/jpeg', 0.9),
  );
}
