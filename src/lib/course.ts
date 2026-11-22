import curriculum from '../../docs/curriculum.json';
import type { Lesson } from '../lesson/types';
import { P02 } from '../lessons/p02';

/** Lessons that are built as interactive scenes. Everything else shows "coming soon". */
export const BUILT: Lesson[] = [...P02];

export interface CourseLesson {
  slug: string;
  title: string;
  status: 'LIVE' | 'NEXT' | 'SOON';
  topics: string[];
  built: Lesson | null;
}
export interface Folder {
  id: string;          // source phase number (internal), e.g. '02'
  number: string;      // shown before the title: '00' for ML Fundamentals
  start?: boolean;     // the course starts here
  title: string;
  tagline: string;
  lessons: CourseLesson[];
  live: number;
}

const kebab = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);

/** Source phases 00 (setup) and 01 (math) are not part of this course; ML Fundamentals is shown as 00. */
const FIRST_PHASE = 2;
const phases: Folder[] = curriculum.phases.filter((p) => p.phase >= FIRST_PHASE).map((p) => {
  const id = String(p.phase).padStart(2, '0');
  const number = String(p.phase - FIRST_PHASE).padStart(2, '0');
  const lessons = curriculum.lessons
    .filter((l) => l.phase === p.phase)
    .map((l) => {
      const built = BUILT.find((b) => b.phase === id && b.index === l.n - 1) ?? null;
      return { slug: built ? built.slug : `${number}-${String(l.n).padStart(2, '0')}-${kebab(l.title)}`, title: l.title, status: l.status as CourseLesson['status'], topics: l.topics, built };
    });
  return { id, number, title: p.title, tagline: p.phase === FIRST_PHASE ? 'Start here: the core ideas of machine learning, each one running live on real data.' : p.tagline, start: p.phase === FIRST_PHASE, lessons, live: lessons.filter((l) => l.status === 'LIVE').length };
});

export const FOLDERS: Folder[] = phases;
export const TOTAL_LESSONS = FOLDERS.reduce((n, f) => n + f.lessons.length, 0);
/** Lessons a learner can take today (progress is counted against these). */
export const LIVE_LESSONS = BUILT.length;

/** Browse groups (no volume codes shown) and topic paths for the "Show" dropdown. */
export const AVAILABLE = FOLDERS.filter((f) => f.live > 0).map((f) => f.id);
export const COMING = FOLDERS.filter((f) => f.live === 0);

export const BROWSE: { id: string; label: string; folders: string[] | null }[] = [
  { id: 'available', label: 'Available now', folders: AVAILABLE },
  { id: 'all', label: 'All phases', folders: null },
  { id: 'found', label: 'Start: ML Fundamentals', folders: ['02'] },
  { id: 'dl', label: 'Deep Learning', folders: ['03', '04', '06'] },
  { id: 'lang', label: 'Language', folders: ['05', '07'] },
  { id: 'llm', label: 'Large Language Models', folders: ['08', '09', '10', '11'] },
  { id: 'agents', label: 'Agents & Protocols', folders: ['12', '13', '14', '15', '16'] },
  { id: 'prod', label: 'Production & Safety', folders: ['17', '18', '19'] },
];
export const TOPICS: { id: string; label: string }[] = curriculum.topics.map((t) => ({ id: t.id, label: t.title }));

export function findLesson(slug: string): { folder: Folder; lesson: CourseLesson; index: number } | null {
  for (const folder of FOLDERS) {
    const index = folder.lessons.findIndex((l) => l.slug === slug);
    if (index >= 0) return { folder, lesson: folder.lessons[index], index };
  }
  return null;
}

export const DEFAULT_SLUG = P02[0].slug;
