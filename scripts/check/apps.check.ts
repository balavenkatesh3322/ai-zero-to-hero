// Verifies that the browser models reproduce scikit-learn's predictions (exported as `check` in each data file).
// Run: npm run check:apps
import inbox from '../../src/lessons/data/apps/inbox.json';
import loans from '../../src/lessons/data/apps/loans.json';
import { makeModels } from '../../src/apps/InboxApp';
import { walk } from '../../src/apps/LoansApp';

let worst = 0;
const cmp = (name: string, got: number[], want: number[]) => {
  const e = Math.max(...got.map((g, i) => Math.abs(g - want[i])));
  worst = Math.max(worst, e);
  console.log(`${name.padEnd(14)} max |browser − sklearn| = ${e.toExponential(2)}`);
};
const M = makeModels(inbox);
const c = inbox.stream.slice(0, 25).map((m) => M.counts(m.text));
cmp('spam NB', c.map(M.nb), inbox.check.nb);
cmp('spam LR', c.map(M.lr), inbox.check.lr);
cmp('spam SVM', c.map(M.svm), inbox.check.svm);

// loans: re-encode the first 20 test applicants exactly like the app does
const enc = (a: Record<string, unknown>) => loans.features.map((f) => { const m = f.match(/^(\w+) = (.+)$/); return m ? (a[m[1]] === m[2] ? 1 : 0) : Number(a[f]); });
const X = loans.stream.slice(0, 20).map(enc);
type N = Parameters<typeof walk>[0];
cmp('loan tree', X.map((x) => walk(loans.tree.nodes as N, x).leaf), loans.check.tree);
cmp('loan forest', X.map((x) => { const p = (loans.forest.trees as N[]).map((t) => walk(t, x).leaf); return p.reduce((a, b) => a + b) / p.length; }), loans.check.forest);
cmp('loan boost', X.map((x) => 1 / (1 + Math.exp(-((loans.boost.trees as N[]).reduce((s, t) => s + loans.boost.lr * walk(t, x).leaf, loans.boost.init))))), loans.check.boost);
if (worst > 5e-3) { console.error('MISMATCH'); process.exit(1); }
console.log('OK — browser models match scikit-learn (rounding only).');
