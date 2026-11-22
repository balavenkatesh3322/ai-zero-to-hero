/** 01 · Deep Learning Core — lesson 6: Optimizers. All numbers from scripts/data/measure_m01.py (m01.json). */
import D from './data/m01.json';
import type { Lesson } from '../lesson/types';
import { W, lesson, recap, step, withApp } from './kit';

const SRC = `Trained by ${D.provenance.script} on ${D.moments.n.toLocaleString('en-US')} real California districts (${D.provenance.dataset}) · ${D.provenance.measuredAt}`;
const P = '03'; // source phase id; shown as 01 · Deep Learning Core
const S = D.summary;
const fmtL = (v: number) => (v > 999 ? Math.round(v).toLocaleString('en-US') : v.toFixed(3));
const curve = (kind: keyof typeof D.curves, lr: string) => (D.curves[kind] as Record<string, number[]>)[lr].map((v, i) => [i * 3, v] as [number, number]);
const steps = (kind: keyof typeof S, lr: string) => (S[kind] as Record<string, { steps: number | null; final: number }>)[lr];

const base = lesson(
  {
    slug: 'optimizers-sgd-momentum-adam', phase: P, index: 5, title: 'Optimizers: SGD, Momentum, Adam', minutes: 10, level: 'Intermediate',
    summary: `Same model, same data: plain gradient descent needs ${steps('gd', '0.05').steps} steps, momentum ${steps('momentum', '0.03').steps}, Adam ${steps('adam', '0.1').steps} — and scaling the input cuts it to ${D.scaledGdSteps}.`,
    learn: ['The loss landscape', 'Learning rate limits', 'Momentum', 'Adam’s per-parameter steps', 'Scale first, then optimise'],
  },
  [['data', 'db', 'Training data', `${D.moments.n.toLocaleString('en-US')} rows`], ['grad', 'pipeline', 'Gradient', 'slope of loss'], ['opt', 'tool', 'Optimizer', 'the update rule'], ['model', 'model', 'Price model', 'w · income + b'], ['loss', 'dashboard', 'Loss']],
  [['data', 'grad'], ['grad', 'opt'], ['opt', 'model'], ['model', 'loss', 'grounded']],
  [
    step('PROBLEM', 'Stuck', 'Training crawls — or explodes',
      `A price model with two weights, trained on real census districts. With gradient descent at learning rate 0.01, loss is still ${fmtL(steps('gd', '0.01').final)} after 150 steps (best possible ${D.optimum.loss.toFixed(3)}). Nudge the rate to 0.055 and it explodes to ${fmtL(steps('gd', '0.055').final)}.`,
      'An optimizer decides how big a step to take, and in which direction, each time the model updates.', ['data', 'model'],
      { widget: { type: 'line', logY: true, xLabel: 'step', yLabel: 'loss', series: [{ name: 'lr 0.01', points: curve('gd', '0.01'), tone: 'orange' }, { name: 'lr 0.05', points: curve('gd', '0.05'), tone: 'green' }, { name: 'lr 0.055', points: curve('gd', '0.055'), tone: 'rust' }], caption: 'Gradient descent, same start, three learning rates (log scale).' }, source: SRC }),
    step('CONCEPT', 'Valley', 'A long, narrow valley',
      `Income is in $10k units (0.5 to 15) while the intercept moves around 1, so the loss surface is a steep-sided, flat-bottomed valley. The steep direction caps the learning rate; along the flat floor the steps are tiny. Best stable rate: 0.05 → ${steps('gd', '0.05').steps} steps to reach the best fit.`,
      'The steepest direction limits the step size for every direction.', ['grad', 'opt'],
      { draw: ['data-grad', 'grad-opt'], widget: W.table(['Learning rate', 'Loss after 150 steps', 'Steps to best fit'], (D.lrs.gd as number[]).map((lr) => [String(lr), fmtL(steps('gd', String(lr)).final), steps('gd', String(lr)).steps ?? (steps('gd', String(lr)).final > 100 ? 'diverged' : '> 150')])), source: SRC }),
    step('CONCEPT', 'Momentum', 'Momentum: keep rolling',
      `Momentum adds up past gradients: zig-zags cancel, the consistent downhill direction builds speed. At learning rate 0.03 it reaches the best fit in ${steps('momentum', '0.03').steps} steps — ${Math.round((steps('gd', '0.05').steps ?? 0) / (steps('momentum', '0.03').steps ?? 1))}× fewer than plain gradient descent.`,
      'velocity = 0.9 × velocity + gradient; weights −= lr × velocity.', ['opt', 'model'],
      { draw: ['opt-model'], widget: { type: 'line', logY: true, xLabel: 'step', yLabel: 'loss', series: [{ name: 'GD lr 0.05', points: curve('gd', '0.05'), tone: 'rust' }, { name: 'Momentum lr 0.03', points: curve('momentum', '0.03'), tone: 'violet' }] }, source: SRC }),
    step('CONCEPT', 'Adam', 'Adam: a step size per weight',
      `Adam divides each weight’s step by a running size of its gradients, so the steep and flat directions move at similar speeds. Learning rate 0.1 → ${steps('adam', '0.1').steps} steps; 0.3 → ${steps('adam', '0.3').steps}. It is far less sensitive to the exact rate. AdamW is Adam with weight decay applied separately from the gradient — the default for training transformers.`,
      'Adam = momentum + per-parameter scaling. It forgives badly scaled inputs.', ['opt'],
      { widget: W.table(['Adam learning rate', 'Loss after 150 steps', 'Steps to best fit'], (D.lrs.adam as number[]).map((lr) => [String(lr), fmtL(steps('adam', String(lr)).final), steps('adam', String(lr)).steps ?? '> 150'])), source: SRC }),
    step('CASE', 'Scale', 'Case: fix the cause, not the symptom',
      `Standardise income (subtract the mean, divide by the spread) and the valley becomes round. Plain gradient descent then reaches the same best fit in ${D.scaledGdSteps} steps — faster than any optimizer on the raw input.`,
      'Better optimizers help; well-scaled inputs help more. Do both.', ['data', 'grad'], { source: SRC }),
    recap('Downhill, with the right stride', [
      ['Why crawl?', 'Long narrow valley', 'Badly scaled input'],
      ['Max learning rate?', 'Set by steepest direction', '0.05 here; 0.055 explodes'],
      ['Momentum?', 'Accumulate direction', `${steps('momentum', '0.03').steps} steps`],
      ['Adam?', 'Per-weight step size', `${steps('adam', '0.1').steps} steps, robust`],
      ['First fix?', 'Scale the features', `${D.scaledGdSteps} steps`],
    ], ['gradient', '→ update rule', '→ step', '→ repeat'], 'Next in Deep Learning Core: regularization — dropout, weight decay and batch norm.'),
  ],
  [],
);

export const M01: Lesson[] = [
  withApp(base, {
    app: 'optim-race', model: 'trainer',
    nodes: [
      ['eng', 'person', 'ML engineer', undefined, [86, 236]], ['nb', 'laptop', 'Notebook', undefined, [228, 150]],
      ['trainer', 'server', 'Training job', undefined, [374, 236]], ['data', 'db', 'Training data', '16,512 rows', [374, 84]],
      ['model', 'model', 'Price model', undefined, [520, 150]], ['dash', 'dashboard', 'Loss curves', undefined, [668, 236]],
    ],
    links: [['eng', 'nb'], ['nb', 'trainer'], ['data', 'trainer'], ['trainer', 'model'], ['model', 'dash', 'grounded']],
    title: 'Live: race the optimizers on a real loss landscape',
    body: 'Every dot is a training step computed right now on all real training districts. Change a learning rate and the race restarts: watch gradient descent zig-zag, momentum overshoot and settle, Adam walk straight in — and gradient descent blow up when the rate is too high.',
    keyIdea: 'Pick the optimizer and the learning rate together, and always check the loss curve.',
    source: `${SRC} · Live app · every step computed in your browser`,
  }),
];
