"""Live apps for Phase 02 (ML Fundamentals): real public datasets -> small model files the browser runs live.

Every app in the lessons replays REAL rows through REAL trained models. Nothing here is random except the seeded
train/test split and seeded algorithm initialisation; each output carries its dataset name, licence and source URL.

  inbox   SMS Spam Collection (Almeida & Gomez Hidalgo, UCI, CC BY 4.0)            -> naive Bayes, logistic regression, linear SVM, a hand rule
  homes   California Housing (1990 US census, Pace & Barry 1997, via scikit-learn)  -> linear models, engineered features, trees, lasso path
  movies  MovieLens 100K (GroupLens, University of Minnesota; research use)         -> item-item KNN recommender, viewer taste profiles
  loans   Statlog German Credit (Hofmann, UCI, CC BY 4.0)                           -> decision tree, random forest, gradient boosting, tuning
  sensor  NAB machine_temperature_system_failure (Numenta, MIT)                     -> hourly series + labelled failure windows
  cards   Credit Card Fraud Detection (ULB MLG, OpenML 1597, DbCL 1.0)               -> imbalanced fraud scoring
  serving per-request latency of the models above, measured on this machine

Usage:  .venv/bin/python measure_apps.py <download-dir> ../../src/lessons/data/apps

<download-dir> must contain (California Housing and the card-fraud set are fetched by scikit-learn itself):
  https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip
  https://files.grouplens.org/datasets/movielens/ml-100k.zip
  https://archive.ics.uci.edu/static/public/144/statlog+german+credit+data.zip
  https://raw.githubusercontent.com/numenta/NAB/master/data/realKnownCause/machine_temperature_system_failure.csv
  https://raw.githubusercontent.com/numenta/NAB/master/labels/combined_windows.json
"""
import datetime
import io
import json
import os
import platform
import re
import sys
import time
import zipfile

import numpy as np
import pandas as pd
import sklearn
from sklearn.cluster import KMeans
from sklearn.datasets import fetch_california_housing, fetch_openml
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import Lasso, LinearRegression, LogisticRegression
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score, mean_absolute_error, precision_score, r2_score,
                             recall_score, roc_auc_score, silhouette_score)
from sklearn.model_selection import ParameterSampler, cross_val_score, train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.preprocessing import StandardScaler
from sklearn.svm import LinearSVC
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor

DL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SEED = 0
R = lambda x, d=4: float(round(float(x), d))  # noqa: E731
PROV = {"measuredAt": datetime.date.today().isoformat(), "script": "scripts/data/measure_apps.py", "sklearn": sklearn.__version__, "seed": SEED}


def dump(name, obj):
    with open(os.path.join(OUT, f"{name}.json"), "w") as f:
        json.dump(obj, f, separators=(",", ":"), ensure_ascii=False)
    print(f"{name}.json  {os.path.getsize(os.path.join(OUT, name + '.json')) / 1024:.0f} KB")


def cls_metrics(y, p):
    tn, fp, fn, tp = confusion_matrix(y, p, labels=[0, 1]).ravel()
    return {"accuracy": R(accuracy_score(y, p)), "precision": R(precision_score(y, p, zero_division=0)), "recall": R(recall_score(y, p)),
            "f1": R(f1_score(y, p)), "tp": int(tp), "fp": int(fp), "fn": int(fn), "tn": int(tn)}


def timed(fn, x_rows, n=400):
    """Median and p99 latency (ms) of single-row predictions, plus every measured value."""
    lat = []
    for i in range(n):
        row = x_rows[i % len(x_rows)]
        t = time.perf_counter(); fn(row); lat.append((time.perf_counter() - t) * 1000)
    lat = np.array(lat)
    return {"p50": R(np.percentile(lat, 50), 3), "p99": R(np.percentile(lat, 99), 3), "samples": [R(v, 3) for v in lat]}


latencies = {}

