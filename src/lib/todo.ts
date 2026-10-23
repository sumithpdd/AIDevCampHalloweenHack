/**
 * Thrown by every unfinished challenge stub so the UI can show a friendly
 * "you haven't solved Challenge N yet" message instead of a stack trace.
 */
export const CHALLENGE_DOCS: Record<number, string> = {
  1: 'docs/04-challenge-1-firebase-ai-logic.md',
  2: 'docs/05-challenge-2-prompt-expansion.md',
  3: 'docs/06-challenge-3-nano-banana-avatar.md',
  4: 'docs/07-challenge-4-omni-video.md',
};

export class ChallengeTodo extends Error {
  readonly challenge: number;
  constructor(challenge: number, task: string) {
    super(`🕸️ Challenge ${challenge} is still a TODO: ${task}. See ${CHALLENGE_DOCS[challenge]}`);
    this.name = 'ChallengeTodo';
    this.challenge = challenge;
  }
}
