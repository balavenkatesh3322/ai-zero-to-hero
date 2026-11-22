import { useEffect, useRef } from 'react';
import { GitHubMark, Icon, type IconName } from './Icon';
import type { Theme } from '../lib/hooks';
import { SITE } from '../lib/pages';

const NAV: { view: string; label: string; icon: IconName }[] = [
  { view: 'learn', label: 'Learn', icon: 'book' },
  { view: 'map', label: 'Course map', icon: 'map' },
  { view: 'practice', label: 'Practice', icon: 'target' },
  { view: 'design', label: 'System Design', icon: 'layout' },
  { view: 'cheatsheets', label: 'Cheatsheets', icon: 'grid' },
];

interface Props { view: string; theme: Theme; toggleTheme: () => void; query: string; setQuery: (q: string) => void }

export function Header({ view, theme, toggleTheme, query, setQuery }: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchRef.current?.focus(); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="AI Zero to Hero — home">
        <img src="/favicon.svg" width="30" height="30" alt="" />
        <span>AI Zero to <span className="brand__hl">Hero</span></span>
      </a>
      <nav className="topnav" aria-label="Primary">
        {NAV.map((n, i) => (
          <a key={n.view} style={{ ['--i' as string]: i }} href={`/${n.view}`} className={view === n.view ? 'topnav__item pop' : 'topnav__item'} aria-current={view === n.view ? 'page' : undefined}>
            <Icon name={n.icon} />{n.label}
          </a>
        ))}
      </nav>
      <div className="topbar__spacer" />
      <div className="topbar__tools">
        <label className="search">
          <Icon name="search" />
          <span className="sr-only">Search lessons</span>
          <input ref={searchRef} id="lesson-search" name="q" type="search" placeholder="Search lessons…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <kbd>⌘K</kbd>
        </label>
        <button type="button" className="tool-btn" onClick={toggleTheme} aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}>
          <Icon name={theme === 'light' ? 'moon' : 'sun'} />
        </button>
        <a className="tool-btn gh-btn" href={SITE.repo} target="_blank" rel="noreferrer" aria-label="AI Zero to Hero on GitHub — star or contribute"><GitHubMark /><span className="gh-btn__label">GitHub</span></a>
        <a className="creator" href="https://balavenkatesh.is-a.dev/" target="_blank" rel="noreferrer">
          <span className="creator__avatar">BV</span>
          <span className="creator__text"><span className="creator__by">created by</span><span className="creator__name">Bala Venkatesh</span></span>
        </a>
      </div>
    </header>
  );
}
