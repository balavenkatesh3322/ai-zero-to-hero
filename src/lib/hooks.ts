import { useCallback, useEffect, useState } from 'react';

/* ---------- safe storage (private windows can throw) ---------- */
export function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v === null ? fallback : (JSON.parse(v) as T); } catch { return fallback; }
}
export function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable: keep in memory only */ }
}

/* ---------- theme ---------- */
export type Theme = 'light' | 'dark';
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme as Theme) || 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#211e1a' : '#f4ebe0');
    try { localStorage.setItem('azh:theme', theme); } catch { /* ignore */ }
  }, [theme]);
  return [theme, useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), [])];
}

/* ---------- path route: /learn/<slug>/<step> (old #/ links are redirected) ---------- */
export interface Route { view: string; slug?: string; step: number }
function parse(): Route {
  const parts = location.pathname.split('/').filter(Boolean);
  const view = parts[0] || 'learn';
  return { view, slug: parts[1], step: Math.max(0, (parseInt(parts[2] || '1', 10) || 1) - 1) };
}
if (typeof location !== 'undefined' && location.hash.startsWith('#/')) history.replaceState(null, '', location.hash.slice(1));
export function useRoute(): Route {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    addEventListener('popstate', on);
    // same-origin links navigate inside the app (no full reload)
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.('a');
      const href = a?.getAttribute('href');
      if (!a || !href || !href.startsWith('/') || href.startsWith('//') || a.target === '_blank' || a.hasAttribute('download')) return;
      e.preventDefault(); navigate(href);
    };
    document.addEventListener('click', click);
    return () => { removeEventListener('popstate', on); document.removeEventListener('click', click); };
  }, []);
  return route;
}
/** Step 1 is the lesson's canonical URL; later steps add /<n>. */
export function lessonHref(slug: string, step = 0) { return step === 0 ? `/learn/${slug}` : `/learn/${slug}/${step + 1}`; }
export function navigate(href: string, replace = false) {
  if (href === location.pathname + location.search) return;
  if (replace) history.replaceState(null, '', href); else { history.pushState(null, '', href); scrollTo(0, 0); }
  dispatchEvent(new PopStateEvent('popstate'));
}

/* ---------- progress (browser only, per spec §8) ---------- */
export function useProgress(): [Set<string>, (slug: string) => void] {
  const [done, setDone] = useState<Set<string>>(() => new Set(load<string[]>('azh:done', [])));
  const mark = useCallback((slug: string) => {
    setDone((prev) => { const next = new Set(prev); next.add(slug); save('azh:done', [...next]); return next; });
  }, []);
  return [done, mark];
}
