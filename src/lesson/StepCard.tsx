import type { Step } from './types';
import { Icon } from '../components/Icon';

interface Props { step: Step; index: number; total: number; onBack: () => void; onNext: () => void; nextLabel: string }

export function StepCard({ step, index, total, onBack, onNext, nextLabel }: Props) {
  const tagClass = step.tag === 'TRY IT' ? 'TRY' : step.tag === 'LIVE APP' ? 'LIVE' : step.tag;
  const isLast = index === total - 1;
  return (
    <section className="card stepcard" aria-labelledby="step-title">
      <div className="stepcard__head">
        <span className="eyebrow">STEP {index + 1} / {total}</span>
        <span className={`tag tag--${tagClass}`}>{step.tag}</span>
      </div>
      <div key={index} className="stepcard__body">
        <h2 id="step-title" className="stepcard__title">{step.title}</h2>
        {step.body && <p className="stepcard__text">{step.body}</p>}
        {step.keyIdea && (
          <div className="keyidea">
            <span className="keyidea__icon"><Icon name="spark" size={13} /></span>
            <div>
              <div className="keyidea__label">KEY IDEA</div>
              <p>{step.keyIdea}</p>
            </div>
          </div>
        )}
        {step.recap && (
          <table className="recap">
            <thead><tr><th>QUESTION</th><th className="recap__answer">ANSWER</th><th className="recap__because">BECAUSE</th></tr></thead>
            <tbody>{step.recap.map((r) => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody>
          </table>
        )}
        {step.comingUp && (
          <div className="comingup">
            <span className="comingup__icon"><Icon name="arrowRight" size={13} /></span>
            <div><div className="keyidea__label muted">COMING UP</div><p>{step.comingUp}</p></div>
          </div>
        )}
        <a className="discuss" href="https://github.com/" target="_blank" rel="noreferrer">Question or fix? Discuss on GitHub <span aria-hidden="true">↗</span></a>
      </div>
      <div className="stepcard__nav">
        <button type="button" className="ghost navbtn" onClick={onBack} disabled={index === 0}><Icon name="arrowLeft" size={14} /> Back</button>
        <button type="button" className="pop navbtn navbtn--next" onClick={onNext}>
          <span>{nextLabel}</span><Icon name={isLast ? 'check' : 'arrowRight'} size={14} />
        </button>
      </div>
    </section>
  );
}
