/**
 * Phase 02 live apps: for each lesson, the real production system it lives in and the live app that runs on real data.
 * Every number comes from src/lessons/data/apps/summary.json (scripts/data/measure_apps.py).
 */
import S from './data/apps/summary.json';
import type { ObjectKind } from '../lesson/types';
import type { Lk, LiveSpec } from './kit';

const pct = (n: number, d = 1) => `${(n * 100).toFixed(d)}%`;
const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const SRC = 'Live app · scored in your browser by the exact models trained in scripts/data/measure_apps.py';
type Sys = Pick<LiveSpec, 'nodes' | 'links' | 'model'>;

/* ---------------- real systems ---------------- */
const spamSystem = (stage = 'Tokenizer', model = 'Spam model', modelKind: ObjectKind = 'model'): Sys => ({
  nodes: [
    ['sender', 'phone', 'Sender', undefined, [90, 236]], ['carrier', 'gateway', 'SMS gateway', undefined, [232, 150]],
    ['prep', 'pipeline', stage, undefined, [378, 236]], ['model', modelKind, model, undefined, [524, 150]],
    ['inbox', 'inbox', 'Inbox', undefined, [670, 236]], ['spam', 'bin', 'Spam folder', undefined, [670, 72]],
  ],
  links: [['sender', 'carrier'], ['carrier', 'prep'], ['prep', 'model'], ['model', 'inbox', 'grounded'], ['model', 'spam']],
  model: 'model',
});
const homeSystem = (model = 'Price model', prep = 'Feature service'): Sys => ({
  nodes: [
    ['owner', 'person', 'Home owner', undefined, [86, 236]], ['site', 'laptop', 'HomeValue site', undefined, [228, 150]],
    ['features', 'server', prep, undefined, [374, 236]], ['census', 'db', 'Census data', '20,640 districts', [374, 84]],
    ['model', 'model', model, undefined, [520, 150]], ['house', 'house', 'Estimate', undefined, [668, 236]],
  ],
  links: [['owner', 'site'], ['site', 'features'], ['census', 'features'], ['features', 'model'], ['model', 'house', 'grounded']],
  model: 'model',
});
const movieSystem = (model: string): Sys => ({
  nodes: [
    ['viewers', 'user', 'Viewers', '943', [90, 236]], ['app', 'tv', 'Streaming app', undefined, [236, 150]],
    ['ratings', 'db', 'Ratings', '100,000', [384, 236]], ['model', 'model', model, undefined, [530, 150]],
    ['row', 'film', 'Your row', undefined, [672, 236]],
  ],
  links: [['viewers', 'app'], ['app', 'ratings'], ['ratings', 'model'], ['model', 'row', 'grounded'], ['row', 'viewers', 'grounded', [380, 322]]],
  model: 'model',
});
const loanSystem = (modelKind: ObjectKind, model: string): Sys => ({
  nodes: [
    ['applicant', 'person', 'Applicant', undefined, [88, 236]], ['app', 'phone', 'Bank app', undefined, [230, 150]],
    ['bureau', 'db', 'Credit history', undefined, [376, 236]], ['model', modelKind, model, undefined, [522, 150]],
    ['bank', 'bank', 'Loan decision', undefined, [670, 236]],
  ],
  links: [['applicant', 'app'], ['app', 'bureau'], ['bureau', 'model'], ['model', 'bank', 'grounded']],
  model: 'model',
});
const sensorSystem = (model: string, out: [ObjectKind, string]): Sys => ({
  nodes: [
    ['machine', 'machine', 'Machine 7', undefined, [88, 236]], ['gw', 'antenna', 'Sensor gateway', 'every 5 min', [232, 150]],
    ['stream', 'queue', 'Event stream', undefined, [378, 236]], ['model', 'model', model, undefined, [524, 150]],
    ['dash', 'dashboard', 'PlantWatch', undefined, [670, 236]], ['out', out[0], out[1], undefined, [670, 72]],
  ],
  links: [['machine', 'gw'], ['gw', 'stream'], ['stream', 'model'], ['model', 'dash', 'grounded'], ['model', 'out']],
  model: 'model',
});

const live = (app: LiveSpec['app'], sys: Sys, title: string, body: string, keyIdea: string, source: string): LiveSpec => ({ app, ...sys, title, body, keyIdea, source: `${source} · ${SRC}` });
const I = S.inbox, H = S.homes, M = S.movies, L = S.loans, T = S.sensor, C = S.cards;
const lassoAt = (a: number) => H.lasso.find((r) => r.alpha === a)!;
const knn = (k: number) => M.eval.knn.find((r) => r.k === k)!.hit10;
const forestLat = S.serving.models['Loans · random forest (40 trees)'];
const nbLat = S.serving.models['Spam · naive Bayes'];

