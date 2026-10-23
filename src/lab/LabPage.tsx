import { useEffect, useState } from 'react';
import { EVENT } from '../lib/branding';
import { IDE_PROMPT } from './idePrompt';
import { LabStep, STEPS } from './steps';

export function LabPage() {
  const [step, setStep] = useState(() => stepFromHash());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onHash = () => setStep(stepFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, next));
    window.location.hash = String(clamped);
    setStep(clamped);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(IDE_PROMPT);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="page">
      <div className="fog" aria-hidden />
      <header className="header">
        <a className="brand" href="/">
          {EVENT.logos.map((src) => (
            <img key={src} src={src} alt="" className="brand-logo" />
          ))}
          <span>Raise Your Own Haunt</span>
        </a>
        <a className="badge" href="/">
          Back to the booth
        </a>
      </header>

      <main className="main wide lab">
        <p className="lab-kicker">Build it yourself · set up each challenge first</p>
        <h1 className="lab-title">Raise Your Own Haunt</h1>
        <p className="lab-lead">
          Fourteen steps. You create the Firebase project, turn the services on, and prove each model call on its
          own. The single Generate button is step 10, after Challenges 1 to 4 already work.
        </p>

        <ol className="lab-nav">
          {STEPS.map((item, i) => (
            <li key={item.id}>
              <button type="button" className={i === step ? 'on' : ''} onClick={() => go(i)} aria-current={i === step ? 'step' : undefined}>
                <span>{i}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ol>

        <article className="card lab-step">
          <LabStep step={step} onCopy={copyPrompt} copied={copied} />
        </article>

        <div className="lab-pager">
          <button type="button" className="btn ghost" disabled={step === 0} onClick={() => go(step - 1)}>
            Back
          </button>
          <span>
            Step {step} of {STEPS.length - 1}
          </span>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn" onClick={() => go(step + 1)}>
              Next
            </button>
          ) : (
            <a className="btn" href="/">
              Open the booth
            </a>
          )}
        </div>
      </main>
    </div>
  );
}

function stepFromHash() {
  const n = Number(window.location.hash.replace('#', ''));
  return Number.isInteger(n) && n >= 0 && n < STEPS.length ? n : 0;
}
