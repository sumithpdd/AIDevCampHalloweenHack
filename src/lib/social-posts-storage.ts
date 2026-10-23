/**
 * 💾 Saved social posts, kept in this browser's localStorage and keyed by the guest's email.
 * Re-use a caption without another Gemini call. Nothing here is sent to a server.
 */
const STORAGE_KEY = 'haunted_kiosk_social_posts_v1';
const MAX_POSTS_PER_EMAIL = 40;

export interface StoredSocialPost {
  id: string;
  email: string;
  caption: string;
  createdAt: string;
  jobId?: string;
  ghoulName?: string;
  sceneTitle?: string;
}

type Store = Record<string, StoredSocialPost[]>;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

function readStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Store) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* private mode / quota — ignore */
  }
}

const newestFirst = (a: StoredSocialPost, b: StoredSocialPost) => b.createdAt.localeCompare(a.createdAt);

export function listSocialPosts(email: string): StoredSocialPost[] {
  const key = normalizeEmail(email);
  return key ? [...(readStore()[key] ?? [])].sort(newestFirst) : [];
}

export function findPostForJob(email: string, jobId: string) {
  return listSocialPosts(email).find((p) => p.jobId === jobId);
}

export function saveSocialPost(email: string, post: Omit<StoredSocialPost, 'id' | 'email' | 'createdAt'>): StoredSocialPost {
  const key = normalizeEmail(email);
  const store = readStore();
  const entry: StoredSocialPost = {
    id: `sp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email: key,
    createdAt: new Date().toISOString(),
    ...post,
    caption: post.caption.trim(),
  };
  const others = (store[key] ?? []).filter((p) => !(post.jobId && p.jobId === post.jobId));
  store[key] = [entry, ...others].sort(newestFirst).slice(0, MAX_POSTS_PER_EMAIL);
  writeStore(store);
  return entry;
}

export function deleteSocialPost(email: string, id: string) {
  const key = normalizeEmail(email);
  const store = readStore();
  store[key] = (store[key] ?? []).filter((p) => p.id !== id);
  writeStore(store);
}

export function clearSocialPosts(email: string) {
  const store = readStore();
  delete store[normalizeEmail(email)];
  writeStore(store);
}

export const previewCaption = (caption: string, max = 80) => {
  const line = caption.replace(/\s+/g, ' ').trim();
  return line.length <= max ? line : `${line.slice(0, max - 1)}…`;
};
