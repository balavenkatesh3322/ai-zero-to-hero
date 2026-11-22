/**
 * A small coloured tile with a glyph for each lesson's topic (sidebar). Colour = topic family, glyph = the idea.
 * Unknown / coming-soon lessons fall back to a muted page glyph.
 */
type Family = 'supervised' | 'unsupervised' | 'evaluation' | 'features' | 'probability' | 'time' | 'production' | 'risk' | 'optim' | 'intro';

const FAMILY: Record<Family, string> = {
  intro: '#f6cd82', supervised: '#a9c5e8', unsupervised: '#cbbae6', evaluation: '#b2baea', features: '#9dd3c7',
  probability: '#f3b47f', time: '#b3d79f', production: '#f3c89a', risk: '#eba6b2', optim: '#e2cf9a',
};

// 24 × 24 line glyphs (round caps); small filled dots are drawn as tiny circles via "c:x,y,r".
const G: Record<string, [Family, string[]]> = {
  'what-is-machine-learning': ['intro', ['M9 18h6', 'M10 21h4', 'M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z', 'M12 7v3l2 1']],
  'linear-regression-from-scratch': ['supervised', ['M3 21h18', 'M3 21V3', 'M5 18 19 6', 'c:7,13,1.3', 'c:11,13,1.3', 'c:13,8,1.3', 'c:17,10,1.3']],
  'logistic-regression-and-classification': ['supervised', ['M3 21h18', 'M3 21V3', 'M4 18c4 0 5-.5 8-6s4-6 8-6']],
  'decision-trees-and-random-forests': ['supervised', ['M12 3v5', 'M6 14v-3h12v3', 'M12 8v3', 'c:12,3,1.8', 'c:6,16,2', 'c:18,16,2', 'M6 18v3M18 18v3']],
  'support-vector-machines': ['supervised', ['M4 20 20 4', 'M4 14 14 4', 'M10 20 20 10', 'c:6,8,1.4', 'c:9,5,1.4', 'c:17,16,1.4', 'c:15,19,1.4']],
  'knn-and-distance-metrics': ['supervised', ['c:12,12,1.8', 'M12 12m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0', 'c:8,8,1.3', 'c:17,10,1.3', 'c:10,17,1.3', 'c:21,20,1.1', 'c:3,20,1.1']],
  'unsupervised-learning-kmeans-dbscan': ['unsupervised', ['c:5,6,1.8', 'c:9,5,1.8', 'c:6,10,1.8', 'c:16,7,1.8', 'c:19,10,1.8', 'c:12,17,1.8', 'c:16,19,1.8', 'c:9,19,1.8']],
  'feature-engineering-and-selection': ['features', ['M4 6h10', 'M18 6h2', 'M4 12h4', 'M12 12h8', 'M4 18h12', 'M20 18h0', 'c:16,6,2', 'c:10,12,2', 'c:18,18,2']],
  'model-evaluation-metrics-cv': ['evaluation', ['M4 4h16v16H4z', 'M12 4v16', 'M4 12h16', 'M6.5 8l1.5 1.5L10 6.5', 'M14.5 16.5l3-3', 'M17.5 16.5l-3-3']],
  'bias-variance-and-learning-curve': ['evaluation', ['M3 21h18', 'M3 21V3', 'M5 6c3 12 11 12 14 0', 'c:12,15,1.5']],
  'ensemble-methods': ['supervised', ['M12 3 3 8l9 5 9-5-9-5z', 'M3 12.5 12 17.5l9-5', 'M3 17 12 22l9-5']],
  'hyperparameter-tuning': ['optim', ['M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0', 'M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1']],
  'ml-pipelines-and-experiment-tracking': ['production', ['M3 9h5v6H3z', 'M16 9h5v6h-5z', 'M8 12h8', 'M13 9.5l3 2.5-3 2.5', 'M5.5 4v5M18.5 15v5']],
  'naive-bayes': ['probability', ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'c:8,8,1.5', 'c:16,8,1.5', 'c:12,12,1.5', 'c:8,16,1.5', 'c:16,16,1.5']],
  'time-series-fundamentals': ['time', ['M3 21h18', 'M3 21V3', 'M5 15c2-6 3-6 5-1s3 5 5-1 3-6 5-1']],
  'anomaly-detection': ['risk', ['M2 13h4l2-5 3 10 3-7 2 2h6', 'c:19,6,2.2', 'M19 3.6v2.6M19 8.2h0']],
  'handling-imbalanced-data': ['risk', ['M12 3v18', 'M7 21h10', 'M4 7h16', 'M4 7l-2.5 6a3 3 0 0 0 5 0L4 7z', 'M20 7l-2.5 6a3 3 0 0 0 5 0L20 7z']],
  'feature-selection': ['features', ['M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z']],
  'ml-system-design': ['production', ['M4 3h16v6H4z', 'M4 13h16v6H4z', 'M7 6h.01M7 16h.01', 'M11 6h6M11 16h6']],
  'monitoring-data-and-concept-drift': ['production', ['M3 17a9 9 0 0 1 18 0', 'M12 17l4-5', 'c:12,17,1.6', 'M6 21h12']],
  'feature-stores-and-training-serving-skew': ['features', ['M4 6c0 1.7 3.6 3 8 3s8-1.3 8-3-3.6-3-8-3-8 1.3-8 3z', 'M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6', 'M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3']],
  'optimizers-sgd-momentum-adam': ['optim', ['M2 20 9 8l4 6 3-4 6 10z', 'M14 4l3 3', 'M17 4v3h-3']],
};
const FALLBACK = ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'];

export function TopicIcon({ slug, done, soon }: { slug: string; done?: boolean; soon?: boolean }) {
  const hit = soon ? undefined : G[slug];
  const fill = hit ? FAMILY[hit[0]] : 'transparent';
  const paths = hit ? hit[1] : FALLBACK;
  return (
    <span className={`topic${hit ? '' : ' topic--plain'}${done ? ' topic--done' : ''}`} style={{ ['--tc' as string]: fill }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        {paths.map((d) => {
          if (d.startsWith('c:')) { const [x, y, r] = d.slice(2).split(',').map(Number); return <circle key={d} cx={x} cy={y} r={r} fill="currentColor" stroke="none" />; }
          return <path key={d} d={d} />;
        })}
      </svg>
      {done && <span className="topic__done"><svg viewBox="0 0 12 12" width="8" height="8"><path d="M2.5 6.2 5 8.5 9.5 3.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>}
    </span>
  );
}
