import '@fontsource-variable/cinzel';
import '@fontsource-variable/inter';
import './styles/tokens.css';
import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { createAppRoutes } from './router';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

// Translations are provided per language by `Layout`, based on the rendered route.
// On a prerendered page the router picks up the hydration data written by entry-server.tsx.
const router = createBrowserRouter(createAppRoutes());

const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

// Prerendered pages (scripts/prerender.mjs) arrive with markup to hydrate; the bare shell
// (`/`, unknown paths) has an empty #root and is rendered from scratch.
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
