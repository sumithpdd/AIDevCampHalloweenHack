/**
 * 🎃 Halloween scenes — the equivalent of the Formula E lab's
 * "podium_celebration" / "pit_lane_launch" options.
 *
 * Hack idea: add your own! Each scene feeds both the prompt-expansion
 * step (Gemini 3.8 Flash) and the video step (Gemini Omni).
 */
export interface Scene {
  id: string;
  emoji: string;
  title: string;
  /** What the costume / character should be. */
  costume: string;
  /** Where it happens + mood. */
  setting: string;
  /** Camera move + action for the 8-second Omni video. */
  motion: string;
}

export const SCENES: Scene[] = [
  {
    id: 'tower_bridge_vampire',
    emoji: '🧛',
    title: 'Vampire of Tower Bridge',
    costume: 'an elegant Victorian vampire with a high-collared crimson-lined cape, pale skin, subtle fangs',
    setting: "London's Tower Bridge at midnight, thick Thames fog, a blood-red full moon, bats circling the towers",
    motion: 'slow push-in as the vampire turns to camera, cape billowing, bats burst from the fog, lightning flash at the end',
  },
  {
    id: 'haunted_tube',
    emoji: '👻',
    title: 'Ghost of the Last Tube',
    costume: 'a translucent spectral ghost in 1940s clothing, glowing pale-blue edges, hair drifting as if underwater',
    setting: 'an abandoned London Underground platform, flickering lights, a ghost train arriving, "MIND THE GAP" on the floor',
    motion: 'handheld camera drifts along the platform, lights flicker, the ghost fades in and out as the ghost train rushes past',
  },
  {
    id: 'pumpkin_witch',
    emoji: '🧙',
    title: "Witch's Pumpkin Patch",
    costume: 'a powerful witch with a tall crooked hat, emerald robes, a glowing spellbook and a black cat on the shoulder',
    setting: 'a misty pumpkin patch with hundreds of glowing jack-o-lanterns under a purple twilight sky',
    motion: 'orbiting camera as the witch raises a hand, every jack-o-lantern ignites in sequence, sparks spiral upward',
  },
  {
    id: 'zombie_hackathon',
    emoji: '🧟',
    title: 'Zombie Hackathon',
    costume: 'a friendly cartoonish zombie developer in a torn GDG-style hoodie, green-grey skin, glowing laptop stickers',
    setting: 'a spooky late-night hackathon room lit by monitors, cobwebs on the keyboards, pizza boxes, a big "DEMO DAY" banner',
    motion: 'dolly forward as the zombie wins the hackathon, confetti made of ghosts and bats explodes, triumphant pose',
  },
  {
    id: 'skeleton_ball',
    emoji: '💀',
    title: 'Skeleton Masquerade Ball',
    costume: 'a glamorous Día-de-Muertos style sugar-skull face paint, marigold crown, black lace and gold embroidery',
    setting: 'a gothic candle-lit ballroom with dancing skeletons, stained-glass windows and floating candles',
    motion: 'sweeping crane shot down into the ballroom, the character twirls, candles flare, skeletons bow',
  },
];

export const findScene = (id: string): Scene => SCENES.find((s) => s.id === id) ?? SCENES[0];
