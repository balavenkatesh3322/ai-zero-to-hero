"""Phase 02 (ML Fundamentals): train and evaluate every model shown in the 21 lessons on real public datasets.

Datasets: Breast Cancer Wisconsin, Diabetes, Iris, Wine, Digits (scikit-learn), 20 Newsgroups (downloaded via
scikit-learn), Mauna Loa CO2 (statsmodels). Fixed seeds everywhere; anything synthetic is labelled as such.
Usage: .venv/bin/python measure_p02.py ../../src/lessons/data/p02.json
"""
import datetime
import json
import pickle
import sys
import time

import numpy as np
import sklearn
from sklearn.cluster import DBSCAN, KMeans
from sklearn.datasets import fetch_20newsgroups, load_breast_cancer, load_diabetes, load_digits, load_iris, load_wine
from sklearn.ensemble import AdaBoostClassifier, BaggingClassifier, GradientBoostingClassifier, IsolationForest, RandomForestClassifier, StackingClassifier
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_selection import RFE, SelectKBest, f_classif
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import (accuracy_score, adjusted_rand_score, confusion_matrix, f1_score, mean_absolute_error,
                             precision_score, r2_score, recall_score, roc_auc_score)
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV, cross_val_score, learning_curve, train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from statsmodels.datasets import co2

OUT = sys.argv[1]
R = lambda x, d=4: float(round(float(x), d))  # noqa: E731
SEED = 0
data = {"provenance": {"measuredAt": datetime.date.today().isoformat(), "script": "scripts/data/measure_p02.py", "sklearn": sklearn.__version__, "seed": SEED}}

bc = load_breast_cancer(); Xb, yb = bc.data, bc.target          # 0 = malignant, 1 = benign
Xtr, Xte, ytr, yte = train_test_split(Xb, yb, test_size=0.3, random_state=SEED, stratify=yb)
dia = load_diabetes(); iris = load_iris(); wine = load_wine(); dig = load_digits()

# 01 What is ML: majority baseline vs a learned model
lr_pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)).fit(Xtr, ytr)
data["what"] = {"rows": len(yb), "features": Xb.shape[1], "featureExamples": list(bc.feature_names[:5]),
                "classes": {"malignant": int((yb == 0).sum()), "benign": int((yb == 1).sum())},
                "train": len(ytr), "test": len(yte),
                "baseline": R(max(np.mean(yte == 0), np.mean(yte == 1))), "model": R(accuracy_score(yte, lr_pipe.predict(Xte)))}

# 02 Linear regression from scratch: BMI -> progression
x = dia.data[:, 2]; y = dia.target
xtr, xte, ytr2, yte2 = train_test_split(x, y, test_size=0.3, random_state=SEED)
slope = ((xtr - xtr.mean()) * (ytr2 - ytr2.mean())).sum() / ((xtr - xtr.mean()) ** 2).sum(); inter = ytr2.mean() - slope * xtr.mean()
pred = slope * xte + inter
sk = LinearRegression().fit(xtr[:, None], ytr2)
full = LinearRegression().fit(*train_test_split(dia.data, y, test_size=0.3, random_state=SEED)[0::2])
Xa, Xb2, ya, yb2 = train_test_split(dia.data, y, test_size=0.3, random_state=SEED)
data["linreg"] = {"slope": R(slope, 2), "intercept": R(inter, 2), "skSlope": R(sk.coef_[0], 2), "skIntercept": R(sk.intercept_, 2),
                  "r2": R(r2_score(yte2, pred)), "mae": R(mean_absolute_error(yte2, pred), 2),
                  "r2All10": R(r2_score(yb2, LinearRegression().fit(Xa, ya).predict(Xb2))),
                  "points": [[R(a, 4), R(b, 1)] for a, b in zip(xte, yte2)], "line": [[R(v, 4), R(slope * v + inter, 1)] for v in [xte.min(), xte.max()]]}

# 03 Logistic regression: probabilities, confusion matrix, thresholds (positive class = malignant)
proba_m = lr_pipe.predict_proba(Xte)[:, 0]; y_m = (yte == 0).astype(int)
th = []
for t in [0.1, 0.3, 0.5, 0.7, 0.9]:
    p = (proba_m >= t).astype(int)
    th.append({"t": t, "precision": R(precision_score(y_m, p, zero_division=0)), "recall": R(recall_score(y_m, p)), "flagged": int(p.sum())})
