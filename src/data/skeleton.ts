/**
 * 💀 Skeleton mode — the second box in step 2 ("Your nightmare").
 *
 * The guest keeps their real face; their body becomes a glowing skeleton suit
 * with the four AI DevCamp phases written on the bones, in a haunted graveyard.
 *
 *  • Goes through the SAME pipeline as every ghoul (brief → Nano Banana 2 → Gemini Omni),
 *    so the identity lock and the gentle camera-and-cloth motion still apply.
 *  • The four words are painted by Nano Banana 2 (see SKELETON_LETTERING, passed to
 *    generateAvatar). Every other scene keeps the "no text" rule.
 *  • Booth photos are usually waist-up, so all four words sit on the upper body.
 *
 * Edit DEVCAMP_TOPICS to change the list shown on the step-2 screen.
 */
import type { Scene } from '../lib/scenes';

export interface TopicPhase {
  phase: string;
  /** Colour of the phase heading (Google brand colours). */
  color: string;
  topics: string[];
}

/** What we covered across the AI DevCamp 2026 sessions, by week (shown when Skeleton is picked). */
export const DEVCAMP_TOPICS: TopicPhase[] = [
  { phase: 'BUILD', color: '#34a853', topics: ['ADK', 'MCP', 'Agent Skills', 'Antigravity', 'Multi-Agent', 'CopilotKit'] },
  { phase: 'SCALE', color: '#4285f4', topics: ['Agent Runtime', 'Sessions', 'Memory Bank', 'Identity', 'Agent Studio'] },
  { phase: 'GOVERN', color: '#fbbc04', topics: ['Model Armor', 'DLP', 'Policy', 'HITL', 'Registry'] },
  { phase: 'OPTIMISE', color: '#ea4335', topics: ['Cost', 'Evals', 'Traces', 'Models', 'Harnessing ADK'] },
];

/**
 * Which word sits on which bone (all upper body, so a waist-up selfie shows all four):
 *   Spine        → BUILD     (the backbone everything is built on — week 1)
 *   Arms + hands → SCALE     (reach further, lift more — week 2)
 *   Ribcage      → GOVERN    (the cage that guards the heart — guardrails, week 3)
 *   Collarbones  → OPTIMISE  (the top, where it all comes together — week 4)
 */
export const BONE_WORDS = [
  { word: 'OPTIMISE', where: 'shoulders (collarbones)' },
  { word: 'GOVERN', where: 'ribcage' },
  { word: 'BUILD', where: 'spine' },
  { word: 'SCALE', where: 'arms and hands' },
];

export const SKELETON_LETTERING =
  'Costume lettering printed on the skeleton suit of every person, in bold glowing pumpkin-orange capital letters: ' +
  '"OPTIMISE" across the collarbones, "GOVERN" across the middle of the ribcage, "BUILD" on the spine below the ribcage, "SCALE" along each forearm.';

export const SKELETON_SCENE: Scene = {
  id: 'scene-devcamp-halloween-skeleton',
  emoji: '💀',
  title: 'Halloween Skeleton',
  costume:
    'a fitted matte-black bodysuit and gloves printed with a glowing white skeleton: luminous collarbones, ribcage, spine, pelvis, arm and hand bones. ' +
    'Four bold pumpkin-orange words are printed on the bones: "OPTIMISE" across the collarbones, "GOVERN" across the ribcage, "BUILD" on the spine, "SCALE" along the forearms. ' +
    'The suit stops at the neck. The face, hair and neck stay exactly the person in the photo, uncovered, with natural skin. No skull mask, no face paint',
  setting:
    'a haunted graveyard at midnight: a huge full moon, bats flying across a deep purple sky, crooked tombstones, glowing jack-o-lanterns and low purple fog',
  motion:
    'slow push-in as the skeleton bones and orange words pulse brighter, jack-o-lanterns flicker, bats cross the moon, fog drifts past. The person sways gently. Faces stay still and unchanged',
};

export const isSkeletonScene = (scene: Pick<Scene, 'id'>) => scene.id === SKELETON_SCENE.id;
