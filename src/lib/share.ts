/** 📣 Sharing helpers — Web Share API with files on phones, intent links on desktop. */
export interface ShareAssets {
  caption: string;
  imageBlob?: Blob;
  videoBlob?: Blob;
  videoUrl?: string;
  imageUrl?: string;
}

export function canShareFiles(files: File[]): boolean {
  return typeof navigator !== 'undefined' && !!navigator.canShare && navigator.canShare({ files });
}

export function assetFiles({ imageBlob, videoBlob }: ShareAssets): File[] {
  const files: File[] = [];
  if (videoBlob) files.push(new File([videoBlob], `haunted-kiosk.${videoBlob.type.includes('mp4') ? 'mp4' : 'webm'}`, { type: videoBlob.type }));
  if (imageBlob) files.push(new File([imageBlob], 'haunted-kiosk.jpg', { type: imageBlob.type || 'image/jpeg' }));
  return files;
}

/** Native share sheet (Instagram, WhatsApp, LinkedIn apps…). Returns false if unsupported. */
export async function nativeShare(assets: ShareAssets): Promise<boolean> {
  if (!navigator.share) return false;
  const files = assetFiles(assets);
  try {
    if (files.length && canShareFiles(files)) {
      await navigator.share({ files, text: assets.caption, title: 'My Haunted Kiosk ghoul' });
    } else {
      await navigator.share({ text: assets.caption, url: assets.videoUrl ?? assets.imageUrl, title: 'My Haunted Kiosk ghoul' });
    }
    return true;
  } catch (err) {
    if ((err as Error).name === 'AbortError') return true; // user closed the sheet
    return false;
  }
}

export const shareLinks = (caption: string, url?: string) => {
  const text = encodeURIComponent(caption);
  const u = url ? encodeURIComponent(url) : '';
  return {
    linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(url ? `${caption}\n\n${url}` : caption)}`,
    x: `https://x.com/intent/post?text=${text}${u ? `&url=${u}` : ''}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(url ? `${caption}\n${url}` : caption)}`,
    bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(url ? `${caption}\n${url}` : caption)}`,
  };
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
