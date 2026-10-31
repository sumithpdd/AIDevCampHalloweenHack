/**
 * 🎬 Curated booth scenes — one tap picks a backdrop + a character together.
 * This keeps the kiosk to a short 4-step flow: You → Scene → Details → Result.
 * Guests who want more control can "Mix your own" (any backdrop × any character).
 */
import { BACKGROUNDS, getBackgroundById } from './backgrounds.js';
import { PROMPTS, getPromptById } from './prompts.js';
import type { Scene } from '../lib/scenes';

export interface BoothScene {
  id: string;
  title: string;
  description: string;
  emoji: string;
  backgroundId: string;
  promptId: string;
  category: 'london' | 'devcamp' | 'classic';
  featured?: boolean;
}

export const BOOTH_SCENES: BoothScene[] = [
  {
    id: 'scene-tower-bridge-vampire',
    title: 'Vampire of Tower Bridge',
    description: 'Blood moon · Thames fog · cape & bats',
    emoji: '🧛',
    backgroundId: 'tower-bridge-midnight',
    promptId: 'vampire',
    category: 'london',
    featured: true,
  },
  {
    id: 'scene-last-tube-ghost',
    title: 'Ghost of the Last Tube',
    description: 'Abandoned platform · ghost train · mind the gap',
    emoji: '👻',
    backgroundId: 'abandoned-tube',
    promptId: 'ghost',
    category: 'london',
    featured: true,
  },
  {
    id: 'scene-devcamp-zombie',
    title: 'Zombie Hackathon',
    description: 'AI DevCamp hack night · ship it or else',
    emoji: '🧟',
    backgroundId: 'devcamp-hack-night',
    promptId: 'zombie-dev',
    category: 'devcamp',
    featured: true,
  },
  {
    id: 'scene-gemini-wizard',
    title: 'Gemini Wizard',
    description: 'Sparkle portal · build with Gemini',
    emoji: '🪄',
    backgroundId: 'gemini-portal',
    promptId: 'gemini-wizard',
    category: 'devcamp',
    featured: true,
  },
  {
    id: 'scene-london-eye-witch',
    title: 'Witch of the London Eye',
    description: 'Pumpkin-orange Eye · South Bank mist',
    emoji: '🧙',
    backgroundId: 'london-eye-haunted',
    promptId: 'witch',
    category: 'london',
  },
  {
    id: 'scene-big-ben-skull',
    title: 'Westminster Masquerade',
    description: 'Big Ben storm · sugar-skull glamour',
    emoji: '💀',
    backgroundId: 'big-ben-storm',
    promptId: 'sugar-skull',
    category: 'london',
  },
  {
    id: 'scene-pumpkin-witch',
    title: "Witch's Pumpkin Patch",
    description: 'Hundreds of jack-o-lanterns · spellbook',
    emoji: '🎃',
    backgroundId: 'pumpkin-patch',
    promptId: 'witch',
    category: 'classic',
  },
  {
    id: 'scene-skeleton-ball',
    title: 'Skeleton Masquerade Ball',
    description: 'Gothic ballroom · floating candles',
    emoji: '🕯️',
    backgroundId: 'gothic-ballroom',
    promptId: 'sugar-skull',
    category: 'classic',
  },
];

/** Combine a backdrop + character into the Scene shape the pipeline uses. */
export function composeScene(backgroundId: string, promptId: string, id?: string, title?: string): Scene {
  const bg = getBackgroundById(backgroundId) ?? BACKGROUNDS[0];
  const p = getPromptById(promptId) ?? PROMPTS[0];
  return {
    id: id ?? `mix-${bg.id}-${p.id}`,
    emoji: p.emoji,
    title: title ?? `${p.title} · ${bg.name}`,
    costume: p.costume,
    setting: bg.description,
    motion: p.motion,
  };
}

export const resolveBoothScene = (s: BoothScene): Scene => composeScene(s.backgroundId, s.promptId, s.id, s.title);

export const FEATURED_SCENES = BOOTH_SCENES.filter((s) => s.featured);
