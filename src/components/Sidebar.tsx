import { useEffect, useMemo, useRef, useState } from 'react';
import { TopicIcon } from './TopicIcon';
import { Icon } from './Icon';
import { BUILT, BROWSE, COMING, FOLDERS, TOPICS, LIVE_LESSONS, type Folder } from '../lib/course';
import { lessonHref, load, save } from '../lib/hooks';

/** Folder colours (fill, stroke) — same palette as the reference. */
const PAL: [string, string][] = [
  ['#d5b07a', '#a4824e'], ['#3fa456', '#2a7a3d'], ['#7c63d0', '#5a43a6'], ['#e8834d', '#b8602f'], ['#2f86ce', '#1f63a0'],
  ['#2a9d8f', '#1d7066'], ['#d9577a', '#a83a58'], ['#64728a', '#434e61'], ['#8c9a3c', '#626d26'],
];
const folderColour = (f: Folder) => PAL[(f.id === 'SH' ? 1 : parseInt(f.id, 10)) % PAL.length];

function FolderGlyph({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <svg width="21" height="18" viewBox="0 0 24 20" aria-hidden="true" style={{ flex: 'none' }}>
      <path d="M1.5 4.5a2 2 0 0 1 2-2h5l2 2.2h9a2 2 0 0 1 2 2V16a2 2 0 0 1-2 2h-16a2 2 0 0 1-2-2z" fill={fill} stroke={stroke} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M1.5 8.2h21" fill="none" stroke={stroke} strokeOpacity=".55" strokeWidth="1.1" />
    </svg>
  );
}

interface Props { currentSlug: string; query: string; done: Set<string>; panelOpen: boolean; onToggle: () => void }

const BUILT_SLUGS = new Set(BUILT.map((l) => l.slug));

