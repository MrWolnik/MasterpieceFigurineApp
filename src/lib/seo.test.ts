import { describe, expect, it } from 'vitest';
import { site } from '../config/site';
import { getPageMeta, renderHeadTags, truncate, type HeadTag, type PageMeta } from './seo';
import { absoluteUrl } from './siteUrl';
import { getBySlug } from './works';

function attr(meta: PageMeta, match: Record<string, string>, name: string): string | undefined {
  const tag = meta.tags.find((candidate) =>
    Object.entries(match).every(([key, value]) => candidate.attrs[key] === value),
  );
  return tag?.attrs[name];
}

const description = (meta: PageMeta) => attr(meta, { name: 'description' }, 'content');
const canonical = (meta: PageMeta) => attr(meta, { rel: 'canonical' }, 'href');
const hreflang = (meta: PageMeta, lang: string) =>
  attr(meta, { rel: 'alternate', hreflang: lang }, 'href');
const og = (meta: PageMeta, property: string) => attr(meta, { property }, 'content');
const jsonLd = (meta: PageMeta) => meta.tags.find((tag) => tag.tag === 'script');

describe('getPageMeta', () => {
  it('describes the Polish home page', () => {
    const meta = getPageMeta('/pl');
    expect(meta.lang).toBe('pl');
    expect(meta.title).toBe(`Julia – malowanie figurek i obrazy na zamówienie | ${site.brand}`);
    expect(description(meta)).toMatch(/^Ręcznie malowane figurki/);
    expect(canonical(meta)).toBe(absoluteUrl('/pl'));
  });

  it('links every language version and points x-default at Polish', () => {
    const meta = getPageMeta('/en/contact');
    expect(hreflang(meta, 'pl')).toBe(absoluteUrl('/pl/kontakt'));
    expect(hreflang(meta, 'en')).toBe(absoluteUrl('/en/contact'));
    expect(hreflang(meta, 'x-default')).toBe(absoluteUrl('/pl/kontakt'));
  });

  it('builds page titles from the page name and the brand, in the page language', () => {
    expect(getPageMeta('/en/contact').title).toBe(`Contact and commissions | ${site.brand}`);
    expect(getPageMeta('/pl/prywatnosc').title).toBe(`Polityka prywatności | ${site.brand}`);
    expect(getPageMeta('/en/portfolio').title).toBe(`Portfolio | ${site.brand}`);
  });

  it('uses the work title and a shortened description on a work page', () => {
    const work = getBySlug('mgla-nad-bagnem');
    const meta = getPageMeta('/en/portfolio/mgla-nad-bagnem');
    expect(meta.title).toBe(`${work?.title.en ?? ''} | ${site.brand}`);
    expect(description(meta)?.length).toBeLessThanOrEqual(155);
    expect(canonical(meta)).toBe(absoluteUrl('/en/portfolio/mgla-nad-bagnem'));
    expect(hreflang(meta, 'pl')).toBe(absoluteUrl('/pl/portfolio/mgla-nad-bagnem'));
  });

  it('shares the default image while covers are SVG placeholders', () => {
    const meta = getPageMeta('/pl/portfolio/nocny-wartownik');
    expect(og(meta, 'og:image')).toBe(absoluteUrl('/og-image.png'));
  });

  it('fills the Open Graph tags', () => {
    const meta = getPageMeta('/en/portfolio');
    expect(og(meta, 'og:title')).toBe(meta.title);
    expect(og(meta, 'og:url')).toBe(absoluteUrl('/en/portfolio'));
    expect(og(meta, 'og:locale')).toBe('en_GB');
    expect(og(meta, 'og:locale:alternate')).toBe('pl_PL');
    expect(og(meta, 'og:description')).toBe(description(meta));
  });

  it('adds Person structured data only on the home and contact pages', () => {
    expect(jsonLd(getPageMeta('/pl'))).toBeDefined();
    expect(jsonLd(getPageMeta('/en/contact'))).toBeDefined();
    expect(jsonLd(getPageMeta('/pl/portfolio'))).toBeUndefined();
    expect(jsonLd(getPageMeta('/pl/prywatnosc'))).toBeUndefined();
  });

  it('keeps unknown works and paths out of search results', () => {
    for (const path of ['/pl/portfolio/nie-ma-takiej', '/nowhere', '/en/nope']) {
      const meta = getPageMeta(path);
      expect(attr(meta, { name: 'robots' }, 'content')).toBe('noindex');
      expect(canonical(meta)).toBeUndefined();
    }
    expect(getPageMeta('/en/portfolio/missing').title).toBe(`Page not found | ${site.brand}`);
  });
});

describe('truncate', () => {
  it('leaves short text alone, collapsing whitespace', () => {
    expect(truncate('  Short\n text ')).toBe('Short text');
  });

  it('cuts long text at a word boundary and adds an ellipsis', () => {
    const result = truncate('one two three four five', 12);
    expect(result).toBe('one two…');
    expect(result.length).toBeLessThanOrEqual(12);
  });

  it('drops trailing punctuation before the ellipsis', () => {
    expect(truncate('alpha, beta gamma', 9)).toBe('alpha…');
  });
});

describe('renderHeadTags', () => {
  it('escapes attribute values and marks every tag', () => {
    const tags: HeadTag[] = [
      { tag: 'meta', attrs: { name: 'description', content: 'a "b" <c> & d' } },
    ];
    expect(renderHeadTags(tags)).toBe(
      '<meta name="description" content="a &quot;b&quot; &lt;c&gt; &amp; d" data-seo>',
    );
  });

  it('keeps a script body from closing its tag early', () => {
    const tags: HeadTag[] = [
      { tag: 'script', attrs: { type: 'application/ld+json' }, text: '{"a":"</script>"}' },
    ];
    const html = renderHeadTags(tags);
    expect(html).toBe(
      '<script type="application/ld+json" data-seo>{"a":"\\u003c/script>"}</script>',
    );
    expect(JSON.parse(html.slice(html.indexOf('>') + 1, html.lastIndexOf('<')))).toEqual({
      a: '</script>',
    });
  });
});
