/**
 * Live apps on the German Credit data: a bank's loan-decision screen. Real held-out applicants arrive; the exact
 * decision tree / random forest / gradient-boosted trees from scripts/data/measure_apps.py score them in the browser.
 */
import { useEffect, useMemo, useState } from 'react';
import { AppFrame, Loading, Seg, Stat, pct, useClock, useData, type DataMap } from './common';

type D = DataMap['loans'];
export type LoansMode = 'tree' | 'ensemble' | 'tuning';
type Node = { f?: number; t?: number; l?: number; r?: number; leaf?: number; n: number };
type Applicant = Record<string, string | number>;

export const walk = (nodes: Node[], x: number[]) => { const path = [0]; let i = 0; while (nodes[i].leaf === undefined) { i = x[nodes[i].f!] <= nodes[i].t! ? nodes[i].l! : nodes[i].r!; path.push(i); } return { leaf: nodes[i].leaf!, path }; };

export default function LoansApp({ mode }: { mode: LoansMode }) {
  const d = useData('loans');
  if (!d) return <Loading what="German Credit" />;
  return mode === 'tuning' ? <Tuning d={d} /> : <Loans d={d} mode={mode} />;
}

function useEncoder(d: D) {
  return useMemo(() => (a: Applicant) => d.features.map((f) => {
    const m = f.match(/^(\w+) = (.+)$/);
    return m ? (a[m[1]] === m[2] ? 1 : 0) : Number(a[f]);
  }), [d]);
}

