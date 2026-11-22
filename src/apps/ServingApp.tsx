/**
 * Live app: a model-serving load test. One worker serves requests in order; each request takes one of the latencies
 * actually measured for that model on this machine (replayed in order). Raise the traffic and watch the queue.
 */
import { useMemo, useState } from 'react';
import { AppFrame, Loading, Slider, Stat, useClock, useData, type DataMap } from './common';

type D = DataMap['serving'];

export default function ServingApp() {
  const d = useData('serving');
  if (!d) return <Loading what="measured latencies" />;
  return <Serving d={d} />;
}

const N = 3000;
function simulate(samples: number[], rps: number) {
  const gap = 1000 / rps; let free = 0; const resp: number[] = []; const queue: number[] = [];
  for (let i = 0; i < N; i++) {
    const arrive = i * gap, start = Math.max(arrive, free), took = samples[i % samples.length];
    free = start + took; resp.push(free - arrive); queue.push(Math.max(0, Math.round((start - arrive) / gap)));
  }
  const s = [...resp].sort((a, b) => a - b);
  const busy = samples.slice(0, N).reduce((a, b) => a + b, 0) / Math.min(N, samples.length);
  return { resp, queue, p50: s[Math.floor(N * 0.5)], p99: s[Math.floor(N * 0.99)], util: Math.min(1, busy / gap), meanSvc: busy };
}

function Serving({ d }: { d: D }) {
  const names = Object.keys(d.models) as (keyof D['models'])[];
  const [mi, setMi] = useState(names.indexOf('Loans · random forest (40 trees)' as keyof D['models']));
  const [rps, setRps] = useState(400);
  const [budget, setBudget] = useState(5);
  const name = names[Math.max(0, mi)];
  const sim = useMemo(() => simulate(d.models[name].samples, rps), [d, name, rps]);
  const [tick, playing, setPlaying] = useClock(40, N / 20);
  const upto = Math.min(N, (tick + 1) * 20);
  const shown = sim.resp.slice(0, upto);
  const maxY = Math.max(budget * 1.6, ...shown.slice(-300));
  const X = (i: number) => 4 + (i / N) * 592, Y = (v: number) => 120 - (Math.min(v, maxY) / maxY) * 110;
  const over = sim.resp.filter((r) => r > budget).length;

  return (
    <AppFrame name="ModelServe · load test" icon="⚡" playing={playing} onToggle={() => setPlaying(!playing)} status={`${upto.toLocaleString()} of ${N.toLocaleString()} requests`}
      source={`latencies measured on this machine (${d.provenance.machine}) · ${d.provenance.method} · ${d.provenance.script}`}>
      <div className="serving">
        <div className="serving__models" role="radiogroup" aria-label="Model">
          {names.map((n, i) => (
            <button key={n} type="button" role="radio" aria-checked={i === mi} className={`modelpick${i === mi ? ' is-on' : ''}`} onClick={() => setMi(i)}>
              <b>{n}</b><span>p50 {d.models[n].p50} ms · p99 {d.models[n].p99} ms</span>
            </button>
          ))}
        </div>
        <div className="serving__main">
          <Slider label="Traffic" min={50} max={4000} step={50} value={rps} onChange={setRps} show={`${rps.toLocaleString()} req/s`} />
          <Slider label="Latency budget (SLA)" min={1} max={50} step={1} value={budget} onChange={setBudget} show={`${budget} ms`} />
          <svg className="schart" viewBox="0 0 600 130" role="img" aria-label="Response time of each request">
            <line x1="4" x2="596" y1={Y(budget)} y2={Y(budget)} className="schart__sla" />
            <text x="592" y={Y(budget) - 4} textAnchor="end" className="schart__lab">SLA {budget} ms</text>
            <polyline points={shown.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')} className="schart__v" />
          </svg>
          <div className="astats">
            <Stat k="Worker busy" v={`${Math.round(sim.util * 100)}%`} tone={sim.util >= 1 ? 'bad' : undefined} />
            <Stat k="p50 response" v={`${sim.p50.toFixed(2)} ms`} />
            <Stat k="p99 response" v={sim.p99 > 1000 ? `${(sim.p99 / 1000).toFixed(1)} s` : `${sim.p99.toFixed(2)} ms`} tone={sim.p99 > budget ? 'bad' : 'good'} />
            <Stat k="Over budget" v={`${((over / N) * 100).toFixed(1)}%`} tone={over ? 'bad' : 'good'} />
          </div>
          <p className="app-foot">One worker, requests evenly spaced. Above {Math.floor(1000 / sim.meanSvc).toLocaleString()} req/s this model can’t keep up: the queue grows without limit and so does latency. The fix is capacity (more workers) or a cheaper model — not a faster laptop benchmark.</p>
        </div>
      </div>
    </AppFrame>
  );
}
