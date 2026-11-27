import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { getPageMeta, SEO_ATTRIBUTE, type PageMeta } from './seo';

/**
 * Puts `meta` into `doc`: sets the title and replaces every head tag marked with
 * {@link SEO_ATTRIBUTE} (the prerendered ones on first load, the previous page's afterwards).
 */
export function applyPageMeta(doc: Document, meta: PageMeta): void {
  doc.title = meta.title;
  for (const old of doc.head.querySelectorAll(`[${SEO_ATTRIBUTE}]`)) old.remove();
  for (const { tag, attrs, text } of meta.tags) {
    const element = doc.createElement(tag);
    for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
    element.setAttribute(SEO_ATTRIBUTE, '');
    if (text !== undefined) element.textContent = text;
    doc.head.append(element);
  }
}

/**
 * Keeps `<head>` in step with client-side navigation. The head is not rendered by React:
 * prerendering writes the same tags (see getPageMeta), so the first run only re-applies them.
 */
export function usePageMeta(): void {
  const { pathname } = useLocation();
  useEffect(() => {
    applyPageMeta(document, getPageMeta(pathname));
  }, [pathname]);
}
