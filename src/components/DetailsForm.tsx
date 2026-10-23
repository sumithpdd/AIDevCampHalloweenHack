import { isValidEmail } from '../lib/social-posts-storage';
import type { GuestDetails } from '../lib/pipeline';

export function DetailsForm({
  guest,
  onGuest,
  consent,
  onConsent,
}: {
  guest: GuestDetails;
  onGuest: (g: GuestDetails) => void;
  consent: boolean;
  onConsent: (v: boolean) => void;
}) {
  const emailBad = !!guest.email && !isValidEmail(guest.email);
  return (
    <div className="form">
      <label className="field">
        <span>First name <em>(optional, used in your AI caption)</em></span>
        <input
          value={guest.firstName ?? ''}
          maxLength={40}
          autoComplete="given-name"
          placeholder="e.g. Sumith"
          onChange={(e) => onGuest({ ...guest, firstName: e.target.value })}
        />
      </label>
      <label className="field">
        <span>Email <em>(optional, keeps your captions on this device only, never uploaded)</em></span>
        <input
          type="email"
          value={guest.email ?? ''}
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={emailBad}
          onChange={(e) => onGuest({ ...guest, email: e.target.value })}
        />
        {emailBad && <small className="error-text">That email doesn't look right.</small>}
      </label>
      <label className="consent">
        <input type="checkbox" checked={consent} onChange={(e) => onConsent(e.target.checked)} />
        <span>
          I agree that my photo is sent to Google Gemini (via Firebase AI Logic) to create a portrait and video, and stored
          in Firebase for this event. I can delete it from the result screen at any time.
        </span>
      </label>
    </div>
  );
}
