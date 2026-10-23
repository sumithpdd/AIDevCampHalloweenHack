import { useCallback, useEffect, useMemo, useState } from 'react';
import { EVENT } from '../lib/branding';
import { fmt } from '../lib/usage';

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
          [j.meta?.ghoulName, j.meta?.sceneTitle, j.meta?.firstName, j.meta?.caption, j.jobId].some((v) =>
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
              <input className="search" placeholder="Filter by name, scene, caption…" value={filter} onChange={(e) => setFilter(e.target.value)} />
              <div className="row">
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
                  <div className="admin-media">
                    {j.urls.video ? (
                      <video src={j.urls.video} poster={j.urls.avatar} controls preload="none" playsInline />
                    ) : j.urls.avatar ? (
                      <img src={j.urls.avatar} alt="" loading="lazy" />
                    ) : j.urls.selfie ? (
                      <img src={j.urls.selfie} alt="" loading="lazy" className="dim" />
                    ) : (
                      <div className="admin-empty">no media</div>
                    )}
                  </div>
                  <div className="admin-body">
                    <div className="admin-name">{j.meta?.ghoulName ?? 'Unnamed ghoul'}</div>
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
                    <div className="row">
                      {j.urls.avatar && (
                        <a className="btn small ghost" href={j.urls.avatar} target="_blank" rel="noreferrer">
                          Photo
                        </a>
                      )}
                      {j.urls.video && (
                        <a className="btn small ghost" href={j.urls.video} target="_blank" rel="noreferrer">
                          Video
                        </a>
                      )}
                      <button className="btn small ghost danger" onClick={() => void remove(j)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