# ------------------------------------------------------------------ inbox: SMS spam
raw = zipfile.ZipFile(os.path.join(DL, "sms+spam+collection.zip")).read("SMSSpamCollection").decode("utf-8")
rows = [line.split("\t", 1) for line in raw.strip().split("\n")]
texts = [t for _, t in rows]; ys = np.array([1 if lab == "spam" else 0 for lab, _ in rows])
t_tr, t_te, y_tr, y_te = train_test_split(texts, ys, test_size=0.3, random_state=SEED, stratify=ys)
# Same tokenizer as the browser: lowercase, runs of 2+ letters/digits/underscore.
vec = CountVectorizer(lowercase=True, token_pattern=r"(?u)\b\w\w+\b", min_df=2)
Xs_tr = vec.fit_transform(t_tr); Xs_te = vec.transform(t_te)
vocab = vec.get_feature_names_out().tolist()
nb = MultinomialNB(alpha=1.0).fit(Xs_tr, y_tr)
lr = LogisticRegression(C=1.0, max_iter=5000).fit(Xs_tr, y_tr)
svm = LinearSVC(C=0.5, max_iter=20000, random_state=SEED).fit(Xs_tr, y_tr)
RULE_WORDS = ["free", "win", "winner", "prize", "claim", "urgent", "cash"]
rule = lambda t: int(any(w in re.findall(r"\w\w+", t.lower()) for w in RULE_WORDS))  # noqa: E731
p_nb = nb.predict_proba(Xs_te)[:, 1]; p_lr = lr.predict_proba(Xs_te)[:, 1]; m_svm = svm.decision_function(Xs_te)
log_ratio = nb.feature_log_prob_[1] - nb.feature_log_prob_[0]
order = np.argsort(log_ratio)
STREAM = 400
dump("inbox", {
    "provenance": {**PROV, "dataset": "SMS Spam Collection v.1", "by": "T. A. Almeida & J. M. Gómez Hidalgo (2011)", "licence": "CC BY 4.0",
                   "url": "https://archive.ics.uci.edu/dataset/228/sms+spam+collection"},
    "counts": {"messages": len(texts), "spam": int(ys.sum()), "ham": int(len(ys) - ys.sum()), "train": len(t_tr), "test": len(t_te)},
    "vocab": vocab,
    "nb": {"prior": [R(v) for v in nb.class_log_prior_], "ham": [R(v) for v in nb.feature_log_prob_[0]], "spam": [R(v) for v in nb.feature_log_prob_[1]]},
    "lr": {"b": R(lr.intercept_[0]), "w": [R(v) for v in lr.coef_[0]]},
    "svm": {"b": R(svm.intercept_[0]), "w": [R(v) for v in svm.coef_[0]]},
    "rule": RULE_WORDS,
    "test": {
        "baseline": R(1 - y_te.mean()),
        "nb": cls_metrics(y_te, (p_nb >= 0.5).astype(int)), "lr": cls_metrics(y_te, (p_lr >= 0.5).astype(int)),
        "svm": cls_metrics(y_te, (m_svm >= 0).astype(int)), "rule": cls_metrics(y_te, np.array([rule(t) for t in t_te])),
        "auc": {"nb": R(roc_auc_score(y_te, p_nb)), "lr": R(roc_auc_score(y_te, p_lr)), "svm": R(roc_auc_score(y_te, m_svm))},
        "lrThresholds": [{"t": t, **cls_metrics(y_te, (p_lr >= t).astype(int))} for t in [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95]],
        "svmNearMargin": int((np.abs(m_svm) < 1).sum()),
    },
    "topSpam": [[vocab[i], R(log_ratio[i], 2)] for i in order[::-1][:12]],
    "topHam": [[vocab[i], R(log_ratio[i], 2)] for i in order[:12]],
    "stream": [{"text": t, "spam": int(y)} for t, y in zip(t_te[:STREAM], y_te[:STREAM])],
    "check": {"nb": [R(v) for v in p_nb[:25]], "lr": [R(v) for v in p_lr[:25]], "svm": [R(v) for v in m_svm[:25]]},
})
xs1 = [Xs_te[i] for i in range(50)]
latencies["Spam · naive Bayes"] = timed(lambda r: nb.predict_proba(r), xs1)
latencies["Spam · logistic regression"] = timed(lambda r: lr.predict_proba(r), xs1)

