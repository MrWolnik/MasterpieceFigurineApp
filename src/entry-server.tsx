import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import { fillTemplate } from './lib/htmlTemplate';
import { getPageMeta } from './lib/seo';
import { absoluteUrl } from './lib/siteUrl';
import { createAppRoutes } from './router';

export { buildRobots, buildSitemap, prerenderPaths } from './lib/sitemap';

/**
 * Renders one path to a complete HTML document, based on the built `index.html` (`template`).
 * Used at build time by scripts/prerender.mjs; the browser then hydrates the markup (main.tsx).
 */
export async function renderPage(path: string, template: string): Promise<string> {
  const handler = createStaticHandler(createAppRoutes());
  const context = await handler.query(new Request(absoluteUrl(path)));
  if (context instanceof Response) {
    throw new Error(`${path} answered with a redirect (${String(context.status)}); not a page`);
  }
  const router = createStaticRouter(handler.dataRoutes, context);
  // StaticRouterProvider also writes the router's hydration data for createBrowserRouter.
  const appHtml = renderToString(
    <StrictMode>
      <StaticRouterProvider router={router} context={context} />
    </StrictMode>,
  );
  return fillTemplate(template, getPageMeta(path), appHtml);
}
