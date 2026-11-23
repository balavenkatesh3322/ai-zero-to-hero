/**
 * One source of truth for every page's title, description, canonical URL and preview card.
 * Used in the browser (useSeo) and at build time (scripts/seo/build.ts prerenders each page's <head>).
 */
import { BUILT, FOLDERS, findLesson, DEFAULT_SLUG } from './course';
import type { AppId, Lesson } from '../lesson/types';

export const SITE = {
  url: 'https://ai-zerotohero.vercel.app',
  name: 'AI Zero to Hero',
  tagline: 'Learn machine learning by running it on real data',
  description: 'A free, open-source, interactive AI engineering course. Every lesson is an animated system you step through, and ends with a live app running real public data through a real model — spam filters, home prices, recommenders, fraud screening and more.',
  repo: 'https://github.com/balavenkatesh3322/ai-zero-to-hero',
  author: { name: 'Bala Venkatesh', url: 'https://balavenkatesh.is-a.dev/', github: 'https://github.com/balavenkatesh3322' },
  locale: 'en_US',
  themeLight: '#f4ebe0',
  themeDark: '#211e1a',
};

/** Live app shown in each lesson: display name and the real dataset it runs on. */
export const APP_INFO: Record<string, { name: string; data: string }> = {
  inbox: { name: 'Messages · spam filter', data: 'SMS Spam Collection' },
  homes: { name: 'HomeValue · instant estimate', data: 'California Housing census' },
  'movies-knn': { name: 'Streamly · recommendations', data: 'MovieLens 100K' },
  'movies-segments': { name: 'Streamly · audience segments', data: 'MovieLens 100K' },
  loans: { name: 'LendWell · loan desk', data: 'German Credit' },
  'loans-tuning': { name: 'Tuner · hyper-parameter search', data: 'German Credit' },
  sensor: { name: 'PlantWatch · machine temperature', data: 'NAB machine sensor' },
  cards: { name: 'CardGuard · payment screening', data: 'ULB credit-card fraud' },
  serving: { name: 'ModelServe · load test', data: 'measured model latencies' },
};
export const appOf = (l: Lesson) => {
  const id = l.steps.find((s) => s.widget?.type === 'app')?.widget as { app: AppId } | undefined;
  if (!id) return null;
  return APP_INFO[id.app] ?? APP_INFO[id.app.split('-')[0]] ?? null;
};

export const SECTIONS: Record<string, { title: string; description: string }> = {
  map: { title: 'Course map', description: 'The whole AI engineering journey on one page — from ML fundamentals to AI systems design, with topic paths for RAG, tool calling, MCP, agents, evaluation and security. Coming soon.' },
  practice: { title: 'Practice', description: 'Debug real AI and ML incidents and get graded instantly: a pager alert, a trace, four possible root causes. Coming soon to AI Zero to Hero.' },
  design: { title: 'AI system design', description: 'Design whole AI systems interview-style: requirements, napkin math, architecture, data, model choice, evals and cost — twelve step-through case studies. Coming soon.' },
  cheatsheets: { title: 'Cheatsheets', description: 'One printable screen per idea: the key formula, the default numbers and the common failure, in the same visual language as the lessons. Coming soon.' },
};

export interface PageMeta { path: string; title: string; description: string; image: string; imageAlt: string; noindex?: boolean; kind: 'home' | 'lesson' | 'soon' | 'section' | 'other' }

const clip = (s: string, n = 158) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)) + '…');

/** Metadata for any path the app can show. Steps (/learn/x/3) share their lesson's canonical page. */
export function pageMeta(pathname: string): PageMeta {
  const [view = '', slug] = pathname.split('/').filter(Boolean);
  if (!view || (view === 'learn' && !slug)) {
    return { kind: 'home', path: '/', title: `${SITE.name} — ${SITE.tagline}`, description: SITE.description, image: '/og/site.png', imageAlt: `${SITE.name}: interactive machine learning lessons with live apps on real data` };
  }
  if (view === 'learn' && slug) {
    const f = findLesson(slug);
    if (f?.lesson.built) {
      const l = f.lesson.built, app = appOf(l);
      return {
        kind: 'lesson', path: `/learn/${l.slug}`,
        title: `${l.title} · ${f.folder.title} — ${SITE.name}`,
        description: clip(`${l.summary}${app ? ` Live app: ${app.name} on real ${app.data} data.` : ''}`),
        image: `/og/learn/${l.slug}.png`, imageAlt: `${l.title} — lesson ${f.index + 1} of ${f.folder.lessons.length} in ${f.folder.number} · ${f.folder.title}`,
      };
    }
    if (f) return { kind: 'soon', noindex: true, path: `/learn/${f.lesson.slug}`, title: `${f.lesson.title} (coming soon) — ${SITE.name}`, description: clip(`${f.folder.number} · ${f.folder.title}: ${f.folder.tagline} This lesson is coming soon.`), image: '/og/site.png', imageAlt: SITE.name };
  }
  if (SECTIONS[view]) {
    const s = SECTIONS[view];
    return { kind: 'section', path: `/${view}`, title: `${s.title} (coming soon) — ${SITE.name}`, description: s.description, image: `/og/${view}.png`, imageAlt: `${s.title} — ${SITE.name}` };
  }
  return { kind: 'other', noindex: true, path: pathname, title: SITE.name, description: SITE.description, image: '/og/site.png', imageAlt: SITE.name };
}

/** Pages that get their own prerendered HTML, preview card and sitemap entry. */
export function indexablePages(): PageMeta[] {
  return ['/', ...BUILT.map((l) => `/learn/${l.slug}`), ...Object.keys(SECTIONS).map((v) => `/${v}`)].map(pageMeta);
}

/** JSON-LD graph: WebSite, Person (creator) and SoftwareApplication, plus the page itself. */
export function jsonLd(meta: PageMeta) {
  const person = { '@type': 'Person', '@id': `${SITE.url}/#creator`, name: SITE.author.name, url: SITE.author.url, sameAs: [SITE.author.github] };
  const graph: Record<string, unknown>[] = [
    { '@type': 'WebSite', '@id': `${SITE.url}/#website`, url: `${SITE.url}/`, name: SITE.name, description: SITE.description, inLanguage: 'en', creator: { '@id': person['@id'] }, publisher: { '@id': person['@id'] } },
    person,
    {
      '@type': 'SoftwareApplication', '@id': `${SITE.url}/#app`, name: SITE.name, url: `${SITE.url}/`, description: SITE.description,
      applicationCategory: 'EducationalApplication', operatingSystem: 'Any (web browser)', isAccessibleForFree: true, license: 'https://opensource.org/licenses/MIT',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, author: { '@id': person['@id'] }, codeRepository: SITE.repo,
      image: `${SITE.url}/og/site.png`, screenshot: `${SITE.url}/og/site.png`,
    },
    { '@type': 'WebPage', '@id': `${SITE.url}${meta.path}#page`, url: `${SITE.url}${meta.path}`, name: meta.title, description: meta.description, isPartOf: { '@id': `${SITE.url}/#website` }, primaryImageOfPage: `${SITE.url}${meta.image}` },
  ];
  return { '@context': 'https://schema.org', '@graph': graph };
}

export const DEFAULT_LESSON = () => findLesson(DEFAULT_SLUG)!;
export const COURSE_FOLDERS = FOLDERS;
