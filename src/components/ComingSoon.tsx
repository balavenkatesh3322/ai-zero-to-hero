import { SceneObject } from '../lesson/SceneObject';
import type { ObjectKind } from '../lesson/types';
import { AVAILABLE, FOLDERS, DEFAULT_SLUG } from '../lib/course';
import { lessonHref } from '../lib/hooks';
import { SITE } from '../lib/pages';
import { GitHubMark, Icon } from './Icon';

export interface SoonConfig {
  eyebrow: string;
  title: string;
  lead: string;
  includes: string[];
  objects: [ObjectKind, string][];
}

export const SCREENS: Record<string, SoonConfig> = {
  map: {
    eyebrow: 'COURSE MAP · COMING SOON',
    title: 'The whole journey on one page',
    lead: 'Every volume, phase and lesson from zero to AI systems design — with topic paths (RAG, tool calling, MCP, agents, evaluation, security) and a placement quiz to find where you should start.',
    includes: ['18 phases from ML fundamentals to AI systems design', 'Topic paths that cut across phases', '“Find your level” placement quiz', 'Your progress on every phase'],
    objects: [['user', 'you'], ['pipeline', 'Path'], ['judge', 'Level']],
  },
  practice: {
    eyebrow: 'PRACTICE · COMING SOON',
    title: 'Debug real incidents, graded instantly',
    lead: 'A pager alert, a trace, four possible root causes. Pick one and get specific feedback — the fastest way to turn lessons into instincts.',
    includes: ['Incident scenarios for every phase', 'Real traces and real model outputs', 'Instant, explained grading', 'Streaks and progress — saved in your browser'],
    objects: [['trace', 'Alert'], ['search', 'Trace'], ['judge', 'Diagnose']],
  },
  design: {
    eyebrow: 'AI SYSTEM DESIGN · COMING SOON',
    title: 'Design whole AI systems, interview-style',
    lead: 'Twelve 45-minute case studies — enterprise document Q&A, ChatGPT, a coding assistant, a voice agent — walked through requirements, napkin math, architecture, data, model choice, evals and cost.',
    includes: ['12 step-through case studies', 'Live napkin math and trade-off controls', 'Question / Decision / Because recaps', 'Builds on Phases 11–18'],
    objects: [['gateway', 'Gateway'], ['vector', 'vector DB'], ['llm', 'LLM']],
  },
  cheatsheets: {
    eyebrow: 'CHEATSHEETS · COMING SOON',
    title: 'One screen per idea',
    lead: 'A printable summary for every lesson: the key formula, the default numbers, the common failure — in the same visual language as the lessons.',
    includes: ['A sheet for every lesson', 'Free print-ready PDFs', 'Searchable and filterable', 'Edit any sheet on GitHub'],
    objects: [['doc', 'Sheet'], ['skill', 'Idea'], ['cache', 'Recall']],
  },
};

const availableCount = FOLDERS.filter((f) => AVAILABLE.includes(f.id)).reduce((n, f) => n + f.lessons.length, 0);

export function ComingSoon({ cfg, crumbs }: { cfg: SoonConfig; crumbs?: string }) {
  return (
    <main className="card soonpage" aria-labelledby="soon-title">
      {crumbs && <p className="crumbs">{crumbs}</p>}
      <div className="soonpage__grid">
        <div className="soonpage__copy">
          <span className="chip chip--violet soonpage__eyebrow">{cfg.eyebrow}</span>
          <h1 id="soon-title">{cfg.title}</h1>
          <p className="soonpage__lead">{cfg.lead}</p>
          <ul className="soonpage__list">
            {cfg.includes.map((t) => <li key={t}><Icon name="check" size={13} strokeWidth={2.6} />{t}</li>)}
          </ul>
          <div className="soonpage__actions">
            <a className="pop soon__btn" href={lessonHref(DEFAULT_SLUG)}>Start learning now <Icon name="arrowRight" size={14} /></a>
            <a className="ghost soon__btn" href={SITE.repo} target="_blank" rel="noreferrer"><GitHubMark /> Star or help build it</a>
          </div>
          <p className="muted soonpage__note">Available today: 00 · ML Fundamentals — {availableCount} interactive lessons with live apps.</p>
        </div>
        <div className="soonpage__scene stagebox" aria-hidden="true">
          {cfg.objects.map(([kind, label], i) => (
            <div key={label} className="soonpage__obj" style={{ ['--i' as string]: i }}>
              <SceneObject kind={kind} label={label} state={i === 1 ? 'on' : 'done'} />
            </div>
          ))}
          <span className="soonpage__badge">in progress</span>
        </div>
      </div>
    </main>
  );
}
