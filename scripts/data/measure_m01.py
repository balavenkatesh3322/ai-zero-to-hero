"""01 · Deep Learning Core — Optimizers. Trains a 2-parameter price model (price = w·income + b, income in its raw $10k units) on the real California
Housing training set with gradient descent, momentum and Adam, and exports what the live app needs.

The full-batch gradient of mean squared error for a 1-feature linear model depends only on six sums of the data,
so the app gets those exact moments (not the rows) and runs every optimizer live on all 16,512 training districts.
A slice of real training rows is included for mini-batch SGD.

Usage: .venv/bin/python measure_m01.py ../../src/lessons/data/m01.json
"""
import datetime
import json
import sys

import numpy as np
import sklearn
from sklearn.datasets import fetch_california_housing
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

SEED = 0
R = lambda v, d=5: float(round(float(v), d))  # noqa: E731
H = fetch_california_housing(as_frame=True).frame
tr, _ = train_test_split(H, test_size=0.2, random_state=SEED)       # same split as the ML Fundamentals apps
mu, sd = tr.MedInc.mean(), tr.MedInc.std()
x = tr.MedInc.values; y = tr.MedHouseVal.values                      # income in $10k (raw units), price in $100k
n = len(x)
moments = lambda xs: {"n": n, "x": xs.mean(), "xx": (xs * xs).mean(), "y": y.mean(), "xy": (xs * y).mean(), "yy": (y * y).mean()}  # noqa: E731
M = moments(x)


def loss(w, b):
    return M["yy"] + w * w * M["xx"] + b * b + 2 * w * b * M["x"] - 2 * w * M["xy"] - 2 * b * M["y"]


def grad(w, b):
    return 2 * (w * M["xx"] + b * M["x"] - M["xy"]), 2 * (w * M["x"] + b - M["y"])


def run(kind, lr, steps=150, start=(-0.2, 3.2)):
    w, b = start; vw = vb = sw = sb = 0.0; path = [[w, b, loss(w, b)]]
    for t in range(1, steps + 1):
        gw, gb = grad(w, b)
        if kind == "gd":
            w, b = w - lr * gw, b - lr * gb
        elif kind == "momentum":
            vw, vb = 0.9 * vw + gw, 0.9 * vb + gb; w, b = w - lr * vw, b - lr * vb
        else:  # adam
            vw, vb = 0.9 * vw + 0.1 * gw, 0.9 * vb + 0.1 * gb
            sw, sb = 0.999 * sw + 0.001 * gw * gw, 0.999 * sb + 0.001 * gb * gb
            mhw, mhb = vw / (1 - 0.9 ** t), vb / (1 - 0.9 ** t); shw, shb = sw / (1 - 0.999 ** t), sb / (1 - 0.999 ** t)
            w, b = w - lr * mhw / (np.sqrt(shw) + 1e-8), b - lr * mhb / (np.sqrt(shb) + 1e-8)
        path.append([w, b, loss(w, b)])
        if not np.isfinite(path[-1][2]) or path[-1][2] > 1e4:
            break
    return path


ols = LinearRegression().fit(x.reshape(-1, 1), y)
best = loss(ols.coef_[0], ols.intercept_)
# check: the moment formula equals the loss computed row by row
assert abs(loss(0.3, 1.1) - np.mean((0.3 * x + 1.1 - y) ** 2)) < 1e-9


def steps_to(path, tol=0.01):
    for i, (_, _, l) in enumerate(path):
        if l <= best * (1 + tol):
            return i
    return None


LRS = {"gd": [0.003, 0.01, 0.03, 0.05, 0.055], "momentum": [0.001, 0.005, 0.01, 0.03], "adam": [0.01, 0.03, 0.1, 0.3]}
runs = {k: {str(lr): run(k, lr) for lr in lrs} for k, lrs in LRS.items()}
# the same problem with income standardised: how many gradient-descent steps then?
raw_best = best
Ms = moments((x - mu) / sd)
def loss_s(w, b): return Ms["yy"] + w * w * Ms["xx"] + b * b + 2 * w * b * Ms["x"] - 2 * w * Ms["xy"] - 2 * b * Ms["y"]
ws, bs = 0.0, 0.0; scaled_steps = None
for t in range(1, 500):
    gw, gb = 2 * (ws * Ms["xx"] + bs * Ms["x"] - Ms["xy"]), 2 * (ws * Ms["x"] + bs - Ms["y"])
    ws, bs = ws - 0.1 * gw, bs - 0.1 * gb
    if loss_s(ws, bs) <= raw_best * 1.01: scaled_steps = t; break
rng = np.random.default_rng(SEED)
idx = rng.permutation(n)[:512]   # seeded slice of real training rows for mini-batch SGD
json.dump({
    "provenance": {"measuredAt": datetime.date.today().isoformat(), "script": "scripts/data/measure_m01.py", "sklearn": sklearn.__version__, "seed": SEED,
                   "dataset": "California Housing (1990 US census), via scikit-learn"},
    "moments": {k: R(v, 8) for k, v in M.items()}, "incomeMean": R(mu), "incomeStd": R(sd),
    "optimum": {"w": R(ols.coef_[0]), "b": R(ols.intercept_), "loss": R(best)}, "scaledGdSteps": scaled_steps, "lrs": LRS,
    "start": [-0.2, 3.2],
    "summary": {k: {lr: {"steps": steps_to(p), "final": R(p[-1][2], 4), "diverged": bool(len(p) < 151 or p[-1][2] > p[0][2])} for lr, p in v.items()} for k, v in runs.items()},
    "curves": {k: {lr: [R(s[2], 4) for s in p[:151:3]] for lr, p in v.items()} for k, v in runs.items()},
    "rows": [[R(x[i], 4), R(y[i], 3)] for i in idx],
}, open(sys.argv[1], "w"), separators=(",", ":"))
print("ok", {k: {lr: v["steps"] for lr, v in s.items()} for k, s in json.load(open(sys.argv[1]))["summary"].items()}, "best", R(best))
