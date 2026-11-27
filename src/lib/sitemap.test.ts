import { describe, expect, it } from 'vitest';
import { buildRobots, buildSitemap, prerenderPaths } from './sitemap';
import { absoluteUrl } from './siteUrl';
import { getWorks } from './works';

describe('prerenderPaths', () => {
  it('lists every page in both languages, including each work', () => {
    const paths = prerenderPaths();
    const works = getWorks();
    expect(paths).toHaveLength(2 * (4 + works.length));
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual(
      expect.arrayContaining(['/pl', '/en', '/pl/kontakt', '/en/contact', '/en/privacy']),
    );
    for (const work of works) {
      expect(paths).toContain(`/pl/portfolio/${work.slug}`);
      expect(paths).toContain(`/en/portfolio/${work.slug}`);
    }
  });
});

describe('buildSitemap', () => {
  const xml = buildSitemap();

  it('has one <url> per prerendered page', () => {
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(locs).toEqual(prerenderPaths().map(absoluteUrl));
  });

  it('lists the language versions of every page', () => {
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    const urls = xml.split('<url>').slice(1);
    for (const url of urls) {
      expect(url.match(/hreflang="(pl|en|x-default)"/g)).toHaveLength(3);
    }
    expect(xml).toContain(
      `<xhtml:link rel="alternate" hreflang="en" href="${absoluteUrl('/en/contact')}"/>`,
    );
  });
});

describe('buildRobots', () => {
  it('allows crawling and points to the sitemap', () => {
    const robots = buildRobots();
    expect(robots).toContain('User-agent: *\nAllow: /');
    expect(robots).toContain(`Sitemap: ${absoluteUrl('/sitemap.xml')}`);
  });
});