export function Sidebar({ currentSlug, query, done, panelOpen, onToggle }: Props) {
  const currentFolder = FOLDERS.find((f) => f.lessons.some((l) => l.slug === currentSlug))?.id ?? 'SH';
  const [open, setOpen] = useState<Record<string, boolean>>(() => ({ ...load<Record<string, boolean>>('azh:open', {}), [currentFolder]: true }));
  const [filter, setFilter] = useState<string>(() => load('azh:show', 'available'));
  const [soonOpen, setSoonOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => save('azh:open', open), [open]);
  useEffect(() => save('azh:show', filter), [filter]);
  useEffect(() => { setOpen((o) => ({ ...o, [currentFolder]: true })); }, [currentFolder]);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    addEventListener('mousedown', close); addEventListener('keydown', close);
    return () => { removeEventListener('mousedown', close); removeEventListener('keydown', close); };
  }, [menuOpen]);

  const browse = BROWSE.find((b) => b.id === filter);
  const topic = TOPICS.find((t) => t.id === filter);
  const filterLabel = browse?.label ?? topic?.label ?? 'Available now';
  const q = query.trim().toLowerCase();

  const folders = useMemo(() => FOLDERS
    .map((f) => {
      let lessons = f.lessons;
      if (topic) lessons = lessons.filter((l) => l.topics.includes(topic.id));
      if (q) lessons = lessons.filter((l) => l.title.toLowerCase().includes(q) || f.title.toLowerCase().includes(q));
      return { f, lessons };
    })
    .filter(({ f, lessons }) => (!browse?.folders || browse.folders.includes(f.id)) && lessons.length > 0), [browse, topic, q]);

  const shownCount = folders.reduce((n, x) => n + x.lessons.length, 0);
  const countFor = (ids: string[] | null, topicId?: string) => FOLDERS.filter((f) => !ids || ids.includes(f.id)).reduce((n, f) => n + f.lessons.filter((l) => !topicId || l.topics.includes(topicId)).length, 0);
  const forceOpen = !!q || !!topic;

  if (!panelOpen) {
    return (
      <aside className="panel-strip panel-strip--left" aria-label="Course (collapsed)">
        <button type="button" className="tool-btn panel-strip__btn" onClick={onToggle} aria-expanded={false} aria-controls="course-panel" title="Show course ( [ )">
          <Icon name="panelLeftOpen" size={16} />
        </button>
        <span className="panel-strip__label">Course</span>
        <span className="panel-strip__meta">{[...done].filter((d) => BUILT_SLUGS.has(d)).length}/{LIVE_LESSONS}</span>
      </aside>
    );
  }

  return (
    <aside className="side" id="course-panel" aria-label="Course">
      <div className="tree-root">
        <svg width="20" height="17" viewBox="0 0 24 20" aria-hidden="true"><path d="M1.5 4.5a2 2 0 0 1 2-2h5l2 2.2h9a2 2 0 0 1 2 2V16a2 2 0 0 1-2 2h-16a2 2 0 0 1-2-2z" fill="currentColor" /></svg>
        Course
        <span className="tree-root__meta">{shownCount} lessons</span>
        <button type="button" className="panel-close" onClick={onToggle} aria-expanded={true} aria-controls="course-panel" title="Hide course ( [ )" aria-label="Hide course panel">
          <Icon name="panelLeft" size={15} />
        </button>
      </div>

      <div className="showmenu" ref={menuRef}>
        <button type="button" className="ghost showmenu__btn" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
          <span className="muted">Show</span>
          <strong>{filterLabel}</strong>
          <span className="showmenu__chev" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none' }}><Icon name="chevronDown" size={12} strokeWidth={2.4} /></span>
        </button>
        {menuOpen && (
          <div className="showmenu__menu" role="menu">
            <div className="showmenu__group">BROWSE</div>
            {BROWSE.map((b) => (
              <button key={b.id} type="button" role="menuitemradio" aria-checked={filter === b.id} className={filter === b.id ? 'showmenu__item is-on' : 'showmenu__item'} onClick={() => { setFilter(b.id); setMenuOpen(false); }}>
                <span className="showmenu__mark">{filter === b.id ? '✓' : ''}</span><span>{b.label}</span><span className="muted">{countFor(b.folders)}</span>
              </button>
            ))}
            <div className="showmenu__group">TOPIC PATHS</div>
            {TOPICS.map((t) => (
              <button key={t.id} type="button" role="menuitemradio" aria-checked={filter === t.id} className={filter === t.id ? 'showmenu__item is-on' : 'showmenu__item'} onClick={() => { setFilter(t.id); setMenuOpen(false); }}>
                <span className="showmenu__mark">{filter === t.id ? '✓' : ''}</span><span>{t.label}</span><span className="muted">{countFor(null, t.id)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="course" aria-label="Course outline">
        {folders.length === 0 && <p className="muted course__empty">No lessons match “{query}”.</p>}
        {folders.map(({ f, lessons }, fi) => {
          const isOpen = forceOpen || !!open[f.id];
          const [fill, stroke] = folderColour(f);
          const doneCount = f.lessons.filter((l) => done.has(l.slug)).length;
          return (
            <div key={f.id} className={isOpen ? 'mod is-open' : 'mod'} style={{ ['--i' as string]: fi }}>
              <button type="button" className="mod__head" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [f.id]: !isOpen }))} style={{ color: f.live ? 'var(--ink)' : 'var(--muted)' }}>
                <span className="mod__chev"><Icon name="chevronRight" size={12} strokeWidth={2.6} /></span>
                <FolderGlyph fill={fill} stroke={stroke} />
                <span className="mod__title">{f.number ? `${f.number}. ${f.title}` : f.title}</span>{f.start && <span className="start-tag">START</span>}
                <span className="mod__count">{f.live ? `${doneCount}/${f.lessons.length}` : f.lessons.length}</span>
              </button>
              <div className="mod__body">
                <div className="mod__clip">
                  <ul className="mod__lessons">
                    {lessons.map((l) => {
                      const cur = l.slug === currentSlug;
                      const soon = l.status === 'SOON';
                      return (
                        <li key={l.slug} className={`lesson${cur ? ' is-current' : ''}${soon ? ' is-soon' : ''}`}>
                          <a href={lessonHref(l.slug)} aria-current={cur ? 'page' : undefined} className={cur ? 'pop' : undefined} tabIndex={isOpen ? 0 : -1}>
                            <TopicIcon slug={l.slug} done={done.has(l.slug)} soon={!l.built} />
                            <span className="lesson__title">{l.title}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
        {filter === 'available' && !q && (
          <div className={soonOpen ? 'mod mod--soon is-open' : 'mod mod--soon'} style={{ ['--i' as string]: folders.length }}>
            <button type="button" className="mod__head" aria-expanded={soonOpen} onClick={() => setSoonOpen((v) => !v)}>
              <span className="mod__chev"><Icon name="chevronRight" size={12} strokeWidth={2.6} /></span>
              <FolderGlyph fill="var(--line-strong)" stroke="var(--muted)" />
              <span className="mod__title">{COMING.length} more phases</span>
              <span className="soon-tag">SOON</span>
            </button>
            <div className="mod__body">
              <div className="mod__clip">
                <ul className="mod__lessons">
                  {COMING.map((f) => (
                    <li key={f.id} className="lesson is-soon">
                      <a href={lessonHref(f.lessons[0].slug)} tabIndex={soonOpen ? 0 : -1}>
                        <span className="lesson__mark"><FolderGlyph fill={folderColour(f)[0]} stroke={folderColour(f)[1]} /></span>
                        <span className="lesson__title">{f.number}. {f.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="progress card">
        <span className="eyebrow">PROGRESS</span>
        <span className="progress__pct">{[...done].filter((d) => BUILT_SLUGS.has(d)).length} / {LIVE_LESSONS} <Icon name="chevronRight" size={12} /></span>
      </div>
    </aside>
  );
}
