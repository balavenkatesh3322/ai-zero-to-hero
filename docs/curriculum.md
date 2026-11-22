# AI Zero to Hero — Curriculum (v3)

**The complete `rohitg00/ai-engineering-from-scratch` curriculum: 20 phases · 542 lessons, every lesson mapped 1:1 and taught interactively**, plus our own additions:
**Start Here** (7 primer lessons for absolute beginners) and **AI System Design** (12 interview-style case studies). **Total: 561 interactive units.**

- Full lesson-by-lesson catalogue (title, format, languages, status, topics): [`curriculum-full.md`](curriculum-full.md)
- Machine-readable version used by the app: [`curriculum.json`](curriculum.json) (regenerate from the repo README with `gen_curriculum.py`)
- Source: https://github.com/rohitg00/ai-engineering-from-scratch · https://aiengineeringfromscratch.com (MIT, credited in-app)

## How every lesson is taught
| Repo lesson type | Our format |
|---|---|
| **Learn** | **Scene**: animated isometric step-through: Problem (a real incident) → Concept steps → Try it (a control) → Case (break it) → Recap (finished system + Question / Decision / Because table) |
| **Build** | **Scene + code lab**: the same scene, then the lesson's runnable code (Python / TypeScript / Rust / Julia) linked from the repo |
| **Capstone (Phase 19)** | **Project**: brief, architecture scene, milestones, eval checklist |
Every phase opens with a real incident and has graded **Practice incidents**.

## Structure: 6 volumes (matches the book edition) + Start Here
| Volume | Phases | Lessons | Opening incidents |
|---|---|---|---|
| **V0 Start Here** (ours) | Start Here | 7 | "The support bot invented a 90-day refund policy" |
| **V1 Foundations** | 00 Setup & Tooling (13) · 01 Math Foundations (22) · 02 ML Fundamentals (21) | 56 | API key committed to a public repo · "boot camp" search returns shoes · 99%-accurate fraud model catches nothing |
| **V2 Deep Learning** | 03 Deep Learning Core (13) · 04 Computer Vision (28) · 06 Speech & Audio (17) | 58 | Loss is NaN after 3 epochs · $1,000 read as $1.000 · voice bot talks over the customer |
| **V3 Language** | 05 NLP (29) · 07 Transformers Deep Dive (16) | 45 | Answer split across two chunks · latency doubles as the chat grows |
| **V4 Large Language Models** | 08 Generative AI (15) · 09 Reinforcement Learning (12) · 10 LLMs from Scratch (24) · 11 LLM Engineering (17) | 68 | Six-fingered product photos · reward model loves long answers · fine-tune forgot English · bot quotes a 2019 policy |
| **V5 Agents** | 12 Multimodal AI (25) · 13 Tools & Protocols (45) · 14 Agent Engineering (54) · 15 Autonomous Systems (22) · 16 Multi-Agent & Swarms (25) | 171 | Chart read upside down · delete_user with the wrong ID · agent loops on a 404 · coding agent force-pushed to main · three agents agree on a wrong answer |
| **V6 Production & Safety** | 17 Infrastructure & Production (29) · 18 Ethics, Safety & Alignment (30) · 19 Capstone Projects (85) | 144 | p99 14 s and the bill tripled · a PDF told the agent to email customers · ship it end to end |
| **AI System Design** (ours) | 12 case studies | 12 | "Design ChatGPT in 45 minutes" |

Start Here: What is AI, ML & GenAI? · How an LLM picks the next word · Tokens & context windows · Your first API call · Messages, roles & system prompts · Napkin math: cost & latency · What an AI engineer actually does.

## Topic paths (cross-cutting filters over the 542 lessons)
The topics you asked to cover explicitly, each a filter on the course map (lesson counts from `curriculum.json`):
| Path | Lessons | Where they live |
|---|---|---|
| Very basics | Start Here + 8 | Start Here, P00, P02, P10, P11 |
| RAG | 18 | P05 (retrieval, chunking, embeddings), P11 (RAG, advanced RAG), P12 (ColPali, multimodal RAG), P19 track F |
| Tool calling | 11 | P11 (function calling), P13 (tool interface → schemas, structured output), P19 track A |
| MCP | 18 | P11 (MCP), P13 (fundamentals → server, client, transports, auth, security, registry, conformance), P19 |
| Agent Skills | 6 | P13 (portable contract, discovery, invocation, permissions, evals), P14 (skill libraries) |
| Agents | 27 | P14, P15, P19 track A |
| Evaluation | 35 | P05, P10, P11, P14 (benchmarks, eval-driven dev), P19 track G |
| Security & safety | 25 | P13 (MCP security/auth), P14 (prompt injection), P15 (permissions, kill switches), P17, P18, P19 track I |

## Learning paths & career routes (from aiengineeringfromscratch.com)
- Domains: Building & Deploying AI Applications · Software Engineering Fundamentals · Agent-Assisted Engineering (P14 31–46) · Product Judgment & Delivery (P14 47–54).
- Routes: Customer AI Deployment · DevEx & Education · AI Data Systems · Agent Systems Engineering · LLM Product Engineering · AI Evaluation & Reliability.
- Focused: MCP path (~23 h) · Agent Skills path (~9.5 h) · Reverse Engineering path (~32.5 h, P13 32–45).

## Placement ("Find your level")
New to code → Start Here → P00 · Know Python, new to ML → P01 · Know ML → P03 · Know deep learning → P10 · Ship LLM apps → P11/P13 · Senior, agents only → P14 · Infra → P17.

## Release plan (open source)
- **Phase 1 (LIVE, 69 units):** Start Here (7) · P00 Setup & Tooling (13) · P11 LLM Engineering (17: prompting, RAG, function calling, evals, MCP) · P13 Tools & Protocols 1–31 (tool calling, MCP, Agent Skills) · System Design case 1.
- **Phase 2 (50):** P07 Transformers (16) · P14 Agent Engineering 1–30 · P05 20–23 (structured outputs, NLI, embeddings, chunking).
- **Phase 3:** P10, P12, P14 31–54, P15, P16, P17, P18 + 4 design cases.
- **Phase 4:** P01–P04, P06, P08, P09, P13 32–45 (reverse engineering), P19 capstones, remaining design cases.
Unreleased lessons show **SOON** with a "help write it" link to their issue.
