const PATHS = {
  spark: ['M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z', 'M19 17v4M17 19h4'],
  arrowRight: ['M5 12h14', 'M13 6l6 6-6 6'],
  arrowLeft: ['M19 12H5', 'M11 6l-6 6 6 6'],
  check: ['M20 6 9 17l-5-5'],
  book: ['M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z', 'M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z'],
  map: ['M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z', 'M9 3v15M15 6v15'],
  target: ['M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18z', 'M12 8a4 4 0 1 1 0 8a4 4 0 1 1 0-8z'],
  layout: ['M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M3 9h18'],
  grid: ['M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'],
  search: ['M11 4a7 7 0 1 1 0 14a7 7 0 1 1 0-14z', 'M21 21l-4-4'],
  globe: ['M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18z', 'M3 12h18', 'M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18'],
  moon: ['M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'],
  sun: ['M12 8a4 4 0 1 1 0 8a4 4 0 1 1 0-8z', 'M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'],
  replay: ['M3 12a9 9 0 1 0 3-6.7L3 8', 'M3 3v5h5'],
  pause: ['M7 4h3v16H7zM14 4h3v16h-3z'],
  play: ['M6 4l14 8-14 8z'],
  chevronRight: ['M9 6l6 6-6 6'],
  chevronDown: ['M6 9l6 6 6-6'],
  panelLeft: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M9 3v18', 'M15 9l-3 3 3 3'],
  panelLeftOpen: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M9 3v18', 'M13 9l3 3-3 3'],
  panelRight: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M15 3v18', 'M9 9l3 3-3 3'],
  panelRightOpen: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M15 3v18', 'M11 9l-3 3 3 3'],
  doc: ['M5.5 2h8l4 4v15.5h-12z'],
  clock: ['M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18z', 'M12 7v5l3 2'],
  bars: ['M4 20v-4M10 20v-8M16 20V8M22 20V4'],
  list: ['M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'],
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 14, strokeWidth = 2 }: { name: IconName; size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none' }}>
      {PATHS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

export function GitHubMark({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" style={{ flex: 'none' }}>
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.7.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z" />
    </svg>
  );
}