# ------------------------------------------------------------------ homes: California housing
ch = fetch_california_housing(as_frame=True)
H = ch.frame.copy(); FEATS = list(ch.feature_names)
Htr, Hte = train_test_split(H, test_size=0.2, random_state=SEED)
yh_tr, yh_te = Htr.MedHouseVal.values, Hte.MedHouseVal.values
usd = lambda v: R(v * 100000, 0)  # noqa: E731  target unit is $100,000

one = LinearRegression().fit(Htr[["MedInc"]], yh_tr)
raw8 = LinearRegression().fit(Htr[FEATS], yh_tr)


def engineer(df, cells=None):
    out = pd.DataFrame({
        "MedInc": df.MedInc, "HouseAge": df.HouseAge, "logRooms": np.log(df.AveRooms), "bedroomShare": df.AveBedrms / df.AveRooms,
        "logPopulation": np.log(df.Population), "logOccupancy": np.log(df.AveOccup),
    }, index=df.index)
    cell = (np.floor(df.Latitude * 2) / 2).astype(str) + "," + (np.floor(df.Longitude * 2) / 2).astype(str)
    cells = cells if cells is not None else sorted(cell.value_counts()[lambda s: s >= 30].index.tolist())
    for c in cells:
        out["cell:" + c] = (cell == c).astype(float)
    return out, cells


E_tr, CELLS = engineer(Htr); E_te, _ = engineer(Hte, CELLS)
eng = LinearRegression().fit(E_tr, yh_tr)
depths = [1, 2, 3, 4, 6, 8, 10, 12, 15, 20, None]
tree_curve, tree_models = [], {}
for d in depths:
    m = DecisionTreeRegressor(max_depth=d, random_state=SEED).fit(Htr[FEATS], yh_tr)
    tree_models[d] = m
    tree_curve.append({"depth": d if d else "none", "leaves": int(m.get_n_leaves()), "train": usd(mean_absolute_error(yh_tr, m.predict(Htr[FEATS]))),
                       "test": usd(mean_absolute_error(yh_te, m.predict(Hte[FEATS])))})
sc = StandardScaler().fit(Htr[FEATS]); Z_tr = sc.transform(Htr[FEATS]); Z_te = sc.transform(Hte[FEATS])
lasso = []
for a in [0.001, 0.01, 0.03, 0.06, 0.1, 0.2, 0.35, 0.5, 0.8]:
    m = Lasso(alpha=a, max_iter=50000).fit(Z_tr, yh_tr)
    lasso.append({"alpha": a, "b": R(m.intercept_), "w": [R(v) for v in m.coef_], "nonzero": int((np.abs(m.coef_) > 1e-9).sum()),
                  "mae": usd(mean_absolute_error(yh_te, m.predict(Z_te)))})
