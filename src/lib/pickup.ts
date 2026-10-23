/** Short code for one full booth run. Unambiguous letters so it can be read aloud at the desk. */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function makePickupCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('');
}

export function isPickupCode(value: string): boolean {
  return /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(value);
}

export function pickupUrl(code: string): string {
  return `${window.location.origin}/r/${code}`;
}

/** Public card stored at codes/{code}.json. One code finds the photo used, the portrait, and the video. */
export interface PickupTicket {
  code: string;
  ghoulName?: string;
  sceneTitle?: string;
  caption?: string;
  /** The photograph the guest uploaded. */
  sourceUrl?: string;
  /** The portrait Nano Banana made. photoUrl is the same field, kept for older cards. */
  portraitUrl?: string;
  photoUrl?: string;
  videoUrl?: string;
  updatedAt: string;
}
