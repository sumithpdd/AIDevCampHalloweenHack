import { useEffect, useState } from 'react';
import { EVENT } from '../lib/branding';
import { isPickupCode, type PickupTicket } from '../lib/pickup';
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
        {ticket && (
          <div className="card">
            <h2>{ticket.ghoulName ?? 'Your ghoul'}</h2>
            {ticket.sceneTitle && <p className="muted">{ticket.sceneTitle}</p>}
            <div className="results portrait">
              {ticket.photoUrl ? (
                <figure>
                  <img src={ticket.photoUrl} alt="Halloween portrait" />
                  <figcaption>
                    <a href={ticket.photoUrl}>Open the photo</a>
                  </figcaption>
                </figure>
              ) : (
                <p className="muted">The photo is not ready yet.</p>
              )}
              {ticket.videoUrl ? (
                <figure>
                  <video src={ticket.videoUrl} controls playsInline />
                  <figcaption>
                    <a href={ticket.videoUrl}>Open the video</a>
                  </figcaption>
                </figure>
              ) : (
                <p className="muted">The video is not ready yet. Refresh in a minute.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
