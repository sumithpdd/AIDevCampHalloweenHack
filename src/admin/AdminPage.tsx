import { useCallback, useEffect, useMemo, useState } from 'react';
import { EVENT } from '../lib/branding';
import { shareLinks } from '../lib/share';
import { ShareMarks } from '../components/ShareMarks';
import type { Orientation } from '../lib/avatar';
import { fmt } from '../lib/usage';
import { freshStages, markStage, RetryScreen, type RetryView } from './RetryScreen';
import { VideoWall } from './VideoWall';

interface AdminJob {
  uid: string;
  jobId: string;
  updated: string;
  files: string[];
  meta?: {
    sceneTitle?: string;
    ghoulName?: string;
    firstName?: string;
    caption?: string;
    totalTokens?: number;
    usage?: Record<string, { total: number }>;
    status?: string;
    code?: string;
    wall?: boolean;
    orientation?: string;
    error?: string;
  };
  urls: { avatar?: string; video?: string; selfie?: string };
}

const TOKEN_KEY = 'haunted_kiosk_admin_token';

function readToken(): string | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const { token, expiresAt } = JSON.parse(raw) as { token: string; expiresAt: number };
    return Date.now() < expiresAt ? token : null;
  } catch {
    return null;
  }
}

async function api<T>(path: string, token: string | null, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error ?? `HTTP ${res.status}`), { status: res.status });
  return body as T;
}