S = Hte.iloc[:240]
dump("homes", {
    "provenance": {**PROV, "dataset": "California Housing (1990 US census block groups)", "by": "R. K. Pace & R. Barry (1997), via scikit-learn",
                   "licence": "public (StatLib)", "url": "https://scikit-learn.org/stable/datasets/real_world.html#california-housing-dataset"},
    "counts": {"districts": len(H), "train": len(Htr), "test": len(Hte), "capped": int((H.MedHouseVal >= 5.0).sum())},
    "features": FEATS,
    "one": {"slope": R(one.coef_[0], 5), "intercept": R(one.intercept_, 5), "mae": usd(mean_absolute_error(yh_te, one.predict(Hte[["MedInc"]]))),
            "r2": R(r2_score(yh_te, one.predict(Hte[["MedInc"]])))},
    "raw": {"b": R(raw8.intercept_, 5), "w": [R(v, 6) for v in raw8.coef_], "mae": usd(mean_absolute_error(yh_te, raw8.predict(Hte[FEATS]))),
            "r2": R(r2_score(yh_te, raw8.predict(Hte[FEATS])))},
    "eng": {"b": R(eng.intercept_, 5), "names": E_tr.columns.tolist(), "w": [R(v, 5) for v in eng.coef_], "cells": CELLS,
            "mae": usd(mean_absolute_error(yh_te, eng.predict(E_te))), "r2": R(r2_score(yh_te, eng.predict(E_te)))},
    "trees": {"curve": tree_curve, "pred": {str(d): [R(v, 3) for v in tree_models[d].predict(S[FEATS])] for d in [2, 8, None]}},
    "lasso": {"mean": [R(v, 5) for v in sc.mean_], "scale": [R(v, 5) for v in sc.scale_], "path": lasso},
    "baselineMae": usd(mean_absolute_error(yh_te, np.full_like(yh_te, yh_tr.mean()))),
    "stream": [[R(v, 4) for v in r] + [R(t, 3)] for r, t in zip(S[FEATS].values, S.MedHouseVal.values)],
    "map": [[R(a, 2), R(b, 2)] for a, b in Htr[["Latitude", "Longitude"]].sample(1600, random_state=SEED).values],
})
xh = [Hte[FEATS].iloc[[i]] for i in range(50)]
latencies["Homes · linear regression"] = timed(lambda r: raw8.predict(r), xh)

# ------------------------------------------------------------------ movies: MovieLens 100K
mz = zipfile.ZipFile(os.path.join(DL, "ml-100k.zip"))
ratings = pd.read_csv(io.BytesIO(mz.read("ml-100k/u.data")), sep="\t", names=["u", "i", "r", "ts"])
GENRES = [g.split("|")[0] for g in mz.read("ml-100k/u.genre").decode("latin-1").strip().split("\n") if g]
items = pd.read_csv(io.BytesIO(mz.read("ml-100k/u.item")), sep="|", header=None, encoding="latin-1")
items = items.set_index(0)
counts = ratings.i.value_counts()
POP = counts[counts >= 100].index.sort_values().tolist()
umean = ratings.groupby("u").r.mean()
rp = ratings[ratings.i.isin(POP)].copy(); rp["c"] = rp.r - rp.u.map(umean)
M = rp.pivot_table(index="i", columns="u", values="c", fill_value=0.0).loc[POP].values
norm = np.linalg.norm(M, axis=1, keepdims=True); SIM = (M @ M.T) / (norm @ norm.T); np.fill_diagonal(SIM, 0)
pos = {m: k for k, m in enumerate(POP)}


def title(m):
    t = items.loc[m, 1]
    return re.sub(r", The \(", " (", t).replace(", The", "")


# leave-one-out hit@10: hide each user's most recent liked popular movie, recommend from the rest
liked = ratings[(ratings.r >= 4) & ratings.i.isin(POP)].sort_values("ts")
seen = ratings[ratings.i.isin(POP)].groupby("u").i.apply(set)
pop_rank = [pos[m] for m in counts.loc[POP].sort_values(ascending=False).index]
hits = {k: 0 for k in [1, 3, 5, 10, 20, 50]}; hit_pop = 0; users = 0
for u, g in liked.groupby("u"):
    if len(g) < 5:
        continue
    users += 1; hidden = pos[g.i.iloc[-1]]; keep = [pos[m] for m in g.i.iloc[:-1]]; excl = {pos[m] for m in seen[u]} - {hidden}
    for k in hits:
        score = np.zeros(len(POP))
        for j in keep:
            nb_idx = np.argsort(SIM[j])[::-1][:k]; score[nb_idx] += SIM[j, nb_idx]
        score[list(excl)] = -1e9
        hits[k] += int(hidden in np.argsort(score)[::-1][:10])
    top_pop = [j for j in pop_rank if j not in excl][:10]
    hit_pop += int(hidden in top_pop)
