/**
 * Live apps on NAB's real machine-temperature sensor (an industrial machine that later failed). Hourly readings play
 * back in time order; forecasts, anomaly alerts and drift scores are computed here, live, as each reading arrives.
 */
import { useMemo, useState } from 'react';
import { AppFrame, Loading, Seg, Slider, Stat, useClock, useData, type DataMap } from './common';

type D = DataMap['sensor'];
export type SensorMode = 'forecast' | 'anomaly' | 'drift';
const WIN = 240; // hours on screen
const H = 6;     // forecast horizon (hours)

export default function SensorApp({ mode }: { mode: SensorMode }) {
  const d = useData('sensor');
  if (!d) return <Loading what="the NAB machine-temperature stream" />;
  return <Sensor d={d} mode={mode} />;
}

const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
const std = (a: number[]) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length); };

function psi(ref: number[], cur: number[]) {
  const s = [...ref].sort((a, b) => a - b);
  const edges = Array.from({ length: 9 }, (_, i) => s[Math.floor(((i + 1) / 10) * (s.length - 1))]);
  const bin = (v: number) => { let i = 0; while (i < 9 && v > edges[i]) i++; return i; };
  const h = (a: number[]) => { const c = new Array(10).fill(0); a.forEach((v) => c[bin(v)]++); return c.map((x) => x / a.length + 1e-4); };
  const A = h(ref), B = h(cur);
  return { value: A.reduce((t, a, i) => t + (B[i] - a) * Math.log(B[i] / a), 0), A, B };
}

