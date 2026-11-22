# AI Zero to Hero — Project Spec

> Living document. Updated every time the design or plan changes. Last updated: **2026-11-22** (v12).
> UX canvas: https://claude.ai/artifact/RryZduvpNLQZf4qiCmhm5K · Curriculum: [`curriculum.md`](curriculum.md)

## 1. What it is
An **open-source, interactive course** that takes anyone from "what is an LLM?" to designing production AI systems.
Every concept is an **animated isometric scene you step through**, starting from a **real incident**: theory comes in only when you need it.

- **Creator:** Bala Venkatesh, Lead AI Engineer & Enterprise Architect ([balavenkatesh.is-a.dev](https://balavenkatesh.is-a.dev/)), credited in every header.
- **License:** MIT (code + lessons). Curriculum outline adapted from `rohitg00/ai-engineering-from-scratch` (MIT), credited in-app.
- **Model:** **free and open source for everyone**. Anyone can contribute lessons, scenes, translations and fixes.
- **Visual language:** matches *designed-to-scale* (warm paper, JetBrains Mono, ink-outlined pop buttons, isometric step-through diagrams, light + dark), with our own brand, icons and content.

## 2. Status of decisions
| Decision | Status |
|---|---|
| Name: **AI Zero to Hero** | ✅ decided |
| Open source, everything free in v1 | ✅ decided |
| Pro / pricing | ⏸ **future plan**: design kept (canvas board 03), hidden from the app, see §9 |
| Curriculum: all **20 phases · 542 lessons** of ai-engineering-from-scratch (1:1) + Start Here (7) + 12 design cases = 561 units | ✅ drafted, awaiting review |
| Domain, GitHub org/repo URL | ⏳ open |
| UX approval → start Phase 1 build | ✅ approved; building screen by screen, each one approved before the next |

## 3. Audience
1. **Beginners**: no AI background; need the very basics without a maths wall.
2. **Developers moving into AI**: want RAG, tool calling, MCP and agents, fast and visual.
3. **Interview candidates**: AI system design and LLM internals.
4. **Contributors**: engineers who want to teach a topic they know.

## 4. Information architecture (screens)
| # | Screen | Purpose | Canvas board |
|---|---|---|---|
| 1 | **Learn**: lesson player | 3 panels: course tree · animated scene + metrics + stepper · step card (tag, title, body, key idea, Back/Next) + "You'll learn" | `Main` |
| 2 | **Practice**: incident scenarios | pager alert → trace → diagnose (multiple choice) → instant feedback; free | `Practice` |
| 3 | **Course map** | 6-level stack, modules per level, incident hook, lesson chips, learning-path filter | `Map` |
| 4 | **Find your level** | 4-question placement → start module, path, hours | `Level` |
| 5 | **System Design Studio** | 7-stage interview walkthrough with live napkin math and trade-off controls | `Design` |
| 6 | **Cheatsheets** | one screen per idea, filter by level, free PDF download | `Cheatsheets` |
| 7 | **My progress** | resume card, streak, level progress, activity, skills, certificates (free) | `Profile` |
| 8 | **Contribute** | how to contribute, lesson anatomy, good first issues, module status board, contributors | `Contribute` |
| 9 | **Coming-soon template** | dimmed preview + "watch on GitHub" + vote; used by Build Lab and every unreleased module | `BuildLab` |
| — | Pricing (**future, hidden**) | Free / Pro / Lifetime / Team design, parked | `Pro` |
| — | Product plan | vision, curriculum table, roadmap, stack, metrics | `Plan` |
| — | Icon library | isometric node icons used in all scenes | `Icons` + `Node` |

Global header (one row at ≥1280px, everything vertically centred at 32px height): logo · Learn · Course map · Practice · System Design · Cheatsheets · *spacer* · search (220px, ⌘K) · language · theme toggle · GitHub icon (→ Contribute) · creator credit ("created by Bala Venkatesh").

### Lesson player layout rules (match designed-to-scale)
- **Full-viewport app**: the page is exactly 100vh; the three columns scroll internally. On screens <1100px it becomes a normal scrolling page and the columns stack.
- **Course sidebar = flat list of colour folders** (Start Here + Phases 00–19, no volume labels), exactly like the reference: chevron rotates 90° (0.3s), the folder body slides open (grid-rows 0fr→1fr, 0.34s) with the lessons hanging off a tree line; **several folders can be open at once**; the list scrolls inside its own panel; PROGRESS pinned at the bottom.
- **"Show" dropdown** above the folders filters them: All phases · Start Here · Foundations · Deep Learning · Language · Large Language Models · Agents & Protocols · Production & Safety · topic paths (Very basics, RAG, Tool calling, MCP, Agent Skills, Agents, Evaluation, Security & safety). Menu is a pop card (ink border, offset shadow) with a ✓ on the current choice.
- **Arrow animation (key interaction):** when a step starts, its connector **draws itself in** (stroke-dashoffset 1→0, 0.9s, ease-in-out), then the **arrowhead pops in** at the destination (scale 0.3→1 at 0.82s), then request packets (orange `#f3b47f`, responses green `#9fd28f`) travel along it. Walked connectors stay solid ink with arrowheads; not-yet-explained connectors are dashed grey without heads. The "In this lesson" rail fills with an ink line (0.7s) as you advance. Reduced-motion users get the final state without animation.
- **"In this lesson" stepper is a pinned footer** of the centre panel (numbered circles with labels, ✓ for completed steps, current = green pop). The same footer appears on Practice ("In this incident") and System Design ("Interview stages").
- **The scene builds up and stays**: nodes appear when first explained and stay visible (mint = already explained, green = this step, links turn solid once walked). New parts of the system appear in place (e.g. `policy.md` joins the scene at the Case step).
- **Recap step shows the finished system**: every node visible, the full path animated, and the step card switches to a **Question / Decision / Because** table plus a "Coming up" box; the Next button becomes "Finish lesson ✓".

## 5. Lesson format
Each lesson is **data**, not hand-built pages: one file per lesson (`lessons/<module>/<slug>.json` or `.mdx`):
```
id, module, title, minutes, difficulty, youWillLearn[]
scene:  nodes[{id, kind, label, x, y}], links[{from, to}]
steps[]: { label, tag: PROBLEM|CONCEPT|TRY IT|CASE|LIVE APP|RECAP, title, body, keyIdea, scene?: 'system',
           activeNodes[], activeLinks[], callout, metrics{}, detail: <widget id + props> }
practice[]: { alert, trace, question, options[{text, correct, feedback}] }
```
Widgets (reusable "detail" panels): token chips, vector bars, attention heat-row, probability bars + slider, table, chat transcript, cost bars, pipeline chips.
**Live apps (v11).** Every lesson has a LIVE APP step just before the recap. The stage swaps the concept diagram for the lesson's **real production system** (`lesson.system`, e.g. phone → SMS gateway → tokenizer → spam model → inbox / spam folder), and below it a small working app runs **real public data through the real trained models** in the browser (`src/apps/`, widget `{type:'app', app}`). Apps load their data on demand and can be paused; learners can also type or edit their own inputs.

Keyboard: ← → steps · R replay · Space pause · Ctrl K search. Every step has its own URL (`#/lesson-slug/3`) so it can be shared.

## 6. Design system
- **Font:** JetBrains Mono everywhere (400–800).
- **Light tokens:** paper `#f4ebe0`, card `#f8f0e6`, sheet `#f9f2e8`, line `#ddd3c5`, line-strong `#c6bbac`, ink `#1d1b18`, muted `#6f6961`, green `#cfe3b2`, green-2 `#b2d491`, violet `#e7ddf5`, orange `#fcdcbd`, red `#f8d5cf`, rust `#d0683a`.
- **Dark tokens:** paper `#211e1a`, card `#26231e`, line `#342f28`, ink `#efe6d6`, muted `#a3998b`, green `#3f4c2b`, violet `#493563`, orange `#5a4531`, red `#5f3a33`.
- **Components:** pop button (green, 1.5px ink border, `1.5px 2.5px 0` ink shadow) · ghost button · pill tags (PROBLEM red, CONCEPT violet, TRY IT green, CASE orange, RECAP grey) · metric chips · numbered stepper · isometric grid floor · module folders in 12 colours.
- **Scene object library: real objects, colour = role.** Every object is a small realistic isometric illustration built from real 3D geometry (`src/lesson/iso.ts` boxes, cylinders and discs projected to SVG; drawings in `src/lesson/art.ts`): a server is a rack with drive bays and LEDs, a person is a person, a database is stacked disks, a model is a chip on a board. 1.4px ink outlines, lit top / mid left / darker right faces, a soft ground shadow and a name pill underneath. **Never generic boxes or circles.** See all of them at `#/objects`.

  | Role | Colour | Objects |
  |---|---|---|
  | People & devices | shirts in role colours; dark devices | `user` (crowd), `person`, `browser`/`laptop`, `phone`, `tv`, `terminal` (card reader) |
  | Services / compute | blue `#a9c5e8` | `server` (rack), `gateway` (switch / load balancer), `search` (magnifier), `agent` (robot) |
  | Models | amber `#f6cd82` | `model` (chip), `llm` (chip + spark), `dice`, `tree`, `forest` |
  | Data | purple `#cbbae6` | `db` (stacked disks), `vector` (3-D scatter), `memory` (filing cabinet), `doc` (paper stack) |
  | Fast path | green `#b3d79f` | `cache` (RAM sticks) |
  | Pipelines & streams | orange `#f3b47f` | `tokens` (tiles), `queue` (conveyor with messages), `pipeline` (conveyor + station), `antenna` (sensor gateway) |
  | Tools, MCP, skills | teal `#9dd3c7` | `tool` (toolbox), `plug` (MCP), `skill` (books), `machine` (industrial machine) |
  | Safety | rose `#eba6b2` | `shield`, `bin` (spam / quarantine) |
  | Observability & evals | indigo `#b2baea` | `judge`, `trace`, `dashboard` (monitors) |
  | Places | warm | `house`, `bank`, `inbox` (mail tray), `film` (clapperboard) |

  States: **idle** (not yet explained, 45% opacity) · **done** (full colour) · **on** (sits on a green ground pad `#b3d79f` with a `#5fae57` outline, and its pill gets the pop shadow). Packets: request `#f3b47f`, response/grounded `#9fd28f`. Objects keep the same pastel colours in dark mode.
- Accessibility: real buttons and links, 44px targets on the stepper, text contrast ≥ 4.5:1 in both themes, reduced-motion stops packet animation.

## 7. Curriculum
**The complete `rohitg00/ai-engineering-from-scratch` curriculum, lesson for lesson: 20 phases · 542 lessons**, plus our **Start Here** primer (7) and **AI System Design** (12 cases) = **561 interactive units**.
- Overview: [`curriculum.md`](curriculum.md) · full catalogue: [`curriculum-full.md`](curriculum-full.md) · app data: [`curriculum.json`](curriculum.json) · regenerate from the repo README: `python3 scripts/gen_curriculum.py <parsed-readme.json> docs/`
- **Volumes** (match the book edition): V0 Start Here · V1 Foundations (P00–02) · V2 Deep Learning (P03, 04, 06) · V3 Language (P05, 07) · V4 Large Language Models (P08–11) · V5 Agents (P12–16) · V6 Production & Safety (P17–19).
- **Format per lesson:** repo *Learn* → Scene · repo *Build* → Scene + code lab · Phase 19 → Project.
- **Topic paths** (filters across all 542): Very basics · RAG (18) · Tool calling (11) · MCP (18) · Agent Skills (6) · Agents (27) · Evaluation (35) · Security & safety (25).
- Each phase opens with a real incident; learning paths and career routes follow aiengineeringfromscratch.com.

## 8. Open-source & contribution model
- Repo: `[github-org]/ai-zero-to-hero` (TBD). MIT. CONTRIBUTING.md + lesson template + scene preview tool.
- Ways to contribute: write a lesson (JSON/MDX) · design a scene · add a practice incident · translate · fix/review.
- Flow: pick an issue labelled `lesson-wanted` / `good-first-issue` → copy the template → preview locally (`npm run dev`) → PR → review by a maintainer (accuracy + format check) → merged → live.
- Every unreleased phase/lesson shows **SOON** with a "help write this" link to its issue.
- Recognition: contributor names on each lesson, a contributors wall, and contributor badges on profiles.
- Community: GitHub Discussions for questions (instead of a paid AI tutor in v1).

## 9. Future plan: monetisation (not in v1)
Parked until the course has traction (suggested trigger: 10k monthly learners or 5k GitHub stars). The design is kept on canvas board `Pro`.
- **Pro** ($12/mo or $96/yr): AI tutor per step, graded certificate exams, cloud sync, early access.
- **Founding lifetime** ($199, first 500).
- **Team** ($20/seat/mo): dashboards, SSO, private scenarios.
- Other options: sponsorships (clearly labelled), corporate workshops, paid certification exams, GitHub Sponsors / Open Collective from day 1.
- Principle: **lessons stay free forever**; only things with a running cost or business value (tutor, exams, team admin) would be paid.

## 10. Roadmap
| Phase | Scope |
|---|---|
| **1: Foundation (build first)** | Lesson engine + iso scene engine + icon library, light/dark, search, local progress. **69 units:** Start Here (7), P00 Setup & Tooling (13), P11 LLM Engineering (17), P13 Tools & Protocols 1–31 (tool calling, MCP, Agent Skills), System Design case 1, practice incidents. Course map, Find your level, Cheatsheets, Contribute. |
| 2 | **50 units:** P07 Transformers (16), P14 Agent Engineering 1–30, P05 20–23. Contributor preview tool. i18n (first 5 languages). |
| 3 | P10, P12, P14 31–54, P15, P16, P17, P18 + 4 design cases + Build Lab beta. Accounts + sync (optional). |
| 4 | P01–P04, P06, P08, P09, P13 32–45, P19 capstones (85), all design cases, certificates. |
| Later | Revisit §9 monetisation. |

## 10b. Build status (screen by screen, each approved before the next)
| # | Screen | Status |
|---|---|---|
| 1 | Learn: lesson player (header, colour-folder sidebar + Show filter + search, scene engine with draw-in arrows/packets, widgets, stepper, step card, recap, light/dark, keyboard ← → R Space, hash URLs per step, local progress, staged launch animation) | 🟡 built, awaiting approval |
| 1a | Start Here, Phase 00 and Phase 01 | ✂️ removed from the app on 2026-11-22 (sources kept in `archive/`) |
| 1b | **Phase 02 ML Fundamentals: 21 lessons, each with a live app** on real data (`scripts/data/measure_p02.py`, `measure_apps.py`) | 🟡 built, awaiting approval |
| 1d | **01 · Deep Learning Core — Optimizers** (lesson 6 of 13) with the optimizer-race live app (`scripts/data/measure_m01.py`) | 🟡 in review (PR) |
| 1c | **Realistic object library** (39 kinds, `#/objects`) | 🟡 built, awaiting approval |
| 2 | Course map | ⏳ coming-soon screen live |
| 3 | Practice | ⏳ coming-soon screen live |
| 4 | System Design Studio | ⏳ coming-soon screen live |
| 5 | Cheatsheets | ⏳ coming-soon screen live |
| 6 | Find your level | ⏳ |
| 7 | My progress | ⏳ |
| 8 | Contribute | ⏳ |
| 9 | Coming-soon template | ⏳ |

Run locally: `npm install && npm run dev` → http://localhost:5173

## 10b-1. What is live now
- **Live:** Phase 02 ML Fundamentals = **21 interactive lessons**, each ending in a live app inside its real system. Progress counts against these 21.
- **Live apps** (all real data, all models run in the browser):

  | App (real-world system) | Dataset (licence) | Lessons |
  |---|---|---|
  | SMS spam filter: phone → gateway → tokenizer → model → inbox / spam folder | SMS Spam Collection, Almeida & Gómez Hidalgo 2011 (CC BY 4.0) | 01 rules vs learning · 03 logistic regression & threshold · 05 SVM margin · 09 confusion matrix · 13 pipeline · 14 naive Bayes evidence |
  | Home-value estimator: owner → site → feature service + census DB → price model → estimate | California Housing, Pace & Barry 1997 (public, StatLib) | 02 linear regression · 08 feature engineering · 10 tree depth (bias/variance) · 18 lasso selection · 21 training-serving skew |
  | Streaming recommender & audience segments | MovieLens 100K, GroupLens (research use; only derived similarities and genre shares shipped) | 06 item-KNN · 07 k-means live |
  | Loan desk: applicant → bank app → credit history → risk model → decision | Statlog German Credit, Hofmann 1994 (CC BY 4.0) | 04 decision tree path · 11 forest vs boosting · 12 grid vs random search |
  | Factory monitoring: machine → sensor gateway → stream → model → dashboard / pager | NAB machine_temperature_system_failure, Numenta (MIT) | 15 forecasting · 16 anomaly alerts vs labelled failures · 20 drift (PSI) |
  | Card fraud screening: terminal → payment network → fraud model → bank → cardholder | Credit Card Fraud Detection, ULB / OpenML 1597 (DbCL 1.0) | 17 imbalanced data |
  | Model-serving load test | latencies measured on the build machine | 19 ML system design |
- **Sidebar default:** "Show: Available now" lists only Phase 02, plus one collapsed "19 more phases · SOON" row.
- **Coming soon:** every other phase, Course map, Practice, System Design and Cheatsheets (shared coming-soon screen).

## 10c. Data policy: no invented numbers
- **Model internals** (token IDs, embeddings, attention, next-token and whole-answer probabilities, model answers) are **measured** on a real open model (Qwen/Qwen2.5-0.5B-Instruct, float32, CPU) by `scripts/data/measure_start_here.py`, which writes `src/lessons/data/start-here.json` with provenance (model, revision, date).
- **Prices and context windows** are **published** values (Anthropic model table, cached 2026-11-03) in `src/lessons/data/pricing.ts`.
- **Worked examples** state their assumptions on screen; calculators use the learner's own numbers.
- Every step that shows numbers prints its source under the panel. When a measurement contradicts the planned story, the story changes. Example: the real model answered "30 days", not "90", so lesson 2 now uses a 14-day policy.

- **Live apps:** `scripts/data/measure_apps.py <downloads> src/lessons/data/apps` trains every model and exports weights, trees, histograms and real rows (one JSON per app, plus `summary.json` for lesson text). The browser re-implements only *inference* (naive Bayes, linear models, tree walking, boosting sums) and `npm run check:apps` proves it reproduces scikit-learn's predictions (max difference < 0.001). Live counters (confusion matrices, running errors, alerts, PSI) are computed from the rows the learner has actually watched; the full-test-set numbers are printed next to them. The only seeded randomness is the train/test split and k-means initialisation — never data.

## 10d. URLs, SEO & sharing
- **Numbering:** the course starts at **00 · ML Fundamentals** (marked START). Source phases 00 Setup and 01 Math are not part of the course; the remaining phases are renumbered 01–17 and show "coming soon".
- **Real paths, not hashes:** `/` (home = first lesson), `/learn/<slug>` (canonical lesson URL), `/learn/<slug>/<step>` (a step; canonical points to the lesson), `/map`, `/practice`, `/design`, `/cheatsheets`. Old `#/…` links redirect. Same-origin links navigate in-app.
- **One metadata source:** `src/lib/pages.ts` (`SITE`, `pageMeta`, `jsonLd`). In the browser `useSeo` updates title, description, canonical, robots, Open Graph, Twitter and JSON-LD on every navigation; at build time `scripts/seo/build.ts` prerenders a real HTML file per indexable page (home, 21 lessons, 4 sections) with the same head.
- **Preview cards:** 1200×630 PNGs generated at build time with resvg and JetBrains Mono (OFL, `scripts/seo/fonts/`), drawn with the course's own iso objects: `/og/site.png`, `/og/learn/<slug>.png` (eyebrow, title, measured summary, the lesson's real system and its live app), `/og/<section>.png`.
- **Icons & PWA:** `favicon.ico` (16/32/48), `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` (180), `icon-192/512.png`, maskable 512, `site.webmanifest`.
- **Crawling:** `sitemap.xml` (indexable pages + image entries), `robots.txt` (disallows `/objects`), coming-soon lesson pages are `noindex`.
- **JSON-LD:** `@graph` with WebSite, Person (creator, sameAs GitHub), SoftwareApplication (EducationalApplication, free, MIT, code repository) and the WebPage.
- **Hosting:** Vercel (`vercel.json`: Vite build, rewrites for steps and the SPA fallback, immutable caching for hashed assets). Repo: https://github.com/balavenkatesh3322/ai-zero-to-hero. Production URL is `SITE.url`.

## 11. Tech stack
**Vite 5 + React 18 + TypeScript** SPA, self-hosted JetBrains Mono (@fontsource) · lessons as JSON/MDX in the repo · hand-built SVG isometric scene engine · i18n JSON · localStorage progress (accounts optional later) · Vercel / GitHub Pages hosting · Plausible analytics · GitHub Actions: lint lessons against the schema, build previews per PR.

## 12. Success metrics (v1)
Lesson-1 completion ≥ 55% · weekly returning learners · GitHub stars & forks · contributors per month · merged lesson PRs · time-to-merge.

## Changelog
- **v13 (2026-11-22):** First Deep Learning Core lesson: Optimizers (gradient descent, momentum, Adam, mini-batch SGD) with a live optimizer race on the real loss landscape, computed exactly from data moments. A folder now counts as available as soon as it has a built lesson.
- **v12.2 (2026-11-22):** Light theme by default (only an explicit toggle is remembered); removed the language button; header GitHub button links to the repo; every step card links to “Open an issue” and “Edit on GitHub”; PR templates (general, add-lesson, edit-lesson), issue forms and two worked sample PRs in `docs/contributing/`.
- **v12.1 (2026-11-22):** Professional README (one-line statement, screenshots in `docs/screenshots/`, features, curriculum status, run/contribute sections), `CONTRIBUTING.md` and MIT `LICENSE`. Dataset and third-party details stay in this spec and the scripts, not the README.
- **v12 (2026-11-22):** SEO & sharing (per-page titles/descriptions, canonical URLs, generated Open Graph/Twitter cards, icons, manifest, sitemap, robots, JSON-LD), path URLs instead of hashes, ML Fundamentals renumbered as 00 · START with later phases 01–17 coming soon, deployment to Vercel from GitHub.
- **v11 (2026-11-22):** Removed Start Here, Phase 00 and Phase 01 from the app (archived). Every ML Fundamentals lesson now ends with a LIVE APP step: the stage shows the real production system and a working app runs real public data through the real trained models (spam filter, home-value estimator, recommender, audience segments, loan desk, machine monitoring, card-fraud screening, serving load test). New realistic isometric object library (39 kinds, 3-D geometry, `#/objects`) replaces the generic blocks everywhere.
- **v10 (2026-11-21):** Built Phases 00–02 (56 lessons) with a lesson kit (auto layout, step and recap helpers) and new chart widgets (line, scatter, pixel grids). Data comes from real sandboxed commands (Phase 00), real datasets and model internals (Phase 01) and real trained models (Phase 02). Sidebar defaults to Available now; coming-soon screens added for the other phases and screens. Release plan: Phases 00–02 live.
- **v9 (2026-11-21):** All 7 Start Here lessons built on measured or published data only; new widgets (transcript, samples, diverging embedding chart, attention heat, bars + temperature dial, compare, code with a live-run rule, table, quiz, picker, cost calculator); data source shown on every step; staged launch animation (header → nav → sidebar folders → lesson → metrics → scene objects → step bar → right column).
- **v8 (2026-11-21):** Development started. Screen 1 (lesson player) built in Vite + React + TS with the data-driven lesson engine; the flagship lesson is `src/lessons/start-here/next-word.ts`.
- **v7 (2026-11-18):** Scene objects rebuilt as the reference's coloured system: rounded gradient blocks with icon + name on top, purple data cylinders, a people-crowd slab with a count, a laptop device, a green active pad, and an idle state. 22 object kinds in 9 colour roles. Used in Learn, Practice, System Design and the object library board.
- **v6 (2026-11-18):** Sidebar rebuilt as the reference's flat colour-folder list (multi-open, animated chevron + slide), "Show" filter dropdown (no V-labels), draw-in connector + arrowhead pop animation, filling progress rail.
- **v5 (2026-11-18):** Curriculum now covers **all 20 phases · 542 lessons** of ai-engineering-from-scratch 1:1 (+ Start Here + 12 design cases = 561). Generated `curriculum-full.md` / `curriculum.json` via `scripts/gen_curriculum.py`. Sidebar, course map (volumes → phases, topic paths), plan, placement, practice, cheatsheets, progress and contribute screens updated to phase numbering.
- **v4 (2026-11-17):** Lesson player rebuilt to the reference layout: one-row header, level-grouped collapsible sidebar with internal scroll, pinned "In this lesson" footer, build-up scene with "done" state, recap with Question/Decision/Because table. Practice gets an "In this incident" footer; System Design gets build-up + an 8th Recap stage with a decisions table.
- **v3 (2026-11-17):** Open source, all free; Pro/pricing moved to future plan; curriculum v2 (21 modules incl. tool calling, MCP, skills, evaluation, security); relevant iso icons replace generic boxes; Contribute page added.
- **v2:** Name → AI Zero to Hero; course map, placement, system design studio, cheatsheets, progress, coming-soon pages.
- **v1:** Lesson player, practice, pricing, plan in the designed-to-scale visual language.