function Loans({ d, mode }: { d: D; mode: 'tree' | 'ensemble' }) {
  const encode = useEncoder(d);
  const [tick, playing, setPlaying] = useClock(3200, d.stream.length);
  const [edit, setEdit] = useState<Applicant | null>(null);
  useEffect(() => { setEdit(null); }, [tick]);
  const base = d.stream[tick] as unknown as Applicant;
  const a = edit ?? base;
  const x = encode(a);
  const tree = walk(d.tree.nodes as Node[], x);
  const forestP = (d.forest.trees as Node[][]).map((t) => walk(t, x).leaf);
  const forest = forestP.reduce((s, v) => s + v, 0) / forestP.length;
  const boostSteps = (d.boost.trees as Node[][]).reduce<number[]>((acc, t) => [...acc, acc[acc.length - 1] + d.boost.lr * walk(t, x).leaf], [d.boost.init]);
  const boost = 1 / (1 + Math.exp(-boostSteps[boostSteps.length - 1]));
  const set = (k: string, v: string | number) => { setPlaying(false); setEdit({ ...a, [k]: v }); };
  const decide = (p: number) => (p >= 0.5 ? 'DECLINE' : 'APPROVE');

  return (
    <AppFrame name="LendWell · loan desk" icon="🏦" playing={playing} onToggle={() => setPlaying(!playing)} status={edit ? 'what-if (edited)' : `applicant ${tick + 1} of ${d.stream.length}`}
      source={`${d.provenance.dataset}, ${d.provenance.by}, ${d.provenance.licence} · ${d.counts.train} applicants to train, ${d.counts.test} held out`}>
      <div className="loans">
        <form className="loanform" onSubmit={(e) => e.preventDefault()}>
          {Object.entries(d.cat).filter(([k]) => k !== 'purpose').map(([k, vals]) => (
            <label key={k}><span>{k === 'history' ? 'Credit history' : k === 'checking' ? 'Checking account' : k[0].toUpperCase() + k.slice(1)}</span>
              <select value={String(a[k])} onChange={(e) => set(k, e.target.value)}>{vals.map((v) => <option key={v}>{v}</option>)}</select></label>
          ))}
          {([['months', 'Duration (months)', 4, 72, 1], ['amount', 'Amount (DM)', 250, 18500, 250], ['age', 'Age', 19, 75, 1], ['jobYears', 'Years in job', 0, 8, 0.5]] as const).map(([k, l, lo, hi, st]) => (
            <label key={k}><span>{l} <b>{Number(a[k]).toLocaleString()}</b></span><input type="range" min={lo} max={hi} step={st} value={Number(a[k])} onChange={(e) => set(k, Number(e.target.value))} /></label>
          ))}
          <div className="loanform__truth">{edit ? 'Edited applicant — no real outcome.' : <>Real outcome: <b className={Number(base.bad) ? 'is-bad' : 'is-good'}>{Number(base.bad) ? 'defaulted' : 'repaid'}</b></>}</div>
        </form>

        {mode === 'tree' ? (
          <div className="treeview">
            <TreeSvg nodes={d.tree.nodes as Node[]} path={tree.path} names={d.features} />
            <div className={`verdict ${tree.leaf >= 0.5 ? 'is-bad' : 'is-good'}`}>{decide(tree.leaf)} · {pct(tree.leaf, 0)} of training applicants in this leaf defaulted</div>
            <p className="app-foot">Depth-3 tree on the whole test set: accuracy {pct(d.tree.accuracy)} vs {pct(d.baseline)} for “approve everyone” — and it catches only {pct(d.tree.recall)} of defaulters. Deeper trees: train {pct(d.depthCurve[7].train)}, test {pct(d.depthCurve[7].test)} at depth 10.</p>
          </div>
        ) : (
          <div className="ens">
            <div className="ens__row"><span>One tree</span><b className={tree.leaf >= 0.5 ? 'is-bad' : 'is-good'}>{decide(tree.leaf)}</b><span className="muted">P(default) {tree.leaf.toFixed(2)}</span></div>
            <div className="ens__row"><span>Random forest · 40 trees vote</span><b className={forest >= 0.5 ? 'is-bad' : 'is-good'}>{decide(forest)}</b><span className="muted">avg {forest.toFixed(2)}</span></div>
            <div className="votes" aria-label="Each tree's estimate">{forestP.map((p, i) => <i key={i} style={{ background: `color-mix(in srgb, #e0705f ${Math.round(p * 100)}%, #b3d79f)` }} title={`tree ${i + 1}: ${p.toFixed(2)}`} />)}</div>
            <div className="ens__row"><span>Gradient boosting · 80 small trees add up</span><b className={boost >= 0.5 ? 'is-bad' : 'is-good'}>{decide(boost)}</b><span className="muted">P {boost.toFixed(2)}</span></div>
            <svg className="boostline" viewBox="0 0 320 70" role="img" aria-label="Boosting score after each tree">
              <line x1="0" x2="320" y1="35" y2="35" className="boostline__zero" />
              <polyline points={boostSteps.map((v, i) => `${(i / 80) * 316 + 2},${35 - v * 18}`).join(' ')} className="boostline__l" />
              <text x="4" y="66" className="margin__lab">tree 0 (prior)</text><text x="316" y="66" textAnchor="end" className="margin__lab">tree 80</text>
            </svg>
            <table className="atable"><thead><tr><th>Whole test set</th><th>Accuracy</th><th>AUC</th><th>Defaulters caught</th><th>Cost*</th></tr></thead><tbody>
              {(['tree', 'forest', 'boost'] as const).map((m) => <tr key={m}><td>{m === 'tree' ? 'One tree' : m === 'forest' ? 'Forest' : 'Boosting'}</td><td>{pct(d[m].accuracy)}</td><td>{d[m].auc.toFixed(3)}</td><td>{pct(d[m].recall)}</td><td>{d[m].cost}</td></tr>)}
            </tbody></table>
            <p className="app-foot">*The dataset’s own cost matrix: approving a defaulter costs 5, declining a good customer costs 1.</p>
          </div>
        )}
      </div>
    </AppFrame>
  );
}

