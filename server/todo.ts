/** Server-side twin of src/lib/todo.ts */
export class ChallengeTodo extends Error {
  readonly challenge: number;
  constructor(challenge: number, task: string) {
    super(`🕸️ Challenge ${challenge} is still a TODO: ${task}. See docs/07-challenge-4-omni-video.md`);
    this.name = 'ChallengeTodo';
    this.challenge = challenge;
  }
}
