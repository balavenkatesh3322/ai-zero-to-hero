# AI Zero to Hero

A free, open-source, interactive AI engineering course. Every idea is an animated system you step through, starting from a real incident — and every lesson ends with a **live app** running real data through a real model, inside the real system it belongs to.
Created by [Bala Venkatesh](https://balavenkatesh.is-a.dev/). Curriculum adapted from [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) (MIT): 20 phases and 542 lessons. Live today: **00 · ML Fundamentals** (21 lessons with live apps); the later phases are coming soon.

**Live site:** https://ai-zero-to-hero.vercel.app

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
```

## Project layout

| Path | What it is |
|---|---|
| `docs/spec.md` | Product spec: the living source of truth |
| `docs/curriculum*.md`, `docs/curriculum.json` | Full 561-unit curriculum (regenerate with `scripts/gen_curriculum.py`) |
| `src/lesson/` | Lesson engine: `Stage` (scene, draw-in arrows, packets), `SceneObject` + `art.ts`/`iso.ts` (realistic isometric objects, gallery at `#/objects`), widgets, stepper, step card |
| `src/lessons/` | Lessons as data: `p02.ts` (concept steps) + `p02-live.ts` (real system + live app per lesson), written with the helpers in `kit.ts` |
| `src/apps/` | Live apps: spam filter, home values, recommender/segments, loan desk, machine monitoring, card fraud, serving load test |
| `archive/` | Removed lessons (Start Here, Phases 00–01) and their scripts/data, not built |
| `src/components/` | Header and course sidebar (colour folders and the "Show" filter) |
| `src/styles/` | Design tokens (light/dark) and styles |

## Data policy: no invented numbers

Every number a lesson shows is measured or published, and each step names its source under the panel.
- **Concept steps** use models trained on public datasets by `scripts/data/measure_p02.py`.
- **Live apps** use `scripts/data/measure_apps.py`: SMS Spam Collection (CC BY 4.0), California Housing, MovieLens 100K (research use, derived values only), German Credit (CC BY 4.0), NAB machine temperature (MIT), ULB credit-card fraud (DbCL). The browser runs the exported models; `npm run check:apps` verifies they match scikit-learn.

```bash
cd scripts/data && uv venv --python 3.12 .venv
VIRTUAL_ENV=.venv uv pip install scikit-learn==1.5.2 scipy==1.14.1 pandas==2.2.3 pyarrow==18.0.0 statsmodels==0.14.4
.venv/bin/python measure_p02.py ../../src/lessons/data/p02.json
# live apps: download the raw files once (URLs are in the script header), then
.venv/bin/python measure_apps.py <download-dir> ../../src/lessons/data/apps
cd ../.. && npm run check:apps
```

Curriculum data: `python3 scripts/parse_readme.py scripts/data/aefs.json && python3 scripts/gen_curriculum.py scripts/data/aefs.json docs`.

## Write a lesson

Copy a lesson in `src/lessons/p02.ts`, describe the scene (`nodes`, `links`) and the `steps` (each step lists the nodes it `focus`es and the links it `draw`s), add its real system and live app in `p02-live.ts` (pick objects that look like the real thing — see `#/objects`), then register it in `BUILT` in `src/lib/course.ts`. See `docs/spec.md` §5 for the format.

## License

MIT
