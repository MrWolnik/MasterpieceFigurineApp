import { createBrowserRouter, type RouteObject } from 'react-router';
import App from './App';

// Minimal routing. Language-prefixed routes, redirects and the 404 page arrive in Z0.5.
const routes: RouteObject[] = [{ path: '/', element: <App /> }];

// `import.meta.env.DEV` is statically `false` in production builds, so Vite drops this
// branch and the styleguide chunk entirely.
if (import.meta.env.DEV) {
  routes.push({
    path: '/styleguide',
    lazy: async () => {
      const { Styleguide } = await import('./pages/Styleguide/Styleguide');
      return { Component: Styleguide };
    },
  });
}

export const router = createBrowserRouter(routes);
