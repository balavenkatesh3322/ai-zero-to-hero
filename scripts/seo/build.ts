/**
 * Post-build SEO & sharing assets (runs after `vite build`, writes into dist/):
 *  - one prerendered HTML file per indexable page with its own <title>, description, canonical, Open Graph, Twitter and JSON-LD
 *  - 1200×630 preview cards (PNG) for the site, every lesson (with its live app) and every section, drawn with the course's own iso objects
 *  - favicon.ico / favicon-32.png / apple-touch-icon.png / icon-192 / icon-512 / maskable icon, site.webmanifest, sitemap.xml, robots.txt
 * Run: npm run seo   (part of npm run build)
 */
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { SITE, appOf, indexablePages, jsonLd, pageMeta, SECTIONS, type PageMeta } from '../../src/lib/pages';
import { BUILT, findLesson } from '../../src/lib/course';
import { ART } from '../../src/lesson/art';
import { INK } from '../../src/lesson/iso';
import type { ObjectKind } from '../../src/lesson/types';

const ROOT = path.resolve(__dirname, '../..');
const DIST = path.join(ROOT, 'dist');
const FONTS = ['Regular', 'Bold', 'ExtraBold'].map((w) => path.join(ROOT, 'scripts/seo/fonts', `JetBrainsMono-${w}.ttf`));
const today = new Date().toISOString().slice(0, 10);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function png(svg: string, width: number) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'JetBrains Mono' } }).render().asPng();
}
function write(rel: string, data: string | Buffer) {
  const f = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
}

/* ------------------------------------------------------------------ preview cards */
const wrap = (text: string, perLine: number, maxLines: number) => {
  const words = text.split(/\s+/), lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > perLine) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w;
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && cur.trim()) lines.push(cur.trim());
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) lines[maxLines - 1] = lines[maxLines - 1].replace(/[ ,.;:—-]*$/, '') + '…';
  return lines;
};

function object(kind: ObjectKind, label: string, x: number, y: number, s: number) {
  const shapes = ART[kind]().map((p) => `<path d="${p.d}" fill="${p.fill}" ${p.stroke === 'none' ? 'stroke="none"' : `stroke="${p.stroke ?? INK}" stroke-width="${p.sw ?? 1.4}"`} stroke-linejoin="round" stroke-linecap="round"/>`).join('');
  const w = label.length * 9.6 + 26;
  return `<g transform="translate(${x} ${y}) scale(${s}) translate(-70 -88)">
    <ellipse cx="70" cy="90" rx="48" ry="20" fill="#6b5236" opacity=".16"/>${shapes}</g>
    <g transform="translate(${x} ${y + 22 * s})"><rect x="${-w / 2}" y="-15" width="${w}" height="30" rx="15" fill="#f9f2e8" stroke="${INK}" stroke-width="2"/>
    <text x="0" y="6" text-anchor="middle" font-size="16" font-weight="700" fill="${INK}">${esc(label)}</text></g>`;
}

const LOGO = (x: number, y: number, s: number) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M16 3 L28 9.5 L16 16 L4 9.5 Z" fill="#cfe3b2" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 9.5 L16 16 L16 29 L4 22.5 Z" fill="#f8f0e6" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M28 9.5 L16 16 L16 29 L28 22.5 Z" fill="#c6bbac" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="16" cy="9.5" r="2" fill="${INK}"/></g>`;

function grid() {
  let g = '';
  for (let i = -20; i < 40; i++) { const x = i * 44; g += `<line x1="${x}" y1="0" x2="${x + 630 * 1.732}" y2="630"/><line x1="${x}" y1="630" x2="${x + 630 * 1.732}" y2="0"/>`; }
  return `<g stroke="#e3d9cb" stroke-width="1.2">${g}</g>`;
}

