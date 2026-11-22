/**
 * Live app: card-fraud screening on the real ULB credit-card transactions. A contiguous slice of real test traffic
 * streams past; the counters cover the whole test period (85,443 transactions) from exact score histograms.
 */
import { useState } from 'react';
import { AppFrame, Loading, Slider, Stat, metrics, pct, useClock, useData, type DataMap } from './common';

type D = DataMap['cards'];

export default function CardsApp() {
  const d = useData('cards');
  if (!d) return <Loading what="the credit-card fraud data" />;
  return <Cards d={d} />;
}

function Cards({ d }: { d: D }) {
  const rows = d.slice.rows;
  const [tick, playing, setPlaying] = useClock(140, rows.length);
  const [thr, setThr] = useState(0.5);
  const [model, setModel] = useState<'plain' | 'weighted'>('weighted');
  const bin = Math.round(thr * 200);
  const trainFrauds = d.counts.frauds - d.counts.testFrauds;
  const full = (m: 'plain' | 'weighted') => {
    const h = d[m], tp = h.fraud.slice(bin).reduce((a, b) => a + b, 0), fp = h.legit.slice(bin).reduce((a, b) => a + b, 0);
    return { tp, fp, fn: d.counts.testFrauds - tp, tn: d.counts.test - d.counts.testFrauds - fp };
  };
  const c = full(model), m = metrics(c);
  const seen = rows.slice(0, tick + 1), recent = seen.slice(-9).reverse();
  const score = (r: number[]) => (model === 'plain' ? r[2] : r[3]);
  const flagged = seen.filter((r) => score(r) >= thr).length;

  return (
    <AppFrame name="CardGuard · payment screening" icon="💳" playing={playing} onToggle={() => setPlaying(!playing)} status={`${seen.length} of ${rows.length} live payments`}
      source={`${d.provenance.dataset}, ${d.provenance.by}, ${d.provenance.licence} · trained on the first ${d.counts.train.toLocaleString()} transactions, tested on the next ${d.counts.test.toLocaleString()}`}>
      <div className="cards">
        <ul className="ticker" aria-live="off">
          {recent.map((r, i) => {
            const s = score(r), flag = s >= thr;
            return (
              <li key={seen.length - i} className={`tx${flag ? ' tx--flag' : ''}${r[1] ? ' tx--fraud' : ''}`}>
                <span className="tx__amt">€{r[0].toFixed(2)}</span>
                <span className="tx__bar"><i style={{ width: `${Math.max(2, s * 100)}%` }} /></span>
                <span className="tx__s">{s.toFixed(3)}</span>
                <span className="tx__v">{flag ? 'HOLD' : 'OK'}</span>
                {r[1] === 1 && <span className="tx__truth">real fraud</span>}
              </li>
            );
          })}
        </ul>
        <div className="cards__side">
          <div className="aseg" role="radiogroup" aria-label="Model">
            <button type="button" role="radio" aria-checked={model === 'plain'} className={model === 'plain' ? 'is-on' : ''} onClick={() => setModel('plain')}>Plain logistic regression</button>
            <button type="button" role="radio" aria-checked={model === 'weighted'} className={model === 'weighted' ? 'is-on' : ''} onClick={() => setModel('weighted')}>Class-weighted (each fraud counts × {Math.round((d.counts.train - trainFrauds) / trainFrauds)})</button>
          </div>
          <Slider label="Hold payment if score ≥" min={0.05} max={0.95} step={0.05} value={thr} onChange={setThr} show={thr.toFixed(2)} />
          <div className="astats">
            <Stat k="Frauds caught (test period)" v={`${c.tp} of ${d.counts.testFrauds}`} tone={m.recall > 0.8 ? 'good' : 'bad'} />
            <Stat k="Good customers held" v={c.fp.toLocaleString()} tone={c.fp > 500 ? 'bad' : undefined} />
            <Stat k="Precision" v={pct(m.precision)} /><Stat k="Accuracy" v={pct(m.accuracy, 2)} />
          </div>
          <p className="app-foot">“Never flag anything” is {pct(d.baseline, 2)} accurate and catches zero fraud. In the live slice: {seen.filter((r) => r[1]).length} real fraud among {seen.length} payments, {flagged} held. AUC — plain {d.plain.auc}, weighted {d.weighted.auc}.</p>
        </div>
      </div>
    </AppFrame>
  );
}
