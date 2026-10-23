import { useState } from 'react';
import { downloadBlob, nativeShare, shareLinks } from '../lib/share';
import { printPortrait } from '../lib/print';
import type { Orientation } from '../lib/avatar';

export function SharePanel({
  caption,
  onCaption,
  captionState,
  onRegenerate,
  imageBlob,
  imageUrl,
  videoBlob,
  videoUrl,
  orientation,
}: {
  caption: string;
  onCaption: (c: string) => void;
  captionState?: 'running' | 'done' | 'error';
  onRegenerate: () => void;
  imageBlob?: Blob;
  imageUrl?: string;
  videoBlob?: Blob;
  videoUrl?: string;
  orientation: Orientation;
}) {
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const links = shareLinks(caption, videoUrl ?? imageUrl);
  const ext = videoBlob?.type.includes('mp4') ? 'mp4' : 'webm';

  const copy = async () => {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="share">
      <h3>📣 Share your ghoul</h3>
      <label className="field">
        <span>
          AI caption{' '}
          {captionState === 'running' && <em>(Gemini is writing…)</em>}
          {captionState === 'error' && <em>(couldn't write one — try again)</em>}
        </span>
        <textarea rows={6} value={caption} onChange={(e) => onCaption(e.target.value)} placeholder="Your caption appears here…" />
      </label>
      <div className="row">
        <button className="btn small" onClick={copy} disabled={!caption}>
          {copied ? '✅ Copied' : '📋 Copy caption'}
        </button>
        <button className="btn small ghost" onClick={onRegenerate} disabled={captionState === 'running'}>
          ✨ New caption
        </button>
      </div>

      <div className="share-grid">
        <button
          className="btn"
          onClick={async () => {
            const ok = await nativeShare({ caption, imageBlob, videoBlob, imageUrl, videoUrl });
            setShareMsg(ok ? '' : 'Sharing isn’t supported here — use the links below.');
          }}
        >
          📲 Share…
        </button>
        <a className="btn ghost" href={links.linkedin} target="_blank" rel="noreferrer" onClick={() => void copy()}>
          LinkedIn
        </a>
        <a className="btn ghost" href={links.x} target="_blank" rel="noreferrer">
          X
        </a>
        <a className="btn ghost" href={links.bluesky} target="_blank" rel="noreferrer">
          Bluesky
        </a>
        <a className="btn ghost" href={links.whatsapp} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </div>
      {shareMsg && <p className="muted">{shareMsg}</p>}
      <p className="muted small">
        Tip: LinkedIn and Instagram don’t accept files from links. Download the video/photo, then attach it with the copied
        caption.
      </p>

      <div className="share-grid">
        {imageBlob && (
          <button className="btn ghost" onClick={() => downloadBlob(imageBlob, 'haunted-kiosk.jpg')}>
            ⬇️ Photo
          </button>
        )}
        {videoBlob ? (
          <button className="btn ghost" onClick={() => downloadBlob(videoBlob, `haunted-kiosk.${ext}`)}>
            ⬇️ Video
          </button>
        ) : (
          videoUrl && (
            <a className="btn ghost" href={videoUrl} target="_blank" rel="noreferrer">
              ⬇️ Video
            </a>
          )
        )}
        {imageUrl && (
          <button className="btn ghost" onClick={() => printPortrait(imageUrl, orientation)}>
            🖨️ Print postcard
          </button>
        )}
      </div>
    </section>
  );
}
