# Sample PR: add a new lesson

A complete example of adding a lesson to a coming-soon module, with its live app.
Use it as a blueprint; open a [new-lesson issue](../../.github/ISSUE_TEMPLATE/new-lesson.yml) first so nobody duplicates work.

---

**Title:** `Add lesson: Gradient Descent (01 · Deep Learning Core, lesson 1)`

**Body** (from the [add-lesson template](../../.github/PULL_REQUEST_TEMPLATE/add-lesson.md)):

> ## New lesson: Gradient Descent
>
> **Module / position:** 01 · Deep Learning Core, lesson 1
> **Live app:** "Price tuner" — a pricing service that learns a demand curve live, one gradient step at a time
> **Closes:** #57
>
> ### The story
> A pricing team's model is off by 30%. The learner watches the loss surface, takes gradient steps by hand,
> breaks training with a learning rate that is too high, then fixes it — and finally runs the live price tuner.
>
> ### Steps
> | # | Tag | Title | Objects in focus | Widget |
> |---|---|---|---|---|
> | 1 | PROBLEM | The model is 30% off | `data`, `model` | table |
> | 2 | CONCEPT | Walk downhill | `model`, `loss` | line chart |
> | 3 | TRY IT | Pick a learning rate | `loss` | bars + dial |
> | 4 | LIVE APP | Train the price tuner live | real system | app |
> | 5 | RECAP | Downhill, carefully | — | flow |
>
> ### Data
> - Script: `scripts/data/measure_m01.py` → `src/lessons/data/m01.json`
> - Every number in the lesson comes from that file.
>
> ### Checklist
> - [x] Lesson added to `BUILT` · [x] real system + live app · [x] build and checks pass · [x] spec updated

---

## The files

### 1. Measure the numbers — `scripts/data/measure_m01.py`

```python
"""01 · Deep Learning Core — gradient descent on a real dataset. Usage: python measure_m01.py ../../src/lessons/data/m01.json"""
import json, sys, numpy as np
from sklearn.datasets import fetch_california_housing
X, y = fetch_california_housing(return_X_y=True)
x = (X[:, 0] - X[:, 0].mean()) / X[:, 0].std()        # one standardised feature
out = {"runs": {}}
for lr in [0.01, 0.1, 1.0, 2.1]:
    w = b = 0.0; loss = []
    for _ in range(40):
        err = w * x + b - y
        loss.append(float((err ** 2).mean()))
        w -= lr * 2 * (err * x).mean(); b -= lr * 2 * err.mean()
    out["runs"][str(lr)] = [round(v, 4) for v in loss]
json.dump(out, open(sys.argv[1], "w"))
```

### 2. Write the lesson — `src/lessons/m01.ts`

```ts
import D from './data/m01.json';
import type { Lesson } from '../lesson/types';
import { W, lesson, recap, step } from './kit';

const SRC = 'Measured by scripts/data/measure_m01.py';
export const M01: Lesson[] = [
  lesson(
    { slug: 'gradient-descent', phase: '03', index: 0, title: 'Gradient Descent', minutes: 9,
      summary: `With a learning rate of 0.1 the loss falls from ${D.runs['0.1'][0]} to ${D.runs['0.1'][39]} in 40 steps; at 2.1 it explodes.`,
      learn: ['Loss as a landscape', 'The gradient', 'Learning rate', 'Divergence'] },
    // scene objects: [id, kind, label, sub?]  — pick kinds that look like the real thing (/objects)
    [['data', 'db', 'Sales data'], ['model', 'model', 'Price model'], ['loss', 'dashboard', 'Loss']],
    [['data', 'model'], ['model', 'loss', 'grounded']],
    [
      step('PROBLEM', 'Off by 30%', 'The model is 30% off', '…', 'Training = repeatedly nudging weights to reduce the loss.', ['data', 'model'], { source: SRC }),
      step('CONCEPT', 'Downhill', 'Walk downhill', '…', 'The gradient points uphill; step the other way.', ['model', 'loss'], {
        draw: ['model-loss'],
        widget: { type: 'line', xLabel: 'step', yLabel: 'loss', series: Object.entries(D.runs).slice(0, 3).map(([lr, l]) => ({ name: `lr ${lr}`, points: l.map((v, i) => [i, v] as [number, number]) })) },
        source: SRC,
      }),
      recap('Downhill, carefully', [['What moves?', 'The weights', 'Against the gradient'], ['Too big a step?', 'Diverges', `lr 2.1`]], ['loss', '→ gradient', '→ step', '→ repeat'], 'Next: backpropagation.'),
    ],
  ),
];
```

### 3. Add the live app step — `src/lessons/m01-live.ts`

Follow `src/lessons/p02-live.ts`: describe the **real system** (objects with stage positions and links) and the app,
then wrap the lessons with `withApp(lesson, spec)`. Put the app component in `src/apps/` and register its id in
`AppId` (`src/lesson/types.ts`) and `src/apps/AppView.tsx`.

### 4. Register it — `src/lib/course.ts`

```diff
-export const BUILT: Lesson[] = [...P02];
+export const BUILT: Lesson[] = [...P02, ...M01];
```

The sidebar, sitemap, preview card (`/og/learn/gradient-descent.png`) and SEO tags are generated automatically.

### 5. Check and document

```bash
npm run typecheck && npm run build && npm run check:apps
```

Add a line to `docs/spec.md` (build status + changelog), take light/dark screenshots, and open the PR with `?template=add-lesson.md`.
