import '@fontsource-variable/cinzel';
import '@fontsource-variable/inter';
import './styles/tokens.css';
import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { createAppRoutes } from './router';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

// Translations are provided per language by `Layout`, based on the rendered route.
const router = createBrowserRouter(createAppRoutes());

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
