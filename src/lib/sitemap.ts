import { languages } from './i18n';
import { pathFor, type RouteKey, type RouteParams } from './routes';
import { alternateLinks } from './seo';
import { absoluteUrl } from './siteUrl';
import { getWorks } from './works';

interface Page {
  key: RouteKey;
  params?: RouteParams;
}

/** Every indexable page once (language-independent); the work pages come from the content. */
function pages(): Page[] {
  return [
    { key: 'home' },
    { key: 'portfolio' },
    ...getWorks().map((work): Page => ({ key: 'work', params: { slug: work.slug } })),
    { key: 'contact' },
    { key: 'privacy' },
  ];
}

/** Paths that are prerendered to static HTML: every page in every language. */
export function prerenderPaths(): string[] {
  return languages.flatMap((lang) => pages().map(({ key, params }) => pathFor(key, lang, params)));
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** sitemap.xml with one `<url>` per page and language, each listing its language versions. */
export function buildSitemap(): string {
  const urls = languages.flatMap((lang) =>
    pages().map(({ key, params }) => {
      const alternates = alternateLinks(key, params)
        .map(
          ({ attrs }) =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(attrs.hreflang ?? '')}" href="${escapeXml(attrs.href ?? '')}"/>`,
        )
        .join('\n');
      return `  <url>\n    <loc>${escapeXml(absoluteUrl(pathFor(key, lang, params)))}</loc>\n${alternates}\n  </url>`;
    }),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

export function buildRobots(): string {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${absoluteUrl('/sitemap.xml')}`, ''].join(
    '\n',
  );
}
