"""Phase 01 (Math Foundations): compute every number shown in the 22 lessons from real data.

Real sources: scikit-learn bundled datasets (iris, digits, diabetes, wine, breast cancer), Qwen2.5-0.5B-Instruct
(embeddings, config, next-token distributions), statsmodels' Mauna Loa CO2 series, networkx's Zachary karate club,
and this course's own text. Simulations use a fixed seed and are labelled as simulations in the lessons.
Usage: .venv/bin/python measure_p01.py ../../src/lessons/data/p01.json
"""
import datetime
import json
import sys

import networkx as nx
import numpy as np
import torch
from sklearn.datasets import load_breast_cancer, load_diabetes, load_digits, load_iris, load_wine
from sklearn.decomposition import PCA
from sklearn.linear_model import LogisticRegression
from sklearn.manifold import TSNE
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from statsmodels.datasets import co2
from transformers import AutoModelForCausalLM, AutoTokenizer

OUT = sys.argv[1]
R = lambda x, d=4: float(round(float(x), d))  # noqa: E731
data = {"provenance": {"measuredAt": datetime.date.today().isoformat(), "script": "scripts/data/measure_p01.py",
                       "numpy": np.__version__, "torch": torch.__version__}}

iris = load_iris()
X_iris, y_iris = iris.data, iris.target
dig = load_digits()
dia = load_diabetes()
wine = load_wine()
bc = load_breast_cancer()

# 01 Linear algebra intuition: a flower is a vector
idx = [0, 50, 100]
data["iris"] = {"features": list(iris.feature_names), "species": list(iris.target_names),
                "samples": [{"species": iris.target_names[y_iris[i]], "v": [R(x, 1) for x in X_iris[i]]} for i in idx],
                "means": [{"species": s, "v": [R(x, 2) for x in X_iris[y_iris == k].mean(0)]} for k, s in enumerate(iris.target_names)],
                "count": len(X_iris)}
a, b, c = X_iris[0], X_iris[50], X_iris[100]
data["iris"]["dot"] = {"setosa·versicolor": R(a @ b, 2), "versicolor·virginica": R(b @ c, 2), "setosa·virginica": R(a @ c, 2)}

# 02 Matrix ops: a trained logistic regression IS a matrix multiply
lr = LogisticRegression(max_iter=1000).fit(X_iris, y_iris)
logits = X_iris[idx] @ lr.coef_.T + lr.intercept_
data["matmul"] = {"W": [[R(x, 3) for x in row] for row in lr.coef_], "b": [R(x, 3) for x in lr.intercept_],
                  "logits": [[R(x, 2) for x in r] for r in logits], "pred": [iris.target_names[k] for k in logits.argmax(1)],
                  "shapes": {"X": [3, 4], "W": list(lr.coef_.T.shape), "out": [3, 3]}}

# 03 Eigen: covariance of iris
cov = np.cov(X_iris.T)
vals, vecs = np.linalg.eigh(cov)
order = vals.argsort()[::-1]
vals, vecs = vals[order], vecs[:, order]
data["eigen"] = {"cov": [[R(x, 3) for x in r] for r in cov], "values": [R(x, 4) for x in vals],
                 "explained": [R(x, 4) for x in vals / vals.sum()], "v1": [R(x, 3) for x in vecs[:, 0]]}

# 04 Derivatives: diabetes, predict progression from BMI with y = w·x; loss as a function of w
x = dia.data[:, 2]; y = dia.target
ws = np.linspace(0, 1900, 39)
mse = lambda w: float(((w * x + y.mean() - y) ** 2).mean())  # noqa: E731
w0, h = 600.0, 1e-3
analytic = float((2 * x * (w0 * x + y.mean() - y)).mean())
numeric = (mse(w0 + h) - mse(w0 - h)) / (2 * h)
w_best = float(((y - y.mean()) @ x) / (x @ x))
data["deriv"] = {"curve": [[R(w, 1), R(mse(w), 1)] for w in ws], "w0": w0, "analytic": R(analytic, 3), "numeric": R(numeric, 3),
                 "wBest": R(w_best, 1), "lossBest": R(mse(w_best), 1), "n": len(x)}