function Sensor({ d, mode }: { d: D; mode: SensorMode }) {
  const v = d.values;
  const [speed, setSpeed] = useState<1 | 4>(4);
  const [tick, playing, setPlaying] = useClock(speed === 4 ? 45 : 180, v.length);
  const [thr, setThr] = useState(3);
  const t = Math.max(mode === 'drift' ? 340 : 100, tick + (mode === 'drift' ? 340 : 100));
  const now = Math.min(t, v.length - 1);
  const t0 = useMemo(() => new Date(d.start.replace(' ', 'T') + 'Z').getTime(), [d.start]);
  const when = (i: number) => new Date(t0 + i * 3600e3).toISOString().slice(0, 13).replace('T', ' ') + ':00';
  const inWin = (i: number) => d.windows.some(([a, b]) => i >= a && i <= b);

  // anomaly: rolling z-score over the previous 72 h (same rule as measure_apps.py)
  const z = useMemo(() => v.map((x, i) => { if (i < 72) return 0; const w = v.slice(i - 72, i); const s = std(w); return s > 0 ? Math.abs(x - mean(w)) / s : 0; }), [v]);
  const alerts = useMemo(() => {
    const eps: [number, number][] = [];
    for (let i = 72; i <= now; i++) if (z[i] > thr) { const e = eps[eps.length - 1]; if (e && i - e[1] <= 6) e[1] = i; else eps.push([i, i]); }
    return eps;
  }, [z, thr, now]);
  const caught = d.windows.filter(([a, b]) => a <= now && alerts.some(([s, e]) => s <= b && a <= e)).length;
  const falseA = alerts.filter(([s, e]) => !d.windows.some(([a, b]) => s <= b && a <= e)).length;

  // forecasts made 6 h earlier, and their running mean absolute error
  const fc = (i: number) => ({ naive: v[i - H], seasonal: v[i - 24], mean24: mean(v.slice(i - H - 24, i - H)) });
  const err = useMemo(() => {
    const e = { naive: 0, seasonal: 0, mean24: 0 }; let n = 0;
    for (let i = H + 24; i <= now; i++) { const f = fc(i); e.naive += Math.abs(v[i] - f.naive); e.seasonal += Math.abs(v[i] - f.seasonal); e.mean24 += Math.abs(v[i] - f.mean24); n++; }
    return { naive: e.naive / n, seasonal: e.seasonal / n, mean24: e.mean24 / n };
  }, [now, v]); // eslint-disable-line react-hooks/exhaustive-deps

  const drift = mode === 'drift' ? psi(v.slice(0, 168), v.slice(Math.max(0, now - 167), now + 1)) : null;

  // chart
  const lo = Math.max(0, now - WIN + 1), seg = v.slice(lo, now + 1);
  const vmin = 0, vmax = 110;
  const X = (i: number) => 4 + ((i - lo) / (WIN - 1)) * 592, Y = (x: number) => 150 - ((x - vmin) / (vmax - vmin)) * 140;
  const line = (f: (i: number) => number, from = lo) => Array.from({ length: now - from + 1 }, (_, k) => from + k).filter((i) => i >= 30).map((i) => `${X(i).toFixed(1)},${Y(f(i)).toFixed(1)}`).join(' ');

  return (
    <AppFrame name="PlantWatch · machine 7 temperature" icon="⚙" playing={playing} onToggle={() => setPlaying(!playing)} status={when(now)}
      source={`${d.provenance.dataset}, ${d.provenance.by}, ${d.provenance.licence} · ${d.rawReadings.toLocaleString()} readings every ${d.rawStepMinutes} min, shown as hourly means`}>
      <div className="sensor">
        <svg className="schart" viewBox="0 0 600 160" role="img" aria-label="Machine temperature over the last 10 days">
          {d.windows.filter(([a, b]) => b >= lo && a <= now).map(([a, b]) => <rect key={a} x={X(Math.max(a, lo))} y="6" width={Math.max(2, X(Math.min(b, now)) - X(Math.max(a, lo)))} height="148" className="schart__win" />)}
          {[20, 50, 80].map((g) => <g key={g}><line x1="4" x2="596" y1={Y(g)} y2={Y(g)} className="schart__grid" /><text x="6" y={Y(g) - 3} className="schart__lab">{g}°</text></g>)}
          {mode === 'forecast' && <>
            <polyline points={line((i) => fc(i).seasonal, Math.max(lo, 30))} className="schart__f2" />
            <polyline points={line((i) => fc(i).naive, Math.max(lo, 30))} className="schart__f1" />
          </>}
          <polyline points={seg.map((x, k) => `${X(lo + k).toFixed(1)},${Y(x).toFixed(1)}`).join(' ')} className="schart__v" />
          {mode === 'anomaly' && alerts.filter(([s]) => s >= lo).map(([s]) => <g key={s}><line x1={X(s)} x2={X(s)} y1="8" y2="152" className={inWin(s) ? 'schart__hit' : 'schart__miss'} /><circle cx={X(s)} cy={Y(v[s])} r="4.5" className={inWin(s) ? 'schart__hitdot' : 'schart__missdot'} /></g>)}
          {mode === 'drift' && now - 167 >= lo && <rect x={X(now - 167)} y="4" width={X(now) - X(now - 167)} height="4" className="schart__cur" />}
          <circle cx={X(now)} cy={Y(v[now])} r="4" className="schart__now" />
        </svg>
        <div className="sensor__legend"><span className="lg lg--win" /> labelled failure window (NAB) {mode === 'forecast' && <><span className="lg lg--f1" /> naive (6 h ago) <span className="lg lg--f2" /> same hour yesterday</>}{mode === 'anomaly' && <><span className="lg lg--hit" /> alert in a window <span className="lg lg--miss" /> false alarm</>}</div>

        <div className="sensor__ctl">
          <Seg label="Playback speed" value={speed} onChange={setSpeed} options={[[1, '1 h / 0.2 s'], [4, 'fast']]} />
          <span className="sensor__now">{v[now].toFixed(1)}°</span>
        </div>

        {mode === 'forecast' && (
          <div className="astats">
            <Stat k="Naive · last value (6 h ago)" v={`${err.naive.toFixed(2)}°`} tone={err.naive <= Math.min(err.seasonal, err.mean24) ? 'good' : undefined} />
            <Stat k="Seasonal · same hour yesterday" v={`${err.seasonal.toFixed(2)}°`} tone={err.seasonal <= Math.min(err.naive, err.mean24) ? 'good' : undefined} />
            <Stat k="Mean of a day (6 h old)" v={`${err.mean24.toFixed(2)}°`} tone={err.mean24 <= Math.min(err.naive, err.seasonal) ? 'good' : undefined} />
          </div>
        )}
        {mode === 'forecast' && <p className="app-foot">Running average error of a 6-hour-ahead forecast. Full series: naive {d.forecastMae6h.naive}°, seasonal {d.forecastMae6h.seasonal}°, daily mean {d.forecastMae6h.mean24}° — this machine has no strong daily rhythm, so “same hour yesterday” loses.</p>}

        {mode === 'anomaly' && (
          <>
            <Slider label="Alert when |z| >" min={2} max={4} step={0.5} value={thr} onChange={setThr} show={thr.toFixed(1)} />
            <div className="astats"><Stat k="Failure windows caught" v={`${caught} of ${d.windows.filter(([a]) => a <= now).length}`} tone="good" /><Stat k="False alarms (pages)" v={falseA} tone={falseA > 10 ? 'bad' : undefined} /><Stat k="Current z-score" v={z[now].toFixed(2)} /></div>
            <p className="app-foot">Whole series at |z| &gt; {thr}: {d.zscore[thr.toFixed(1) as keyof D['zscore']].caught} of 4 windows caught, {d.zscore[thr.toFixed(1) as keyof D['zscore']].falseAlarms} false alarms. Lower the threshold and you page the on-call engineer more often.</p>
          </>
        )}

        {mode === 'drift' && drift && (
          <>
            <div className="psi">
              <div className="psi__bars" aria-label="Share of readings per temperature band: first week vs latest week">
                {drift.A.map((a, i) => <div key={i} className="psi__pair"><i style={{ height: `${a * 200}%` }} className="psi__ref" /><i style={{ height: `${drift.B[i] * 200}%` }} className="psi__cur" /></div>)}
              </div>
              <div className="astats"><Stat k="PSI · latest week vs first week" v={drift.value.toFixed(2)} tone={drift.value > 0.2 ? 'bad' : 'good'} /><Stat k="Status" v={drift.value > 0.25 ? 'DRIFT — retrain?' : drift.value > 0.1 ? 'watch' : 'stable'} tone={drift.value > 0.25 ? 'bad' : undefined} /></div>
            </div>
            <p className="app-foot"><span className="lg lg--ref" /> first week (reference) <span className="lg lg--cur" /> latest 7 days. Rule of thumb: PSI &lt; 0.1 stable, &gt; 0.25 shifted. Whole series: PSI first exceeds 0.2 at hour {d.psi.firstAbove02} and peaks at {d.psi.max}.</p>
          </>
        )}
      </div>
    </AppFrame>
  );
}
