/** Shared pieces of the live apps: lazy real-data loading, a pausable clock, the app window frame, small UI atoms. */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type Inbox from '../lessons/data/apps/inbox.json';
import type Homes from '../lessons/data/apps/homes.json';
import type Movies from '../lessons/data/apps/movies.json';
import type Loans from '../lessons/data/apps/loans.json';
import type Sensor from '../lessons/data/apps/sensor.json';
import type Cards from '../lessons/data/apps/cards.json';
import type Serving from '../lessons/data/apps/serving.json';

export interface DataMap { inbox: typeof Inbox; homes: typeof Homes; movies: typeof Movies; loans: typeof Loans; sensor: typeof Sensor; cards: typeof Cards; serving: typeof Serving }
const LOAD: { [K in keyof DataMap]: () => Promise<{ default: DataMap[K] }> } = {
  inbox: () => import('../lessons/data/apps/inbox.json'),
  homes: () => import('../lessons/data/apps/homes.json'),
  movies: () => import('../lessons/data/apps/movies.json'),
  loans: () => import('../lessons/data/apps/loans.json'),
  sensor: () => import('../lessons/data/apps/sensor.json'),
  cards: () => import('../lessons/data/apps/cards.json'),
  serving: () => import('../lessons/data/apps/serving.json'),
};
const cache: Partial<DataMap> = {};

/** Loads one app's measured data file on demand (kept out of the main bundle). */
export function useData<K extends keyof DataMap>(name: K): DataMap[K] | null {
  const [d, setD] = useState<DataMap[K] | null>((cache[name] as DataMap[K]) ?? null);
  useEffect(() => {
    if (d) return;
    let live = true;
    LOAD[name]().then((m) => { cache[name] = m.default as never; if (live) setD(m.default); });
    return () => { live = false; };
  }, [name, d]);
  return d;
}

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A clock that ticks every `ms` while playing. Returns [tick, playing, setPlaying]. */
export function useClock(ms: number, max = Infinity): [number, boolean, (p: boolean) => void, (t: number) => void] {
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(!reduced());
  const maxRef = useRef(max); maxRef.current = max;
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTick((t) => (t + 1 >= maxRef.current ? t : t + 1)), ms);
    return () => clearInterval(id);
  }, [playing, ms]);
  return [tick, playing, setPlaying, setTick];
}

interface FrameProps { name: string; icon: string; source: string; playing?: boolean; onToggle?: () => void; status?: ReactNode; children: ReactNode }

/** A small app window: title bar with live indicator, body, and a data-source footer. */
export function AppFrame({ name, icon, source, playing, onToggle, status, children }: FrameProps) {
  return (
    <section className="app-win" aria-label={`${name} (live app)`}>
      <header className="app-win__bar">
        <span className="app-win__dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="app-win__icon" aria-hidden="true">{icon}</span>
        <strong className="app-win__name">{name}</strong>
        {status && <span className="app-win__status">{status}</span>}
        {onToggle && (
          <button type="button" className={`app-live${playing ? ' is-on' : ''}`} onClick={onToggle} aria-pressed={playing} title={playing ? 'Pause the live feed' : 'Resume the live feed'}>
            <span className="app-live__dot" aria-hidden="true" />{playing ? 'LIVE' : 'PAUSED'}
          </button>
        )}
      </header>
      <div className="app-win__body">{children}</div>
      <footer className="app-win__src">Real data · {source}</footer>
    </section>
  );
}

export function Loading({ what }: { what: string }) {
  return <div className="app-win app-win--loading" role="status">Loading {what}…</div>;
}

export function Stat({ k, v, tone }: { k: string; v: ReactNode; tone?: 'good' | 'bad' }) {
  return <div className={`astat${tone ? ` astat--${tone}` : ''}`}><span className="astat__k">{k}</span><span className="astat__v">{v}</span></div>;
}

export function Slider({ label, min, max, step, value, onChange, show }: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void; show: string }) {
  return (
    <label className="aslider">
      <span className="aslider__k">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="aslider__v">{show}</span>
    </label>
  );
}

export function Seg<T extends string | number>({ options, value, onChange, label }: { options: [T, string][]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="aseg" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => <button key={String(v)} type="button" role="radio" aria-checked={v === value} className={v === value ? 'is-on' : ''} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  );
}

export const pct = (n: number, d = 1) => (Number.isFinite(n) ? `${(n * 100).toFixed(d)}%` : '—');
export const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
export const ratio = (a: number, b: number) => (b ? a / b : NaN);

/** Deterministic PRNG (mulberry32) — used only for seeded algorithm initialisation, never to make data. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Confusion counts → the usual metrics. */
export function metrics(c: { tp: number; fp: number; fn: number; tn: number }) {
  const n = c.tp + c.fp + c.fn + c.tn;
  const precision = ratio(c.tp, c.tp + c.fp), recall = ratio(c.tp, c.tp + c.fn);
  return { n, accuracy: ratio(c.tp + c.tn, n), precision, recall, f1: ratio(2 * precision * recall, precision + recall) };
}