# 05 Chain rule & autodiff: torch autograd on a tiny 2-layer computation with real inputs
xt = torch.tensor(X_iris[0], dtype=torch.float32)
W1 = torch.tensor([[0.2, -0.1, 0.4, 0.3], [0.1, 0.5, -0.3, 0.2]], requires_grad=True)
w2 = torch.tensor([0.7, -0.4], requires_grad=True)
hidden = torch.relu(W1 @ xt); out = w2 @ hidden; loss = (out - 1.0) ** 2
loss.backward()
data["autodiff"] = {"x": [R(v, 1) for v in X_iris[0]], "W1": W1.detach().tolist(), "w2": w2.detach().tolist(),
                    "hidden": [R(v, 4) for v in hidden.tolist()], "out": R(out.item()), "loss": R(loss.item()),
                    "dW2": [R(v) for v in w2.grad.tolist()], "dW1": [[R(v) for v in r] for r in W1.grad.tolist()],
                    "manual_dw2": [R(2 * (out.item() - 1) * hv) for hv in hidden.tolist()]}

# 06 Probability & distributions: wine alcohol histogram + normal fit; model next-token distribution
alc = wine.data[:, 0]
hist, edges = np.histogram(alc, bins=12)
data["dist"] = {"alcohol": {"n": len(alc), "mean": R(alc.mean(), 3), "std": R(alc.std(ddof=1), 3), "min": R(alc.min(), 2), "max": R(alc.max(), 2),
                            "hist": [[R((edges[i] + edges[i + 1]) / 2, 2), int(hist[i])] for i in range(len(hist))],
                            "within1sd": R(np.mean(np.abs(alc - alc.mean()) <= alc.std(ddof=1)), 4)}}

# Qwen: next-token distribution (also used for entropy / KL / numerics / tensors / RoPE)
MODEL = "Qwen/Qwen2.5-0.5B-Instruct"
tok = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForCausalLM.from_pretrained(MODEL, torch_dtype=torch.float32).eval()
def chat(system, user, prefix):
    t = tok.apply_chat_template([{"role": "system", "content": system}, {"role": "user", "content": user}], tokenize=False, add_generation_prompt=True) + prefix
    return tok(t, add_special_tokens=False)["input_ids"]
SYS = "You are a customer-support assistant for an online shoe store. Answer in one sentence."
POL = SYS + " Store policy: Returns are accepted within 14 days of delivery."
Q = "How long do I have to return shoes?"
with torch.no_grad():
    lp = model(torch.tensor([chat(SYS, Q, "You have ")])).logits[0, -1].double()
    lg = model(torch.tensor([chat(POL, Q, "You have ")])).logits[0, -1].double()
def H(logits, T=1.0):
    p = torch.softmax(logits / T, -1); return float(-(p * torch.log2(p.clamp_min(1e-300))).sum())
p_plain, p_pol = torch.softmax(lp, -1), torch.softmax(lg, -1)
top = torch.topk(p_plain, 6)
data["dist"]["nextToken"] = {"top": [{"token": tok.decode([int(i)]), "p": R(v, 4)} for v, i in zip(top.values, top.indices)],
                             "sumAll": R(p_plain.sum(), 6), "vocab": int(p_plain.numel())}
# 09 Entropy & KL
data["entropy"] = {"temps": [{"T": T, "bits": R(H(lp, T), 3)} for T in [0.3, 0.7, 1.0, 1.5, 2.0]],
                   "withoutPolicyBits": R(H(lp), 3), "withPolicyBits": R(H(lg), 3),
                   "kl_pol_vs_plain_bits": R(float((p_pol * (torch.log2(p_pol.clamp_min(1e-300)) - torch.log2(p_plain.clamp_min(1e-300)))).sum()), 3),
                   "uniformBits": R(np.log2(p_plain.numel()), 3),
                   "coin": [{"p": p, "bits": R(-(p * np.log2(p) + (1 - p) * np.log2(1 - p)) if 0 < p < 1 else 0, 3)} for p in [0.5, 0.7, 0.9, 0.99]]}

