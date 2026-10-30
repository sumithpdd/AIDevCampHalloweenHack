import { useState } from 'react';
import { downloadBlob, nativeShare, shareLinks } from '../lib/share';
import { ShareMarks } from './ShareMarks';
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
  pageUrl,
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
  /** Public page for this run: photo used, portrait, and video. */
  pageUrl?: string;
  orientation: Orientation;
}) {
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const links = shareLinks(caption, pageUrl ?? videoUrl ?? imageUrl);
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

      <div className="share-row">
        <button
          className="btn"
          onClick={async () => {
            const ok = await nativeShare({ caption, imageBlob, videoBlob, imageUrl, videoUrl: pageUrl ?? videoUrl });
            setShareMsg(ok ? '' : 'Sharing isn’t supported here — use the seals below.');
          }}
        >
          📲 Share…
        </button>
        <ShareMarks links={links} printUrl={imageUrl} orientation={orientation} />
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
      </div>
    </section>
  );
}
