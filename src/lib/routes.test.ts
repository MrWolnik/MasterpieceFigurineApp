import { describe, expect, it } from 'vitest';
import { languages } from './i18n';
import { canonicalPath, pathFor, resolvePath, routeKeys, switchLanguagePath } from './routes';

const pairs = [
  ['/pl', '/en'],
  ['/pl/portfolio', '/en/portfolio'],
  ['/pl/portfolio/nocny-wartownik', '/en/portfolio/nocny-wartownik'],
  ['/pl/kontakt', '/en/contact'],
  ['/pl/prywatnosc', '/en/privacy'],
] as const;

describe('pathFor', () => {
  it('builds language-prefixed paths', () => {
    expect(pathFor('home', 'pl')).toBe('/pl');
    expect(pathFor('contact', 'pl')).toBe('/pl/kontakt');
    expect(pathFor('contact', 'en')).toBe('/en/contact');
    expect(pathFor('privacy', 'en')).toBe('/en/privacy');
    expect(pathFor('work', 'en', { slug: 'mgla-nad-bagnem' })).toBe(
      '/en/portfolio/mgla-nad-bagnem',
    );
  });

  it('gives every page in every language a distinct path', () => {
    for (const lang of languages) {
      const paths = routeKeys.map((key) => pathFor(key, lang, { slug: 'x' }));
      expect(new Set(paths).size).toBe(routeKeys.length);
    }
  });
});

describe('resolvePath', () => {
  it('resolves a page in its own language', () => {
    expect(resolvePath('/pl/kontakt')).toEqual({ lang: 'pl', key: 'contact', params: {} });
    expect(resolvePath('/en/portfolio/abc')).toEqual({
      lang: 'en',
      key: 'work',
      params: { slug: 'abc' },
    });
    expect(resolvePath('/en/')).toEqual({ lang: 'en', key: 'home', params: {} });
    expect(resolvePath('/pl/portfolio/za%C5%BC')).toEqual({
      lang: 'pl',
      key: 'work',
      params: { slug: 'zaż' },
    });
  });

  it("falls back to another language's slug", () => {
    expect(resolvePath('/en/kontakt')).toEqual({ lang: 'en', key: 'contact', params: {} });
    expect(resolvePath('/pl/privacy')).toEqual({ lang: 'pl', key: 'privacy', params: {} });
  });

  it('returns null for unknown paths and languages', () => {
    expect(resolvePath('/')).toBeNull();
    expect(resolvePath('/de/kontakt')).toBeNull();
    expect(resolvePath('/pl/nie-ma-takiej-strony')).toBeNull();
    expect(resolvePath('/pl/portfolio/a/b')).toBeNull();
  });
});

describe('canonicalPath', () => {
  it("maps another language's slug to the canonical one", () => {
    expect(canonicalPath('/en/kontakt')).toBe('/en/contact');
    expect(canonicalPath('/pl/contact')).toBe('/pl/kontakt');
    expect(canonicalPath('/pl/privacy')).toBe('/pl/prywatnosc');
  });

  it('returns null for unknown paths', () => {
    expect(canonicalPath('/en/nope')).toBeNull();
  });
});

describe('switchLanguagePath', () => {
  it.each(pairs)('maps %s ↔ %s', (pl, en) => {
    expect(switchLanguagePath({ pathname: pl }, 'en')).toBe(en);
    expect(switchLanguagePath({ pathname: en }, 'pl')).toBe(pl);
  });

  it('keeps the current language path when switching to the same language', () => {
    for (const [pl, en] of pairs) {
      expect(switchLanguagePath({ pathname: pl }, 'pl')).toBe(pl);
      expect(switchLanguagePath({ pathname: en }, 'en')).toBe(en);
    }
  });

  it('keeps the query string and hash', () => {
    expect(
      switchLanguagePath(
        { pathname: '/pl/kontakt', search: '?kind=painting', hash: '#form' },
        'en',
      ),
    ).toBe('/en/contact?kind=painting#form');
  });

  it('does not double-encode percent-encoded slugs', () => {
    expect(switchLanguagePath({ pathname: '/pl/portfolio/a%20b' }, 'en')).toBe(
      '/en/portfolio/a%20b',
    );
    expect(switchLanguagePath({ pathname: '/pl/portfolio/za%C5%BC' }, 'en')).toBe(
      '/en/portfolio/za%C5%BC',
    );
  });

  it('keeps a slug with malformed encoding instead of throwing', () => {
    expect(resolvePath('/pl/portfolio/a%E0b')).toEqual({
      lang: 'pl',
      key: 'work',
      params: { slug: 'a%E0b' },
    });
  });

  it('sends unknown pages to the home page of the target language', () => {
    expect(switchLanguagePath({ pathname: '/pl/nie-ma' }, 'en')).toBe('/en');
    expect(switchLanguagePath({ pathname: '/foo' }, 'pl')).toBe('/pl');
  });
});
