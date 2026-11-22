/**
 * Live app: a home-value estimator ("what is this district worth?"). Real held-out California census districts
 * stream in; prices come from the exact models trained in scripts/data/measure_apps.py.
 */
import { useMemo, useState } from 'react';
import { AppFrame, Loading, Seg, Slider, Stat, useClock, useData, usd, type DataMap } from './common';

type D = DataMap['homes'];
export type HomesMode = 'line' | 'features' | 'depth' | 'lasso' | 'skew';
const K = 100000; // target unit is $100,000
const NAMES: Record<string, string> = { MedInc: 'Median income', HouseAge: 'House age', AveRooms: 'Rooms / home', AveBedrms: 'Bedrooms / home', Population: 'Population', AveOccup: 'People / home', Latitude: 'Latitude', Longitude: 'Longitude' };
const f1 = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n));

export default function HomesApp({ mode }: { mode: HomesMode }) {
  const d = useData('homes');
  if (!d) return <Loading what="California Housing" />;
  return <Homes d={d} mode={mode} />;
}

function Homes({ d, mode }: { d: D; mode: HomesMode }) {
  const [tick, playing, setPlaying] = useClock(1500, d.stream.length);
  const [depth, setDepth] = useState<'2' | '8' | 'None'>('8');
  const [ai, setAi] = useState(3);
  const [bug, setBug] = useState(true);
  const [income, setIncome] = useState(5);

  const raw = (x: number[]) => d.raw.b + x.reduce((s, v, i) => s + v * d.raw.w[i], 0);
  const engW = useMemo(() => new Map(d.eng.names.map((n, i) => [n, d.eng.w[i]])), [d]);
  const eng = (x: number[]) => {
    const [inc, age, rooms, beds, pop, occ, lat, lon] = x;
    let z = d.eng.b + inc * engW.get('MedInc')! + age * engW.get('HouseAge')! + Math.log(rooms) * engW.get('logRooms')! + (beds / rooms) * engW.get('bedroomShare')!
      + Math.log(pop) * engW.get('logPopulation')! + Math.log(occ) * engW.get('logOccupancy')!;
    z += engW.get(`cell:${f1(Math.floor(lat * 2) / 2)},${f1(Math.floor(lon * 2) / 2)}`) ?? 0;
    return z;
  };
  const path = d.lasso.path[ai];
  const lasso = (x: number[]) => path.b + x.reduce((s, v, i) => s + ((v - d.lasso.mean[i]) / d.lasso.scale[i]) * path.w[i], 0);

  const predict = (x: number[], i: number): number[] => {
    if (mode === 'line') return [d.one.slope * x[0] + d.one.intercept];
    if (mode === 'features') return [raw(x), eng(x)];
    if (mode === 'depth') return [d.trees.pred[depth][i]];
    if (mode === 'lasso') return [lasso(x)];
    const sent = [...x]; if (bug) sent[0] = x[0] * 10000;
    return [raw(sent), raw(x)];
  };
  const labels = mode === 'features' ? ['8 raw columns', '+ engineered'] : mode === 'skew' ? [bug ? 'Served (bug: $ not $10k)' : 'Served (fixed)', 'Offline (training)'] : ['Estimate'];
  const seen = d.stream.slice(0, tick + 1);
  const errs = labels.map((_, k) => seen.reduce((s, r, i) => s + Math.abs(predict(r.slice(0, 8), i)[k] - r[8]), 0) / seen.length * K);
  const cur = seen[seen.length - 1];
  const curP = predict(cur.slice(0, 8), seen.length - 1);

  // map extents (California)
  const X = (lon: number) => ((lon + 124.6) / 10.5) * 180 + 10, Y = (lat: number) => 200 - ((lat - 32.4) / 9.6) * 190;

  return (
    <AppFrame name="HomeValue · instant estimate" icon="⌂" playing={playing} onToggle={() => setPlaying(!playing)} status={`district ${seen.length} of ${d.stream.length}`}
      source={`${d.provenance.dataset}, ${d.provenance.by} · ${d.counts.train.toLocaleString()} districts to train, ${d.counts.test.toLocaleString()} held out`}>
      <div className="homes">
        <svg className="camap" viewBox="0 0 200 210" role="img" aria-label="Map of California districts">
          {d.map.map(([lat, lon], i) => <circle key={i} cx={X(lon)} cy={Y(lat)} r="1.3" className="camap__dot" />)}
          {seen.slice(-40).map((r, i, a) => { const e = Math.abs(predict(r.slice(0, 8), seen.length - a.length + i)[0] - r[8]) * K; return <circle key={i} cx={X(r[7])} cy={Y(r[6])} r="3.2" className={e < 40000 ? 'camap__ok' : e < 100000 ? 'camap__mid' : 'camap__bad'} />; })}
          <circle cx={X(cur[7])} cy={Y(cur[6])} r="7" className="camap__cur" />
          <text x="8" y="206" className="camap__lab">dot colour = estimate error</text>
        </svg>

        <div className="listing">
          <div className="listing__head">Census district · {cur[6].toFixed(2)}°N {Math.abs(cur[7]).toFixed(2)}°W</div>
          <dl className="listing__facts">
            <div><dt>Median income</dt><dd>{usd((mode === 'skew' && bug ? cur[0] : cur[0]) * 10000)}</dd></div>
            <div><dt>House age</dt><dd>{cur[1]} yrs</dd></div>
            <div><dt>Rooms / home</dt><dd>{cur[2].toFixed(1)}</dd></div>
            <div><dt>People / home</dt><dd>{cur[5].toFixed(1)}</dd></div>
          </dl>
          {labels.map((l, k) => (
            <div key={l} className={`listing__est${mode === 'skew' && k === 0 && bug ? ' is-bad' : ''}`}><span>{l}</span><b>{Math.abs(curP[k] * K) > 1e8 ? `${(curP[k] * K / 1e9).toFixed(1)} billion $` : usd(curP[k] * K)}</b></div>
          ))}
          <div className="listing__truth"><span>Census value</span><b>{usd(cur[8] * K)}{cur[8] >= 5 ? '+ (capped)' : ''}</b></div>
          <div className="astats">{labels.map((l, k) => <Stat key={l} k={`Avg error · ${l}`} v={errs[k] > 1e8 ? '> $100M' : usd(errs[k])} tone={mode === 'skew' && k === 0 && bug ? 'bad' : undefined} />)}</div>
        </div>

        <div className="homes__ctl">
          {mode === 'line' && (
            <>
              <Slider label="Your district’s median income" min={0.5} max={15} step={0.1} value={income} onChange={setIncome} show={usd(income * 10000)} />
              <p className="app-note">price = {d.one.slope.toFixed(3)} × income + {d.one.intercept.toFixed(3)} (in $100k) → <b>{usd((d.one.slope * income + d.one.intercept) * K)}</b></p>
              <p className="app-foot">Whole test set: one feature explains R² = {d.one.r2} of the variation; average error {usd(d.one.mae)} (vs {usd(d.baselineMae)} for always guessing the mean).</p>
            </>
          )}
          {mode === 'features' && <p className="app-foot">Whole test set: 8 raw columns → average error {usd(d.raw.mae)} (R² {d.raw.r2}). Adding logs, a bedroom share and {d.eng.cells.length} half-degree location cells → {usd(d.eng.mae)} (R² {d.eng.r2}). Same algorithm, better inputs.</p>}
          {mode === 'depth' && (
            <>
              <Seg label="Tree depth" value={depth} onChange={setDepth} options={[['2', 'depth 2 · underfit'], ['8', 'depth 8'], ['None', 'unlimited · overfit']]} />
              <table className="atable"><thead><tr><th>Depth</th><th>Leaves</th><th>Train error</th><th>Test error</th></tr></thead>
                <tbody>{d.trees.curve.filter((r) => [2, 4, 8, 12, 20, 'none'].includes(r.depth)).map((r) => <tr key={String(r.depth)} className={String(r.depth) === (depth === 'None' ? 'none' : depth) ? 'is-best' : ''}><td>{r.depth}</td><td>{r.leaves.toLocaleString()}</td><td>{usd(r.train)}</td><td>{usd(r.test)}</td></tr>)}</tbody></table>
            </>
          )}
          {mode === 'lasso' && (
            <>
              <Slider label="L1 penalty (alpha)" min={0} max={d.lasso.path.length - 1} step={1} value={ai} onChange={setAi} show={String(path.alpha)} />
              <div className="coefs">{d.features.map((f, i) => (
                <div key={f} className={`coefs__row${Math.abs(path.w[i]) < 1e-9 ? ' is-zero' : ''}`}><span>{NAMES[f]}</span>
                  <span className="coefs__bar"><span style={{ width: `${Math.min(50, Math.abs(path.w[i]) * 50)}%`, [path.w[i] >= 0 ? 'left' : 'right']: '50%' } as React.CSSProperties} /></span>
                  <span className="coefs__v">{Math.abs(path.w[i]) < 1e-9 ? 'dropped' : path.w[i].toFixed(3)}</span></div>))}
              </div>
              <p className="app-foot">{path.nonzero} of 8 features kept · test error {usd(path.mae)}.</p>
            </>
          )}
          {mode === 'skew' && (
            <>
              <Seg label="Serving code" value={bug ? 'bug' : 'fix'} onChange={(v) => setBug(v === 'bug')} options={[['bug', 'Serving sends income in $'], ['fix', 'Serving uses training units ($10k)']]} />
              <p className="app-note">The model learned income in units of $10,000 (5.0 = $50,000). The website’s feature code sends dollars (50000). Nothing crashes — every estimate is just wrong.</p>
            </>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