export const LIVE: Record<number, LiveSpec> = {
  0: live('inbox-rules', spamSystem('Tokenizer', 'Spam filter'), 'Live: rules vs learning, in a real inbox',
    `Real SMS messages from people's phones arrive. A hand-written rule (flag ${I.ruleWords.slice(0, 4).join(', ')}, …) and a learned model read the same stream. On ${I.counts.test.toLocaleString()} held-out messages the rule catches ${pct(I.rule.recall)} of spam; the learned filter catches ${pct(I.nb.recall)}.`,
    'Nobody wrote “150p” or “tone” into the learned filter — it found those words in the data. That is the whole point of machine learning.', I.source),
  1: live('homes-line', homeSystem('Price line'), 'Live: a one-line home-value estimate',
    `Every estimate here is price = ${H.one.slope.toFixed(3)} × income + ${H.one.intercept.toFixed(3)} (in $100k), fitted on ${H.counts.train.toLocaleString()} real California districts. Watch held-out districts stream in and the error add up: ${usd(H.one.mae)} on average, R² ${H.one.r2}.`,
    'One straight line already beats guessing the average by a lot — and you can see on the map exactly where a single feature isn’t enough.', H.source),
  2: live('inbox-logreg', spamSystem('Tokenizer', 'Logistic regression'), 'Live: pick the threshold for a real spam filter',
    `The model outputs a probability for every message. You choose where to cut. At 0.1 it catches ${pct(I.lr01.recall)} of spam but loses ${I.lr01.fp} good messages; at 0.9 it loses ${I.lr09.fp} and catches ${pct(I.lr09.recall)}. Type your own message too.`,
    'The model gives probabilities; the business picks the threshold. Losing a real message usually costs more than letting one spam through.', I.source),
  3: live('loans-tree', loanSystem('tree', 'Decision tree'), 'Live: a decision tree at a loan desk',
    `Real 1994 German credit applicants (${L.counts.applicants.toLocaleString()}, ${L.counts.defaulted} defaulted) arrive one by one. Follow the highlighted path through the tree — or edit the form and watch it change. The honest result: this depth-3 tree is ${pct(L.tree.accuracy)} accurate, barely above ${pct(L.baseline)} for approving everyone, and catches ${pct(L.tree.recall)} of defaulters.`,
    'Trees are easy to read and easy to fool yourself with. Always compare against the “approve everyone” baseline and look at recall, not just accuracy.', L.source),
  4: live('inbox-svm', spamSystem('Vectorizer', 'Linear SVM'), 'Live: where each message lands on the margin',
    `A linear SVM scores each real message; the sign decides spam or not. Messages inside the margin (score between −1 and +1) are the close calls — ${I.nearMargin} of ${I.counts.test.toLocaleString()} test messages. Accuracy on the full test set: ${pct(I.svm.accuracy)}.`,
    'The SVM only cares about the hard cases near the boundary — those support vectors decide where the line goes.', I.source),
  5: live('movies-knn', movieSystem('KNN recommender'), 'Live: “because you liked…” with nearest neighbours',
    `Click movies you like. For each one, the app looks up its k most similar movies — similar because the same real MovieLens viewers rated them alike — and adds up the similarities. Measured on ${M.eval.users} viewers: k=1 finds the hidden movie ${pct(knn(1))} of the time, k=5 ${pct(knn(5))}, k=50 ${pct(knn(50))}; just recommending the most popular gets ${pct(M.eval.popularity)}.`,
    'k is a real trade-off: too few neighbours is noisy, too many drowns your taste in what everyone likes.', M.source),
  6: live('movies-segments', movieSystem('Segmenter'), 'Live: k-means finds audience segments',
    `Each dot is one of ${M.counts.users} real viewers, placed by the mix of genres they rate. k-means runs right here: assign everyone to the nearest centre, move each centre to its members’ mean, repeat until nothing changes. Change k and watch the segments re-form.`,
    'Nobody labelled these segments — the algorithm found groups, and a human then reads them (“more Sci-Fi and Action”). That’s unsupervised learning.', M.source),
  7: live('homes-features', homeSystem('Price model', 'Feature engineering'), 'Live: same model, better features',
    `Two estimates for every real district: linear regression on the 8 raw columns (average error ${usd(H.raw.mae)}) and the same algorithm with engineered features — logs, a bedroom share and ${H.cells} half-degree location cells (${usd(H.eng.mae)}).`,
    'In practice, better inputs beat a fancier algorithm surprisingly often. Location was in the data all along — as raw latitude it just wasn’t usable by a straight line.', H.source),
  8: live('inbox-metrics', spamSystem(), 'Live: a confusion matrix that fills itself',
    `Every real message lands in one of four boxes. Watch accuracy look great from the start — “never flag anything” would already score ${pct(I.baseline)} — while recall tells you how much spam still gets through. Full test set: precision ${pct(I.nb.precision)}, recall ${pct(I.nb.recall)}.`,
    'Accuracy hides the rare class. Read the confusion matrix, then choose the metric that matches the cost of each mistake.', I.source),
  9: live('homes-depth', homeSystem('Regression tree'), 'Live: underfit, just right, overfit',
    `Choose a tree depth and watch real held-out districts. Depth 2 is ${usd(H.depth2.test)} off on average; depth 8 ${usd(H.depth8.test)}; an unlimited tree memorises training data (train error ${usd(H.depthNone.train)}) but is ${usd(H.depthNone.test)} off on new districts.`,
    'The training error keeps falling; the test error turns around. That U-shape is the bias–variance trade-off you can actually see.', H.source),
  10: live('loans-ensemble', loanSystem('forest', 'Forest + boosting'), 'Live: one tree vs a forest vs boosting',
    `The same real applicant, three models. A random forest averages 40 trees’ opinions (each square is one tree); boosting adds up 80 small trees, each fixing the last one’s mistakes (the line). Test AUC: one tree ${L.tree.auc.toFixed(3)}, forest ${L.forest.auc.toFixed(3)}, boosting ${L.boost.auc.toFixed(3)}.`,
    'Many weak, different opinions beat one strong-looking one. And with the dataset’s 5:1 cost of approving a defaulter, the best model on accuracy isn’t the cheapest.', L.source),
  11: live('loans-tuning', loanSystem('tree', 'Tuned tree'), 'Live: watch a hyper-parameter search run',
    `Every dot is one real training run of a decision tree, scored by 5-fold cross-validation. The grid tries all ${L.gridTrials} combinations; random search tries ${L.randomTrials}. Grid best: depth ${L.best.max_depth}, leaf size ${L.best.min_samples_leaf}, CV AUC ${L.best.auc}; random reaches ${L.randomBest.toFixed(4)}.`,
    `Random search gets close with a third of the trials. And the winner scores ${L.bestTestAuc} on the untouched test set — tuning on CV always flatters a little.`, L.source),
  12: live('inbox-pipeline', spamSystem('Pipeline', 'Model'), 'Live: one pipeline, from raw text to decision',
    `Type any message and watch it pass every stage that was fitted on training data: tokenize → count vector over ${I.vocab.toLocaleString()} words → model → decision. Words never seen in training are ignored, exactly like in production.`,
    'Ship the whole pipeline as one object. If serving re-implements a stage by hand, the stages drift apart.', I.source),
  13: live('inbox-bayes', spamSystem('Word counter', 'Naive Bayes'), 'Live: naive Bayes reads your message',
    `Each word adds evidence for spam or ham, learned from ${I.counts.train.toLocaleString()} real messages; the prior is ${pct(I.counts.spam / I.counts.messages)} spam. Strongest spam words found in training: ${I.topSpam.slice(0, 5).join(', ')}. Full test set: accuracy ${pct(I.nb.accuracy)}.`,
    'Add up independent per-word evidence, start from the base rate — crude assumptions, excellent spam filter.', I.source),
  14: live('sensor-forecast', sensorSystem('Forecaster', ['phone', 'Maintenance']), 'Live: forecast a real machine’s temperature',
    `Real readings from an industrial machine (${T.raw.toLocaleString()} readings, shown hourly). Two forecasts made 6 hours ahead race the real values. Over the whole series: naive ${T.mae.naive}°, “same hour yesterday” ${T.mae.seasonal}°, daily mean ${T.mae.mean24}°.`,
    'Always run the naive forecast first. Here it wins: this machine has no daily rhythm, so a seasonal model only adds error.', T.source),
  15: live('sensor-anomaly', sensorSystem('Detector', ['phone', 'On-call pager']), 'Live: catch the failure before it happens',
    `The same machine, now with an alert: flag a reading more than ${3} standard deviations from the last 72 hours. Shaded bands are NAB’s labelled failure windows (${T.windows}, including a catastrophic failure). At 3.0 the detector catches ${T.zscore['3.0'].caught} of ${T.windows} windows with ${T.zscore['3.0'].falseAlarms} false alarms.`,
    'Every threshold trades missed failures against paging someone at 3 a.m. for nothing. Measure both.', T.source),
  16: live('cards-fraud', { nodes: [
    ['terminal', 'terminal', 'Card terminal', undefined, [88, 236]], ['network', 'gateway', 'Payment network', undefined, [232, 150]],
    ['model', 'model', 'Fraud model', undefined, [378, 236]], ['bank', 'bank', 'Issuing bank', undefined, [524, 150]], ['alert', 'phone', 'Cardholder', undefined, [670, 236]],
  ], links: [['terminal', 'network'], ['network', 'model'], ['model', 'bank', 'grounded'], ['bank', 'alert']] as Lk[], model: 'model' },
  'Live: screening real card payments for fraud',
    `${C.counts.transactions.toLocaleString()} real card payments, ${C.counts.frauds} of them fraud (${pct(C.counts.frauds / C.counts.transactions, 2)}). “Never flag” is ${pct(C.baseline, 2)} accurate. A plain model catches ${C.plain.tp} of ${C.counts.testFrauds} test frauds; weighting frauds up catches ${C.weighted.tp} — and holds ${C.weighted.fp.toLocaleString()} good customers’ payments.`,
    'With rare events, accuracy is meaningless. Re-weighting moves recall up and precision down; the threshold is a business decision.', C.source),
  17: live('homes-lasso', homeSystem('Lasso model', 'Feature selection'), 'Live: L1 switches features off',
    `Slide the L1 penalty and watch coefficients shrink to exactly zero. At α=0.1 only ${lassoAt(0.1).nonzero} of 8 features survive and the error rises to ${usd(lassoAt(0.1).mae)}; at α=0.01 ${lassoAt(0.01).nonzero} survive at ${usd(lassoAt(0.01).mae)}.`,
    'L1 does feature selection for you — the question is how much accuracy you’ll trade for a smaller, simpler model.', H.source),
  18: live('serving-load', { nodes: [
    ['users', 'user', 'Users', 'requests/s', [88, 236]], ['lb', 'gateway', 'Load balancer', undefined, [232, 150]],
    ['server', 'server', 'Model server', '1 worker', [378, 236]], ['cache', 'cache', 'Feature cache', undefined, [378, 84]],
    ['model', 'model', 'Model', undefined, [524, 150]], ['mon', 'trace', 'Latency monitor', undefined, [670, 236]],
  ], links: [['users', 'lb'], ['lb', 'server'], ['cache', 'server'], ['server', 'model'], ['model', 'mon', 'grounded']] as Lk[], model: 'server' },
  'Live: load-test a model with real latencies',
    `Every request takes a latency measured on a real machine (${S.serving.machine}). A 40-tree random forest: p50 ${forestLat.p50} ms, p99 ${forestLat.p99} ms; naive Bayes: p50 ${nbLat.p50} ms. Raise the traffic and watch one worker’s queue explode.`,
    'Latency isn’t a property of the model alone — it’s the model plus traffic plus capacity. Past ~100% busy, the queue grows without limit.', 'latencies measured by scripts/data/measure_apps.py'),
  19: live('sensor-drift', sensorSystem('Drift monitor', ['dashboard', 'Retrain?']), 'Live: is today’s data still like training data?',
    `The monitor compares the last 7 days of real readings with the first week (the “training” week) using the population stability index. Over this series PSI first passes 0.2 at hour ${T.psi.firstAbove02} and peaks at ${T.psi.max} as the machine approaches failure.`,
    'Models don’t break loudly; their inputs move. Monitor input distributions, not just accuracy — labels often arrive too late.', T.source),
  20: live('homes-skew', homeSystem('Price model', 'Serving features'), 'Live: a units bug between training and serving',
    `Training used median income in units of $10,000. The serving code sends dollars. Nothing errors — the site shows wildly wrong estimates for every real district. Flip the fix and the error returns to ${usd(H.raw.mae)}.`,
    'Define each feature once and use the same code for training and serving (a feature store). Then add a check that serving inputs look like training inputs.', H.source),
};