# 07 Bayes: breast cancer base rate + a real classifier's sensitivity / specificity on held-out data
Xtr, Xte, ytr, yte = train_test_split(bc.data, bc.target, test_size=0.3, random_state=0, stratify=bc.target)
clf = LogisticRegression(max_iter=5000).fit(StandardScaler().fit(Xtr).transform(Xtr), ytr)
pred = clf.predict(StandardScaler().fit(Xtr).transform(Xte))
malig = 0  # in sklearn's encoding 0 = malignant
tp = int(((pred == malig) & (yte == malig)).sum()); fn = int(((pred != malig) & (yte == malig)).sum())
tn = int(((pred != malig) & (yte != malig)).sum()); fp = int(((pred == malig) & (yte != malig)).sum())
sens, spec = tp / (tp + fn), tn / (tn + fp)
prior = float((bc.target == malig).mean())
def post(pr): return sens * pr / (sens * pr + (1 - spec) * (1 - pr))
data["bayes"] = {"n": len(bc.target), "malignant": int((bc.target == malig).sum()), "prior": R(prior, 4),
                 "test": {"tp": tp, "fn": fn, "tn": tn, "fp": fp, "n": len(yte)}, "sensitivity": R(sens, 4), "specificity": R(spec, 4),
                 "posteriorAtDatasetPrior": R(post(prior), 4) if fp else None,
                 "posteriorCurve": [[pr, R(post(pr), 4)] for pr in [0.001, 0.01, 0.05, 0.1, 0.2, 0.37, 0.5]] if fp else None}

# 08 Gradient descent family on diabetes (standardised features), fixed seed and learning rates
Xd = StandardScaler().fit_transform(dia.data); yd = (dia.target - dia.target.mean()) / dia.target.std()
def run(opt_name, lr, steps=60):
    torch.manual_seed(0)
    w = torch.zeros(Xd.shape[1], requires_grad=True)
    Xt, yt = torch.tensor(Xd, dtype=torch.float32), torch.tensor(yd, dtype=torch.float32)
    opt = {"SGD": lambda: torch.optim.SGD([w], lr=lr), "Momentum": lambda: torch.optim.SGD([w], lr=lr, momentum=0.9), "Adam": lambda: torch.optim.Adam([w], lr=lr)}[opt_name]()
    curve = []
    for s in range(steps):
        opt.zero_grad(); l = ((Xt @ w - yt) ** 2).mean(); l.backward(); opt.step(); curve.append([s, R(l.item(), 4)])
    return curve
best = float(np.linalg.lstsq(np.c_[Xd], yd, rcond=None)[1][0] / len(yd))
data["gd"] = {"curves": {"SGD": run("SGD", 0.05), "Momentum": run("Momentum", 0.05), "Adam": run("Adam", 0.05)},
              "tooHigh": run("SGD", 0.6, 25), "optimum": R(best, 4), "lr": 0.05, "steps": 60}

# 10 PCA / t-SNE on digits
pca = PCA().fit(dig.data)
cum = np.cumsum(pca.explained_variance_ratio_)
Z = PCA(2).fit_transform(dig.data)
sub = np.arange(0, len(dig.data), 3)
T2 = TSNE(2, random_state=0, init="pca", perplexity=30).fit_transform(dig.data[sub])
data["dimred"] = {"n": len(dig.data), "dims": dig.data.shape[1],
                  "cumulative": [[k + 1, R(cum[k], 4)] for k in range(0, 64)],
                  "kFor90": int(np.searchsorted(cum, 0.9) + 1), "kFor95": int(np.searchsorted(cum, 0.95) + 1),
                  "pca2": [[R(Z[i, 0], 2), R(Z[i, 1], 2), int(dig.target[i])] for i in sub],
                  "tsne2": [[R(T2[j, 0], 2), R(T2[j, 1], 2), int(dig.target[i])] for j, i in enumerate(sub)]}

# 11 SVD: low-rank reconstruction of digits images
U, S, Vt = np.linalg.svd(dig.data - dig.data.mean(0), full_matrices=False)
mean = dig.data.mean(0)
def recon(k, i): return np.clip((U[i, :k] * S[:k]) @ Vt[:k] + mean, 0, 16)
errs = [[k, R(np.sqrt(((((U[:, :k] * S[:k]) @ Vt[:k] + mean) - dig.data) ** 2).mean()), 4)] for k in [1, 2, 5, 10, 20, 30, 40, 64]]
data["svd"] = {"singular": [R(s, 2) for s in S[:20]], "errors": errs, "label": int(dig.target[0]),
               "images": [{"k": k, "values": [R(v, 2) for v in (dig.data[0] if k == 64 else recon(k, 0))]} for k in [2, 5, 10, 20, 64]],
               "storage": {"original": int(dig.data.size), "rank10": int(10 * (dig.data.shape[0] + dig.data.shape[1] + 1))}}

