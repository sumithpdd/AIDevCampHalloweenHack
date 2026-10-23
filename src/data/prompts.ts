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
    costume: 'a high-collared crimson-lined Victorian cape and evening clothes worn over the real person. Keep their natural skin. A hint of fangs only if the mouth still looks like the same person',
    motion: 'slow push-in, cape billowing, bats burst from the fog, lightning flash at the end. Faces stay still and unchanged',
  },
  {
    id: 'ghost',
    title: 'Friendly Ghost',
    emoji: '👻',
    costume: '1940s clothing with a cool blue rim light. The person stays solid and fully visible. Do not make them translucent and do not restyle their hair',
    motion: 'handheld camera drifts closer, lights flicker, they give a small wave. The body never fades or changes shape',
  },
  {
    id: 'witch',
    title: 'Pumpkin Witch',
    emoji: '🧙',
    costume: 'a tall crooked hat, emerald robes, a glowing spellbook and a black cat nearby. The face stays exactly the person in the photo',
    motion: 'orbiting camera as the witch raises a hand, every light ignites in sequence, sparks spiral upward',
  },
  {
    id: 'zombie-dev',
    title: 'Zombie Developer',
    emoji: '🧟',
    costume: 'a torn GDG London hoodie with glowing laptop stickers. Keep natural skin. Do not turn anyone green, grey, or cartoonish',
    motion: 'dolly forward as the zombie ships the demo, confetti made of ghosts and bats explodes, triumphant pose',
  },
  {
    id: 'sugar-skull',
    title: 'Sugar-Skull Dancer',
    emoji: '💀',
    costume: 'a marigold crown with black lace and gold embroidery on the clothing. At most a few small flowers at the hairline. Do not cover the face with sugar-skull paint',
    motion: 'sweeping crane shot as candles flare. People may turn slightly. Faces do not morph',
  },
  {
    id: 'gemini-wizard',
    title: 'Gemini Wizard',
    emoji: '🪄',
    costume: 'a midnight-blue robe embroidered with Gemini sparkles and a staff of light. The face stays exactly the person in the photo',
    motion: 'slow orbit as the wizard casts a spell, sparkles swirl into a portal behind them, robe flowing',
  },
];

export const getPromptById = (id: string) => PROMPTS.find((p) => p.id === id);
