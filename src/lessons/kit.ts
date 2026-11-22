/** Compact authoring helpers for lessons. A lesson = meta + scene objects + links + steps. */
import type { AppId, Lesson, LessonCtx, Metric, ObjectKind, SceneLink, SceneNode, Step, StepTag, Widget } from '../lesson/types';

/** Default positions for 3–7 objects on the 760 × 330 stage (zig-zag, like the reference). */
const LAYOUT: Record<number, [number, number][]> = {
  2: [[230, 220], [530, 160]],
  3: [[160, 230], [380, 150], [600, 230]],
  4: [[120, 240], [290, 150], [460, 240], [630, 150]],
  5: [[100, 244], [240, 158], [380, 244], [520, 158], [660, 244]],
  6: [[100, 244], [240, 158], [380, 244], [520, 158], [660, 244], [380, 76]],
  7: [[90, 250], [225, 165], [375, 250], [375, 80], [525, 165], [670, 250], [670, 80]],
};

/** [id, kind, label, sub?, { at?, appears?, hide? }] */
export type N = [string, ObjectKind, string, string?, { at?: [number, number]; appears?: number; hide?: number }?];
/** [from, to, tone?] — id is `${from}-${to}` */
export type Lk = [string, string, ('request' | 'grounded')?, [number, number]?];

export interface Meta {
  slug: string; phase: string; index: number; title: string; summary: string;
  minutes: number; level?: Lesson['level']; learn: string[];
}

export const link = (from: string, to: string) => `${from}-${to}`;

export function lesson(meta: Meta, nodes: N[], links: Lk[], steps: Step[], metrics: Metric[] = [], legend?: Lesson['legend']): Lesson {
  const pos = LAYOUT[Math.min(Math.max(nodes.length, 2), 7)];
  const sceneNodes: SceneNode[] = nodes.map(([id, kind, label, sub, o], i) => {
    const [x, y] = o?.at ?? pos[i] ?? [380, 160];
    return { id, kind, label, sub, x, y, appearsAt: o?.appears, hideAfter: o?.hide };
  });
  const sceneLinks: SceneLink[] = links.map(([from, to, tone, curve]) => ({ id: link(from, to), from, to, tone, curve }));
  return {
    slug: meta.slug, phase: meta.phase, index: meta.index, title: meta.title, summary: meta.summary,
    minutes: meta.minutes, level: meta.level ?? 'Beginner', youWillLearn: meta.learn,
    nodes: sceneNodes, links: sceneLinks, metrics, steps,
    legend: legend ?? [
      { label: 'flow', swatch: 'request' }, { label: 'data / result', swatch: 'grounded' },
      { label: 'already explained', swatch: 'done' }, { label: 'this step', swatch: 'focus' },
    ],
  };
}

type Extra = Partial<Pick<Step, 'draw' | 'packets' | 'callout' | 'widget' | 'source' | 'recap' | 'comingUp'>>;

/** One step. `focus` = object ids; `draw` = links as "from-to" ids. */
export function step(tag: StepTag, label: string, title: string, body: string, keyIdea: string, focus: string[], extra: Extra = {}): Step {
  return { tag, label, title, body, keyIdea, focus, ...extra };
}

/** Final recap step with a Question / Answer / Because table. */
export function recap(title: string, rows: [string, string, string][], chips: string[], comingUp: string, draw?: string[]): Step {
  return { tag: 'RECAP', label: 'Recap', title, focus: [], draw, recap: rows, comingUp, widget: { type: 'flow', chips } };
}

/** A metric row that holds the same value on every step from `from` onwards. */
export function metric(label: string, steps: number, values: Record<number, string | ((c: LessonCtx) => string)>): Metric {
  const out: Metric['values'] = [];
  let last: string | ((c: LessonCtx) => string) = '—';
  for (let i = 0; i < steps; i++) { if (values[i] !== undefined) last = values[i]; out.push(last); }
  return { label, values: out };
}

/** Shorthand widgets. */
export const W = {
  table: (head: string[], rows: (string | number)[][], caption?: string): Widget => ({ type: 'table', head, rows: rows.map((r) => r.map(String)), caption }),
  code: (title: string, code: string, note?: string): Widget => ({ type: 'code', title, code, note }),
  bars: (rows: [string, number, string?, ('good' | 'bad' | 'plain')?][], caption?: string, max?: number): Widget =>
    ({ type: 'bars', rows: () => rows.map(([label, value, display, tone]) => ({ label, value, display: display ?? String(value), tone: tone ?? 'plain' })), caption, max }),
  compare: (...cards: [string, 'violet' | 'orange' | 'green' | 'blue' | 'sheet', string[]][]): Widget => ({ type: 'compare', cards: cards.map(([title, tone, lines]) => ({ title, tone, lines })) }),
  flow: (...chips: string[]): Widget => ({ type: 'flow', chips }),
};

export const fmt = (n: number, d = 3) => (Math.abs(n) >= 1000 ? Math.round(n).toLocaleString('en-US') : Number(n.toFixed(d)).toString());
export const pct = (n: number, d = 1) => `${(n * 100).toFixed(d)}%`;

/** Real-world system for a lesson's live app: nodes with explicit stage positions, and links. */
export interface LiveSpec {
  app: AppId;
  nodes: [string, ObjectKind, string, string | undefined, [number, number]][];
  links: Lk[];
  /** Node that represents the model (highlighted). */
  model: string;
  title: string;
  body: string;
  keyIdea: string;
  source: string;
}

/**
 * Adds a LIVE APP step (just before the recap) that swaps the concept diagram for the real production system and
 * runs the live app underneath it. Metrics keep their previous value on the new step.
 */
export function withApp(l: Lesson, s: LiveSpec): Lesson {
  const at = l.steps.findIndex((x) => x.tag === 'RECAP');
  const pos = at < 0 ? l.steps.length : at;
  const links: SceneLink[] = s.links.map(([from, to, tone, curve]) => ({ id: `sys:${link(from, to)}`, from, to, tone, curve }));
  const live: Step = {
    tag: 'LIVE APP', label: 'Live app', title: s.title, body: s.body, keyIdea: s.keyIdea, scene: 'system',
    focus: [s.model], draw: links.map((k) => k.id), widget: { type: 'app', app: s.app }, source: s.source,
  };
  const steps = [...l.steps.slice(0, pos), live, ...l.steps.slice(pos)];
  const metrics = l.metrics.map((m) => ({ ...m, values: [...m.values.slice(0, pos), m.values[Math.max(0, pos - 1)], ...m.values.slice(pos)] }));
  return {
    ...l, steps, metrics,
    system: { nodes: s.nodes.map(([id, kind, label, sub, [x, y]]) => ({ id, kind, label, sub, x, y })), links },
  };
}