cm = confusion_matrix(y_m, (proba_m >= 0.5).astype(int))
data["logreg"] = {"accuracy": R(accuracy_score(y_m, (proba_m >= 0.5).astype(int))), "auc": R(roc_auc_score(y_m, proba_m)),
                  "cm": cm.tolist(), "thresholds": th, "examples": [R(p, 4) for p in proba_m[:6]], "exampleTruth": ["malignant" if v else "benign" for v in y_m[:6]]}

# 04 Trees & forests: depth vs train/test accuracy, forest, feature importances
depths = []
for d in [1, 2, 3, 5, 8, 12, None]:
    t = DecisionTreeClassifier(max_depth=d, random_state=SEED).fit(Xtr, ytr)
    depths.append({"depth": d if d else "unlimited", "train": R(t.score(Xtr, ytr)), "test": R(t.score(Xte, yte)), "leaves": int(t.get_n_leaves())})
rf = RandomForestClassifier(n_estimators=300, random_state=SEED).fit(Xtr, ytr)
imp = sorted(zip(bc.feature_names, rf.feature_importances_), key=lambda z: -z[1])[:6]
data["trees"] = {"depths": depths, "forestTest": R(rf.score(Xte, ytr[:0].size or yte) if False else rf.score(Xte, yte)), "forestTrees": 300,
                 "importances": [[n, R(v)] for n, v in imp]}

# 05 SVM: scaling matters, kernels
svm_raw = SVC(kernel="rbf").fit(Xtr, ytr).score(Xte, yte)
svm_lin = make_pipeline(StandardScaler(), SVC(kernel="linear")).fit(Xtr, ytr)
svm_rbf = make_pipeline(StandardScaler(), SVC(kernel="rbf")).fit(Xtr, ytr)
data["svm"] = {"rbfUnscaled": R(svm_raw), "linearScaled": R(svm_lin.score(Xte, yte)), "rbfScaled": R(svm_rbf.score(Xte, yte)),
               "supportVectors": int(svm_rbf[-1].n_support_.sum()), "train": len(ytr)}

# 06 KNN on wine: k and scaling
Xw_tr, Xw_te, yw_tr, yw_te = train_test_split(wine.data, wine.target, test_size=0.3, random_state=SEED, stratify=wine.target)
knn = []
for k in [1, 3, 5, 9, 15, 25]:
    knn.append({"k": k, "raw": R(KNeighborsClassifier(k).fit(Xw_tr, yw_tr).score(Xw_te, yw_te)),
                "scaled": R(make_pipeline(StandardScaler(), KNeighborsClassifier(k)).fit(Xw_tr, yw_tr).score(Xw_te, yw_te))})
data["knn"] = {"rows": len(wine.target), "classes": len(set(wine.target)), "results": knn,
               "ranges": {n: [R(wine.data[:, i].min(), 2), R(wine.data[:, i].max(), 2)] for i, n in enumerate(wine.feature_names) if n in ("proline", "hue", "alcohol", "magnesium")}}

# 07 Clustering: k-means elbow on iris, ARI vs species; DBSCAN
Xi = StandardScaler().fit_transform(iris.data)
inertia = [[k, R(KMeans(k, n_init=10, random_state=SEED).fit(Xi).inertia_, 2)] for k in range(1, 9)]
km3 = KMeans(3, n_init=10, random_state=SEED).fit(Xi)
db = DBSCAN(eps=0.6, min_samples=5).fit(Xi)
from sklearn.decomposition import PCA  # noqa: E402
Z = PCA(2).fit_transform(Xi)
data["cluster"] = {"inertia": inertia, "ariKmeans": R(adjusted_rand_score(iris.target, km3.labels_)),
                   "dbscanClusters": int(len(set(db.labels_)) - (1 if -1 in db.labels_ else 0)), "dbscanNoise": int((db.labels_ == -1).sum()),
                   "ariDbscan": R(adjusted_rand_score(iris.target, db.labels_)),
                   "scatter": [[R(Z[i, 0], 3), R(Z[i, 1], 3), int(km3.labels_[i])] for i in range(len(Z))]}

# 08 Feature engineering: polynomial features on diabetes; scaling on KNN (from 06)
poly = []
for deg in [1, 2, 3]:
    m = make_pipeline(PolynomialFeatures(deg, include_bias=False), StandardScaler(), LinearRegression())
    poly.append({"degree": deg, "features": int(PolynomialFeatures(deg, include_bias=False).fit(Xa).n_output_features_),
                 "trainR2": R(m.fit(Xa, ya).score(Xa, ya)), "testR2": R(m.score(Xb2, yb2))})
