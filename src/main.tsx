import '@fontsource-variable/cinzel';
import '@fontsource-variable/inter';
import './styles/tokens.css';
import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, matchRoutes } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { createAppRoutes } from './router';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

const routes = createAppRoutes();
const prerendered = rootElement.dataset.path === window.location.pathname;

// Pages are lazy chunks (router.tsx). Load the current page's chunk before hydrating, so the
// first render already has it and matches the prerendered markup. (On a prerendered page this
// script itself starts only after the first paint: htmlTemplate.ts `deferScripts`.)
await Promise.all(
  (matchRoutes(routes, window.location) ?? []).map(async ({ route }) => {
    if (typeof route.lazy !== 'function') return;
    Object.assign(route, await route.lazy(), { lazy: undefined });
  }),
);

// Translations are provided per language by `Layout`, based on the rendered route.
// On a prerendered page the router picks up the hydration data written by entry-server.tsx.
const router = createBrowserRouter(routes);

const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

// Prerendered pages (scripts/prerender.mjs) arrive with markup to hydrate. It is hydrated only at
// the URL it was rendered for: a server may serve the same file for another spelling (e.g.
// `/EN/Contact` from a case-insensitive disk), and then the router must render and redirect
// from scratch. The bare shell (`/`, unknown paths) has an empty #root anyway.
if (prerendered) {
  hydrateRoot(rootElement, app);
} else {
  rootElement.replaceChildren();
  createRoot(rootElement).render(app);
}
