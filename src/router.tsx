import type { ComponentType } from 'react';
import { redirect, type LoaderFunctionArgs, type RouteObject } from 'react-router';
import { Layout } from './components/Layout/Layout';
import { NavigationFocus } from './components/Layout/NavigationFocus/NavigationFocus';
import { detectBrowserLanguage, languages, type Language } from './lib/i18n';
import { canonicalPath, pathFor, resolvePath, routePaths, type RouteKey } from './lib/routes';
import { Home } from './pages/Home/Home';
import { NotFound } from './pages/NotFound/NotFound';

interface LazyPage {
  key: Exclude<RouteKey, 'home'>;
  /** Source file of the page, as Vite's build manifest names it (see scripts/prerender.mjs). */
  module: string;
  load: () => Promise<{ Component: ComponentType }>;
}

/**
 * Every page except home (the index route of each language, kept in the main bundle as the most
 * common entry). Each is its own chunk, loaded when first visited, so e.g. the order form and its
 * validation are only downloaded on the contact page.
 */
export const lazyPages: readonly LazyPage[] = [
  {
    key: 'portfolio',
    module: 'src/pages/Portfolio/Portfolio.tsx',
    load: async () => ({ Component: (await import('./pages/Portfolio/Portfolio')).Portfolio }),
  },
  {
    key: 'work',
    module: 'src/pages/WorkDetails/WorkDetails.tsx',
    load: async () => ({
      Component: (await import('./pages/WorkDetails/WorkDetails')).WorkDetails,
    }),
  },
  {
    key: 'contact',
    module: 'src/pages/Contact/Contact.tsx',
    load: async () => ({ Component: (await import('./pages/Contact/Contact')).Contact }),
  },
  {
    key: 'privacy',
    module: 'src/pages/Privacy/Privacy.tsx',
    load: async () => ({ Component: (await import('./pages/Privacy/Privacy')).Privacy }),
  },
];

/**
 * Unmatched path: if it points to a known page under a non-canonical spelling
 * (another language's slug like `/en/kontakt`, or other letter case like `/EN/Contact`),
 * redirect to the canonical URL; otherwise render the 404.
 */
/** Source module of the lazy page at `pathname` (none for home and unknown paths). */
export function pageModule(pathname: string): string | undefined {
  const key = resolvePath(pathname)?.key;
  return lazyPages.find((page) => page.key === key)?.module;
}

function redirectToCanonical({ request }: LoaderFunctionArgs) {
  const canonical = canonicalPath(new URL(request.url));
  return canonical ? redirect(canonical) : null;
}

function languageRoute(lang: Language): RouteObject {
  return {
    path: lang,
    // Case-sensitive, so `/EN/contact` is not served as a duplicate of `/en/contact`.
    caseSensitive: true,
    // The language comes from the route that is rendered, not from a side effect in a loader.
    element: <Layout lang={lang} />,
    children: [
      { index: true, Component: Home },
      ...lazyPages.map(({ key, load }) => ({
        path: routePaths[key][lang],
        caseSensitive: true,
        lazy: load,
      })),
      { path: '*', loader: redirectToCanonical, Component: NotFound },
    ],
  };
}

const styleguideRoute: RouteObject = {
  path: 'styleguide',
  lazy: async () => {
    const { Styleguide } = await import('./pages/Styleguide/Styleguide');
    return { Component: Styleguide };
  },
};

/** All app routes. A factory so tests can mount them in a memory router. */
export function createAppRoutes(): RouteObject[] {
  return [
    {
      path: '/',
      Component: NavigationFocus,
      children: [
        { index: true, loader: () => redirect(pathFor('home', detectBrowserLanguage())) },
        ...languages.map(languageRoute),
        // `import.meta.env.DEV` is statically `false` in production builds, so Vite drops
        // the styleguide route and its chunk entirely.
        ...(import.meta.env.DEV ? [styleguideRoute] : []),
        // No (valid) language prefix: redirect if it is a known page in another letter case,
        // otherwise show the 404 in the browser's language.
        {
          element: <Layout lang={detectBrowserLanguage()} />,
          children: [{ path: '*', loader: redirectToCanonical, Component: NotFound }],
        },
      ],
    },
  ];
}
