"""Generate the full AI Zero to Hero curriculum (542 repo lessons + our additions) from the parsed README JSON."""
import json, re, sys

src, out_dir = sys.argv[1], sys.argv[2]
phases = json.load(open(src))

VOLUMES = [
    ("V0", "Start Here", [], "Zero to your first AI call. No experience needed."),
    ("V1", "Foundations", [0, 1, 2], "Tools, maths and classical ML."),
    ("V2", "Deep Learning", [3, 4, 6], "From a perceptron to vision and speech."),
    ("V3", "Language", [5, 7], "NLP, attention and the transformer, by hand."),
    ("V4", "Large Language Models", [8, 9, 10, 11], "Generative AI, RL, train a mini GPT, ship RAG."),
    ("V5", "Agents", [12, 13, 14, 15, 16], "Multimodal, tools & MCP, agents, swarms."),
    ("V6", "Production & Safety", [17, 18, 19], "Serving, safety, capstones."),
]

HOOKS = {
    0: "An API key was committed to a public repo.",
    1: 'Search returns shoes for a "boot camp" query.',
    2: "The fraud model is 99% accurate and catches nothing.",
    3: "Loss is NaN after 3 epochs.",
    4: "The receipt scanner reads $1,000 as $1.000.",
    5: "The answer was split across two chunks.",
    6: "The voice bot talks over the customer.",
    7: "Latency doubles as the chat grows.",
    8: "Generated product photos all have six fingers.",
    9: "The reward model learned to love long answers.",
    10: "The fine-tuned model forgot how to speak English.",
    11: "The bot quotes a refund policy from 2019.",
    12: "The model reads a chart upside down.",
    13: "The model called delete_user with the wrong ID.",
    14: "The agent loops forever on a 404.",
    15: "The coding agent force-pushed to main.",
    16: "Three agents agree on a wrong answer.",
    17: "p99 latency is 14 s at 200 users — and the bill tripled.",
    18: "A PDF told the agent to email the customer list.",
    19: "Ship it end to end, with evals and a dashboard.",
}

# Release plan: which phases / lesson ranges ship in which product phase
LAUNCH = {2: 'all'}   # live: Phase 02 · ML Fundamentals
NEXT: dict = {}                             # everything else: coming soon
def status(p, n):
    for table, s in ((LAUNCH, "LIVE"), (NEXT, "NEXT")):
        r = table.get(p)
        if r == "all" or (r and n in r):
            return s
    return "SOON"

START_HERE = [
    "What is AI, ML & GenAI?", "How an LLM picks the next word", "Tokens & context windows",
    "Your first API call", "Messages, roles & system prompts", "Napkin math: cost & latency",
    "What an AI engineer actually does",
]
DESIGN_CASES = [
    "Enterprise document Q&A (RAG)", "ChatGPT", "Coding assistant", "Customer-support agent",
    "Real-time voice assistant", "AI search engine", "Deep-research multi-agent system",
    "LLM gateway / platform", "Content moderation", "Meeting summarizer", "Code-review bot",
    "LLM-powered recommender",
]

# Topic paths: cross-cutting filters over the 542 lessons (matched by title keywords)
TOPICS = [
    ("basics", "Very basics", [r"Dev Environment", r"APIs & Keys", r"Python for AI", r"What Is Machine Learning", r"Prompt Engineering: Techniques", r"Tokenizers: BPE", r"Self-Attention from Scratch", r"Embeddings & Vector"]),
    ("rag", "RAG", [r"RAG", r"Retrieval", r"Chunking", r"Embedding Models", r"Reranker|Reranking", r"BM25", r"Query Rewriting", r"ColPali", r"Information Retrieval"]),
    ("tools", "Tool calling", [r"Tool Use|Tool Interface|Function Call|Tool Schema|Tool Calls|Tool Registry|Structured Output"]),
    ("mcp", "MCP", [r"\bMCP\b|Model Context Protocol"]),
    ("skills", "Agent Skills", [r"\bSkill"]),
    ("agents", "Agents", [r"Agent Loop|ReWOO|Reflexion|Tree of Thoughts|Self-Refine|Agent Memory|Memory Blocks|Hybrid Memory|Workflow Patterns|Orchestration|Harness|Agent Runtimes|Computer Use|Voice Agents|Failure Modes — Why Agents|Agent Workbench|Plan-Execute|Long-Horizon"]),
    ("eval", "Evaluation", [r"Evaluation|Evals?\b|Benchmark|RAGAS|LLM-as|Eval Harness|Eval-Driven|Metric"]),
    ("security", "Security & safety", [r"Security|Injection|Jailbreak|Red-Team|Guardrail|Llama Guard|Safety|Kill Switch|Permission|Sandbox|PII|Compliance|Poisoned|Moderation|Refusal"]),
]

def fmt(p, l):
    t = l["type"]
    if p == 19:
        return "Project"
    return "Scene + code lab" if t == "Build" else "Scene"

