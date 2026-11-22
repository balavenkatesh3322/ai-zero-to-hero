/**
 * Live app: an optimizer race on a real loss landscape. A price model (price = w·income + b) trains on all 16,512 real
 * California training districts — exactly, via six data moments — with gradient descent, momentum, Adam and
 * mini-batch SGD (on real rows). Every step is computed here, live.
 */
import { useEffect, useMemo, useState } from 'react';
import { AppFrame, Slider, Stat, useClock } from './common';
import D0 from '../lessons/data/m01.json'; // 13 KB, loaded with this lazy app chunk

type D = typeof D0;
export type OptKind = 'gd' | 'momentum' | 'adam' | 'sgd';
type Pt = [number, number, number];

export function makeLoss(m: D['moments']) {
  const loss = (w: number, b: number) => m.yy + w * w * m.xx + b * b + 2 * w * b * m.x - 2 * w * m.xy - 2 * b * m.y;
  const grad = (w: number, b: number): [number, number] => [2 * (w * m.xx + b * m.x - m.xy), 2 * (w * m.x + b - m.y)];
  return { loss, grad };
}

/** Same update rules as scripts/data/measure_m01.py. */
export function runOptimizer(d: D, kind: OptKind, lr: number, steps: number): Pt[] {
  const { loss, grad } = makeLoss(d.moments);
  let [w, b] = d.start as [number, number];
  let vw = 0, vb = 0, sw = 0, sb = 0;
  const path: Pt[] = [[w, b, loss(w, b)]];
  for (let t = 1; t <= steps; t++) {
    let [gw, gb] = grad(w, b);
    if (kind === 'sgd') { // mini-batch of 32 real training rows, taken in order
      const batch = Array.from({ length: 32 }, (_, k) => d.rows[((t - 1) * 32 + k) % d.rows.length]);
      gw = batch.reduce((s, [x, y]) => s + 2 * (w * x + b - y) * x, 0) / 32;
      gb = batch.reduce((s, [x, y]) => s + 2 * (w * x + b - y), 0) / 32;
    }
    if (kind === 'gd' || kind === 'sgd') { w -= lr * gw; b -= lr * gb; }
    else if (kind === 'momentum') { vw = 0.9 * vw + gw; vb = 0.9 * vb + gb; w -= lr * vw; b -= lr * vb; }
    else {
      vw = 0.9 * vw + 0.1 * gw; vb = 0.9 * vb + 0.1 * gb; sw = 0.999 * sw + 0.001 * gw * gw; sb = 0.999 * sb + 0.001 * gb * gb;
      const c1 = 1 - 0.9 ** t, c2 = 1 - 0.999 ** t;
      w -= (lr * (vw / c1)) / (Math.sqrt(sw / c2) + 1e-8); b -= (lr * (vb / c1)) / (Math.sqrt(sb / c2) + 1e-8);
    }
    const l = loss(w, b);
    path.push([w, b, l]);
    if (!Number.isFinite(l) || l > 1e4) break;
  }
  return path;
}

const COL: Record<OptKind, string> = { gd: '#e0705f', momentum: '#2f86ce', adam: '#3fa456', sgd: '#d9874a' };
const NAME: Record<OptKind, string> = { gd: 'Gradient descent', momentum: 'Momentum', adam: 'Adam', sgd: 'Mini-batch SGD' };
const STEPS = 150;

export default function OptimApp() {
  return <Optim d={D0} />;
}