# taste profiles: share of each user's ratings per genre (aggregate, not raw ratings)
gcols = list(range(5, 5 + len(GENRES)))
ig = items[gcols].values.astype(float); ig_idx = {m: k for k, m in enumerate(items.index)}
prof = np.zeros((ratings.u.nunique(), len(GENRES)))
for u, g in ratings.groupby("u"):
    v = ig[[ig_idx[m] for m in g.i]].sum(0); prof[u - 1] = v / v.sum()
prof = prof[:, 1:]; GEN = GENRES[1:]  # drop 'unknown'
elbow = []
for k in range(2, 11):
    km = KMeans(n_clusters=k, n_init=10, random_state=SEED).fit(prof)
    elbow.append({"k": k, "inertia": R(km.inertia_), "silhouette": R(silhouette_score(prof, km.labels_))})
dump("movies", {
    "provenance": {**PROV, "dataset": "MovieLens 100K", "by": "GroupLens Research, University of Minnesota (Harper & Konstan 2015)",
                   "licence": "research use with acknowledgement; only derived similarities and genre shares are included",
                   "url": "https://grouplens.org/datasets/movielens/100k/"},
    "counts": {"ratings": len(ratings), "users": int(ratings.u.nunique()), "movies": int(ratings.i.nunique()), "popular": len(POP)},
    "genres": GEN,
    "movies": [{"t": title(m), "n": int(counts[m]), "g": [GENRES[j - 5] for j in gcols if items.loc[m, j] == 1],
                "nb": [[int(j), R(SIM[k, j], 3)] for j in np.argsort(SIM[k])[::-1][:20]]} for k, m in enumerate(POP)],
    "eval": {"users": users, "popularity": R(hit_pop / users), "knn": [{"k": k, "hit10": R(v / users)} for k, v in hits.items()]},
    "profiles": [[R(v, 3) for v in r] for r in prof],
    "elbow": elbow,
})

# ------------------------------------------------------------------ loans: German credit
gz = zipfile.ZipFile(os.path.join(DL, "statlog+german+credit+data.zip"))
g = pd.read_csv(io.BytesIO(gz.read("german.data")), sep=" ", header=None)
CHECK = {"A11": "below 0 DM", "A12": "0–200 DM", "A13": "200+ DM", "A14": "no account"}
HIST = {"A30": "no credits / all paid", "A31": "all paid here", "A32": "paying duly", "A33": "delays before", "A34": "critical account"}
SAV = {"A61": "< 100 DM", "A62": "100–500 DM", "A63": "500–1000 DM", "A64": "1000+ DM", "A65": "unknown / none"}
EMP = {"A71": 0, "A72": 0.5, "A73": 2.5, "A74": 5.5, "A75": 8}  # years in job (midpoints of the coded ranges)
HOUSE = {"A151": "rent", "A152": "own", "A153": "free"}
PURP = {"A40": "new car", "A41": "used car", "A42": "furniture", "A43": "radio / TV", "A44": "appliances", "A45": "repairs",
        "A46": "education", "A48": "retraining", "A49": "business", "A410": "other"}
apps = pd.DataFrame({"checking": g[0].map(CHECK), "months": g[1], "history": g[2].map(HIST), "purpose": g[3].map(PURP),
                     "amount": g[4], "savings": g[5].map(SAV), "jobYears": g[6].map(EMP), "age": g[12], "housing": g[14].map(HOUSE)})
yl = (g[20] == 2).astype(int).values  # 1 = defaulted ("bad")
CAT = {"checking": list(CHECK.values()), "history": list(HIST.values()), "purpose": list(PURP.values()), "savings": list(SAV.values()), "housing": list(HOUSE.values())}
NUM = ["months", "amount", "jobYears", "age"]


