/** Keeps <head> (title, description, canonical, Open Graph, Twitter, robots, JSON-LD) in step with in-app navigation. */
import { useEffect } from 'react';
import { SITE, jsonLd, pageMeta } from './pages';
import type { Route } from './hooks';

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.content = value;
}

export function useSeo(route: Route) {
  useEffect(() => {
    const m = pageMeta(location.pathname);
    const url = `${SITE.url}${m.path}`, img = `${SITE.url}${m.image}`;
    document.title = m.title;
    setMeta('name', 'description', m.description);
    setMeta('name', 'robots', m.noindex ? 'noindex, follow' : 'index, follow');
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
    link.href = url;
    setMeta('property', 'og:title', m.title); setMeta('property', 'og:description', m.description);
    setMeta('property', 'og:url', url); setMeta('property', 'og:image', img); setMeta('property', 'og:image:alt', m.imageAlt);
    setMeta('property', 'og:type', m.kind === 'lesson' ? 'article' : 'website');
    setMeta('name', 'twitter:title', m.title); setMeta('name', 'twitter:description', m.description);
    setMeta('name', 'twitter:image', img); setMeta('name', 'twitter:image:alt', m.imageAlt);
    let ld = document.getElementById('ld-json');
    if (!ld) { ld = document.createElement('script'); ld.id = 'ld-json'; ld.setAttribute('type', 'application/ld+json'); document.head.appendChild(ld); }
    ld.textContent = JSON.stringify(jsonLd(m));
  }, [route.view, route.slug]);
}