# 12 Tensors: real shapes inside the model's forward pass
cfgm = model.config
ids = torch.tensor([tok(Q, add_special_tokens=False)["input_ids"]])
with torch.no_grad():
    emb = model.get_input_embeddings()(ids)
    o = model(ids, output_hidden_states=True, output_attentions=False)
data["tensors"] = {"ids": list(ids.shape), "embeddings": list(emb.shape), "hidden": list(o.hidden_states[-1].shape), "logits": list(o.logits.shape),
                   "layers": cfgm.num_hidden_layers, "heads": cfgm.num_attention_heads, "kvHeads": cfgm.num_key_value_heads,
                   "headDim": cfgm.hidden_size // cfgm.num_attention_heads, "hidden_size": cfgm.hidden_size, "intermediate": cfgm.intermediate_size,
                   "mlpUp": list(model.model.layers[0].mlp.up_proj.weight.shape), "vocab": cfgm.vocab_size,
                   "broadcast": {"a": [3, 1], "b": [1, 4], "out": list((np.ones((3, 1)) + np.ones((1, 4))).shape)}}

# 13 Numerical stability: naive softmax overflow vs the max-subtraction trick, real float limits
z = np.array([1000.0, 1001.0, 1002.0], dtype=np.float32)
with np.errstate(over="ignore", invalid="ignore"):
    naive = np.exp(z) / np.exp(z).sum()
stable = np.exp(z - z.max()) / np.exp(z - z.max()).sum()
data["numerics"] = {"logits": z.tolist(), "naive": [str(v) for v in naive], "stable": [R(v, 4) for v in stable],
                    "limits": [{"dtype": n, "max": float(np.finfo(t).max), "eps": float(np.finfo(t).eps)} for n, t in [("float16", np.float16), ("float32", np.float32), ("float64", np.float64)]],
                    "sumSmall": {"float32": float(np.float32(1e8) + np.float32(1.0) - np.float32(1e8)), "float64": float(1e8 + 1.0 - 1e8)},
                    "logitRange": [R(lp.min(), 2), R(lp.max(), 2)]}

# 14 Norms & distances: three iris flowers + Qwen embeddings
def norms(v): return {"L1": R(np.abs(v).sum(), 3), "L2": R(np.linalg.norm(v), 3), "Linf": R(np.abs(v).max(), 3)}
E = model.get_input_embeddings().weight.detach().numpy()
def wid(w): return tok(w, add_special_tokens=False)["input_ids"][0]
pairs = [(" king", " queen"), (" king", " banana"), (" cat", " dog"), (" cat", " car")]
cos = lambda u, v: float(u @ v / (np.linalg.norm(u) * np.linalg.norm(v)))  # noqa: E731
data["norms"] = {"flowers": [{"species": iris.target_names[y_iris[i]], "v": [R(t, 1) for t in X_iris[i]], **norms(X_iris[i])} for i in idx],
                 "dist": {"L1": R(np.abs(a - c).sum(), 3), "L2": R(np.linalg.norm(a - c), 3), "cos": R(cos(a, c), 4), "pair": "setosa vs virginica"},
                 "words": [{"a": p, "b": q, "cos": R(cos(E[wid(p)], E[wid(q)]), 4), "l2": R(np.linalg.norm(E[wid(p)] - E[wid(q)]), 4)} for p, q in pairs]}

# 15 Statistics: diabetes BMI vs progression; bootstrap CI (seeded)
bmi_raw = dia.data[:, 2]
rng = np.random.default_rng(0)
boots = [np.corrcoef(*np.array([bmi_raw, dia.target])[:, rng.integers(0, len(bmi_raw), len(bmi_raw))])[0, 1] for _ in range(2000)]
t = dia.target
data["stats"] = {"n": len(t), "mean": R(t.mean(), 1), "median": R(np.median(t), 1), "std": R(t.std(ddof=1), 1),
                 "q": [R(np.percentile(t, p), 1) for p in [25, 50, 75]], "min": R(t.min()), "max": R(t.max()),
                 "corr": R(np.corrcoef(bmi_raw, t)[0, 1], 4), "ci95": [R(np.percentile(boots, 2.5), 4), R(np.percentile(boots, 97.5), 4)],
                 "scatter": [[R(bmi_raw[i], 4), R(t[i], 1), 0] for i in range(0, len(t), 2)]}