data["features"] = {"poly": poly}

# 09 Evaluation: k-fold CV and metrics
cv = cross_val_score(make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)), Xb, yb, cv=5)
pm = (proba_m >= 0.5).astype(int)
data["eval"] = {"folds": [R(s) for s in cv], "mean": R(cv.mean()), "std": R(cv.std()),
                "metrics": {"accuracy": R(accuracy_score(y_m, pm)), "precision": R(precision_score(y_m, pm)), "recall": R(recall_score(y_m, pm)),
                            "f1": R(f1_score(y_m, pm)), "auc": R(roc_auc_score(y_m, proba_m))}}

# 10 Bias / variance: learning curve (digits, SVC) + tree depth (from 04)
sizes, tr_s, va_s = learning_curve(SVC(gamma=0.001), dig.data, dig.target, cv=5, train_sizes=np.linspace(0.1, 1.0, 6), random_state=SEED, shuffle=True)
data["biasvar"] = {"sizes": [int(s) for s in sizes], "train": [R(v) for v in tr_s.mean(1)], "val": [R(v) for v in va_s.mean(1)]}

# 11 Ensembles (5-fold CV accuracy on breast cancer)
base = DecisionTreeClassifier(max_depth=3, random_state=SEED)
ens = {
    "Single tree (depth 3)": base,
    "Bagging (100 trees)": BaggingClassifier(DecisionTreeClassifier(random_state=SEED), n_estimators=100, random_state=SEED),
    "Random forest (300)": RandomForestClassifier(300, random_state=SEED),
    "AdaBoost (200)": AdaBoostClassifier(n_estimators=200, algorithm="SAMME", random_state=SEED),
    "Gradient boosting (200)": GradientBoostingClassifier(n_estimators=200, random_state=SEED),
    "Stacking (LR + RF + SVM)": StackingClassifier([("lr", make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000))), ("rf", RandomForestClassifier(200, random_state=SEED)), ("svm", make_pipeline(StandardScaler(), SVC()))], final_estimator=LogisticRegression(max_iter=5000)),
}
data["ensembles"] = [{"name": n, **(lambda s: {"mean": R(s.mean()), "std": R(s.std())})(cross_val_score(m, Xb, yb, cv=5))} for n, m in ens.items()]

# 12 Hyperparameter tuning: grid vs random search on digits (SVC)
Xd_tr, Xd_te, yd_tr, yd_te = train_test_split(dig.data, dig.target, test_size=0.3, random_state=SEED, stratify=dig.target)
grid = {"C": [0.1, 1, 10, 100], "gamma": [1e-4, 1e-3, 1e-2, 1e-1]}
t0 = time.time(); gs = GridSearchCV(SVC(), grid, cv=3).fit(Xd_tr, yd_tr); t_gs = time.time() - t0
from scipy.stats import loguniform  # noqa: E402
t0 = time.time(); rs = RandomizedSearchCV(SVC(), {"C": loguniform(0.1, 100), "gamma": loguniform(1e-4, 1e-1)}, n_iter=8, cv=3, random_state=SEED).fit(Xd_tr, yd_tr); t_rs = time.time() - t0
heat = gs.cv_results_
data["tuning"] = {"default": R(SVC().fit(Xd_tr, yd_tr).score(Xd_te, yd_te)), "gridBest": {k: v for k, v in gs.best_params_.items()}, "gridCV": R(gs.best_score_), "gridTest": R(gs.score(Xd_te, yd_te)), "gridFits": len(heat["params"]) * 3, "gridSeconds": R(t_gs, 2),
                  "randomBest": {k: R(v, 5) for k, v in rs.best_params_.items()}, "randomCV": R(rs.best_score_), "randomTest": R(rs.score(Xd_te, yd_te)), "randomFits": 8 * 3, "randomSeconds": R(t_rs, 2),
                  "grid": [[p["C"], p["gamma"], R(s)] for p, s in zip(heat["params"], heat["mean_test_score"])]}

