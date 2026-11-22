/**
 * Live apps on MovieLens 100K: a "because you liked…" recommender (item-item KNN on real rating similarities) and
 * viewer taste segments (k-means running live in the browser on each viewer's genre mix).
 */
import { useEffect, useMemo, useState } from 'react';
import { AppFrame, Loading, Slider, Stat, pct, rng, useClock, useData, type DataMap } from './common';

type D = DataMap['movies'];
export type MoviesMode = 'knn' | 'segments';
const HUES = ['#cbbae6', '#f3b47f', '#a9c5e8', '#b3d79f', '#f6cd82', '#eba6b2', '#9dd3c7', '#b2baea'];
const hue = (s: string) => HUES[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length];

export default function MoviesApp({ mode }: { mode: MoviesMode }) {
  const d = useData('movies');
  if (!d) return <Loading what="MovieLens 100K" />;
  return mode === 'knn' ? <Recs d={d} /> : <Segments d={d} />;
}

function Recs({ d }: { d: D }) {
  const byPop = useMemo(() => d.movies.map((m, i) => ({ ...m, i })).sort((a, b) => b.n - a.n), [d]);
  const [liked, setLiked] = useState<number[]>(() => ['Star Wars (1977)', 'Toy Story (1995)'].map((t) => d.movies.findIndex((m) => m.t === t)).filter((i) => i >= 0));
  const [k, setK] = useState(5);
  const [q, setQ] = useState('');
  const recs = useMemo(() => {
    const score = new Map<number, { s: number; why: number; best: number }>();
    for (const j of liked) for (const [n, sim] of d.movies[j].nb.slice(0, k)) {
      if (liked.includes(n)) continue;
      const cur = score.get(n) ?? { s: 0, why: j, best: -1 };
      cur.s += sim; if (sim > cur.best) { cur.best = sim; cur.why = j; }
      score.set(n, cur);
    }
    return [...score.entries()].sort((a, b) => b[1].s - a[1].s).slice(0, 8);
  }, [liked, k, d]);
  const shown = byPop.filter((m) => !q || m.t.toLowerCase().includes(q.toLowerCase())).slice(0, 12);
  const toggle = (i: number) => setLiked((l) => (l.includes(i) ? l.filter((x) => x !== i) : [...l, i]));
  const ev = d.eval.knn.reduce((a, b) => (Math.abs(b.k - k) < Math.abs(a.k - k) ? b : a));

  return (
    <AppFrame name="Streamly · recommendations" icon="▶" status={`${liked.length} liked`}
      source={`${d.provenance.dataset}, ${d.provenance.by} · ${d.counts.ratings.toLocaleString()} ratings by ${d.counts.users} viewers · similarities computed by ${d.provenance.script}`}>
      <div className="recs">
        <div className="recs__pick">
          <div className="recs__bar"><input type="search" placeholder="Find a movie…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find a movie" /><span className="muted">click to like</span></div>
          <div className="posters">
            {shown.map((m) => (
              <button key={m.i} type="button" className={`poster${liked.includes(m.i) ? ' is-liked' : ''}`} style={{ ['--h' as string]: hue(m.t) }} onClick={() => toggle(m.i)} aria-pressed={liked.includes(m.i)}>
                <span className="poster__t">{m.t}</span><span className="poster__g">{m.g.slice(0, 2).join(' · ')}</span>{liked.includes(m.i) && <span className="poster__heart">♥</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="recs__out">
          <Slider label="Neighbours per liked movie (k)" min={1} max={20} step={1} value={k} onChange={setK} show={String(k)} />
          <div className="row-title">Because you liked…</div>
          <ol className="reclist" aria-live="polite">
            {recs.length === 0 && <li className="muted">Like a movie to get recommendations.</li>}
            {recs.map(([n, r]) => (
              <li key={n} className="reclist__item" style={{ ['--h' as string]: hue(d.movies[n].t) }}>
                <span className="reclist__t">{d.movies[n].t}</span>
                <span className="reclist__why">similar to {d.movies[r.why].t.replace(/ \(\d{4}\)$/, '')} · {r.best.toFixed(2)}</span>
              </li>
            ))}
          </ol>
          <div className="astats"><Stat k={`Hit@10 · k=${ev.k}`} v={pct(ev.hit10)} tone="good" /><Stat k="Popularity baseline" v={pct(d.eval.popularity)} /></div>
          <p className="app-foot">Hit@10 = for {d.eval.users} real viewers, hide their latest liked movie; how often is it in the top 10? Measured: k=1 {pct(d.eval.knn[0].hit10)}, k=5 {pct(d.eval.knn[2].hit10)}, k=50 {pct(d.eval.knn[5].hit10)}.</p>
        </div>
      </div>
    </AppFrame>
  );
}

/* ---------------- segments: k-means live ---------------- */
function kmeansInit(X: number[][], k: number, seed: number) {
  const r = rng(seed), C = [X[Math.floor(r() * X.length)]];
  while (C.length < k) {
    const d2 = X.map((x) => Math.min(...C.map((c) => dist2(x, c))));
    let u = r() * d2.reduce((a, b) => a + b, 0), i = 0;
    while (u > d2[i] && i < X.length - 1) { u -= d2[i]; i++; }
    C.push(X[i]);
  }
  return C.map((c) => [...c]);
}
const dist2 = (a: number[], b: number[]) => a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0);
function lloyd(X: number[][], C: number[][]) {
  const lab = X.map((x) => { let b = 0, bd = Infinity; C.forEach((c, j) => { const v = dist2(x, c); if (v < bd) { bd = v; b = j; } }); return b; });
  const next = C.map((c, j) => { const m = X.filter((_, i) => lab[i] === j); return m.length ? c.map((_, f) => m.reduce((s, x) => s + x[f], 0) / m.length) : c; });
  const inertia = X.reduce((s, x, i) => s + dist2(x, next[lab[i]]), 0);
  return { lab, C: next, inertia };
}
/** 2-D projection via the top two principal components (power iteration) — for drawing only. */
function pca2(X: number[][]) {
  const n = X.length, p = X[0].length, mu = Array.from({ length: p }, (_, f) => X.reduce((s, x) => s + x[f], 0) / n);
  const Z = X.map((x) => x.map((v, f) => v - mu[f]));
  const comps: number[][] = [];
  for (let c = 0; c < 2; c++) {
    let v: number[] = Array.from({ length: p }, (_, f) => (f === c ? 1 : 0.1));
    for (let it = 0; it < 60; it++) {
      const s = Z.map((z) => z.reduce((a, b, f) => a + b * v[f], 0));
      let w = Array.from({ length: p }, (_, f) => Z.reduce((a, z, i) => a + z[f] * s[i], 0));
      comps.forEach((q) => { const d = w.reduce((a, b, f) => a + b * q[f], 0); w = w.map((x, f) => x - d * q[f]); });
      const nrm = Math.hypot(...w); v = w.map((x) => x / nrm);
    }
    comps.push(v);
  }
  return Z.map((z) => comps.map((q) => z.reduce((a, b, f) => a + b * q[f], 0)));
}

function Segments({ d }: { d: D }) {
  const X = d.profiles;
  const P2 = useMemo(() => pca2(X), [X]);
  const [k, setK] = useState(4);
  const [state, setState] = useState(() => ({ C: kmeansInit(X, 4, 0), lab: X.map(() => -1), inertia: NaN, iter: 0, done: false }));
  const [tick, playing, setPlaying, setTick] = useClock(650);
  useEffect(() => { setState({ C: kmeansInit(X, k, 0), lab: X.map(() => -1), inertia: NaN, iter: 0, done: false }); setTick(0); }, [k, X, setTick]);
  useEffect(() => {
    if (tick === 0) return;
    setState((s) => { if (s.done) return s; const r = lloyd(X, s.C); return { ...r, iter: s.iter + 1, done: s.lab.every((l, i) => l === r.lab[i]) }; });
  }, [tick, X]);
  const xs = P2.map((p) => p[0]), ys = P2.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const sx = (v: number) => 10 + ((v - x0) / (x1 - x0)) * 260, sy = (v: number) => 190 - ((v - y0) / (y1 - y0)) * 180;
  const avg = X[0].map((_, f) => X.reduce((s, x) => s + x[f], 0) / X.length);
  const ref = d.elbow.find((e) => e.k === k);

  return (
    <AppFrame name="Streamly · audience segments" icon="◎" playing={playing} onToggle={() => setPlaying(!playing)} status={`iteration ${state.iter}${state.done ? ' · converged' : ''}`}
      source={`${d.provenance.dataset}, ${d.provenance.by} · each dot = one of ${X.length} real viewers, placed by the genres they watch`}>
      <div className="segs">
        <svg className="segs__plot" viewBox="0 0 280 200" role="img" aria-label="Viewers coloured by segment">
          {P2.map((p, i) => <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r="2.4" fill={state.lab[i] < 0 ? '#c9c0b4' : HUES[state.lab[i] % HUES.length]} stroke="#211e1b" strokeWidth=".4" />)}
        </svg>
        <div className="segs__side">
          <Slider label="Number of segments (k)" min={2} max={8} step={1} value={k} onChange={setK} show={String(k)} />
          <div className="astats"><Stat k="Within-segment spread" v={Number.isFinite(state.inertia) ? state.inertia.toFixed(2) : '—'} /><Stat k="scikit-learn, same k" v={ref ? ref.inertia.toFixed(2) : '—'} /></div>
          <ul className="segcards">
            {state.C.map((c, j) => {
              const size = state.lab.filter((l) => l === j).length;
              const lift = c.map((v, f) => [d.genres[f], v - avg[f]] as [string, number]).sort((a, b) => b[1] - a[1]).slice(0, 3);
              return <li key={j} style={{ ['--h' as string]: HUES[j % HUES.length] }}><b>Segment {j + 1}</b> <span className="muted">{size || '—'} viewers</span><span className="segcards__g">more {lift.map((l) => l[0]).join(', ')}</span></li>;
            })}
          </ul>
          <p className="app-foot">k-means runs here, live: assign each viewer to the nearest centre, move centres to the mean, repeat. scikit-learn silhouette by k: {d.elbow.slice(0, 5).map((e) => `${e.k}→${e.silhouette}`).join(', ')} (higher = cleaner split).</p>
        </div>
      </div>
    </AppFrame>
  );
}
