import { describe, expect, it } from 'vitest';
import {
  collectTags,
  filterWorks,
  getBySlug,
  getFeatured,
  getTags,
  getWorks,
  parseWorks,
  sortWorks,
  type Work,
} from './works';

const text = { pl: 'Tekst', en: 'Text' };

function figurine(slug: string, extra: Record<string, unknown> = {}) {
  return {
    kind: 'figurine',
    slug,
    title: text,
    description: text,
    tags: ['warhammer'],
    cover: `/works/${slug}/cover.svg`,
    order: 1,
    ...extra,
  };
}

function painting(slug: string, extra: Record<string, unknown> = {}) {
  return {
    kind: 'painting',
    slug,
    title: text,
    description: text,
    tags: ['olej'],
    cover: `/works/${slug}/cover.svg`,
    image: `/works/${slug}/full.svg`,
    imageHiRes: `/works/${slug}/full@2x.svg`,
    medium: text,
    size: '50 × 70 cm',
    year: 2025,
    order: 1,
    ...extra,
  };
}

/** Wraps raw objects as if they were loaded from `src/content/works/<slug>.json`. */
function files(...raws: { slug: string }[]): Record<string, unknown> {
  return Object.fromEntries(raws.map((raw) => [`/src/content/works/${raw.slug}.json`, raw]));
}

describe('parseWorks', () => {
  it('parses both kinds and fills defaults', () => {
    const [fig] = parseWorks(files(figurine('a')));
    expect(fig).toMatchObject({ coverFocus: '50% 50%', images: [], featured: false });
    expect(parseWorks(files(painting('b')))[0]?.kind).toBe('painting');
  });

  it('sorts by order, then slug', () => {
    const works = parseWorks(
      files(figurine('c', { order: 2 }), figurine('b', { order: 1 }), painting('a', { order: 2 })),
    );
    expect(works.map((w) => w.slug)).toEqual(['b', 'a', 'c']);
  });

  it.each([
    ['a painting without image', painting('x', { image: undefined }), /image/],
    ['a figurine with medium', figurine('x', { medium: text }), /medium/],
    ['an unknown kind', figurine('x', { kind: 'sculpture' }), /kind/],
    ['a missing English title', figurine('x', { title: { pl: 'Tytuł' } }), /title/],
    ['a non-kebab-case slug', figurine('X_1'), /kebab-case/],
  ])('rejects %s', (_name, raw, field) => {
    expect(() => parseWorks(files(raw))).toThrow(field);
  });

  it('names the invalid file in the error', () => {
    expect(() => parseWorks(files(painting('bad', { year: 'x' })))).toThrow(
      '/src/content/works/bad.json',
    );
  });

  it('rejects a slug that does not match the file name', () => {
    expect(() => parseWorks({ '/src/content/works/other.json': figurine('a') })).toThrow(
      /match the file name/,
    );
  });

  it('rejects duplicate slugs', () => {
    expect(() =>
      parseWorks({
        '/src/content/works/a.json': figurine('a'),
        '/other/a.json': figurine('a'),
      }),
    ).toThrow(/Duplicate work slug "a"/);
  });
});

describe('query helpers', () => {
  const works: Work[] = sortWorks(
    parseWorks(
      files(
        figurine('f1', { tags: ['warhammer', 'nmm'], order: 1 }),
        figurine('f2', { tags: ['dnd'], order: 3 }),
        painting('p1', { tags: ['olej', 'nmm'], order: 2 }),
      ),
    ),
  );

  it('filters by kind', () => {
    expect(filterWorks(works, { kind: 'painting' }).map((w) => w.slug)).toEqual(['p1']);
  });

  it('filters by tag across kinds, keeping the order', () => {
    expect(filterWorks(works, { tag: 'nmm' }).map((w) => w.slug)).toEqual(['f1', 'p1']);
  });

  it('combines kind and tag', () => {
    expect(filterWorks(works, { kind: 'figurine', tag: 'nmm' }).map((w) => w.slug)).toEqual(['f1']);
    expect(filterWorks(works, { kind: 'figurine', tag: 'olej' })).toEqual([]);
  });

  it('returns all works without a filter', () => {
    expect(filterWorks(works)).toHaveLength(3);
  });

  it('collects unique, sorted tags, optionally per kind', () => {
    expect(collectTags(works)).toEqual(['dnd', 'nmm', 'olej', 'warhammer']);
    expect(collectTags(works, 'painting')).toEqual(['nmm', 'olej']);
  });
});

describe('sample content', () => {
  it('has 5 figurines (2 with 360° frames) and 3 paintings', () => {
    const figurines = getWorks({ kind: 'figurine' });
    expect(getWorks()).toHaveLength(8);
    expect(figurines).toHaveLength(5);
    expect(figurines.filter((w) => w.kind === 'figurine' && w.frames)).toHaveLength(2);
    expect(getWorks({ kind: 'painting' })).toHaveLength(3);
  });

  it('is sorted by order', () => {
    const orders = getWorks().map((w) => w.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it('finds works by slug', () => {
    expect(getBySlug('mgla-nad-bagnem')?.kind).toBe('painting');
    expect(getBySlug('missing')).toBeUndefined();
  });

  it('has featured works and tags for each kind', () => {
    expect(getFeatured().length).toBeGreaterThan(0);
    expect(getFeatured().every((w) => w.featured)).toBe(true);
    expect(getTags('painting')).toContain('olej');
    expect(getTags('figurine')).not.toContain('olej');
  });
});
