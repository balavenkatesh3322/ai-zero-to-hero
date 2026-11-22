import type { Step } from './types';

export function Stepper({ steps, step, go }: { steps: Step[]; step: number; go: (i: number) => void }) {
  const n = steps.length;
  return (
    <footer className="timeline" aria-label="In this lesson">
      <div className="timeline__head">
        <span className="eyebrow">IN THIS LESSON</span>
        <span className="timeline__count">Step {step + 1} of {n}</span>
      </div>
      <div className="timeline__track" style={{ ['--n' as string]: n }}>
        <span className="timeline__rail"><span style={{ width: `${(step / (n - 1)) * 100}%` }} /></span>
        <ol className="timeline__steps">
          {steps.map((s, i) => (
            <li key={i} style={{ ['--i' as string]: i }}>
              <button
                type="button"
                className={i === step ? 'is-current' : i < step ? 'is-done' : ''}
                aria-current={i === step ? 'step' : undefined}
                aria-label={`Step ${i + 1}: ${s.title}`}
                onClick={() => go(i)}
              >
                <span className="timeline__dot">{i < step ? '✓' : i + 1}</span>
                <span className="timeline__label">{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </footer>
  );
}
