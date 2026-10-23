import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/** Renders a QR for a URL. The value is the thing a phone opens when it scans. */
export function QrImage({ value, caption }: { value: string; caption: string }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { margin: 1, width: 240, color: { dark: '#1a0b00', light: '#fff8ee' } })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc('');
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!src) return null;
  return (
    <figure className="qr">
      <img src={src} alt="" />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
