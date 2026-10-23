import { useCallback, useEffect, useRef, useState } from 'react';

type Mode = 'camera' | 'upload';

/** Camera snap or file upload — same UX as the Formula E kiosk. */
export function PhotoInput({ photo, onPhoto }: { photo: Blob | null; onPhoto: (b: Blob | null) => void }) {
  const [mode, setMode] = useState<Mode>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photo) return setPreviewUrl(null);
    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  const start = useCallback(async () => {
    stop();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current?.getTracks().forEach((t) => t.stop()); // a newer start() won the race
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.onloadedmetadata = () => setReady(true);
        // play() can be interrupted when React re-renders (StrictMode) — harmless.
        video.play().catch(() => undefined);
      }
    } catch (err) {
      setCameraError((err as Error).message || 'Camera unavailable — try uploading a photo instead.');
    }
  }, [stop]);

  useEffect(() => {
    if (mode === 'camera' && !photo) start();
    else stop();
    return stop;
  }, [mode, photo, start, stop]);

  const snap = () => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 480;
    const ctx = canvas.getContext('2d')!;
    ctx.translate(canvas.width, 0); // un-mirror the selfie preview
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((b) => b && onPhoto(b), 'image/jpeg', 0.92);
  };

  return (
    <div className="photo-input">
      <div className="tabs" role="tablist">
        {(['camera', 'upload'] as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            className={`tab ${mode === m ? 'active' : ''}`}
            onClick={() => {
              onPhoto(null);
              setMode(m);
            }}
          >
            {m === 'camera' ? '📷 Snap a selfie' : '🪦 Upload a photo'}
          </button>
        ))}
      </div>

      <div className="frame">
        {previewUrl ? (
          <img src={previewUrl} alt="Your photo" />
        ) : mode === 'camera' ? (
          <video ref={videoRef} className="mirror" autoPlay playsInline muted />
        ) : (
          <label className="dropzone">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPhoto(f);
              }}
            />
            <span className="dropzone-icon">🕯️</span>
            <span>Choose a clear, front-facing photo</span>
          </label>
        )}
      </div>

      {cameraError && mode === 'camera' && !photo && (
        <p className="alert">
          {cameraError}{' '}
          <button className="link" onClick={start}>
            Try again
          </button>
        </p>
      )}

      <div className="row center">
        {photo ? (
          <button className="btn ghost" onClick={() => onPhoto(null)}>
            🔄 Retake
          </button>
        ) : (
          mode === 'camera' && (
            <button className="btn" onClick={snap} disabled={!ready}>
              📸 Snap
            </button>
          )
        )}
      </div>
    </div>
  );
}
