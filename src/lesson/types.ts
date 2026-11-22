/** Lesson data model — every lesson is data, rendered by the scene engine. See docs/spec.md §5. */

export type ObjectKind =
  | 'user' | 'person' | 'browser' | 'laptop' | 'phone' | 'tv' | 'terminal'
  | 'server' | 'gateway' | 'search' | 'agent'
  | 'llm' | 'model' | 'dice'
  | 'db' | 'vector' | 'memory' | 'doc'
  | 'cache'
  | 'tokens' | 'queue' | 'pipeline'
  | 'tool' | 'plug' | 'skill'
  | 'shield'
  | 'judge' | 'trace' | 'dashboard'
  | 'inbox' | 'bin' | 'house' | 'bank' | 'machine' | 'antenna' | 'film' | 'tree' | 'forest';

export interface SceneNode {
  id: string;
  kind: ObjectKind;
  label: string;
  sub?: string;
  /** Centre of the object's base in stage coordinates (stage is 760 × 330). */
  x: number;
  y: number;
  /** Hidden until this step index (0-based). Defaults to always visible. */
  appearsAt?: number;
  /** Hidden after this step index (0-based). */
  hideAfter?: number;
}

export interface SceneLink {
  id: string;
  from: string;
  to: string;
  /** 'request' = ink, 'grounded' = green */
  tone?: 'request' | 'grounded';
  /** Optional quadratic control point for a curved link. */
  curve?: [number, number];
}

export type StepTag = 'PROBLEM' | 'CONCEPT' | 'TRY IT' | 'CASE' | 'LIVE APP' | 'RECAP';

/** Interactive state shared by a lesson's widgets (e.g. the temperature dial). */
export interface LessonCtx { temp: number }

export interface Bar { label: string; value: number; display?: string; tone?: 'good' | 'bad' | 'plain' }
export interface Choice { text: string; correct: boolean; why: string }

export type Widget =
  | { type: 'transcript'; title?: string; messages: { role: 'user' | 'assistant' | 'system' | 'note'; text: string; tone?: 'bad' | 'good' }[]; aside?: { title: string; text: string; highlight?: string } }
  | { type: 'tokens'; tokens: { text: string; id: number }[] }
  | { type: 'samples'; samples: { name: string; text: string; chars: number; tokens: { text: string; id: number }[] }[] }
  | { type: 'vectors'; words: { word: string; values: number[] }[]; pairs: { a: string; b: string; cos: number }[] }
  | { type: 'attention'; tokens: { text: string; weight: number }[]; caption: string }
  | { type: 'bars'; rows: (ctx: LessonCtx) => Bar[]; max?: number; dial?: boolean; caption?: string }
  | { type: 'flow'; chips: string[] }
  | { type: 'compare'; cards: { title: string; tone: 'violet' | 'orange' | 'green' | 'blue' | 'sheet'; lines: string[] }[] }
  | { type: 'code'; title: string; code: string; note?: string; bad?: boolean; run?: { label: string; inputs: string[]; fn: (input: string) => string } }
  | { type: 'table'; head: string[]; rows: string[][]; caption?: string }
  | { type: 'quiz'; items: { prompt: string; choices: Choice[] }[] }
  | { type: 'picker'; title: string; options: { label: string; detail: string; result: string; tone?: 'good' | 'bad' }[] }
  | { type: 'calc' }
  | { type: 'line'; series: { name: string; points: [number, number][]; tone?: 'violet' | 'orange' | 'green' | 'ink' | 'rust' }[]; xLabel: string; yLabel: string; logY?: boolean; caption?: string; markers?: { x: number; label: string }[] }
  | { type: 'scatter'; points: [number, number, number][]; classes: string[]; xLabel: string; yLabel: string; caption?: string }
  | { type: 'pixels'; images: { label: string; size: number; values: number[] }[]; caption?: string }
  | { type: 'app'; app: AppId };

/** Live apps: real public data replayed through real trained models, in the browser. See src/apps/. */
export type AppId =
  | 'inbox-rules' | 'inbox-logreg' | 'inbox-svm' | 'inbox-metrics' | 'inbox-pipeline' | 'inbox-bayes'
  | 'homes-line' | 'homes-features' | 'homes-depth' | 'homes-lasso' | 'homes-skew'
  | 'movies-knn' | 'movies-segments'
  | 'loans-tree' | 'loans-ensemble' | 'loans-tuning'
  | 'sensor-forecast' | 'sensor-anomaly' | 'sensor-drift'
  | 'cards-fraud' | 'serving-load';

export interface Callout { text: string; at: string; tone: 'sheet' | 'violet' | 'orange' | 'green'; place?: 'above' | 'below' }

export interface Step {
  label: string;
  tag: StepTag;
  title: string;
  body?: string;
  keyIdea?: string;
  /** Node ids highlighted (green pad) in this step. */
  focus: string[];
  /** Link ids that draw in (animated) during this step; they stay solid afterwards. */
  draw?: string[];
  /** Link ids that carry packets this step (defaults to `draw`). */
  packets?: string[];
  callout?: Callout | ((ctx: LessonCtx) => Callout);
  widget?: Widget;
  /** 'system' = this step shows the lesson's real production system instead of the concept diagram. */
  scene?: 'system';
  /** Where the numbers in this step come from (shown under the widget). */
  source?: string;
  /** Recap table rows: question, answer, because. */
  recap?: [string, string, string][];
  comingUp?: string;
}

export interface Metric { label: string; values: (string | ((ctx: LessonCtx) => string))[] }

export interface Lesson {
  slug: string;
  phase: string;        // folder id in the course tree, e.g. 'SH' or '11'
  index: number;        // 0-based position in that folder
  title: string;
  summary: string;
  minutes: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  youWillLearn: string[];
  nodes: SceneNode[];
  links: SceneLink[];
  metrics: Metric[];
  steps: Step[];
  /** The real-world system behind the lesson's live app (shown on steps with scene: 'system'). */
  system?: { nodes: SceneNode[]; links: SceneLink[] };
  legend: { label: string; swatch: 'request' | 'grounded' | 'done' | 'focus' }[];
}