interface Card { eyebrow: string; title: string; summary: string; footer: string; objects: [ObjectKind, string][] }
function cardSvg(c: Card) {
  const titleSize = c.title.length > 40 ? 50 : c.title.length > 26 ? 58 : 66;
  const tLines = wrap(c.title, Math.floor(700 / (titleSize * 0.6)), 3);
  const tY = 236, sY = tY + (tLines.length - 1) * titleSize * 1.12 + 58;
  const sLines = wrap(c.summary, 46, Math.max(1, Math.min(3, Math.floor((500 - sY) / 34) + 1)));
  const S = 1.9, pos: [number, number][] = [[905, 205], [1070, 335], [905, 470]];
  const arrows = pos.slice(1).map(([x, y], i) => { const [a, b] = pos[i]; const dx = x - a, dy = y - b, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L; const s0 = [a + ux * 58, b - 30 + uy * 58], e0 = [x - ux * 64, y - 30 - uy * 64]; const ang = Math.atan2(e0[1] - s0[1], e0[0] - s0[0]) * 180 / Math.PI;
    return `<path d="M${s0[0].toFixed(1)} ${s0[1].toFixed(1)} L${e0[0].toFixed(1)} ${e0[1].toFixed(1)}" stroke="${INK}" stroke-width="3" fill="none"/><path d="M2 0 L-14 -8 L-10 0 L-14 8 Z" fill="${i ? '#3fa456' : INK}" stroke="${i ? '#3fa456' : INK}" stroke-linejoin="round" transform="translate(${e0[0].toFixed(1)} ${e0[1].toFixed(1)}) rotate(${ang.toFixed(1)})"/><circle cx="${((s0[0] + e0[0]) / 2).toFixed(1)}" cy="${((s0[1] + e0[1]) / 2).toFixed(1)}" r="8" fill="${i ? '#9fd28f' : '#f3b47f'}" stroke="${INK}" stroke-width="2"/>`; }).join('');
  const ew = c.eyebrow.length * 10.8 + 34;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="JetBrains Mono">
  <rect width="1200" height="630" fill="#f4ebe0"/>${grid()}
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="${INK}" stroke-width="3"/>
  ${LOGO(64, 58, 1.55)}<text x="124" y="92" font-size="30" font-weight="800" fill="${INK}">AI Zero to <tspan fill="${INK}">Hero</tspan></text>
  <g transform="translate(64 136)"><rect width="${ew}" height="40" rx="20" fill="#cfe3b2" stroke="${INK}" stroke-width="2.2"/><text x="17" y="27" font-size="18" font-weight="800" fill="#24521c">${esc(c.eyebrow)}</text></g>
  ${tLines.map((l, i) => `<text x="64" y="${tY + i * titleSize * 1.12}" font-size="${titleSize}" font-weight="800" fill="${INK}">${esc(l)}</text>`).join('')}
  ${sLines.map((l, i) => `<text x="64" y="${sY + 6 + i * 34}" font-size="23" fill="#34302b">${esc(l)}</text>`).join('')}
  <g transform="translate(64 532)"><rect width="${c.footer.length * 10.25 + 58}" height="44" rx="12" fill="#1d1b18"/><circle cx="22" cy="22" r="6" fill="#e0705f"/><text x="38" y="29" font-size="17" font-weight="700" fill="#f4ebe0">${esc(c.footer)}</text></g>
  ${arrows}${c.objects.map(([k, l], i) => object(k, l, pos[i][0], pos[i][1], S)).join('')}
</svg>`;
}

const cards: { file: string; card: Card }[] = [];
cards.push({ file: 'og/site.png', card: { eyebrow: 'FREE · OPEN SOURCE · INTERACTIVE', title: SITE.tagline, summary: 'Every lesson is a system you step through, then a live app running real public data through a real model.', footer: `LIVE APPS · ${BUILT.length} lessons · 00 · ML Fundamentals`, objects: [['phone', 'Sender'], ['model', 'Model'], ['inbox', 'Inbox']] } });
for (const l of BUILT) {
  const f = findLesson(l.slug)!, app = appOf(l), sys = l.system!.nodes;
  const model = sys.find((n) => n.kind === 'model' || n.kind === 'tree' || n.kind === 'forest' || n.kind === 'server') ?? sys[2];
  const picks = [sys[0], model, sys[sys.length - 1] === model ? sys[sys.length - 2] : sys[sys.length - 1]];
  cards.push({ file: `og/learn/${l.slug}.png`, card: {
    eyebrow: `${f.folder.number} · ${f.folder.title.toUpperCase()} · LESSON ${f.index + 1}/${f.folder.lessons.length}`,
    title: l.title, summary: l.summary, footer: app ? `LIVE APP · ${app.name}` : 'Interactive lesson', objects: picks.map((n) => [n.kind, n.label]),
  } });
}
const SECTION_OBJECTS: Record<string, [ObjectKind, string][]> = { map: [['person', 'You'], ['pipeline', 'Path'], ['judge', 'Level']], practice: [['trace', 'Alert'], ['search', 'Trace'], ['judge', 'Diagnose']], design: [['gateway', 'Gateway'], ['db', 'Data'], ['llm', 'LLM']], cheatsheets: [['doc', 'Sheet'], ['skill', 'Idea'], ['cache', 'Recall']] };
for (const [v, s] of Object.entries(SECTIONS)) cards.push({ file: `og/${v}.png`, card: { eyebrow: `${s.title.toUpperCase()} · COMING SOON`, title: s.title, summary: s.description, footer: `Start now: ${BUILT.length} live lessons, free`, objects: SECTION_OBJECTS[v] } });

for (const c of cards) write(c.file, png(cardSvg(c.card), 1200));

/* ------------------------------------------------------------------ icons */
const iconSvg = (size: number, pad: number, bg: boolean, radius = 0) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">${bg ? `<rect width="32" height="32" rx="${radius}" fill="#f4ebe0"/>` : ''}<g transform="translate(${pad} ${pad}) scale(${(32 - 2 * pad) / 32})">${LOGO(0, 0, 1).replace(/^<g transform="translate\(0 0\) scale\(1\)">/, '<g>')}</g></svg>`;
const ico = (pngs: Buffer[], sizes: number[]) => {
  const head = Buffer.alloc(6 + 16 * pngs.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
  let off = head.length;
  pngs.forEach((p, i) => { const e = 6 + i * 16; head[e] = sizes[i] % 256; head[e + 1] = sizes[i] % 256; head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6); head.writeUInt32LE(p.length, e + 8); head.writeUInt32LE(off, e + 12); off += p.length; });
  return Buffer.concat([head, ...pngs]);
};
write('favicon.ico', ico([16, 32, 48].map((s) => png(iconSvg(s, 0.5, false), s)), [16, 32, 48]));
write('favicon-32.png', png(iconSvg(32, 0.5, false), 32));
write('apple-touch-icon.png', png(iconSvg(180, 4, true), 180));
write('icon-192.png', png(iconSvg(192, 3, true, 6), 192));
write('icon-512.png', png(iconSvg(512, 3, true, 6), 512));
write('icon-maskable-512.png', png(iconSvg(512, 7, true), 512));
write('site.webmanifest', JSON.stringify({
  name: SITE.name, short_name: 'Zero to Hero', description: SITE.description, start_url: '/', scope: '/', display: 'standalone',
  background_color: SITE.themeLight, theme_color: SITE.themeLight, lang: 'en', categories: ['education'],
  icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
}, null, 2));

/* ------------------------------------------------------------------ prerendered pages, sitemap, robots */
// keep the untouched Vite shell so this step can be re-run without rebuilding
const SHELL = path.join(ROOT, 'node_modules/.cache/seo-shell.html');
const built = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
if (built.includes('<!--seo-->')) { fs.mkdirSync(path.dirname(SHELL), { recursive: true }); fs.writeFileSync(SHELL, built); }
const template = fs.readFileSync(SHELL, 'utf8');
function head(m: PageMeta) {
  const url = `${SITE.url}${m.path}`, img = `${SITE.url}${m.image}`;
  return [
    `<link rel="canonical" href="${url}" />`,
    `<meta name="robots" content="${m.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}" />`,
    `<meta property="og:type" content="${m.kind === 'lesson' ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="${SITE.name}" />`, `<meta property="og:locale" content="${SITE.locale}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`, `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${url}" />`, `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:type" content="image/png" />`, `<meta property="og:image:width" content="1200" />`, `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(m.imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`, `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`, `<meta name="twitter:image" content="${img}" />`, `<meta name="twitter:image:alt" content="${esc(m.imageAlt)}" />`,
    `<script type="application/ld+json" id="ld-json">${JSON.stringify(jsonLd(m)).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ');
}
function render(m: PageMeta) {
  if (!template.includes('<!--seo-->')) throw new Error('dist/index.html is missing the <!--seo--> marker');
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(m.description)}" />`)
    .replace('<!--seo-->', head(m));
}
const pages = indexablePages();
for (const m of pages) write(m.path === '/' ? 'index.html' : `${m.path.slice(1)}/index.html`, render(m));
write('404.html', render({ ...pageMeta('/'), noindex: true, title: `Page not found — ${SITE.name}` }));

write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.map((m) => `  <url><loc>${SITE.url}${m.path}</loc><lastmod>${today}</lastmod><changefreq>${m.kind === 'section' ? 'monthly' : 'weekly'}</changefreq><priority>${m.kind === 'home' ? '1.0' : m.kind === 'lesson' ? '0.8' : '0.4'}</priority><image:image><image:loc>${SITE.url}${m.image}</image:loc></image:image></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /objects\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

console.log(`seo: ${pages.length} pages, ${cards.length} preview cards, icons, manifest, sitemap, robots → dist/`);
