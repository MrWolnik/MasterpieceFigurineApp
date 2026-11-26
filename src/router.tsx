import type { i18n } from 'i18next';
import type { ComponentType } from 'react';
import {
  createBrowserRouter,
  redirect,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router';
import { LanguageLayout } from './components/Layout/LanguageLayout/LanguageLayout';
import { detectBrowserLanguage, languages, type Language } from './lib/i18n';
import { canonicalPath, pathFor, routePaths, type RouteKey } from './lib/routes';
import { Contact } from './pages/Contact/Contact';
import { Home } from './pages/Home/Home';
import { NotFound } from './pages/NotFound/NotFound';
import { Portfolio } from './pages/Portfolio/Portfolio';
import { Privacy } from './pages/Privacy/Privacy';
import { WorkDetails } from './pages/WorkDetails/WorkDetails';

const pages: Record<Exclude<RouteKey, 'home'>, ComponentType> = {
  portfolio: Portfolio,
  work: WorkDetails,
  contact: Contact,
  privacy: Privacy,
};

/**
 * Unknown path inside a language prefix: if it uses another language's slug
 * (`/en/kontakt`), redirect to the canonical page (`/en/contact`); otherwise render the 404.
 */
function redirectToCanonical({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const canonical = canonicalPath(url.pathname);
  return canonical ? redirect(`${canonical}${url.search}${url.hash}`) : null;
}

function languageRoute(lang: Language, i18n: i18n): RouteObject {
  return {
    path: lang,
    // Runs before the first render of the language, so the page never flashes in the wrong one.
    loader: async () => {
      await i18n.changeLanguage(lang);
      return null;
    },
    Component: LanguageLayout,
    children: [
      { index: true, Component: Home },
      ...Object.entries(pages).map(([key, Component]) => ({
        path: routePaths[key as keyof typeof pages][lang],
        Component,
      })),
      { path: '*', loader: redirectToCanonical, Component: NotFound },
    ],
  };
}

/** All app routes. A factory so tests can mount them in a memory router with their own i18n. */
export function createAppRoutes(i18n: i18n): RouteObject[] {
  const routes: RouteObject[] = [
    { index: true, loader: () => redirect(pathFor('home', detectBrowserLanguage())) },
    ...languages.map((lang) => languageRoute(lang, i18n)),
  ];

  // `import.meta.env.DEV` is statically `false` in production builds, so Vite drops this
  // branch and the styleguide chunk entirely.
  if (import.meta.env.DEV) {
    routes.push({
      path: 'styleguide',
      lazy: async () => {
        const { Styleguide } = await import('./pages/Styleguide/Styleguide');
        return { Component: Styleguide };
      },
    });
  }

  // No (valid) language prefix: show the 404 in the browser's language.
  routes.push({
    Component: LanguageLayout,
    children: [
      {
        path: '*',
        loader: async () => {
          await i18n.changeLanguage(detectBrowserLanguage());
          return null;
        },
        Component: NotFound,
      },
    ],
  });

  return [{ path: '/', children: routes }];
}

export function createAppRouter(i18n: i18n) {
  return createBrowserRouter(createAppRoutes(i18n));
}