def encode(df):
    cols = {c: df[c].astype(float) for c in NUM}
    for c, vals in CAT.items():
        for v in vals:
            cols[f"{c} = {v}"] = (df[c] == v).astype(float)
    return pd.DataFrame(cols, index=df.index)


XL = encode(apps); LF = XL.columns.tolist()
xl_tr, xl_te, yl_tr, yl_te, a_tr, a_te = train_test_split(XL.values, yl, apps, test_size=0.3, random_state=SEED, stratify=yl)


def export_tree(t, leaf="proba"):
    tr = t.tree_
    out = []
    for i in range(tr.node_count):
        if tr.children_left[i] == -1:
            v = tr.value[i][0]
            out.append({"leaf": R(v[1] / v.sum(), 4) if leaf == "proba" else R(v[0], 5), "n": int(tr.n_node_samples[i])})
        else:
            out.append({"f": int(tr.feature[i]), "t": R(tr.threshold[i], 3), "l": int(tr.children_left[i]), "r": int(tr.children_right[i]), "n": int(tr.n_node_samples[i])})
    return out


tree3 = DecisionTreeClassifier(max_depth=3, random_state=SEED).fit(xl_tr, yl_tr)
depth_curve = []
for d in [1, 2, 3, 4, 5, 6, 8, 10, 15, None]:
    m = DecisionTreeClassifier(max_depth=d, random_state=SEED).fit(xl_tr, yl_tr)
    depth_curve.append({"depth": d if d else "none", "train": R(accuracy_score(yl_tr, m.predict(xl_tr))), "test": R(accuracy_score(yl_te, m.predict(xl_te))),
                        "auc": R(roc_auc_score(yl_te, m.predict_proba(xl_te)[:, 1]))})
rf = RandomForestClassifier(n_estimators=40, max_depth=5, random_state=SEED).fit(xl_tr, yl_tr)
gb = GradientBoostingClassifier(n_estimators=80, max_depth=2, learning_rate=0.1, random_state=SEED).fit(xl_tr, yl_tr)
prior = yl_tr.mean(); gb_init = float(np.log(prior / (1 - prior)))


def summary(m):
    p = m.predict_proba(xl_te)[:, 1]
    pred = (p >= 0.5).astype(int)
    cm = cls_metrics(yl_te, pred)
    return {**cm, "auc": R(roc_auc_score(yl_te, p)), "cost": int(5 * cm["fn"] + cm["fp"])}


# hyper-parameter search, in the order a search would run it (5-fold CV ROC AUC on the training set)
grid = [{"max_depth": d, "min_samples_leaf": s} for d in [2, 3, 4, 5, 6, 8, 10] for s in [1, 5, 10, 20, 40]]
cv = lambda p: R(cross_val_score(DecisionTreeClassifier(random_state=SEED, **p), xl_tr, yl_tr, cv=5, scoring="roc_auc").mean())  # noqa: E731
grid_res = [{**p, "auc": cv(p)} for p in grid]
rand = list(ParameterSampler({"max_depth": list(range(2, 11)), "min_samples_leaf": list(range(1, 41))}, n_iter=12, random_state=SEED))
rand_res = [{**{k: int(v) for k, v in p.items()}, "auc": cv(p)} for p in rand]
bestp = max(grid_res, key=lambda r: r["auc"])
best_tree = DecisionTreeClassifier(random_state=SEED, max_depth=bestp["max_depth"], min_samples_leaf=bestp["min_samples_leaf"]).fit(xl_tr, yl_tr)
dump("loans", {
    "provenance": {**PROV, "dataset": "Statlog (German Credit Data)", "by": "Prof. Dr. Hans Hofmann (1994), UCI", "licence": "CC BY 4.0",
                   "url": "https://archive.ics.uci.edu/dataset/144/statlog+german+credit+data"},
    "counts": {"applicants": len(g), "defaulted": int(yl.sum()), "train": len(yl_tr), "test": len(yl_te)},
    "features": LF, "num": NUM, "cat": CAT,
    "baseline": R(1 - yl_te.mean()),
    "tree": {"nodes": export_tree(tree3), **summary(tree3)},
    "depthCurve": depth_curve,
    "forest": {"trees": [export_tree(t) for t in rf.estimators_], **summary(rf)},
    "boost": {"init": R(gb_init, 5), "lr": 0.1, "trees": [export_tree(t[0], leaf="value") for t in gb.estimators_], **summary(gb)},
    "tuning": {"grid": grid_res, "random": rand_res, "best": bestp, "bestTest": summary(best_tree)},
    "stream": [{**{k: (v if isinstance(v, str) else (int(v) if float(v).is_integer() else float(v))) for k, v in r.items()}, "bad": int(y)}
               for (_, r), y in zip(a_te.iloc[:120].iterrows(), yl_te[:120])],
    "check": {"tree": [R(v) for v in tree3.predict_proba(xl_te[:20])[:, 1]], "forest": [R(v) for v in rf.predict_proba(xl_te[:20])[:, 1]],
              "boost": [R(v) for v in gb.predict_proba(xl_te[:20])[:, 1]]},
})
xl1 = [xl_te[[i]] for i in range(50)]
latencies["Loans · decision tree"] = timed(lambda r: tree3.predict_proba(r), xl1)
latencies["Loans · random forest (40 trees)"] = timed(lambda r: rf.predict_proba(r), xl1)
latencies["Loans · gradient boosting (80 trees)"] = timed(lambda r: gb.predict_proba(r), xl1)

