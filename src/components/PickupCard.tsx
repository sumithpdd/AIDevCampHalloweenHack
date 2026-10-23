import { pickupUrl } from '../lib/pickup';
import { QrImage } from './QrImage';

/** Shown on the booth while a run is in progress and after it finishes. */
export function PickupCard({
  code,
  photoUrl,
  videoUrl,
}: {
  code: string;
  photoUrl?: string;
  videoUrl?: string;
}) {
  const page = pickupUrl(code);
  return (
    <section className="pickup">
      <p className="muted">Give this code to the desk, or scan to open the photo and the video.</p>
      <p className="pickup-code">{code}</p>
      <div className="pickup-qrs">
        <QrImage value={page} caption="Photo and video" />
        {photoUrl && <QrImage value={photoUrl} caption="Photo only" />}
        {videoUrl && <QrImage value={videoUrl} caption="Video only" />}
      </div>
    </section>
  );
}