function TreeSvg({ nodes, path, names }: { nodes: Node[]; path: number[]; names: string[] }) {
  const pos: Record<number, [number, number]> = {};
  const place = (i: number, depth: number, x0: number, x1: number) => { pos[i] = [(x0 + x1) / 2, 18 + depth * 52]; const n = nodes[i]; if (n.leaf === undefined) { place(n.l!, depth + 1, x0, (x0 + x1) / 2); place(n.r!, depth + 1, (x0 + x1) / 2, x1); } };
  place(0, 0, 0, 480);
  const q = (n: Node) => { const f = names[n.f!]; const m = f.match(/^(\w+) = (.+)$/); return m ? `${m[1]}: ${m[2]}?` : `${f} ≤ ${n.t!.toLocaleString()}?`; };
  return (
    <svg className="tree" viewBox="0 0 480 200" role="img" aria-label="Decision tree with this applicant's path highlighted">
      {nodes.map((n, i) => n.leaf === undefined && [n.l!, n.r!].map((c, k) => <g key={`${i}-${c}`}><line x1={pos[i][0]} y1={pos[i][1]} x2={pos[c][0]} y2={pos[c][1]} className={path.includes(c) ? 'tree__e is-on' : 'tree__e'} /><text x={(pos[i][0] + pos[c][0]) / 2 + (k ? 6 : -6)} y={(pos[i][1] + pos[c][1]) / 2} textAnchor={k ? 'start' : 'end'} className="tree__yn">{names[n.f!].includes(' = ') ? (k ? 'yes' : 'no') : (k ? 'more' : 'less')}</text></g>))}
      {nodes.map((n, i) => (
        <g key={i} transform={`translate(${pos[i][0]} ${pos[i][1]})`} className={path.includes(i) ? 'tree__n is-on' : 'tree__n'}>
          {n.leaf === undefined
            ? <><rect x="-56" y="-11" width="112" height="22" rx="6" /><text textAnchor="middle" y="4">{q(n)}</text></>
            : <><rect x="-27" y="-11" width="54" height="22" rx="11" className={n.leaf >= 0.5 ? 'is-bad' : 'is-good'} /><text textAnchor="middle" y="4">{Math.round(n.leaf * 100)}% bad</text></>}
        </g>
      ))}
    </svg>
  );
}

function Tuning({ d }: { d: D }) {
  const grid = d.tuning.grid, rand = d.tuning.random;
  const [tick, playing, setPlaying, setTick] = useClock(260, grid.length + 1);
  const [which, setWhich] = useState<'grid' | 'random'>('grid');
  useEffect(() => { setTick(0); setPlaying(true); }, [which, setTick, setPlaying]);
  const runs = which === 'grid' ? grid : rand;
  const done = runs.slice(0, Math.min(tick, runs.length));
  const best = done.reduce<(typeof runs)[number] | null>((b, r) => (!b || r.auc > b.auc ? r : b), null);
  const X = (leaf: number) => 40 + (leaf / 40) * 260, Y = (dep: number) => 170 - ((dep - 2) / 8) * 150;
  const col = (auc: number) => `color-mix(in srgb, #6fa75f ${Math.round(Math.max(0, Math.min(1, (auc - 0.6) / 0.13)) * 100)}%, #f3e9dd)`;
  return (
    <AppFrame name="Tuner · hyper-parameter search" icon="⚙" playing={playing} onToggle={() => setPlaying(!playing)} status={`${done.length} of ${runs.length} trials`}
      source={`${d.provenance.dataset} · every trial = a decision tree scored by 5-fold cross-validated ROC AUC on the ${d.counts.train} training applicants (${d.provenance.script})`}>
      <div className="tuning">
        <svg className="tuning__plot" viewBox="0 0 320 200" role="img" aria-label="Search trials by depth and leaf size">
          <text x="170" y="196" textAnchor="middle" className="margin__lab">min samples per leaf →</text>
          <text x="10" y="100" className="margin__lab" transform="rotate(-90 10 100)" textAnchor="middle">max depth →</text>
          {done.map((r, i) => <circle key={i} cx={X(r.min_samples_leaf)} cy={Y(r.max_depth)} r={best === r ? 9 : 7} fill={col(r.auc)} stroke="#211e1b" strokeWidth={best === r ? 2.4 : 1} />)}
        </svg>
        <div className="tuning__side">
          <Seg label="Search strategy" value={which} onChange={setWhich} options={[['grid', `Grid · ${grid.length} trials`], ['random', `Random · ${rand.length} trials`]]} />
          <div className="astats"><Stat k="Best CV AUC so far" v={best ? best.auc.toFixed(4) : '—'} tone="good" /><Stat k="Best settings" v={best ? `depth ${best.max_depth}, leaf ${best.min_samples_leaf}` : '—'} /></div>
          <p className="app-foot">Grid best: depth {d.tuning.best.max_depth}, leaf {d.tuning.best.min_samples_leaf}, CV AUC {d.tuning.best.auc}. Random search reached {Math.max(...rand.map((r) => r.auc)).toFixed(4)} with {rand.length} trials. The grid winner scores AUC {d.tuning.bestTest.auc} on the untouched test set — tuning on CV is optimistic.</p>
        </div>
      </div>
    </AppFrame>
  );
}
