import { useEffect, useState } from 'react';
import { Stage } from './Stage';
import { Stepper } from './Stepper';
import { StepCard } from './StepCard';
import { WidgetView } from './Widgets';
import { Icon } from '../components/Icon';
import type { Lesson, LessonCtx } from './types';
import type { Folder } from '../lib/course';
import { lessonHref, navigate } from '../lib/hooks';

interface Props { lesson: Lesson; folder: Folder; index: number; step: number; onFinish: () => void }

const SWATCH: Record<Lesson['legend'][number]['swatch'], string> = {
  request: 'legend__dot legend__dot--request', grounded: 'legend__dot legend__dot--grounded',
  done: 'legend__dot legend__dot--done', focus: 'legend__dot legend__dot--focus',
};

export function LessonPlayer({ lesson, folder, index, step, onFinish }: Props) {
  const [ctx, setCtx] = useState<LessonCtx>({ temp: 1 });
  const [paused, setPaused] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const n = lesson.steps.length;
  const s = Math.min(step, n - 1);
  const cur = lesson.steps[s];

  const go = (i: number) => navigate(lessonHref(lesson.slug, Math.max(0, Math.min(n - 1, i))));
  const next = () => {
    if (s < n - 1) return go(s + 1);
    onFinish();
    const nextLesson = folder.lessons[index + 1];
    if (nextLesson) navigate(lessonHref(nextLesson.slug));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); if (s < n - 1) go(s + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(s - 1); }
      else if (e.key.toLowerCase() === 'r') setReplayKey((k) => k + 1);
      else if (e.key === ' ' && !el.closest('button, a')) { e.preventDefault(); setPaused((p) => !p); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });


  const nextLabel = s === n - 1 ? 'Finish lesson' : `Next: ${lesson.steps[s + 1].label}`;

  return (
    <>
      <main className="card lessonpane" aria-labelledby="lesson-title">
        <div className="lesson-head">
          <p className="crumbs">{folder.number ? `${folder.number}. ` : ''}{folder.title} <span className="muted">/</span> Lesson {index + 1} of {folder.lessons.length}</p>
          <div className="lesson-head__row">
            <h1 id="lesson-title">{lesson.title}</h1>
            <div className="lesson-head__chips">
              <span className="chip chip--orange"><Icon name="clock" size={12} /> {lesson.minutes} min</span>
              <span className="chip chip--green"><Icon name="bars" size={12} /> {lesson.level}</span>
              <span className="chip chip--violet"><Icon name="list" size={12} /> {n} steps</span>
            </div>
          </div>
          <p className="lesson-head__sum">{lesson.summary}</p>
        </div>

        <div className={cur.scene === 'system' ? 'stagebox stagebox--live' : 'stagebox'}>
          <div className="stage__hud">
            <div className="metrics">
              {lesson.metrics.map((m, mi) => {
                const v = m.values[s];
                const value = typeof v === 'function' ? v(ctx) : v;
                return (
                  <div key={m.label} className="metric" style={{ ['--i' as string]: mi }}>
                    <div className="metric__k">{m.label}</div>
                    <div key={value} className="metric__v">{value}</div>
                  </div>
                );
              })}
            </div>
            <div className="stage__tools">
              <button type="button" className="ghost toolbtn" onClick={() => setReplayKey((k) => k + 1)} title="Replay this step (R)"><Icon name="replay" size={13} /> Replay</button>
              <button type="button" className="ghost toolbtn" onClick={() => setPaused((p) => !p)} title="Pause traffic (Space)" aria-pressed={paused}>
                <Icon name={paused ? 'play' : 'pause'} size={13} /> {paused ? 'Play' : 'Pause'}
              </button>
            </div>
          </div>

          <Stage lesson={lesson} step={s} ctx={ctx} paused={paused} replayKey={replayKey} />

          <div key={`${s}-${replayKey}`} className="detail">
            <WidgetView widget={cur.widget} ctx={ctx} setCtx={setCtx} />
          </div>
          {cur.source && <p className="source" key={`src${s}`}><span className="source__dot" aria-hidden="true" />Data: {cur.source}</p>}

          <div className="legend">
            {lesson.legend.map((l) => <span key={l.label}><span className={SWATCH[l.swatch]} /> {l.label}</span>)}
          </div>
        </div>

        <Stepper steps={lesson.steps} step={s} go={go} />
      </main>

      <aside className="rail" aria-label="Step">
        <StepCard lessonTitle={lesson.title} step={cur} index={s} total={n} onBack={() => go(s - 1)} onNext={next} nextLabel={nextLabel} />
        <section className="card learn">
          <div className="eyebrow">YOU’LL LEARN</div>
          <ul>
            {lesson.youWillLearn.map((t, i) => (
              <li key={t} className={s > i + 2 ? 'is-done' : ''}>
                <span className="learn__box">{s > i + 2 && <Icon name="check" size={10} strokeWidth={3} />}</span>{t}
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </>
  );
}
