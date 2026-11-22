"""Phase 00 (Setup & Tooling): run real commands in a throwaway sandbox and record their actual output.

Writes src/lessons/data/p00.json. Everything is captured on the machine that runs this script; the JSON records which.
Usage: .venv/bin/python measure_p00.py ../../src/lessons/data/p00.json
"""
import cProfile
import datetime
import hashlib
import io
import json
import os
import platform
import pstats
import shutil
import subprocess
import sys
import tempfile
import time
import timeit

import numpy as np
import pandas as pd
import torch
from sklearn.datasets import load_breast_cancer

OUT = sys.argv[1]
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def sh(cmd: str, cwd: str | None = None, env: dict | None = None) -> dict:
    p = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True, env={**os.environ, **(env or {})})
    return {"cmd": cmd, "code": p.returncode, "out": (p.stdout + p.stderr).strip()}


data = {"provenance": {"measuredAt": datetime.date.today().isoformat(), "script": "scripts/data/measure_p00.py",
                       "machine": f"{platform.system()} {platform.release()} · {platform.machine()} · {os.cpu_count()} CPU threads"}}

# 01 Dev environment: real tool versions on this machine
data["versions"] = [
    {"tool": t, **sh(c)} for t, c in [
        ("Python (system)", "python3 --version"), ("Python (project venv)", f"{sys.executable} --version"),
        ("Node.js", "node --version"), ("npm", "npm --version"), ("git", "git --version"), ("uv", "uv --version"),
    ]
]
pkg = json.load(open(os.path.join(ROOT, "package.json")))
data["packageJson"] = {"dependencies": pkg.get("dependencies", {}), "devDependencies": pkg.get("devDependencies", {})}
data["lockfileBytes"] = os.path.getsize(os.path.join(ROOT, "package-lock.json"))

# 02 Git: a real repo with a real merge conflict and a leaked secret in history
g = tempfile.mkdtemp(prefix="azh-git-")
env = {"GIT_AUTHOR_NAME": "Demo", "GIT_AUTHOR_EMAIL": "demo@example.com", "GIT_COMMITTER_NAME": "Demo", "GIT_COMMITTER_EMAIL": "demo@example.com"}
steps = []
for c in [
    "git init -q -b main", "printf 'TEMPERATURE = 0.7\\n' > config.py", "git add config.py", "git commit -q -m 'Add config'",
    "git switch -q -c tune", "printf 'TEMPERATURE = 0.2\\n' > config.py", "git commit -q -am 'Lower temperature'",
    "git switch -q main", "printf 'TEMPERATURE = 1.0\\n' > config.py", "git commit -q -am 'Raise temperature'",
    "git merge tune",
]:
    steps.append(sh(c, g, env))
conflict = open(os.path.join(g, "config.py")).read()
sh("git merge --abort", g, env)
sh("printf 'API_KEY = \"sk-demo-not-a-real-key\"\\n' > secrets.py && git add secrets.py && git commit -q -m 'Add key'", g, env)
sh("git rm -q secrets.py && git commit -q -m 'Remove key'", g, env)
history = sh("git log --oneline --all -- secrets.py", g, env)["out"]
still = sh("git show HEAD~1:secrets.py", g, env)["out"]
data["git"] = {"merge": steps[-1], "conflictFile": conflict, "historyOfSecret": history, "secretStillInHistory": still,
               "log": sh("git log --oneline --graph --all", g, env)["out"]}
shutil.rmtree(g)