# 16 Sampling: Monte Carlo pi (seeded) + random vs stratified split class ratios on breast cancer
rng = np.random.default_rng(42)
pts = rng.random((100_000, 2)); inside = ((pts ** 2).sum(1) <= 1).cumsum()
ns = [10, 100, 1000, 10_000, 100_000]
ratios = []
for seed in range(20):
    _, _, _, yr = train_test_split(bc.data, bc.target, test_size=0.1, random_state=seed)
    _, _, _, ys = train_test_split(bc.data, bc.target, test_size=0.1, random_state=seed, stratify=bc.target)
    ratios.append([float((yr == 0).mean()), float((ys == 0).mean())])
ratios = np.array(ratios)
data["sampling"] = {"pi": [[n, R(4 * inside[n - 1] / n, 4)] for n in ns], "seed": 42,
                    "split": {"population": R((bc.target == 0).mean(), 4), "randomMin": R(ratios[:, 0].min(), 4), "randomMax": R(ratios[:, 0].max(), 4),
                              "stratMin": R(ratios[:, 1].min(), 4), "stratMax": R(ratios[:, 1].max(), 4), "runs": 20, "testSize": int(len(bc.target) * 0.1 + 1)}}

# 17 Linear systems: least squares on diabetes, condition numbers
A = np.c_[np.ones(len(dia.data)), dia.data]
coef, res, rank, sv = np.linalg.lstsq(A, dia.target, rcond=None)
pred = A @ coef
data["linsys"] = {"shape": list(A.shape), "coef": [R(v, 2) for v in coef], "features": ["intercept"] + list(dia.feature_names),
                  "r2": R(1 - ((dia.target - pred) ** 2).sum() / ((dia.target - dia.target.mean()) ** 2).sum(), 4),
                  "cond": R(np.linalg.cond(A), 2), "condNormal": R(np.linalg.cond(A.T @ A), 2),
                  "small": {"A": [[2, 1], [1, 3]], "b": [5, 10], "x": [R(v, 4) for v in np.linalg.solve([[2, 1], [1, 3]], [5, 10])]}}

# 18 Convex optimisation: logistic loss along a line (convex) vs a tiny network from different seeds (non-convex)
Xs = StandardScaler().fit_transform(bc.data); yb = bc.target
w_star = LogisticRegression(max_iter=5000).fit(Xs, yb)
def logloss(wv, bv):
    zz = Xs @ wv + bv; return float(np.mean(np.logaddexp(0, -zz * (2 * yb - 1))))
# loss along the straight line from all-zero weights (t=0) to the fitted weights (t=1), and beyond
line = [[R(t, 2), R(logloss(w_star.coef_[0] * t, w_star.intercept_[0] * t), 4)] for t in np.linspace(-1, 3, 33)]
finals = []
for seed in range(5):
    torch.manual_seed(seed)
    net = torch.nn.Sequential(torch.nn.Linear(30, 4), torch.nn.Tanh(), torch.nn.Linear(4, 1))
    opt = torch.optim.SGD(net.parameters(), lr=0.5)
    Xt = torch.tensor(Xs, dtype=torch.float32); yt = torch.tensor(yb, dtype=torch.float32)
    for _ in range(300):
        opt.zero_grad(); l = torch.nn.functional.binary_cross_entropy_with_logits(net(Xt).squeeze(1), yt); l.backward(); opt.step()
    finals.append({"seed": seed, "loss": R(l.item(), 4), "firstWeight": R(net[0].weight[0, 0].item(), 4)})
data["convex"] = {"line": line, "networks": finals}

