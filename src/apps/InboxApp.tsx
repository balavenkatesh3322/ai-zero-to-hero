/**
 * Live app: an SMS inbox with a spam filter. Real held-out messages from the SMS Spam Collection arrive one by one and
 * are scored in the browser by the exact models trained in scripts/data/measure_apps.py (weights exported to JSON).
 */
import { useMemo, useState } from 'react';
import { AppFrame, Loading, Slider, Stat, metrics, pct, useClock, useData, type DataMap } from './common';

type D = DataMap['inbox'];
export type InboxMode = 'rules' | 'logreg' | 'svm' | 'metrics' | 'pipeline' | 'bayes';

export const tokenize = (t: string) => (t.toLowerCase().match(/[\p{L}\p{N}_]+/gu) ?? []).filter((w) => w.length >= 2);

export function makeModels(d: D) {
  const idx = new Map(d.vocab.map((w, i) => [w, i]));
  const counts = (text: string) => {
    const m = new Map<number, number>();
    for (const w of tokenize(text)) { const i = idx.get(w); if (i !== undefined) m.set(i, (m.get(i) ?? 0) + 1); }
    return m;
  };
  const nb = (c: Map<number, number>) => {
    let h = d.nb.prior[0], s = d.nb.prior[1];
    c.forEach((n, i) => { h += n * d.nb.ham[i]; s += n * d.nb.spam[i]; });
    return 1 / (1 + Math.exp(h - s));
  };
  const lin = (w: number[], b: number, c: Map<number, number>) => { let z = b; c.forEach((n, i) => { z += n * w[i]; }); return z; };
  const lr = (c: Map<number, number>) => 1 / (1 + Math.exp(-lin(d.lr.w, d.lr.b, c)));
  const svm = (c: Map<number, number>) => lin(d.svm.w, d.svm.b, c);
  const rule = (text: string) => (tokenize(text).some((w) => d.rule.includes(w)) ? 1 : 0);
  const evidence = (c: Map<number, number>) => [...c.entries()].map(([i, n]) => ({ w: d.vocab[i], n, lr: d.nb.spam[i] - d.nb.ham[i] })).sort((a, b) => Math.abs(b.lr) - Math.abs(a.lr));
  return { idx, counts, nb, lr, svm, rule, evidence };
}

const SAMPLES = ['Are we still on for lunch tomorrow?', 'WINNER!! You have been selected to claim a £900 prize. Call 09061701461 now', 'Free entry in our weekly draw, txt WIN to 87121'];

interface Msg { text: string; spam: number; nb: number; lr: number; svm: number; rule: number }

export default function InboxApp({ mode }: { mode: InboxMode }) {
  const d = useData('inbox');
  if (!d) return <Loading what="the SMS Spam Collection" />;
  return <Inbox d={d} mode={mode} />;
}

