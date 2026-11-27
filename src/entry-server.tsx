import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import { fillTemplate } from './lib/htmlTemplate';
import { fontPreloads, pageAssets, renderPreloadTags, type Manifest } from './lib/preloadTags';
import { getPageMeta } from './lib/seo';
import { absoluteUrl } from './lib/siteUrl';
import { createAppRoutes, pageModule } from './router';

export { buildRobots, buildSitemap, prerenderPaths } from './lib/sitemap';

/** What the client build produced: its manifest and the file names in `dist/assets`. */
export interface BuildAssets {
  manifest: Manifest;
  assetFiles: readonly string[];
}

/**
 * Renders one path to a complete HTML document, based on the built `index.html` (`template`).
 * With `build`, it also links the page's own JS chunks and stylesheets and preloads its fonts.
 * Used at build time by scripts/prerender.mjs; the browser then hydrates the markup (main.tsx).
 */
export async function renderPage(
  path: string,
  template: string,
  build?: BuildAssets,
): Promise<string> {
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
  const meta = getPageMeta(path);
  if (!build) return fillTemplate(template, { path, meta, appHtml });
  const assets = pageAssets(build.manifest, pageModule(path));
  return fillTemplate(template, {
    path,
    meta,
    appHtml,
    preloadHtml: renderPreloadTags(fontPreloads(build.assetFiles, meta.lang), assets.styles),
    scripts: assets.scripts,
  });
}
