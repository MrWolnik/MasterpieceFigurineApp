import { generatePath, matchPath, type Params } from 'react-router';
import { isLanguage, languages, type Language } from './i18n';

export const routeKeys = ['home', 'portfolio', 'work', 'contact', 'privacy'] as const;
export type RouteKey = (typeof routeKeys)[number];

/**
 * Localised path of every page, relative to the language prefix (`/pl`, `/en`).
 * Single source of truth for the router, links and the language switcher.
 */
export const routePaths: Record<RouteKey, Record<Language, string>> = {
  home: { pl: '', en: '' },
  portfolio: { pl: 'portfolio', en: 'portfolio' },
  work: { pl: 'portfolio/:slug', en: 'portfolio/:slug' },
  contact: { pl: 'kontakt', en: 'contact' },
  privacy: { pl: 'prywatnosc', en: 'privacy' },
};

export type RouteParams = Record<string, string>;

/** Builds the absolute path of a page, e.g. `pathFor('contact', 'en')` → `/en/contact`. */
export function pathFor(key: RouteKey, lang: Language, params: RouteParams = {}): string {
  const path = routePaths[key][lang];
  return path ? `/${lang}/${generatePath(path, params)}` : `/${lang}`;
}

export interface ResolvedRoute {
  lang: Language;
  key: RouteKey;
  params: RouteParams;
}

function matchKey(rest: string, slugLanguage: Language): Omit<ResolvedRoute, 'lang'> | null {
  for (const key of routeKeys) {
    const match = matchPath({ path: `/${routePaths[key][slugLanguage]}` }, rest);
    if (match) {
      return { key, params: decodedParams(match.params) };
    }
  }
  return null;
}

/** `matchPath` leaves params percent-encoded, while `generatePath` encodes them again. */
function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value; // malformed encoding: keep it as is rather than throw
  }
}

function decodedParams(params: Params): RouteParams {
  return Object.fromEntries(
    Object.entries(params)
      .filter((entry): entry is [string, string] => entry[1] !== undefined)
      .map(([key, value]) => [key, decodeParam(value)]),
  );
}

/**
 * Works out which page a pathname points to. The prefix decides the language; the rest may use
 * the slugs of that language or, as a fallback, of another one (`/en/kontakt` → contact, en).
 * Returns `null` for unknown paths.
 */
export function resolvePath(pathname: string): ResolvedRoute | null {
  const [, prefix = '', ...segments] = pathname.split('/');
  const lang = prefix.toLowerCase();
  if (!isLanguage(lang)) {
    return null;
  }
  const rest = `/${segments.join('/')}`;
  const slugLanguages = [lang, ...languages.filter((other) => other !== lang)];
  for (const slugLanguage of slugLanguages) {
    const match = matchKey(rest, slugLanguage);
    if (match) {
      return { lang, ...match };
    }
  }
  return null;
}

/** The canonical path for `pathname`, or `null` when it points nowhere. */
export function canonicalPath(pathname: string): string | null {
  const route = resolvePath(pathname);
  return route ? pathFor(route.key, route.lang, route.params) : null;
}

interface LocationLike {
  pathname: string;
  search?: string;
  hash?: string;
}

/**
 * The same page in another language, keeping query and hash
 * (`/pl/kontakt?kind=painting` → `/en/contact?kind=painting`).
 * Unknown pages map to the target language's home page.
 */
export function switchLanguagePath(
  { pathname, search = '', hash = '' }: LocationLike,
  target: Language,
): string {
  const route = resolvePath(pathname);
  if (!route) {
    return pathFor('home', target);
  }
  return `${pathFor(route.key, target, route.params)}${search}${hash}`;
}