# 13 Pipelines: leakage demo — selecting features on ALL data before CV, on pure noise (seeded, clearly synthetic)
rng = np.random.default_rng(SEED)
Xn = rng.standard_normal((200, 5000)); yn = rng.integers(0, 2, 200)
sel = SelectKBest(f_classif, k=20).fit(Xn, yn)
leaky = cross_val_score(LogisticRegression(max_iter=2000), sel.transform(Xn), yn, cv=5).mean()
clean = cross_val_score(make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression(max_iter=2000)), Xn, yn, cv=5).mean()
data["pipeline"] = {"rows": 200, "features": 5000, "kept": 20, "leaky": R(leaky), "clean": R(clean)}

# 14 Naive Bayes on 20 Newsgroups (4 categories)
cats = ["sci.space", "rec.autos", "comp.graphics", "talk.politics.guns"]
tr = fetch_20newsgroups(subset="train", categories=cats, remove=("headers", "footers", "quotes"))
te = fetch_20newsgroups(subset="test", categories=cats, remove=("headers", "footers", "quotes"))
vec = CountVectorizer(stop_words="english", min_df=2); Xt = vec.fit_transform(tr.data)
nb = MultinomialNB().fit(Xt, tr.target)
vocab = np.array(vec.get_feature_names_out())
top = {tr.target_names[c]: list(vocab[np.argsort(nb.feature_log_prob_[c] - nb.feature_log_prob_.mean(0))[-8:][::-1]]) for c in range(len(cats))}
t0 = time.time(); acc_nb = nb.score(vec.transform(te.data), te.target); t_nb = time.time() - t0
data["nb"] = {"train": len(tr.data), "test": len(te.data), "vocab": len(vocab), "accuracy": R(acc_nb), "predictSeconds": R(t_nb, 3), "categories": tr.target_names, "topWords": top,
              "example": {"text": "The rocket launch was delayed because of the orbit calculation.", "pred": tr.target_names[int(nb.predict(vec.transform(["The rocket launch was delayed because of the orbit calculation."]))[0])]}}

# 15 Time series: CO2 — naive vs seasonal naive vs trend+season, last 24 months held out
s = co2.load_pandas().data["co2"].interpolate().resample("MS").mean()
vals = s.values; h = 24; train_v, test_v = vals[:-h], vals[-h:]
naive = np.repeat(train_v[-1], h)
seasonal = train_v[-12:][np.arange(h) % 12]
t_idx = np.arange(len(train_v)); coef = np.polyfit(t_idx, train_v, 2); trend_tr = np.polyval(coef, t_idx)
season = np.array([(train_v - trend_tr)[m::12].mean() for m in range(12)])
start_m = len(train_v) % 12
fut = np.arange(len(train_v), len(vals)); ts = np.polyval(coef, fut) + season[(fut) % 12]
data["ts"] = {"start": str(s.index[0].date()), "end": str(s.index[-1].date()), "heldOut": h,
              "mae": {"Last value": R(mean_absolute_error(test_v, naive), 3), "Same month last year": R(mean_absolute_error(test_v, seasonal), 3), "Trend + season": R(mean_absolute_error(test_v, ts), 3)},
              "actual": [[i, R(v, 2)] for i, v in enumerate(test_v)], "forecast": [[i, R(v, 2)] for i, v in enumerate(ts)], "naiveLine": [[i, R(v, 2)] for i, v in enumerate(naive)]}

# 16 Anomaly detection: Isolation Forest trained on benign cases only, scoring malignant as anomalies
Xs_ = StandardScaler().fit(Xtr[ytr == 1])
iso = IsolationForest(n_estimators=300, contamination="auto", random_state=SEED).fit(Xs_.transform(Xtr[ytr == 1]))
scores = -iso.score_samples(Xs_.transform(Xte)); flag = iso.predict(Xs_.transform(Xte)) == -1
data["anomaly"] = {"trainBenign": int((ytr == 1).sum()), "auc": R(roc_auc_score(yte == 0, scores)),
                   "flagged": int(flag.sum()), "flaggedMalignant": int((flag & (yte == 0)).sum()), "malignantInTest": int((yte == 0).sum()), "benignInTest": int((yte == 1).sum())}