# ------------------------------------------------------------------ sensor: NAB machine temperature
ts = pd.read_csv(os.path.join(DL, "machine_temperature_system_failure.csv"), parse_dates=["timestamp"]).set_index("timestamp").value
hourly = ts.resample("1h").mean().interpolate()
win = json.load(open(os.path.join(DL, "combined_windows.json")))["realKnownCause/machine_temperature_system_failure.csv"]
t0 = hourly.index[0]
hidx = lambda s: int((pd.Timestamp(s) - t0) / pd.Timedelta("1h"))  # noqa: E731
windows = [[max(0, hidx(a)), min(len(hourly) - 1, hidx(b))] for a, b in win]
v = hourly.values
# the same detectors the browser runs (lesson text quotes these numbers)
def zscore_alerts(v, W=72, thr=3.0):
    flags = []
    for i in range(W, len(v)):
        w = v[i - W:i]; s = w.std()
        if s > 0 and abs(v[i] - w.mean()) / s > thr:
            flags.append(i)
    return flags


def episodes(flags, gap=6):
    eps = []
    for f in flags:
        if eps and f - eps[-1][1] <= gap:
            eps[-1][1] = f
        else:
            eps.append([f, f])
    return eps


def score_eps(eps):
    caught = sum(any(a <= e[1] and e[0] <= b for e in eps) for a, b in windows)
    false = sum(not any(a <= e[1] and e[0] <= b for a, b in windows) for e in eps)
    first = []
    for a, b in windows:
        hit = [e[0] for e in eps if a <= e[1] and e[0] <= b]
        first.append(int(hit[0] - a) if hit else None)
    return {"caught": int(caught), "falseAlarms": int(false), "hoursIntoWindow": first}


det = {str(thr): score_eps(episodes(zscore_alerts(v, 72, thr))) for thr in [2.0, 2.5, 3.0, 3.5, 4.0]}
H6 = 6
mae = {"naive": R(np.mean(np.abs(v[H6 + 24:] - v[24:-H6]))), "seasonal": R(np.mean(np.abs(v[H6 + 24:] - v[H6:-24]))),
       "mean24": R(np.mean([abs(v[i] - v[i - H6 - 24:i - H6].mean()) for i in range(H6 + 24, len(v))]))}


def psi(ref, cur, bins=10):
    edges = np.quantile(ref, np.linspace(0, 1, bins + 1)); edges[0], edges[-1] = -np.inf, np.inf
    a = np.histogram(ref, edges)[0] / len(ref) + 1e-4; b = np.histogram(cur, edges)[0] / len(cur) + 1e-4
    return float(np.sum((b - a) * np.log(b / a)))