lessons = []
for ph in phases:
    for l in ph["lessons"]:
        lessons.append({
            "phase": ph["phase"], "phaseTitle": ph["title"], "n": l["n"], "title": l["title"],
            "repoType": l["type"], "languages": l["lang"], "format": fmt(ph["phase"], l),
            "status": status(ph["phase"], l["n"]), "source": l["path"],
            "topics": [k for k, _, pats in TOPICS if any(re.search(pt, l["title"], re.I) for pt in pats)],
        })
assert len(lessons) == 542, len(lessons)

vol_of = {p: v for v, _, ps, _ in VOLUMES for p in ps}
data = {
    "product": "AI Zero to Hero", "source": "rohitg00/ai-engineering-from-scratch (MIT)",
    "volumes": [{"id": v, "title": t, "phases": ps, "blurb": b} for v, t, ps, b in VOLUMES],
    "startHere": START_HERE, "designCases": DESIGN_CASES,
    "phases": [{"phase": ph["phase"], "title": ph["title"], "tagline": ph["tagline"], "volume": vol_of[ph["phase"]],
                "hook": HOOKS[ph["phase"]], "count": len(ph["lessons"])} for ph in phases],
    "topics": [{"id": k, "title": t, "count": sum(k in l["topics"] for l in lessons)} for k, t, _ in TOPICS],
    "lessons": lessons,
}
json.dump(data, open(f"{out_dir}/curriculum.json", "w"), indent=1, ensure_ascii=False)

# Markdown
live = sum(l["status"] == "LIVE" for l in lessons); nxt = sum(l["status"] == "NEXT" for l in lessons)
md = [
    "# AI Zero to Hero — Full Lesson Catalogue",
    "",
    "Generated from `rohitg00/ai-engineering-from-scratch` (MIT): **20 phases · 542 lessons**, every lesson mapped 1:1,",
    "plus our additions: **Start Here** (7 primer lessons) and **AI System Design** (12 case studies). **Total: 561 interactive units.**",
    "",
    "Format: **Scene** = animated step-through (Problem → Concept → Try it → Case → Recap) · **Scene + code lab** = the same plus the lesson's runnable code (the repo's Build lessons) · **Project** = capstone brief with milestones.",
    f"Status: **LIVE** = Phase 1 launch ({live + len(START_HERE) + 1} units) · **NEXT** = Phase 2 ({nxt}) · **SOON** = open for contributors.",
    "",
    "## Topic paths (cross-cutting filters)",
    "| Path | Lessons |", "|---|---|",
]
for t in data["topics"]:
    md.append(f"| {t['title']} | {t['count']} |")
md += ["", "---", "", "## V0 · Start Here — LIVE (7)", ""]
md += [f"{i + 1}. {t}" for i, t in enumerate(START_HERE)]
for v, vt, ps, b in VOLUMES[1:]:
    n = sum(len(phases[p]["lessons"]) for p in ps)
    md += ["", f"## {v} · {vt} — {n} lessons", f"_{b}_"]
    for p in ps:
        ph = phases[p]
        md += ["", f"### Phase {p:02d} · {ph['title']} ({len(ph['lessons'])})",
               f"> {ph['tagline']}  ", f"> **Opening incident:** {HOOKS[p]}", "",
               "| # | Lesson | Format | Languages | Status | Topics |", "|---|---|---|---|---|---|"]
        for l in ph["lessons"]:
            L = next(x for x in lessons if x["phase"] == p and x["n"] == l["n"])
            md.append(f"| {l['n']:02d} | {l['title']} | {L['format']} | {l['lang']} | {L['status']} | {', '.join(L['topics'])} |")
md += ["", "## AI System Design — 12 cases (our addition)", ""]
md += [f"{i + 1}. Design {t}" + (" — LIVE" if i == 0 else "") for i, t in enumerate(DESIGN_CASES)]
open(f"{out_dir}/curriculum-full.md", "w").write("\n".join(md) + "\n")

# Compact data for the canvas (course map + sidebar)
compact = {
    "vols": [[v, t, b, ps] for v, t, ps, b in VOLUMES],
    "phases": [[ph["phase"], ph["title"], len(ph["lessons"]), HOOKS[ph["phase"]],
                sum(status(ph["phase"], l["n"]) == "LIVE" for l in ph["lessons"]),
                [l["title"][:34] for l in ph["lessons"]]] for ph in phases],
    "topics": {k: sorted({l["phase"] for l in lessons if k in l["topics"]}) for k, _, _ in TOPICS},
    "topicCounts": {t["id"]: t["count"] for t in data["topics"]},
}
json.dump(compact, open(f"{out_dir}/compact.json", "w"), ensure_ascii=False, separators=(",", ":"))
print("lessons", len(lessons), "live", live, "next", nxt)
print({t["id"]: t["count"] for t in data["topics"]})
