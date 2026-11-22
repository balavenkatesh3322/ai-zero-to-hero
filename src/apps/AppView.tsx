/** Picks the live app for an AppId. Each app is code-split and loads its own real-data file on demand. */
import { Suspense, lazy } from 'react';
import type { AppId } from '../lesson/types';

const Inbox = lazy(() => import('./InboxApp'));
const Homes = lazy(() => import('./HomesApp'));
const Movies = lazy(() => import('./MoviesApp'));
const Loans = lazy(() => import('./LoansApp'));
const Sensor = lazy(() => import('./SensorApp'));
const Cards = lazy(() => import('./CardsApp'));
const Serving = lazy(() => import('./ServingApp'));
const Optim = lazy(() => import('./OptimApp'));

export function AppView({ app }: { app: AppId }) {
  const [family, mode] = app.split('-') as [string, string];
  return (
    <Suspense fallback={<div className="app-win app-win--loading" role="status">Starting the app…</div>}>
      {family === 'inbox' && <Inbox mode={({ rules: 'rules', logreg: 'logreg', svm: 'svm', metrics: 'metrics', pipeline: 'pipeline', bayes: 'bayes' } as const)[mode as 'rules']} />}
      {family === 'homes' && <Homes mode={mode as 'line'} />}
      {family === 'movies' && <Movies mode={mode as 'knn'} />}
      {family === 'loans' && <Loans mode={mode as 'tree'} />}
      {family === 'sensor' && <Sensor mode={mode as 'forecast'} />}
      {family === 'cards' && <Cards />}
      {family === 'serving' && <Serving />}
      {family === 'optim' && <Optim />}
    </Suspense>
  );
}
