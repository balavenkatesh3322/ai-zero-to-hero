"""Key numbers from the live-app data files, small enough to import into lesson text (src/lessons/data/apps/summary.json).
Usage: python3 summarize_apps.py ../../src/lessons/data/apps   (also run at the end of measure_apps.py)"""
import json, os, sys

D = sys.argv[1]
J = lambda n: json.load(open(os.path.join(D, n + '.json')))  # noqa: E731
i, h, m, l, s, c, v = (J(n) for n in ['inbox', 'homes', 'movies', 'loans', 'sensor', 'cards', 'serving'])
th = {r['t']: r for r in i['test']['lrThresholds']}
pick = lambda r, *k: {x: r[x] for x in k}  # noqa: E731
tc = {str(r['depth']): r for r in h['trees']['curve']}
out = {
    'inbox': {'counts': i['counts'], 'vocab': len(i['vocab']), 'baseline': i['test']['baseline'], 'rule': i['test']['rule'], 'nb': i['test']['nb'], 'lr': i['test']['lr'],
              'svm': i['test']['svm'], 'auc': i['test']['auc'], 'nearMargin': i['test']['svmNearMargin'], 'lr01': th[0.1], 'lr09': th[0.9], 'ruleWords': i['rule'],
              'topSpam': [w for w, _ in i['topSpam'][:6]], 'source': f"{i['provenance']['dataset']} ({i['provenance']['by']}, {i['provenance']['licence']})"},
    'homes': {'counts': h['counts'], 'one': h['one'], 'raw': pick(h['raw'], 'mae', 'r2'), 'eng': pick(h['eng'], 'mae', 'r2'), 'cells': len(h['eng']['cells']),
              'baselineMae': h['baselineMae'], 'depth2': tc['2'], 'depth8': tc['8'], 'depthNone': tc['none'], 'depth12': tc['12'],
              'lasso': [pick(r, 'alpha', 'nonzero', 'mae') for r in h['lasso']['path']], 'source': f"{h['provenance']['dataset']} ({h['provenance']['by']})"},
    'movies': {'counts': m['counts'], 'eval': m['eval'], 'elbow': m['elbow'], 'source': f"{m['provenance']['dataset']} ({m['provenance']['by']})"},
    'loans': {'counts': l['counts'], 'baseline': l['baseline'], **{k: {x: l[k][x] for x in ('accuracy', 'recall', 'precision', 'auc', 'cost')} for k in ('tree', 'forest', 'boost')},
              'depthCurve': l['depthCurve'], 'gridTrials': len(l['tuning']['grid']), 'randomTrials': len(l['tuning']['random']), 'best': l['tuning']['best'],
              'bestTestAuc': l['tuning']['bestTest']['auc'], 'randomBest': max(r['auc'] for r in l['tuning']['random']), 'source': f"{l['provenance']['dataset']} ({l['provenance']['by']}, {l['provenance']['licence']})"},
    'sensor': {'hours': len(s['values']), 'raw': s['rawReadings'], 'windows': len(s['windows']), 'zscore': s['zscore'], 'mae': s['forecastMae6h'], 'psi': s['psi'], 'start': s['start'],
               'source': f"{s['provenance']['dataset']} ({s['provenance']['by']}, {s['provenance']['licence']})"},
    'cards': {'counts': c['counts'], 'baseline': c['baseline'], 'plain': {**c['plain']['at05'], 'auc': c['plain']['auc']}, 'weighted': {**c['weighted']['at05'], 'auc': c['weighted']['auc']},
              'source': f"{c['provenance']['dataset']} ({c['provenance']['by']}, {c['provenance']['licence']})"},
    'serving': {'models': {k: {'p50': x['p50'], 'p99': x['p99']} for k, x in v['models'].items()}, 'machine': v['provenance']['machine']},
    'provenance': i['provenance'] | {'dataset': 'see each app'},
}
json.dump(out, open(os.path.join(D, 'summary.json'), 'w'), indent=1, ensure_ascii=False)
print('summary.json', os.path.getsize(os.path.join(D, 'summary.json')) // 1024, 'KB')