REF = 168
psis = [psi(v[:REF], v[i - REF:i]) for i in range(2 * REF, len(v) + 1)]
dump("sensor", {
    "provenance": {**PROV, "dataset": "NAB realKnownCause/machine_temperature_system_failure", "by": "Numenta Anomaly Benchmark (Lavin & Ahmad 2015)",
                   "licence": "MIT", "url": "https://github.com/numenta/NAB"},
    "start": str(t0), "stepHours": 1, "rawReadings": int(len(ts)), "rawStepMinutes": 5,
    "values": [R(x, 1) for x in v], "windows": windows,
    "zscore": det, "forecastMae6h": mae, "psi": {"refHours": REF, "max": R(max(psis), 3), "firstAbove02": int(2 * REF + next(i for i, p in enumerate(psis) if p > 0.2)) if any(p > 0.2 for p in psis) else None},
})

# ------------------------------------------------------------------ cards: credit card fraud
cc = fetch_openml(data_id=1597, as_frame=True, parser="auto").frame
cc["Class"] = cc["Class"].astype(int)
cc = cc.reset_index(drop=True)  # OpenML keeps the original row order, which is time order (no Time column)
cut = int(len(cc) * 0.7)
ctr, cte = cc.iloc[:cut], cc.iloc[cut:]
VC = [c for c in cc.columns if c != "Class"]
cs = StandardScaler().fit(ctr[VC])
Ctr, Cte = cs.transform(ctr[VC]), cs.transform(cte[VC])
plain = LogisticRegression(max_iter=5000).fit(Ctr, ctr.Class)
weighted = LogisticRegression(max_iter=5000, class_weight="balanced").fit(Ctr, ctr.Class)
EDGES = np.linspace(0, 1, 201)


def hist(m):
    p = m.predict_proba(Cte)[:, 1]
    return {"fraud": np.histogram(p[cte.Class.values == 1], EDGES)[0].tolist(), "legit": np.histogram(p[cte.Class.values == 0], EDGES)[0].tolist(),
            "auc": R(roc_auc_score(cte.Class, p)), "at05": cls_metrics(cte.Class.values, (p >= 0.5).astype(int))}, p


hp, pp = hist(plain); hw, pw = hist(weighted)
# a contiguous slice of real test traffic around the first test fraud, in time order
fi = int(np.argmax(cte.Class.values == 1)); lo = max(0, fi - 300)
sl = cte.iloc[lo:lo + 1200]
dump("cards", {
    "provenance": {**PROV, "dataset": "Credit Card Fraud Detection (European cardholders, Sept 2013)", "by": "Worldline & ULB Machine Learning Group (Dal Pozzolo et al. 2015), OpenML 1597",
                   "licence": "DbCL 1.0", "url": "https://www.openml.org/d/1597"},
    "counts": {"transactions": len(cc), "frauds": int(cc.Class.sum()), "train": len(ctr), "test": len(cte), "testFrauds": int(cte.Class.sum())},
    "baseline": R(1 - cte.Class.mean(), 5),
    "plain": hp, "weighted": hw,
    "slice": {"from": int(lo), "rows": [[R(a, 2), int(c), R(p1, 4), R(p2, 4)] for a, c, p1, p2 in
                                          zip(sl.Amount, sl.Class, pp[lo:lo + 1200], pw[lo:lo + 1200])]},
})

# ------------------------------------------------------------------ serving: latencies measured above
dump("serving", {"provenance": {**PROV, "machine": f"{platform.processor() or platform.machine()} · Python {platform.python_version()}",
                                "method": "400 single-row predict calls per model, timed with perf_counter"}, "models": latencies})

# ------------------------------------------------------------------ key numbers for lesson text
import subprocess  # noqa: E402
subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), "summarize_apps.py"), OUT], check=True)
