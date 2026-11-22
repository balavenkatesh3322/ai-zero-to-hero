import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LessonPlayer } from './lesson/LessonPlayer';
import { ComingSoon, SCREENS } from './components/ComingSoon';
import { ObjectGallery } from './components/ObjectGallery';
import { DEFAULT_SLUG, findLesson } from './lib/course';
import { navigate, usePanels, useProgress, useRoute, useTheme } from './lib/hooks';
import { useSeo } from './lib/seo';

export function App() {
  const route = useRoute();
  const [theme, toggleTheme] = useTheme();
  const [query, setQuery] = useState('');
  const [done, markDone] = useProgress();
  const [panels, togglePanel] = usePanels();
  const [booting, setBooting] = useState(true);
  useEffect(() => { const t = setTimeout(() => setBooting(false), 2600); return () => clearTimeout(t); }, []);

  // /learn alone → the home page (first lesson); unknown slugs fall back to it too.
  useEffect(() => {
    if (location.pathname === '/learn' || location.pathname === '/learn/') navigate('/', true);
  }, [route.view, route.slug]);
  useSeo(route);

  const found = findLesson(route.slug || DEFAULT_SLUG) ?? findLesson(DEFAULT_SLUG)!;
  const isLearn = route.view === 'learn';

  return (
    <div className={booting ? 'app is-booting' : 'app'}>
      <Header view={route.view} theme={theme} toggleTheme={toggleTheme} query={query} setQuery={setQuery} />
      <div className="row">
        <Sidebar currentSlug={found.lesson.slug} query={query} done={done} panelOpen={panels.left} onToggle={() => togglePanel('left')} />
        {isLearn && found.lesson.built ? (
          <LessonPlayer
            key={found.lesson.slug}
            lesson={found.lesson.built}
            folder={found.folder}
            index={found.index}
            step={route.step}
            onFinish={() => markDone(found.lesson.slug)}
            railOpen={panels.right}
            onToggleRail={() => togglePanel('right')}
          />
        ) : isLearn ? (
          <ComingSoon
            crumbs={`${found.folder.number ? found.folder.number + '. ' : ''}${found.folder.title} / Lesson ${found.index + 1} of ${found.folder.lessons.length}`}
            cfg={{
              eyebrow: 'LESSON · COMING SOON',
              title: found.lesson.title,
              lead: `${found.folder.title}: ${found.folder.tagline} This lesson isn’t built as an interactive scene yet — it’s open for contributors.`,
              includes: ['Opens with a real incident', 'Animated step-through scene', 'Only measured or published data', 'Recap and practice'],
              objects: [['doc', 'Lesson'], ['pipeline', 'Scene'], ['judge', 'Recap']],
            }}
          />
        ) : route.view === 'objects' ? (
          <ObjectGallery />
        ) : (
          <ComingSoon cfg={SCREENS[route.view] ?? SCREENS.map} />
        )}
      </div>
    </div>
  );
}
