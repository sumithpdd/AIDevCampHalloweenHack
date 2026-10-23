import { useEffect, useState } from 'react';
import { EVENT } from '../lib/branding';
import { isPickupCode, pickupUrl, type PickupTicket } from '../lib/pickup';
import { shareLinks } from '../lib/share';
import { readPickupTicket } from '../lib/storage';

/** Public page at /r/CODE. One scan lands on the photo and the video for that run. */
export function PickupPage({ code }: { code: string }) {
  const [ticket, setTicket] = useState<PickupTicket | null | undefined>(undefined);

  useEffect(() => {
    if (!isPickupCode(code)) {
      setTicket(null);
      return;
    }
    let cancelled = false;
    readPickupTicket(code).then((found) => {
      if (!cancelled) setTicket(found);
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div className="page">
      <div className="fog" aria-hidden />
      <header className="header">
        <a className="brand" href="/">
          {EVENT.logos.map((src) => (
            <img key={src} src={src} alt="" className="brand-logo" />
          ))}
          <span>Your ghoul</span>
        </a>
        <span className="badge">{code}</span>
      </header>
      <main className="main">
        {ticket === undefined && <p className="muted">Looking up {code}…</p>}
        {ticket === null && (
          <div className="card">
            <h2>No ghoul for {code}</h2>
            <p>That code is not on file yet. If the booth is still working, wait a moment and refresh.</p>
          </div>
        )}
        {ticket && <Creation ticket={ticket} code={code} />}
      </main>
    </div>
  );
}

function Creation({ ticket, code }: { ticket: PickupTicket; code: string }) {
  const portrait = ticket.portraitUrl ?? ticket.photoUrl;
  const page = pickupUrl(code);
  const blurb = ticket.caption || [ticket.ghoulName, ticket.sceneTitle, code].filter(Boolean).join(' · ');
  const links = shareLinks(blurb, page);
  const [copied, setCopied] = useState<'code' | 'link' | ''>('');

  const copy = async (value: string, which: 'code' | 'link') => {
    await navigator.clipboard.writeText(value);
    setCopied(which);
    window.setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="card">
      <h2>{ticket.ghoulName ?? 'Your ghoul'}</h2>
      {ticket.sceneTitle && <p className="muted">{ticket.sceneTitle}</p>}
      <p className="pickup-code">{code}</p>
      <div className="creation-grid">
        <Media label="Photo used" href={ticket.sourceUrl} kind="image" />
        <Media label="Portrait" href={portrait} kind="image" />
        <Media label="Video" href={ticket.videoUrl} kind="video" />
      </div>
      {ticket.caption && <p className="admin-caption">{ticket.caption}</p>}
      <div className="share-grid">
        <button type="button" className="btn small ghost" onClick={() => void copy(code, 'code')}>
          {copied === 'code' ? 'Copied' : 'Copy code'}
        </button>
        <button type="button" className="btn small ghost" onClick={() => void copy(page, 'link')}>
          {copied === 'link' ? 'Copied' : 'Copy link'}
        </button>
        <a className="btn small ghost" href={links.whatsapp} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        <a className="btn small ghost" href={links.x} target="_blank" rel="noreferrer">
          X
        </a>
        <a className="btn small ghost" href={links.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a className="btn small ghost" href={links.bluesky} target="_blank" rel="noreferrer">
          Bluesky
        </a>
      </div>
    </div>
  );
}

function Media({ label, href, kind }: { label: string; href?: string; kind: 'image' | 'video' }) {
  return (
    <figure>
      {href && kind === 'image' && <img src={href} alt={label} />}
      {href && kind === 'video' && <video src={href} controls playsInline />}
      {!href && <div className="admin-empty">Not ready</div>}
      <figcaption>{href ? <a href={href}>{label}</a> : label}</figcaption>
    </figure>
  );
}
