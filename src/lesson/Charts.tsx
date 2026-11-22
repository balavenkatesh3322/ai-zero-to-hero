import type { Widget } from './types';

const TONE: Record<string, string> = { violet: '#7c63d0', orange: '#e8834d', green: '#3fa456', ink: 'var(--ink)', rust: 'var(--rust)' };
const W = 560, H = 170, PAD = { l: 52, r: 12, t: 10, b: 30 };

const nice = (v: number) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en-US') : Math.abs(v) >= 10 ? v.toFixed(0) : Math.abs(v) >= 1 ? v.toFixed(1) : v.toPrecision(2));

export function LineChart({ series, xLabel, yLabel, logY, caption, markers }: Extract<Widget, { type: 'line' }>) {
  const all = series.flatMap((s) => s.points);
  const xs = all.map((p) => p[0]);
  const ys = all.map((p) => (logY ? Math.log10(Math.max(p[1], 1e-12)) : p[1]));
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  if (y0 === y1) { y0 -= 1; y1 += 1; }
  const sx = (x: number) => PAD.l + ((x - x0) / (x1 - x0 || 1)) * (W - PAD.l - PAD.r);
  const sy = (y: number) => PAD.t + (1 - ((logY ? Math.log10(Math.max(y, 1e-12)) : y) - y0) / (y1 - y0)) * (H - PAD.t - PAD.b);
  const ticks = [0, 0.5, 1].map((t) => y0 + t * (y1 - y0));
  return (
    <div className="chart w-panel">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${yLabel} by ${xLabel}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={sy(logY ? 10 ** t : t)} y2={sy(logY ? 10 ** t : t)} className="chart__grid" />
            <text x={PAD.l - 6} y={sy(logY ? 10 ** t : t) + 3} textAnchor="end" className="chart__tick">{nice(logY ? 10 ** t : t)}</text>
          </g>
        ))}
        <text x={PAD.l} y={H - 8} className="chart__tick">{nice(x0)}</text>
        <text x={W - PAD.r} y={H - 8} textAnchor="end" className="chart__tick">{nice(x1)}</text>
        <text x={(W + PAD.l) / 2} y={H - 8} textAnchor="middle" className="chart__axis">{xLabel}</text>
        {markers?.map((m) => (
          <g key={m.label}>
            <line x1={sx(m.x)} x2={sx(m.x)} y1={PAD.t} y2={H - PAD.b} className="chart__marker" />
            <text x={sx(m.x) + 4} y={PAD.t + 10} className="chart__tick">{m.label}</text>
          </g>
        ))}
        {series.map((s) => (
          <path key={s.name} pathLength={1} className="chart__line" style={{ stroke: TONE[s.tone ?? 'violet'] }}
            d={s.points.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0]).toFixed(1)} ${sy(p[1]).toFixed(1)}`).join(' ')} />
        ))}
      </svg>
      <div className="chart__legend">
        <span className="chart__ylabel">{yLabel}{logY ? ' (log scale)' : ''}</span>
        {series.length > 1 && series.map((s) => <span key={s.name}><i style={{ background: TONE[s.tone ?? 'violet'] }} />{s.name}</span>)}
      </div>
      {caption && <span className="w-cap">{caption}</span>}
    </div>
  );
}

const CLASS_COLOURS = ['#7c63d0', '#e8834d', '#3fa456', '#2f86ce', '#d9577a', '#2a9d8f', '#d5b07a', '#64728a', '#8c9a3c', '#a83a58'];

export function Scatter({ points, classes, xLabel, yLabel, caption }: Extract<Widget, { type: 'scatter' }>) {
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const sx = (x: number) => PAD.l + ((x - x0) / (x1 - x0 || 1)) * (W - PAD.l - PAD.r);
  const sy = (y: number) => PAD.t + (1 - (y - y0) / (y1 - y0 || 1)) * (H - PAD.t - PAD.b);
  return (
    <div className="chart w-panel">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${yLabel} against ${xLabel}`}>
        <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} className="chart__grid" />
        <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={H - PAD.b} className="chart__grid" />
        <text x={(W + PAD.l) / 2} y={H - 8} textAnchor="middle" className="chart__axis">{xLabel}</text>
        <text x={12} y={(H - PAD.b) / 2} className="chart__axis" transform={`rotate(-90 12 ${(H - PAD.b) / 2})`} textAnchor="middle">{yLabel}</text>
        {points.map(([x, y, c], i) => (
          <circle key={i} cx={sx(x)} cy={sy(y)} r="3" className="chart__dot" style={{ fill: CLASS_COLOURS[c % CLASS_COLOURS.length], animationDelay: `${Math.min(i, 300) * 2}ms` }} />
        ))}
      </svg>
      <div className="chart__legend">
        {classes.map((c, i) => <span key={c}><i style={{ background: CLASS_COLOURS[i % CLASS_COLOURS.length] }} />{c}</span>)}
      </div>
      {caption && <span className="w-cap">{caption}</span>}
    </div>
  );
}

export function Pixels({ images, caption }: Extract<Widget, { type: 'pixels' }>) {
  return (
    <div className="w-col w-wide">
      <div className="w-row">
        {images.map((img) => {
          const max = Math.max(...img.values, 1e-9);
          return (
            <figure key={img.label} className="pix">
              <svg viewBox={`0 0 ${img.size} ${img.size}`} width="76" height="76" role="img" aria-label={img.label}>
                {img.values.map((v, i) => (
                  <rect key={i} x={i % img.size} y={Math.floor(i / img.size)} width="1" height="1" style={{ fill: `color-mix(in srgb, var(--ink) ${Math.round((Math.max(0, v) / max) * 100)}%, var(--sheet))` }} />
                ))}
              </svg>
              <figcaption>{img.label}</figcaption>
            </figure>
          );
        })}
      </div>
      {caption && <span className="w-cap">{caption}</span>}
    </div>
  );
}
