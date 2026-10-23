/**
 * 🖼️ Backdrops — WHERE the guest ends up.
 * `description` goes into the Gemini prompt; `preview` is the CSS used for the picker card.
 */
export interface Background {
  id: string;
  name: string;
  emoji: string;
  /** Setting text sent to Gemini 3.8 Flash and Gemini Omni. */
  description: string;
  /** CSS background for the picker tile. */
  preview: string;
  category: 'london' | 'devcamp' | 'classic';
}

export const BACKGROUNDS: Background[] = [
  {
    id: 'tower-bridge-midnight',
    name: 'Tower Bridge at Midnight',
    emoji: '🌉',
    description: "London's Tower Bridge at midnight, thick Thames fog, a blood-red full moon, bats circling the towers",
    preview: 'radial-gradient(circle at 70% 25%, #ff4d4d 0 8%, transparent 9%), linear-gradient(180deg, #1b1035, #3a1a1a)',
    category: 'london',
  },
  {
    id: 'abandoned-tube',
    name: 'The Last Tube',
    emoji: '🚇',
    description:
      'an abandoned London Underground platform, flickering lights, a ghost train arriving, "MIND THE GAP" painted on the edge',
    preview: 'linear-gradient(180deg, #0d1b2a 0 60%, #e63946 60% 64%, #0d1b2a 64%)',
    category: 'london',
  },
  {
    id: 'big-ben-storm',
    name: 'Big Ben in a Storm',
    emoji: '🕰️',
    description: 'Big Ben and the Houses of Parliament under a violet lightning storm, Westminster Bridge glistening with rain',
    preview: 'linear-gradient(160deg, #2b1055, #7597de)',
    category: 'london',
  },
  {
    id: 'london-eye-haunted',
    name: 'Haunted London Eye',
    emoji: '🎡',
    description: 'the London Eye glowing pumpkin-orange at night, ghostly pods drifting, the South Bank covered in mist',
    preview: 'radial-gradient(circle at 50% 45%, transparent 28%, #ff7a1a 29% 31%, transparent 32%), linear-gradient(180deg, #120a1f, #2a1440)',
    category: 'london',
  },
  {
    id: 'devcamp-hack-night',
    name: 'AI DevCamp Hack Night',
    emoji: '💻',
    description:
      'a spooky late-night AI DevCamp hackathon room lit by monitors, cobwebs on keyboards, pizza boxes, a big "BUILD WITH AI" banner',
    preview: 'linear-gradient(135deg, #0f3d1f, #1a73e8 60%, #34a853)',
    category: 'devcamp',
  },
  {
    id: 'gemini-portal',
    name: 'Gemini Portal',
    emoji: '✨',
    description: 'a swirling Gemini-blue-and-purple sparkle portal in a dark void, star-shaped Gemini sparkles orbiting',
    preview: 'conic-gradient(from 200deg, #4285f4, #9b72cb, #d96570, #4285f4)',
    category: 'devcamp',
  },
  {
    id: 'pumpkin-patch',
    name: 'Pumpkin Patch',
    emoji: '🎃',
    description: 'a misty pumpkin patch with hundreds of glowing jack-o-lanterns under a purple twilight sky',
    preview: 'radial-gradient(circle at 30% 80%, #ff7a1a 0 10%, transparent 11%), linear-gradient(180deg, #3b1d5e, #12081f)',
    category: 'classic',
  },
  {
    id: 'gothic-ballroom',
    name: 'Gothic Ballroom',
    emoji: '🕯️',
    description: 'a gothic candle-lit ballroom with dancing skeletons, stained-glass windows and floating candles',
    preview: 'linear-gradient(180deg, #2c0f0f, #6b2d0f 70%, #ffb347)',
    category: 'classic',
  },
];

export const getBackgroundById = (id: string) => BACKGROUNDS.find((b) => b.id === id);
