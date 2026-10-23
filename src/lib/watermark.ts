import { EVENT } from './branding';

/**
 * 💧 Watermarking in the browser — no sharp, no ffmpeg.
 *  • Images: draw the portrait on a <canvas>, add a branded footer with both logos.
 *  • Videos: play the Omni clip into a <canvas>, draw the same footer on every frame,
 *    and re-record it with MediaRecorder (keeps the audio track).
 */

const logoCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string, crossOrigin = false): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load image ${src.slice(0, 60)}`));
    img.src = src;
  });
}

const loadLogo = (src: string) => {
  if (!logoCache.has(src)) logoCache.set(src, loadImage(src));
  return logoCache.get(src)!;
};

export const loadLogos = () => Promise.all(EVENT.logos.map(loadLogo));

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draws the footer (gradient + logo stickers + caption line) onto any canvas frame. */
export function drawBrandFooter(ctx: CanvasRenderingContext2D, w: number, h: number, logos: HTMLImageElement[], subtitle?: string) {
  const unit = Math.min(w, h);
  const footerH = Math.round(unit * 0.2);
  const pad = Math.round(unit * 0.03);

  const grad = ctx.createLinearGradient(0, h - footerH * 1.6, 0, h);
  grad.addColorStop(0, 'rgba(12,7,18,0)');
  grad.addColorStop(1, 'rgba(12,7,18,0.85)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, h - footerH * 1.6, w, footerH * 1.6);

  // Logo "stickers": dark rounded pills so both logos (incl. GDG London's white text) read on any background.
  const logoH = Math.round(footerH * 0.62);
  let x = pad;
  const y = h - pad - logoH;
  for (const logo of logos) {
    const lw = Math.round((logo.naturalWidth / logo.naturalHeight) * logoH);
    const sp = Math.round(logoH * 0.12);
    ctx.fillStyle = 'rgba(18,10,28,0.88)';
    roundRect(ctx, x - sp, y - sp, lw + sp * 2, logoH + sp * 2, sp * 1.6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = Math.max(1, sp / 4);
    ctx.stroke();
    ctx.drawImage(logo, x, y, lw, logoH);
    x += lw + sp * 3;
  }

  // Event line, right-aligned (or under the logos when the frame is narrow).
  const fontPx = Math.max(12, Math.round(unit * 0.03));
  ctx.font = `600 ${fontPx}px "Space Grotesk", system-ui, sans-serif`;
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = fontPx / 3;
  const text = subtitle ? `${subtitle} · ${EVENT.watermarkText}` : EVENT.watermarkText;
  const textW = ctx.measureText(text).width;
  if (x + textW + pad < w) {
    ctx.textAlign = 'right';
    ctx.fillText(text, w - pad, h - pad - logoH / 2 + fontPx / 3);
  } else {
    ctx.textAlign = 'left';
    ctx.fillText(EVENT.watermarkText, pad, y - pad * 1.2);
  }
  ctx.shadowBlur = 0;
}

/** Returns a branded JPEG (as a Blob) of the given image data URL / URL. */
export async function brandImage(src: string, subtitle?: string): Promise<Blob> {
  const [img, logos] = await Promise.all([loadImage(src, !src.startsWith('data:')), loadLogos()]);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  drawBrandFooter(ctx, canvas.width, canvas.height, logos, subtitle);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode branded image'))), 'image/jpeg', 0.92),
  );
}

function pickVideoMime(): string {
  const candidates = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  return candidates.find((m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) ?? '';
}

/**
 * Re-records the video with the brand footer burned in. Runs in real time (≈ clip length).
 * Needs the video URL to allow CORS GET (see docs: storage.cors.json) — otherwise throws.
 */
export async function brandVideo(src: string, onProgress?: (pct: number) => void): Promise<Blob> {
  const mimeType = pickVideoMime();
  if (!mimeType) throw new Error('This browser cannot record video (MediaRecorder unsupported)');

  // Fetch as a blob first: same-origin object URL → canvas is never "tainted".
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Could not download video for branding (${res.status})`);
  const objectUrl = URL.createObjectURL(await res.blob());

  const logos = await loadLogos();
  const video = document.createElement('video');
  video.src = objectUrl;
  video.playsInline = true;
  video.preload = 'auto';
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('Could not decode video'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d')!;
  const stream = canvas.captureStream(30);

  // Route the clip's audio into the recording (not to the speakers).
  let audioCtx: AudioContext | undefined;
  try {
    audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(video);
    const dest = audioCtx.createMediaStreamDestination();
    source.connect(dest);
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  } catch {
    /* silent video is fine */
  }

  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType.split(';')[0] }));
  });

  const draw = () => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    drawBrandFooter(ctx, canvas.width, canvas.height, logos);
    if (video.duration) onProgress?.(Math.min(100, Math.round((video.currentTime / video.duration) * 100)));
    if (!video.ended) requestAnimationFrame(draw);
  };

  recorder.start(250);
  await video.play();
  draw();
  await new Promise<void>((resolve) => (video.onended = () => resolve()));
  draw();
  recorder.stop();
  const blob = await done;
  audioCtx?.close();
  URL.revokeObjectURL(objectUrl);
  return blob;
}

export const videoExtension = (blob: Blob) => (blob.type.includes('mp4') ? 'mp4' : 'webm');