function Inbox({ d, mode }: { d: D; mode: InboxMode }) {
  const M = useMemo(() => makeModels(d), [d]);
  const scored: Msg[] = useMemo(() => d.stream.map((m) => { const c = M.counts(m.text); return { ...m, nb: M.nb(c), lr: M.lr(c), svm: M.svm(c), rule: M.rule(m.text) }; }), [d, M]);
  const [tick, playing, setPlaying] = useClock(mode === 'svm' ? 700 : 1300, scored.length);
  const [thr, setThr] = useState(0.5);
  const [draft, setDraft] = useState(mode === 'rules' || mode === 'svm' || mode === 'metrics' ? '' : SAMPLES[1]);
  const seen = scored.slice(0, tick + 1);
  const latest = [...seen].reverse().slice(0, 7);

  const verdict = (m: Msg) => (mode === 'logreg' ? m.lr >= thr : mode === 'svm' ? m.svm >= 0 : mode === 'rules' ? m.nb >= 0.5 : m.nb >= thr) ? 1 : 0;
  const conf = (pred: (m: Msg) => number) => seen.reduce((c, m) => { const p = pred(m); if (p && m.spam) c.tp++; else if (p) c.fp++; else if (m.spam) c.fn++; else c.tn++; return c; }, { tp: 0, fp: 0, fn: 0, tn: 0 });
  const live = conf(verdict);
  const lm = metrics(live);

  const draftC = M.counts(draft);
  const draftP = mode === 'logreg' ? M.lr(draftC) : M.nb(draftC);

  return (
    <AppFrame name="Messages · spam filter" icon="✉" playing={playing} onToggle={() => setPlaying(!playing)}
      status={`${seen.length} of ${scored.length} real test messages`}
      source={`${d.provenance.dataset}, ${d.provenance.by}, ${d.provenance.licence} · models trained on ${d.counts.train.toLocaleString()} messages (${d.provenance.script})`}>
      <div className="inbox">
        <div className="phone-ui" aria-live="polite">
          <div className="phone-ui__notch" />
          <div className="phone-ui__title">Inbox</div>
          <ul className="phone-ui__list">
            {latest.map((m) => {
              const p = verdict(m), ok = p === m.spam;
              return (
                <li key={m.text + seen.indexOf(m)} className={`sms${p ? ' sms--spam' : ''}`}>
                  <span className={`sms__badge${p ? ' is-spam' : ''}`}>{p ? 'SPAM' : 'INBOX'}</span>
                  <span className="sms__text">{m.text}</span>
                  <span className={`sms__truth ${ok ? 'is-ok' : 'is-bad'}`} title={`Real label: ${m.spam ? 'spam' : 'not spam'}`}>{ok ? '✓' : '✗'} {m.spam ? 'spam' : 'ham'}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="inbox__side">
          {mode === 'rules' && (() => {
            const r = metrics(conf((m) => m.rule)), n = metrics(conf((m) => (m.nb >= 0.5 ? 1 : 0))), none = metrics(conf(() => 0));
            return (
              <>
                <p className="app-note">Three filters read the same messages. The rule flags any message containing <code>{d.rule.join(', ')}</code>; naive Bayes learned word weights from {d.counts.train.toLocaleString()} labelled messages.</p>
                <table className="atable"><thead><tr><th>Filter</th><th>Accuracy</th><th>Spam caught</th><th>Good mail lost</th></tr></thead><tbody>
                  <tr><td>No filter</td><td>{pct(none.accuracy)}</td><td>0%</td><td>0</td></tr>
                  <tr><td>Keyword rule</td><td>{pct(r.accuracy)}</td><td>{pct(r.recall)}</td><td>{conf((m) => m.rule).fp}</td></tr>
                  <tr className="is-best"><td>Learned (naive Bayes)</td><td>{pct(n.accuracy)}</td><td>{pct(n.recall)}</td><td>{conf((m) => (m.nb >= 0.5 ? 1 : 0)).fp}</td></tr>
                </tbody></table>
                <p className="app-foot">Whole test set ({d.counts.test.toLocaleString()} messages): no filter {pct(d.test.baseline)} · rule catches {pct(d.test.rule.recall)} of spam · naive Bayes catches {pct(d.test.nb.recall)}.</p>
              </>
            );
          })()}

          {(mode === 'logreg' || mode === 'metrics') && (
            <>
              <Slider label={mode === 'logreg' ? 'Spam if P(spam) ≥' : 'Threshold'} min={0.05} max={0.95} step={0.05} value={thr} onChange={setThr} show={thr.toFixed(2)} />
              <div className="cm" role="table" aria-label="Confusion matrix, live">
                <div className="cm__corner">real ↓ / filter →</div><div className="cm__h">spam</div><div className="cm__h">inbox</div>
                <div className="cm__h">spam</div><div className="cm__c cm__c--good">{live.tp}<small>caught</small></div><div className="cm__c cm__c--bad">{live.fn}<small>missed</small></div>
                <div className="cm__h">ham</div><div className="cm__c cm__c--bad">{live.fp}<small>good mail lost</small></div><div className="cm__c cm__c--good">{live.tn}<small>delivered</small></div>
              </div>
              <div className="astats"><Stat k="Accuracy" v={pct(lm.accuracy)} /><Stat k="Precision" v={pct(lm.precision)} /><Stat k="Recall" v={pct(lm.recall)} /><Stat k="F1" v={pct(lm.f1)} /></div>
              {mode === 'logreg' && (() => { const row = d.test.lrThresholds.reduce((a, b) => (Math.abs(b.t - thr) < Math.abs(a.t - thr) ? b : a)); return <p className="app-foot">Whole test set at {row.t}: precision {pct(row.precision)}, recall {pct(row.recall)}, {row.fp} good messages lost.</p>; })()}
              {mode === 'metrics' && <p className="app-foot">Whole test set (naive Bayes, 0.5): accuracy {pct(d.test.nb.accuracy)} vs {pct(d.test.baseline)} for “never flag” — but recall {pct(d.test.nb.recall)} shows the {d.test.nb.fn} spam that got through.</p>}
            </>
          )}

          {mode === 'svm' && (
            <>
              <p className="app-note">Each dot is a message placed by the SVM’s score. Right of 0 = spam. The shaded band (−1 to +1) is the margin: the close calls.</p>
              <svg className="margin" viewBox="0 0 400 120" role="img" aria-label="Messages by SVM margin">
                <rect x={200 - 50} y="10" width="100" height="90" className="margin__band" />
                <line x1="200" y1="6" x2="200" y2="104" className="margin__zero" />
                {seen.map((m, i) => { const x = 200 + Math.max(-3.8, Math.min(3.8, m.svm)) * 50; const y = 18 + ((i * 37) % 80); return <circle key={i} cx={x} cy={y} r={i === seen.length - 1 ? 6 : 3.6} className={m.spam ? 'margin__spam' : 'margin__ham'} />; })}
                <text x="8" y="116" className="margin__lab">← not spam</text><text x="392" y="116" textAnchor="end" className="margin__lab">spam →</text>
              </svg>
              <div className="astats"><Stat k="In margin" v={seen.filter((m) => Math.abs(m.svm) < 1).length} /><Stat k="Accuracy" v={pct(lm.accuracy)} /><Stat k="Spam caught" v={pct(lm.recall)} /></div>
              <p className="app-foot">Whole test set: {d.test.svmNearMargin} of {d.counts.test.toLocaleString()} messages fall inside the margin; accuracy {pct(d.test.svm.accuracy)}.</p>
            </>
          )}

          {(mode === 'pipeline' || mode === 'bayes' || mode === 'logreg') && (
            <div className="compose">
              <label className="compose__label" htmlFor={`draft-${mode}`}>Type a message — it runs through the same model</label>
              <textarea id={`draft-${mode}`} rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} />
              <div className="compose__samples">{SAMPLES.map((s) => <button key={s} type="button" className="ghost chipbtn" onClick={() => setDraft(s)}>{s.slice(0, 22)}…</button>)}</div>
              <div className={`compose__verdict${draftP >= thr ? ' is-spam' : ''}`}>{draftP >= thr ? 'SPAM' : 'INBOX'} · P(spam) = {draftP.toFixed(3)}</div>
            </div>
          )}

          {mode === 'pipeline' && (
            <ol className="stages">
              <li><b>1 · raw text</b><span>{draft.length} characters</span></li>
              <li><b>2 · tokenize</b><span className="tokrow">{tokenize(draft).slice(0, 18).map((w, i) => <i key={i} className={M.idx.has(w) ? '' : 'is-oov'} title={M.idx.has(w) ? 'in vocabulary' : 'never seen in training — ignored'}>{w}</i>)}</span></li>
              <li><b>3 · count vector</b><span>{draftC.size} of {d.vocab.length.toLocaleString()} columns non-zero</span></li>
              <li><b>4 · model</b><span>naive Bayes → P(spam) {draftP.toFixed(3)}</span></li>
              <li><b>5 · decision</b><span>{draftP >= 0.5 ? 'move to Spam' : 'deliver to Inbox'}</span></li>
            </ol>
          )}

          {mode === 'bayes' && (
            <div className="evid">
              <div className="evid__head"><span>word</span><span>evidence (log ratio spam : ham)</span></div>
              {M.evidence(draftC).slice(0, 8).map((e) => (
                <div key={e.w} className="evid__row">
                  <span className="evid__w">{e.w}{e.n > 1 ? ` ×${e.n}` : ''}</span>
                  <span className="evid__bar"><span className={e.lr > 0 ? 'is-spam' : 'is-ham'} style={{ width: `${Math.min(50, Math.abs(e.lr) * 9)}%`, [e.lr > 0 ? 'left' : 'right']: '50%' } as React.CSSProperties} /></span>
                  <span className="evid__v">{e.lr > 0 ? '+' : ''}{e.lr.toFixed(2)}</span>
                </div>
              ))}
              <p className="app-foot">Prior: {pct(d.counts.spam / d.counts.messages)} of all messages are spam. Strongest spam words in training: {d.topSpam.slice(0, 5).map((w) => w[0]).join(', ')}.</p>
            </div>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
