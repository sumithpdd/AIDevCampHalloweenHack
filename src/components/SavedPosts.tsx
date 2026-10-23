import { useEffect, useState } from 'react';
import {
  clearSocialPosts,
  deleteSocialPost,
  listSocialPosts,
  previewCaption,
  type StoredSocialPost,
} from '../lib/social-posts-storage';

/** Captions saved on this device for one email — reuse without another Gemini call. */
export function SavedPosts({ email, onUse, refreshKey }: { email: string; onUse: (caption: string) => void; refreshKey?: unknown }) {
  const [posts, setPosts] = useState<StoredSocialPost[]>([]);
  useEffect(() => setPosts(listSocialPosts(email)), [email, refreshKey]);

  if (!email || !posts.length) return null;
  return (
    <details className="saved">
      <summary>
        💾 Saved captions for <b>{email}</b> ({posts.length})
      </summary>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <div>
              <div className="saved-title">
                {p.ghoulName ?? 'Ghoul'} · <span className="muted">{p.sceneTitle}</span>
              </div>
              <div className="muted small">{previewCaption(p.caption)}</div>
              <div className="muted small">{new Date(p.createdAt).toLocaleString('en-GB')}</div>
            </div>
            <div className="row">
              <button className="btn small" onClick={() => onUse(p.caption)}>
                Use
              </button>
              <button
                className="btn small ghost"
                onClick={() => {
                  deleteSocialPost(email, p.id);
                  setPosts(listSocialPosts(email));
                }}
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        className="link"
        onClick={() => {
          clearSocialPosts(email);
          setPosts([]);
        }}
      >
        Forget all captions for this email
      </button>
    </details>
  );
}