# 17 Imbalanced data: keep all benign, subsample malignant to ~5% (seeded, from the real data)
rng = np.random.default_rng(SEED)
ben = np.where(yb == 1)[0]; mal = np.where(yb == 0)[0]
keep = rng.choice(mal, size=int(len(ben) * 0.05 / 0.95), replace=False)
idx = np.r_[ben, keep]; Xi_, yi_ = Xb[idx], (yb[idx] == 0).astype(int)
a_tr, a_te, b_tr, b_te = train_test_split(Xi_, yi_, test_size=0.4, random_state=SEED, stratify=yi_)
plain = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000, C=0.05)).fit(a_tr, b_tr)
weighted = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000, C=0.05, class_weight="balanced")).fit(a_tr, b_tr)
def summ(m): p = m.predict(a_te); return {"accuracy": R(accuracy_score(b_te, p)), "recall": R(recall_score(b_te, p)), "precision": R(precision_score(b_te, p, zero_division=0))}
data["imbalance"] = {"rows": len(yi_), "minority": int(yi_.sum()), "share": R(yi_.mean()), "testMinority": int(b_te.sum()),
                     "alwaysBenign": R(1 - b_te.mean()), "plain": summ(plain), "weighted": summ(weighted)}

# 18 Feature selection: k best vs CV accuracy; RFE picks; L1 sparsity
ks = []
for k in [1, 2, 3, 5, 10, 20, 30]:
    ks.append([k, R(cross_val_score(make_pipeline(StandardScaler(), SelectKBest(f_classif, k=k), LogisticRegression(max_iter=5000)), Xb, yb, cv=5).mean())])
rfe = RFE(LogisticRegression(max_iter=5000), n_features_to_select=5).fit(StandardScaler().fit_transform(Xb), yb)
l1 = LogisticRegression(penalty="l1", solver="liblinear", C=0.1).fit(StandardScaler().fit_transform(Xb), yb)
data["fsel"] = {"curve": ks, "rfe": list(bc.feature_names[rfe.support_]), "l1Nonzero": int((l1.coef_ != 0).sum()), "total": Xb.shape[1]}

# 19 ML system design: latency and size of candidate models on this machine
cands = {"Logistic regression": lr_pipe, "Random forest (300)": rf, "SVM (RBF)": svm_rbf}
lat = []
one = Xte[:1]
for n, m in cands.items():
    m.predict(one)
    t0 = time.perf_counter(); [m.predict(one) for _ in range(200)]; ms = (time.perf_counter() - t0) / 200 * 1000
    lat.append({"model": n, "ms": R(ms, 3), "kb": R(len(pickle.dumps(m)) / 1024, 1), "test": R(m.score(Xte, yte))})
data["sysdesign"] = {"models": lat}

# 20 Drift: train on smaller tumours, deploy on larger ones (a real covariate shift inside the dataset)
r = Xb[:, 0]; cut = np.median(r)
A, B = r <= cut, r > cut
mA = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000))
XA_tr, XA_te, yA_tr, yA_te = train_test_split(Xb[A], yb[A], test_size=0.3, random_state=SEED)
mA.fit(XA_tr, yA_tr)
def psi(expected, actual, bins=10):
    q = np.quantile(expected, np.linspace(0, 1, bins + 1)); q[0], q[-1] = -np.inf, np.inf
    e = np.histogram(expected, q)[0] / len(expected) + 1e-6; a = np.histogram(actual, q)[0] / len(actual) + 1e-6
    return float(((a - e) * np.log(a / e)).sum())
data["drift"] = {"feature": "mean radius", "cut": R(cut, 2), "malignantShareA": R(1 - yb[A].mean()), "malignantShareB": R(1 - yb[B].mean()),
                 "accSame": R(mA.score(XA_te, yA_te)), "accShifted": R(mA.score(Xb[B], yb[B])),
                 "psiSame": R(psi(XA_tr[:, 0], XA_te[:, 0]), 3), "psiShifted": R(psi(XA_tr[:, 0], Xb[B][:, 0]), 3)}

# 21 Training-serving skew: model trained on scaled features, served raw features / wrong unit
scaler = StandardScaler().fit(Xtr); m21 = LogisticRegression(max_iter=5000).fit(scaler.transform(Xtr), ytr)
Xte_mm = Xte.copy(); Xte_mm[:, [0, 2]] = Xte_mm[:, [0, 2]] * 10  # e.g. radius & perimeter logged in mm instead of cm at serving time
data["skew"] = {"consistent": R(m21.score(scaler.transform(Xte), yte)), "rawAtServing": R(m21.score(Xte, yte)),
                "unitChange": R(m21.score(scaler.transform(Xte_mm), yte)), "share_benign": R(yte.mean())}

json.dump(data, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
print(json.dumps({k: v for k, v in data.items() if k not in ("linreg", "cluster", "ts")}, indent=0)[:6000])
