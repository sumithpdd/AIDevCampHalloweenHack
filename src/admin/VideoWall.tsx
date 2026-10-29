export interface WallClip {
  key: string;
  src: string;
  poster?: string;
  title: string;
  code?: string;
}

/** Full-screen grid. Every selected video loops, muted, until someone turns sound on for one of them. */
export function VideoWall({ clips, onClose }: { clips: WallClip[]; onClose: () => void }) {
  return (
    <div className="wall">
      <div className="wall-bar">
        <span>
          Video wall · {clips.length} looping
        </span>
        <button type="button" className="btn small ghost" onClick={onClose}>
          Close
        </button>
      </div>
      {clips.length === 0 ? (
        <p className="wall-empty">Tick “On the wall” next to a finished video, then open the wall again.</p>
      ) : (
        <div className="wall-grid">
          {clips.map((clip) => (
            <figure key={clip.key}>
              <video src={clip.src} poster={clip.poster} autoPlay loop muted playsInline />
              <figcaption>
                {clip.title}
                {clip.code ? ` · ${clip.code}` : ''}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
