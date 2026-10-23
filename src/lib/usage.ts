/**
 * 🔢 Token accounting for every Gemini call in one booth session.
 * Firebase AI Logic responses carry `usageMetadata`; Gemini Omni's interaction carries `usage`.
 */
export type UsageStage = 'brief' | 'avatar' | 'caption' | 'video';

export interface StageUsage {
  input: number;
  output: number;
  thinking: number;
  total: number;
}

export type UsageReport = Partial<Record<UsageStage, StageUsage>>;

/** Shape returned by Firebase AI Logic (`result.response.usageMetadata`). */
export interface AiLogicUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  thoughtsTokenCount?: number;
  totalTokenCount?: number;
}

/** Shape returned by the Interactions API (`interaction.usage`). */
export interface InteractionUsage {
  total_input_tokens?: number;
  total_output_tokens?: number;
  total_thought_tokens?: number;
  total_tokens?: number;
}

type Listener = (stage: UsageStage, usage: StageUsage) => void;
const listeners = new Set<Listener>();

export function onUsage(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(stage: UsageStage, usage: StageUsage) {
  listeners.forEach((l) => l(stage, usage));
}

/** Call with `result.response.usageMetadata` after a Firebase AI Logic generateContent call. */
export function recordUsage(stage: UsageStage, meta: AiLogicUsageMetadata | undefined): void {
  if (!meta) return;
  const input = meta.promptTokenCount ?? 0;
  const output = meta.candidatesTokenCount ?? 0;
  const thinking = meta.thoughtsTokenCount ?? 0;
  emit(stage, { input, output, thinking, total: meta.totalTokenCount ?? input + output + thinking });
}

/** Call with the Omni `interaction.usage` returned by /api/video/status. */
export function recordInteractionUsage(stage: UsageStage, u: InteractionUsage | undefined): void {
  if (!u) return;
  const input = u.total_input_tokens ?? 0;
  const output = u.total_output_tokens ?? 0;
  const thinking = u.total_thought_tokens ?? 0;
  emit(stage, { input, output, thinking, total: u.total_tokens ?? input + output + thinking });
}

export const totalTokens = (r: UsageReport) => Object.values(r).reduce((sum, u) => sum + (u?.total ?? 0), 0);

export const fmt = (n: number) => n.toLocaleString('en-GB');

export function describeUsage(u: StageUsage | undefined): string {
  if (!u) return '';
  const parts = [`in ${fmt(u.input)}`, `out ${fmt(u.output)}`];
  if (u.thinking) parts.push(`thinking ${fmt(u.thinking)}`);
  return `${fmt(u.total)} tokens (${parts.join(' · ')})`;
}