/** 🛡️ /admin — see every generated ghoul, its tokens and caption; delete any of them. */
export function AdminPage() {
  const [token, setToken] = useState<string | null>(readToken);
  const [password, setPassword] = useState('');
  const [jobs, setJobs] = useState<AdminJob[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');
  const [view, setView] = useState<'list' | 'wall'>(() => (location.pathname.replace(/\/+$/, '') === '/admin/wall' ? 'wall' : 'list'));
  const [retrying, setRetrying] = useState(false);
  const [retryView, setRetryView] = useState<RetryView | null>(null);

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setJobs(null);
  };

  const load = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      const { jobs } = await api<{ jobs: AdminJob[] }>('/api/admin/ghouls', token);
      setJobs(jobs);
    } catch (e) {
      if ((e as { status?: number }).status === 401) logout();
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onPop = () => setView(location.pathname.replace(/\/+$/, '') === '/admin/wall' ? 'wall' : 'list');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (view !== 'wall') return;
    const id = window.setInterval(() => void load(), 45 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [view, load]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api<{ token: string; expiresAt: number }>('/api/admin/login', null, {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      sessionStorage.setItem(TOKEN_KEY, JSON.stringify(res));
      setPassword('');
      setToken(res.token);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const openWall = () => {
    history.pushState({}, '', '/admin/wall');
    setView('wall');
  };

  const closeWall = () => {
    history.pushState({}, '', '/admin');
    setView('list');
  };

  const pin = async (job: AdminJob, wall: boolean) => {
    setJobs((js) => js?.map((j) => (j.uid === job.uid && j.jobId === job.jobId ? { ...j, meta: { ...j.meta, wall } } : j)) ?? null);
    try {
      await api('/api/admin/ghouls', token, {
        method: 'PATCH',
        body: JSON.stringify({ uid: job.uid, jobId: job.jobId, wall }),
      });
    } catch (e) {
      setError((e as Error).message);
      void load();
    }
  };

  const retry = async (job: AdminJob) => {
    setRetrying(true);
    setError('');
    setJobs((js) =>
      js?.map((j) =>
        j.uid === job.uid && j.jobId === job.jobId ? { ...j, meta: { ...j.meta, status: 'running', error: undefined } } : j,
      ) ?? null,
    );
    let stages = freshStages();
    let brief: RetryView['brief'];
    let alive = true;
    const close = () => {
      alive = false;
      setRetryView(null);
    };
    const base: RetryView = {
      code: job.meta?.code,
      sceneTitle: job.meta?.sceneTitle,
      firstName: job.meta?.firstName,
      selfieUrl: job.urls.selfie,
      stages,
      running: true,
      onClose: close,
    };
    setRetryView(base);
    const show = (patch: Partial<RetryView>) => {
      if (!alive) return;
      setRetryView((current) => {
        const next = { ...base, ...current, ...patch, onClose: close };
        if (next.stages.video.state === 'running' && !next.videoStartedAt) next.videoStartedAt = Date.now();
        return next;
      });
    };
    try {
      for (let i = 0; i < 40; i++) {
        const res = await api<{
          status: string;
          stage: string;
          error?: string;
          ghoulName?: string;
          personDescription?: string;
          avatarPrompt?: string;
          videoPrompt?: string;
          portraitUrl?: string;
          videoUrl?: string;
        }>('/api/admin/retry', token, {
          method: 'POST',
          body: JSON.stringify({ uid: job.uid, jobId: job.jobId }),
        });
        if (!alive) return;
        if (res.ghoulName && res.avatarPrompt && res.videoPrompt) {
          brief = {
            ghoulName: res.ghoulName,
            personDescription: res.personDescription ?? '',
            avatarPrompt: res.avatarPrompt,
            videoPrompt: res.videoPrompt,
          };
        }
        if (res.status === 'failed') {
          const failed = (res.stage === 'avatar' || res.stage === 'video' || res.stage === 'brief' ? res.stage : 'brief') as
            | 'brief'
            | 'avatar'
            | 'video';
          stages = markStage(stages, failed, 'error', res.error || 'Retry failed');
          show({
            stages,
            brief,
            ...(res.portraitUrl ? { portraitUrl: res.portraitUrl } : {}),
            ...(res.videoUrl ? { videoUrl: res.videoUrl } : {}),
            error: res.error || 'Retry failed',
            running: false,
          });
          break;
        }
        if (res.status === 'completed' || res.stage === 'done') {
          stages = markStage(stages, 'brief', 'done', brief?.ghoulName);
          stages = markStage(stages, 'avatar', 'done', 'Saved the portrait');
          stages = markStage(stages, 'video', 'done', 'Saved video.mp4');
          stages = markStage(stages, 'brand', 'done', 'Portrait and video saved');
          show({
            stages,
            brief,
            ...(res.portraitUrl ? { portraitUrl: res.portraitUrl } : {}),
            ...(res.videoUrl ? { videoUrl: res.videoUrl } : {}),
            running: false,
          });
          break;
        }
        if (res.stage === 'brief') {
          stages = markStage(stages, 'brief', 'done', res.ghoulName);
          stages = markStage(stages, 'avatar', 'running', 'Nano Banana 2 is stitching the costume…');
        } else if (res.stage === 'avatar') {
          stages = markStage(stages, 'brief', 'done', res.ghoulName ?? brief?.ghoulName);
          stages = markStage(stages, 'avatar', 'done', 'Saved the portrait');
          stages = markStage(stages, 'video', 'running', 'Waking Gemini Omni in the crypt…');
        } else if (res.stage === 'video') {
          stages = markStage(stages, 'brief', 'done', res.ghoulName ?? brief?.ghoulName);
          stages = markStage(stages, 'avatar', 'done', 'Saved the portrait');
          stages = markStage(stages, 'video', 'running', 'Gemini Omni is animating your ghoul…');
        }
        show({
          stages,
          brief,
          ...(res.portraitUrl ? { portraitUrl: res.portraitUrl } : {}),
          ...(res.videoUrl ? { videoUrl: res.videoUrl } : {}),
          running: true,
        });
        await new Promise((r) => setTimeout(r, res.stage === 'video' ? 5000 : 400));
      }
      if (alive && stages.video.state === 'running') {
        show({ stages, running: false, error: 'Still rendering. Press Retry again to keep watching.' });
      }
    } catch (e) {
      const message = (e as Error).message;
      const failed = (['video', 'avatar', 'brief'] as const).find((id) => stages[id].state === 'running') ?? 'brief';
      stages = markStage(stages, failed, 'error', message);
      show({ stages, error: message, running: false });
    } finally {
      setRetrying(false);
      await load().catch(() => undefined);
    }
  };

  const remove = async (job: AdminJob) => {
    if (!window.confirm(`Delete ${job.meta?.ghoulName ?? job.jobId} (${job.files.length} files)? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/ghouls?uid=${encodeURIComponent(job.uid)}&jobId=${encodeURIComponent(job.jobId)}`, token, {
        method: 'DELETE',
      });
      setJobs((js) => js?.filter((j) => !(j.uid === job.uid && j.jobId === job.jobId)) ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!jobs) return [];
    return q
      ? jobs.filter((j) =>
          [j.meta?.code, j.meta?.ghoulName, j.meta?.sceneTitle, j.meta?.firstName, j.meta?.caption, j.jobId].some((v) =>
            v?.toLowerCase().includes(q),
          ),
        )
      : jobs;
  }, [jobs, filter]);

  const stats = useMemo(() => {
    const list = jobs ?? [];
    return {
      total: list.length,
      completed: list.filter((j) => j.meta?.status === 'completed').length,
      failed: list.filter((j) => j.meta?.status === 'failed').length,
      tokens: list.reduce((s, j) => s + (j.meta?.totalTokens ?? 0), 0),
    };
  }, [jobs]);

  return (
    <div className="page admin">
      <header className="header">
        <div className="brand">
          {EVENT.logos.map((src) => (
            <img key={src} src={src} alt="" className="brand-logo" />
          ))}
        </div>
        <span className="badge">Admin</span>
      </header>
      <main className="main wide">
        <div className="row spread">
          <h1 className="admin-title">🛡️ Haunted Kiosk admin</h1>
          <a href="/" className="link">
            ← Back to the booth
          </a>
        </div>

        {!token ? (
          <form className="card narrow" onSubmit={login}>
            <label className="field">
              <span>Admin password (the server's ADMIN_SECRET)</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
            </label>
            <button className="btn" disabled={!password}>
              Log in
            </button>
            {error && <p className="error-text">{error}</p>}
          </form>
        ) : (
          <>
            <div className="stats">
              <div>
                <b>{stats.total}</b>
                <span>ghouls</span>
              </div>
              <div>
                <b>{stats.completed}</b>
                <span>completed</span>
              </div>
              <div>
                <b>{stats.failed}</b>
                <span>failed</span>
              </div>
              <div>
                <b>{fmt(stats.tokens)}</b>
                <span>tokens</span>
              </div>
            </div>
            <div className="row spread">
              <input className="search" placeholder="Code, name, scene, caption…" value={filter} onChange={(e) => setFilter(e.target.value)} />
              <div className="row">
                <button className="btn small" onClick={openWall}>
                  Video wall
                </button>
                <button className="btn small ghost" onClick={() => void load()} disabled={busy}>
                  {busy ? 'Loading…' : '↻ Refresh'}
                </button>
                <button className="btn small ghost" onClick={logout}>
                  Log out
                </button>
              </div>
            </div>
            {error && <p className="error-text">{error}</p>}
            {jobs && !shown.length && <p className="muted">Nothing here yet.</p>}
            <div className="admin-grid">
              {shown.map((j) => (
                <article key={`${j.uid}/${j.jobId}`} className="admin-card">
                  <div className="admin-thumbs">
                    <Thumb label="Photo used" src={j.urls.selfie} />
                    <Thumb label="Portrait" src={j.urls.avatar} />
                    <Thumb label="Video" src={j.urls.video} video />
                  </div>
                  <div className="admin-body">
                    <div className="admin-name">{j.meta?.ghoulName ?? j.meta?.sceneTitle ?? 'Unnamed ghoul'}</div>
                    <div className="pickup-code small">{j.meta?.code ?? 'No code yet'}</div>
                    <div className="muted small">
                      {j.meta?.sceneTitle ?? '—'} {j.meta?.firstName ? `· ${j.meta.firstName}` : ''}
                    </div>
                    <div className="muted small">
                      {new Date(j.updated).toLocaleString('en-GB')} ·{' '}
                      <span className={`pill ${j.meta?.status ?? ''}`}>{j.meta?.status ?? 'unknown'}</span>
                    </div>
                    {j.meta?.totalTokens ? (
                      <div className="small">
                        🔢 {fmt(j.meta.totalTokens)} tokens
                        {j.meta.usage && (
                          <span className="muted">
                            {' '}
                            ({Object.entries(j.meta.usage)
                              .map(([k, v]) => `${k} ${fmt(v.total)}`)
                              .join(' · ')})
                          </span>
                        )}
                      </div>
                    ) : null}
                    {j.meta?.caption && <p className="admin-caption">{j.meta.caption}</p>}
                    {j.meta?.error && <p className="error-text small">{j.meta.error}</p>}
                    {j.urls.video && (
                      <label className="wall-pick">
                        <input type="checkbox" checked={!!j.meta?.wall} onChange={(e) => void pin(j, e.target.checked)} />
                        On the wall
                      </label>
                    )}
                    {j.urls.selfie && !j.urls.video && (
                      <button type="button" className="btn small" disabled={retrying} onClick={() => void retry(j)}>
                        {retrying ? 'Retrying…' : 'Retry'}
                      </button>
                    )}
                    <CreationActions
                      code={j.meta?.code}
                      caption={j.meta?.caption}
                      name={j.meta?.ghoulName}
                      printUrl={j.urls.avatar}
                      orientation={j.meta?.orientation === '16:9' ? '16:9' : '9:16'}
                      onDelete={() => void remove(j)}
                    />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
      {retryView && <RetryScreen run={retryView} />}
      {token && view === 'wall' && (
        <VideoWall
          clips={(jobs ?? [])
            .filter((j) => j.meta?.wall && j.urls.video)
            .map((j) => ({
              key: `${j.uid}/${j.jobId}`,
              src: j.urls.video as string,
              poster: j.urls.avatar,
              title: j.meta?.ghoulName ?? 'Ghoul',
              code: j.meta?.code,
            }))}
          onClose={closeWall}
        />
      )}
    </div>
  );
}

function Thumb({ label, src, video }: { label: string; src?: string; video?: boolean }) {
  return (
    <figure>
      {src && video && <video src={src} controls preload="none" playsInline />}
      {src && !video && <img src={src} alt="" loading="lazy" />}
      {!src && <div className="admin-empty">—</div>}
      <figcaption>{label}</figcaption>
    </figure>
  );
}

function CreationActions({
  code,
  caption,
  name,
  printUrl,
  orientation,
  onDelete,
}: {
  code?: string;
  caption?: string;
  name?: string;
  printUrl?: string;
  orientation: Orientation;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState<'code' | 'link' | ''>('');
  const page = code ? `${window.location.origin}/r/${code}` : '';
  const blurb = caption || [name, code].filter(Boolean).join(' · ');
  const links = page ? shareLinks(blurb, page) : null;

  const copy = async (value: string, which: 'code' | 'link') => {
    await navigator.clipboard.writeText(value);
    setCopied(which);
    window.setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="admin-share">
      {code && (
        <>
          <button type="button" className="btn small ghost" onClick={() => void copy(code, 'code')}>
            {copied === 'code' ? 'Copied' : 'Copy code'}
          </button>
          <button type="button" className="btn small ghost" onClick={() => void copy(page, 'link')}>
            {copied === 'link' ? 'Copied' : 'Copy link'}
          </button>
          <a className="btn small ghost" href={`/r/${code}`} target="_blank" rel="noreferrer">
            Open
          </a>
        </>
      )}
      {(links || printUrl) && (
        <ShareMarks links={links ?? shareLinks(blurb)} printUrl={printUrl} orientation={orientation} />
      )}
      <button type="button" className="btn small ghost danger" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}