# 19 Complex numbers / RoPE: the model's rotary base and real rotation angles
theta = float(getattr(cfgm, "rope_theta", 10000.0)); d = cfgm.hidden_size // cfgm.num_attention_heads
inv = theta ** (-np.arange(0, d, 2) / d)
data["complex"] = {"ropeTheta": theta, "headDim": d, "pairs": d // 2,
                   "angles": [{"pos": p, "fastest": R((p * inv[0]) % (2 * np.pi), 4), "slowest": R(p * inv[-1], 8)} for p in [1, 2, 10, 100]],
                   "periods": [R(2 * np.pi / f, 1) for f in [inv[0], inv[len(inv) // 2], inv[-1]]],
                   "rotate": {"z": [1, 0], "byDeg": 90, "result": [R(np.cos(np.pi / 2), 4), R(np.sin(np.pi / 2), 4)]}}

# 20 Fourier: Mauna Loa CO2 (weekly, 1958–2001) — find the yearly cycle with an FFT
s = co2.load_pandas().data["co2"].interpolate()
s = s.resample("MS").mean()
vals_co2 = s.values; det = vals_co2 - np.polyval(np.polyfit(np.arange(len(vals_co2)), vals_co2, 2), np.arange(len(vals_co2)))
F = np.abs(np.fft.rfft(det)); freqs = np.fft.rfftfreq(len(det), d=1.0)
k = int(F[1:].argmax() + 1)
data["fourier"] = {"start": str(s.index[0].date()), "end": str(s.index[-1].date()), "months": len(s),
                   "series": [[R(i / 12 + s.index[0].year, 3), R(v, 2)] for i, v in enumerate(vals_co2)][::2],
                   "detrended": [[i, R(v, 3)] for i, v in enumerate(det[:72])],
                   "spectrum": [[R(1 / f, 2) if f else 0, R(a, 1)] for f, a in zip(freqs[1:60], F[1:60])],
                   "peakPeriodMonths": R(1 / freqs[k], 2), "first": R(vals_co2[0], 2), "last": R(vals_co2[-1], 2)}

# 21 Graph theory: Zachary's karate club
G = nx.karate_club_graph()
pr = nx.pagerank(G)
comms = list(nx.community.greedy_modularity_communities(G))
data["graph"] = {"nodes": G.number_of_nodes(), "edges": G.number_of_edges(), "density": R(nx.density(G), 4),
                 "topDegree": sorted([[n, d] for n, d in G.degree()], key=lambda x: -x[1])[:5],
                 "topPagerank": [[n, R(v, 4)] for n, v in sorted(pr.items(), key=lambda x: -x[1])[:5]],
                 "avgPath": R(nx.average_shortest_path_length(G), 3), "diameter": nx.diameter(G),
                 "communities": [sorted(c) for c in comms], "clubSplit": {str(n): G.nodes[n]["club"] for n in G.nodes},
                 "path0to33": nx.shortest_path(G, 0, 33)}
pos = nx.spring_layout(G, seed=0)
data["graph"]["layout"] = [[R(pos[n][0], 3), R(pos[n][1], 3), next(i for i, c in enumerate(comms) if n in c)] for n in G.nodes]
data["graph"]["edgesList"] = [[u, v] for u, v in G.edges]
from collections import Counter as _C  # noqa: E402
_club = {n: G.nodes[n]["club"] for n in G.nodes}
data["graph"]["agreement"] = {"matched": sum(sum(_club[n] == _C(_club[m] for m in c).most_common(1)[0][0] for n in c) for c in comms), "total": G.number_of_nodes()}

# 22 Stochastic processes: a word-level Markov chain from this course's own curriculum text (seeded walk)
import re  # noqa: E402
text = open(__file__.replace("scripts/data/measure_p01.py", "docs/curriculum.md")).read().lower()
words = re.findall(r"[a-z]+", text)
from collections import Counter, defaultdict  # noqa: E402
nxt = defaultdict(Counter)
for w1, w2 in zip(words, words[1:]): nxt[w1][w2] += 1
start = "the"
trans = [{"next": w, "p": R(c / sum(nxt[start].values()), 4)} for w, c in nxt[start].most_common(6)]
rng = np.random.default_rng(7); walk = [start]
for _ in range(12):
    opts = nxt[walk[-1]]
    if not opts: break
    ws_, cs_ = zip(*opts.items()); walk.append(str(rng.choice(ws_, p=np.array(cs_) / sum(cs_))))
rng = np.random.default_rng(1)
rw = np.cumsum(rng.choice([-1, 1], size=200))
data["stochastic"] = {"corpusWords": len(words), "vocab": len(set(words)), "from": start, "transitions": trans, "walk": walk, "seed": 7,
                      "randomWalk": [[i, int(v)] for i, v in enumerate(rw)], "rwSeed": 1}

json.dump(data, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
print({k: (str(v)[:160]) for k, v in data.items()})
