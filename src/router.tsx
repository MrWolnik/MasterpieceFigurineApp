import type { ComponentType } from 'react';
import { redirect, type LoaderFunctionArgs, type RouteObject } from 'react-router';
import { Layout } from './components/Layout/Layout';
import { NavigationFocus } from './components/Layout/NavigationFocus/NavigationFocus';
import { detectBrowserLanguage, languages, type Language } from './lib/i18n';
import { canonicalPath, pathFor, routePaths, type RouteKey } from './lib/routes';
import { Contact } from './pages/Contact/Contact';
import { Home } from './pages/Home/Home';
import { NotFound } from './pages/NotFound/NotFound';
import { Portfolio } from './pages/Portfolio/Portfolio';
import { Privacy } from './pages/Privacy/Privacy';
import { WorkDetails } from './pages/WorkDetails/WorkDetails';

/** Every page except home, which is the index route of each language. */
const pages = [
  { key: 'portfolio', Component: Portfolio },
  { key: 'work', Component: WorkDetails },
  { key: 'contact', Component: Contact },
  { key: 'privacy', Component: Privacy },
] as const satisfies readonly { key: RouteKey; Component: ComponentType }[];

/**
 * Unmatched path: if it points to a known page under a non-canonical spelling
 * (another language's slug like `/en/kontakt`, or other letter case like `/EN/Contact`),
 * redirect to the canonical URL; otherwise render the 404.
 */
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
      ...pages.map(({ key, Component }) => ({
        path: routePaths[key][lang],
        caseSensitive: true,
        Component,
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