# 03 GPU: what this machine reports, and what the installed PyTorch build can use
smi = sh("nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader")
data["gpu"] = {"nvidiaSmi": smi, "torch": torch.__version__, "cudaAvailable": torch.cuda.is_available(), "torchCudaBuild": torch.version.cuda}
from transformers import AutoConfig  # noqa: E402
cfg = AutoConfig.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct")
from transformers import AutoModelForCausalLM  # noqa: E402
m = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct", torch_dtype=torch.float32)
params = sum(p.numel() for p in m.parameters())
data["gpu"]["model"] = {"name": "Qwen/Qwen2.5-0.5B-Instruct", "parameters": params,
                        "bytes": {"float32": params * 4, "bfloat16": params * 2, "int8": params, "int4": params // 2}}
del m

# 04 APIs & keys: what a secret scanner sees in a working tree (pattern scan, real run)
k = tempfile.mkdtemp(prefix="azh-keys-")
open(os.path.join(k, "app.py"), "w").write('import os\napi_key = os.environ["ANTHROPIC_API_KEY"]\n')
open(os.path.join(k, "old_demo.py"), "w").write('API_KEY = "sk-ant-demo-0000000000000000"  # pasted for a quick test\n')
open(os.path.join(k, ".env"), "w").write("ANTHROPIC_API_KEY=sk-ant-demo-0000000000000000\n")
open(os.path.join(k, ".gitignore"), "w").write(".env\n")
data["keys"] = {"scan": sh(r"grep -rnE 'sk-ant-[A-Za-z0-9-]{10,}' --include='*.py' .", k),
                "envIgnored": sh("git init -q && git status --short --ignored", k)}
shutil.rmtree(k)

# 05 Notebooks: hidden state — run "cells" in the order a person might click them
cells = ["prices = [10, 20, 30]", "total = sum(prices)", "prices = [p * 2 for p in prices]", "print(total)"]
ns, out_top, out_click = {}, io.StringIO(), io.StringIO()
for c in cells:
    exec(c, ns) if "print" not in c else print(eval("total", ns), file=out_top)
ns2 = {}
for i in [0, 2, 1, 3]:
    c = cells[i]
    exec(c, ns2) if "print" not in c else print(eval("total", ns2), file=out_click)
data["notebook"] = {"cells": cells, "topToBottom": out_top.getvalue().strip(), "clickedOrder": [1, 3, 2, 4], "clickedResult": out_click.getvalue().strip()}

# 06 Python environments: two isolated venvs with different numpy versions (real installs, timed)
e = tempfile.mkdtemp(prefix="azh-envs-")
envs = []
for name, ver in [("project-a", "1.26.4"), ("project-b", "2.1.3")]:
    path = os.path.join(e, name)
    t0 = time.time(); sh(f"uv venv -q --python 3.12 {path}"); t_venv = time.time() - t0
    t0 = time.time(); inst = sh(f"VIRTUAL_ENV={path} uv pip install -q numpy=={ver}"); t_inst = time.time() - t0
    envs.append({"name": name, "requested": ver, "venvSeconds": round(t_venv, 2), "installSeconds": round(t_inst, 2), "ok": inst["code"] == 0,
                 "reports": sh(f"{path}/bin/python -c 'import numpy, sys; print(numpy.__version__, sys.version.split()[0])'")["out"]})
data["envs"] = envs
shutil.rmtree(e)

# 08 Editor setup: what the TypeScript checker catches before you run anything
t = tempfile.mkdtemp(prefix="azh-ts-")
open(os.path.join(t, "bug.ts"), "w").write('interface Usage { input_tokens: number; output_tokens: number }\n'
                                           'function cost(u: Usage) { return u.input_tokens * 4 + u.output_token * 20; }\n'
                                           'cost({ input_tokens: "1200", output_tokens: 300 });\n')
data["tsc"] = sh(f"{ROOT}/node_modules/.bin/tsc --noEmit --strict bug.ts", t)
data["tsc"]["source"] = open(os.path.join(t, "bug.ts")).read()
shutil.rmtree(t)

# 09 Data management: one real dataset, three file formats
bc = load_breast_cancer(as_frame=True).frame
d = tempfile.mkdtemp(prefix="azh-data-")
fmts = []
for fmt, write, read in [
    ("CSV", lambda p: bc.to_csv(p, index=False), pd.read_csv),
    ("JSON", lambda p: bc.to_json(p, orient="records"), lambda p: pd.read_json(p, orient="records")),
    ("Parquet", lambda p: bc.to_parquet(p, index=False), pd.read_parquet),
]:
    p = os.path.join(d, "data." + fmt.lower())
    write(p)
    secs = min(timeit.repeat(lambda: read(p), number=5, repeat=3)) / 5
    fmts.append({"format": fmt, "bytes": os.path.getsize(p), "readMs": round(secs * 1000, 2), "sha256": hashlib.sha256(open(p, "rb").read()).hexdigest()[:12]})
data["formats"] = {"dataset": "Breast Cancer Wisconsin (Diagnostic), scikit-learn", "rows": len(bc), "columns": bc.shape[1], "files": fmts}
bc2 = bc.copy(); bc2.iloc[0, 0] += 0.01
p2 = os.path.join(d, "data2.parquet"); bc2.to_parquet(p2, index=False)
data["formats"]["changedOneCellSha256"] = hashlib.sha256(open(p2, "rb").read()).hexdigest()[:12]
shutil.rmtree(d)

# 10 Terminal & shell: real pipelines over this project's own files
data["shell"] = [sh(c, ROOT) for c in [
    "ls docs",
    "wc -l docs/curriculum-full.md",
    "grep -c '| LIVE |' docs/curriculum-full.md",
    "grep -o 'Phase [0-9]* · [A-Za-z&]*' docs/curriculum-full.md | head -5",
    "cat does-not-exist.txt; echo \"exit code: $?\"",
]]

# 11 Linux: what this machine has, and file permissions on a secrets file
l = tempfile.mkdtemp(prefix="azh-linux-")
open(os.path.join(l, ".env"), "w").write("ANTHROPIC_API_KEY=...\n")
data["linux"] = {
    "uname": sh("uname -sr")["out"], "nproc": sh("nproc")["out"],
    "memory": sh("free -h | head -2")["out"], "disk": sh("df -h / | tail -1")["out"],
    "before": sh("ls -l .env", l)["out"], "chmod": sh("chmod 600 .env && ls -l .env", l)["out"],
}
shutil.rmtree(l)

# 12 Debugging & profiling: a real traceback and a real profile of a slow lookup
try:
    usage = {"input_tokens": 1200}
    usage["output_tokens"] * 20  # noqa: B018
except KeyError:
    import traceback
    data["traceback"] = traceback.format_exc(limit=1).strip()
ids_list = list(range(50_000)); ids_set = set(ids_list); queries = list(range(0, 100_000, 50))
def slow(): return sum(1 for q in queries if q in ids_list)
def fast(): return sum(1 for q in queries if q in ids_set)
pr = cProfile.Profile(); pr.enable(); slow(); fast(); pr.disable()
s = io.StringIO(); pstats.Stats(pr, stream=s).sort_stats("cumulative").print_stats("slow|fast");
data["profile"] = {"queries": len(queries), "items": len(ids_list),
                   "slowSeconds": round(min(timeit.repeat(slow, number=1, repeat=3)), 4),
                   "fastSeconds": round(min(timeit.repeat(fast, number=1, repeat=3)), 6),
                   "report": "\n".join(x for x in s.getvalue().splitlines() if "slow" in x or "fast" in x or "ncalls" in x)}

# 13 Python for AI engineering: loops vs vectorised NumPy, list vs array memory
a = np.random.default_rng(0).standard_normal(1_000_000).astype(np.float32); b = a[::-1].copy()
al, bl = a.tolist(), b.tolist()
data["python"] = {
    "n": len(a),
    "loopSeconds": round(min(timeit.repeat(lambda: sum(x * y for x, y in zip(al, bl)), number=1, repeat=3)), 4),
    "numpySeconds": round(min(timeit.repeat(lambda: float(a @ b), number=1, repeat=5)), 6),
    "listBytes": sys.getsizeof(al) + sum(sys.getsizeof(x) for x in al[:1000]) * (len(al) // 1000),
    "arrayBytes": int(a.nbytes),
}

raw = json.dumps(data, indent=1, ensure_ascii=False).replace(ROOT, "<project>").replace(os.path.expanduser("~"), "~")
open(OUT, "w").write(raw)
print(json.dumps(data, indent=1, ensure_ascii=False)[:9000])
