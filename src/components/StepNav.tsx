export const STEPS = ['You', 'Scene', 'Details', 'Result'] as const;

export function StepNav({ step, onStep, canGo }: { step: number; onStep: (i: number) => void; canGo: (i: number) => boolean }) {
  return (
    <ol className="stepnav" aria-label="Booth steps">
      {STEPS.map((label, i) => (
        <li key={label}>
          <button
            className={`stepnav-item ${i === step ? 'current' : ''} ${i < step ? 'done' : ''}`}
            onClick={() => onStep(i)}
            disabled={!canGo(i)}
            aria-current={i === step ? 'step' : undefined}
          >
            <span className="stepnav-num">{i < step ? '✓' : i + 1}</span>
            <span>{label}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