function Optim({ d }: { d: D }) {
  const [lr, setLr] = useState<Record<OptKind, number>>({ gd: 0.05, momentum: 0.03, adam: 0.1, sgd: 0.02 });
  const [on, setOn] = useState<Record<OptKind, boolean>>({ gd: true, momentum: true, adam: true, sgd: false });
  const [tick, playing, setPlaying, setTick] = useClock(70, STEPS + 1);
  const kinds = (Object.keys(NAME) as OptKind[]).filter((k) => on[k]);
  const paths = useMemo(() => Object.fromEntries((Object.keys(NAME) as OptKind[]).map((k) => [k, runOptimizer(d, k, lr[k], STEPS)])) as Record<OptKind, Pt[]>, [d, lr]);
  useEffect(() => { setTick(0); setPlaying(true); }, [lr, setTick, setPlaying]);
  const { loss } = useMemo(() => makeLoss(d.moments), [d]);
  const best = d.optimum.loss;

  // loss landscape (computed from the real data moments)
  const W0 = -0.35, W1 = 0.95, B0 = -1.2, B1 = 3.6, NX = 52, NY = 34;
  const X = (w: number) => 10 + ((w - W0) / (W1 - W0)) * 380, Y = (b: number) => 230 - ((b - B0) / (B1 - B0)) * 220;
  const cells = useMemo(() => {
    const out: { x: number; y: number; v: number }[] = [];
    for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) {
      const w = W0 + ((i + 0.5) / NX) * (W1 - W0), b = B0 + ((j + 0.5) / NY) * (B1 - B0);
      out.push({ x: i, y: j, v: Math.log(loss(w, b) / best) });
    }
    return out;
  }, [loss, best]);
  const vmax = 6; // log(loss / best) up to ~400×, in 12 bands like a contour map
  const reached = (p: Pt[]) => p.findIndex((s) => s[2] <= best * 1.01);
  const cw = 380 / NX, chh = 220 / NY;

  return (
    <AppFrame name="Trainer · optimizer race" icon="⛰" playing={playing} onToggle={() => setPlaying(!playing)} status={`step ${Math.min(tick, STEPS)} of ${STEPS}`}
      source={`${d.provenance.dataset} · ${d.moments.n.toLocaleString()} real training districts · every step computed live in your browser (${d.provenance.script})`}>
      <div className="optim">
        <svg className="optim__map" viewBox="0 0 400 250" role="img" aria-label="Loss landscape with each optimizer's path">
          {cells.map((c) => <rect key={`${c.x}-${c.y}`} x={10 + c.x * cw} y={230 - (c.y + 1) * chh} width={cw + 0.4} height={chh + 0.4} fill={`color-mix(in srgb, #9d86c9 ${Math.round(Math.min(1, Math.floor((c.v / vmax) * 12) / 12) * 85)}%, #f7f1e8)`} />)}
          <circle cx={X(d.optimum.w)} cy={Y(d.optimum.b)} r="5" fill="#f6cd82" stroke="#211e1b" strokeWidth="1.5" />
          <text x={X(d.optimum.w) + 8} y={Y(d.optimum.b) + 4} className="margin__lab">best fit</text>
          {kinds.map((k) => {
            const p = paths[k].slice(0, tick + 1).filter((s) => s[0] > W0 - 1 && s[0] < W1 + 1 && s[1] > B0 - 2 && s[1] < B1 + 2);
            const last = p[p.length - 1];
            return (
              <g key={k}>
                <polyline points={p.map((s) => `${X(s[0]).toFixed(1)},${Y(s[1]).toFixed(1)}`).join(' ')} fill="none" stroke={COL[k]} strokeWidth="2" strokeLinejoin="round" />
                {last && <circle cx={X(last[0])} cy={Y(last[1])} r="4.5" fill={COL[k]} stroke="#211e1b" strokeWidth="1.2" />}
              </g>
            );
          })}
          <text x="200" y="246" textAnchor="middle" className="margin__lab">w (price per $10k of income) →</text>
          <text x="6" y="16" className="margin__lab">b ↑</text>
        </svg>
        <div className="optim__side">
          {(Object.keys(NAME) as OptKind[]).map((k) => {
            const p = paths[k], cur = p[Math.min(tick, p.length - 1)], r = reached(p), dead = p.length < STEPS + 1;
            const opts = k === 'sgd' ? [0.005, 0.01, 0.02, 0.04] : (d.lrs as Record<string, number[]>)[k];
            return (
              <div key={k} className={`optrow${on[k] ? '' : ' is-off'}`} style={{ ['--c' as string]: COL[k] }}>
                <label className="optrow__name"><input type="checkbox" checked={on[k]} onChange={(e) => setOn({ ...on, [k]: e.target.checked })} /> {NAME[k]}</label>
                <Slider label="learning rate" min={0} max={opts.length - 1} step={1} value={Math.max(0, opts.indexOf(lr[k]))} onChange={(i) => setLr({ ...lr, [k]: opts[i] })} show={String(lr[k])} />
                <span className="optrow__stat">{dead && tick >= p.length - 1 ? 'diverged 💥' : `loss ${cur[2] > 999 ? cur[2].toExponential(1) : cur[2].toFixed(3)}`}{r >= 0 && tick >= r ? ` · best fit in ${r} steps` : ''}</span>
              </div>
            );
          })}
          <div className="astats"><Stat k="Best possible loss" v={best.toFixed(3)} /><Stat k="Same data, income scaled" v={`${d.scaledGdSteps} GD steps`} tone="good" /></div>
        </div>
      </div>
    </AppFrame>
  );
}
