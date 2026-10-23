/**
 * 🎭 Characters — WHO the guest becomes and WHAT happens in the 8-second video.
 */
export interface CharacterPrompt {
  id: string;
  title: string;
  emoji: string;
  /** Costume / character description for Gemini 3.8 Flash. */
  costume: string;
  /** One continuous camera move + action for Gemini Omni. */
  motion: string;
}

export const PROMPTS: CharacterPrompt[] = [
  {
    id: 'vampire',
    title: 'Victorian Vampire',
    emoji: '🧛',
    costume: 'an elegant Victorian vampire with a high-collared crimson-lined cape, pale skin, subtle fangs',
    motion: 'slow push-in as the vampire turns to camera, cape billowing, bats burst from the fog, lightning flash at the end',
  },
  {
    id: 'ghost',
    title: 'Friendly Ghost',
    emoji: '👻',
    costume: 'a translucent spectral ghost in 1940s clothing, glowing pale-blue edges, hair drifting as if underwater',
    motion: 'handheld camera drifts closer, lights flicker, the ghost fades in and out and finally waves at camera',
  },
  {
    id: 'witch',
    title: 'Pumpkin Witch',
    emoji: '🧙',
    costume: 'a powerful witch with a tall crooked hat, emerald robes, a glowing spellbook and a black cat on the shoulder',
    motion: 'orbiting camera as the witch raises a hand, every light ignites in sequence, sparks spiral upward',
  },
  {
    id: 'zombie-dev',
    title: 'Zombie Developer',
    emoji: '🧟',
    costume: 'a friendly cartoonish zombie developer in a torn GDG London hoodie, green-grey skin, glowing laptop stickers',
    motion: 'dolly forward as the zombie ships the demo, confetti made of ghosts and bats explodes, triumphant pose',
  },
  {
    id: 'sugar-skull',
    title: 'Sugar-Skull Dancer',
    emoji: '💀',
    costume: 'glamorous Día-de-Muertos sugar-skull face paint, marigold crown, black lace and gold embroidery',
    motion: 'sweeping crane shot down to the character, who twirls as candles flare and skeletons bow',
  },
  {
    id: 'gemini-wizard',
    title: 'Gemini Wizard',
    emoji: '🪄',
    costume: 'a cosmic wizard in a midnight-blue robe embroidered with glowing Gemini sparkles, holding a staff of light',
    motion: 'slow orbit as the wizard casts a spell, sparkles swirl into a portal behind them, robe flowing',
  },
];

export const getPromptById = (id: string) => PROMPTS.find((p) => p.id === id);
