/**
 * 🎃 Halloween scenes — the equivalent of the Formula E lab's
 * "podium_celebration" / "pit_lane_launch" options.
 *
 * Hack idea: add your own in src/data/booth-scenes.ts! Each scene feeds both the
 * prompt-expansion step (Gemini 3.8 Flash) and the video step (Gemini Omni).
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

// The scene list now lives in src/data/: backgrounds.ts (where) × prompts.ts (who) → booth-scenes.ts (curated pairs).
import { BOOTH_SCENES, resolveBoothScene } from '../data/booth-scenes';

export const SCENES: Scene[] = BOOTH_SCENES.map(resolveBoothScene);

export const findScene = (id: string): Scene => SCENES.find((s) => s.id === id) ?? SCENES[0];
