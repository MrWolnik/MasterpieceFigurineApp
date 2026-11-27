import { describe, expect, it } from 'vitest';
import { fontPreloads, pageAssets, renderPreloadTags, type Manifest } from './preloadTags';

const manifest: Manifest = {
  'index.html': {
    file: 'assets/index.js',
    isEntry: true,
    imports: ['_shared.js'],
    css: ['assets/index.css'],
  },
  '_shared.js': { file: 'assets/shared.js', css: ['assets/shared.css'] },
  'src/pages/Contact/Contact.tsx': {
    file: 'assets/Contact.js',
    imports: ['_shared.js', '_form.js'],
    css: ['assets/Contact.css'],
  },
  '_form.js': { file: 'assets/form.js', imports: ['_shared.js'], css: ['assets/form.css'] },
  'src/pages/Privacy/Privacy.tsx': { file: 'assets/Privacy.js' },
};

describe('pageAssets', () => {
  it("lists the page's chunks and styles, leaving out what the entry already loads", () => {
    expect(pageAssets(manifest, 'src/pages/Contact/Contact.tsx')).toEqual({
      scripts: ['/assets/Contact.js', '/assets/form.js'],
      styles: ['/assets/Contact.css', '/assets/form.css'],
    });
    expect(pageAssets(manifest, 'src/pages/Privacy/Privacy.tsx')).toEqual({
      scripts: ['/assets/Privacy.js'],
      styles: [],
    });
  });

  it('has nothing to add for a page in the entry (home)', () => {
    expect(pageAssets(manifest, undefined)).toEqual({ scripts: [], styles: [] });
  });

  it('fails the build when a page is missing from the manifest', () => {
    expect(() => pageAssets(manifest, 'src/pages/Gone.tsx')).toThrow(/not in the build manifest/);
  });
});

describe('fontPreloads', () => {
  const files = [
    'cinzel-latin-wght-normal-AAA.woff2',
    'cinzel-latin-ext-wght-normal-BBB.woff2',
    'inter-latin-wght-normal-CCC.woff2',
    'inter-latin-ext-wght-normal-DDD.woff2',
    'inter-cyrillic-wght-normal-EEE.woff2',
    'index-FFF.js',
  ];

  it('preloads the Latin subsets in English', () => {
    expect(fontPreloads(files, 'en')).toEqual([
      '/assets/cinzel-latin-wght-normal-AAA.woff2',
      '/assets/inter-latin-wght-normal-CCC.woff2',
    ]);
  });

  it('adds Latin Extended for Polish letters', () => {
    expect(fontPreloads(files, 'pl')).toEqual([
      '/assets/cinzel-latin-wght-normal-AAA.woff2',
      '/assets/inter-latin-wght-normal-CCC.woff2',
      '/assets/cinzel-latin-ext-wght-normal-BBB.woff2',
      '/assets/inter-latin-ext-wght-normal-DDD.woff2',
    ]);
  });

  it('fails the build when a font file is missing (e.g. a renamed package)', () => {
    expect(() => fontPreloads(['index.js'], 'en')).toThrow(/No built font/);
  });
});

describe('renderPreloadTags', () => {
  it('renders font preloads and stylesheets (the JS loads after the first paint)', () => {
    const html = renderPreloadTags(['/assets/a.woff2'], ['/assets/p.css']);
    expect(html.split(/\n/).map((line) => line.trim())).toEqual([
      '<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/a.woff2">',
      '<link rel="stylesheet" crossorigin href="/assets/p.css">',
    ]);
  });
});
