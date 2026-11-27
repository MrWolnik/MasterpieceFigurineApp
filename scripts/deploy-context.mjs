// Which Netlify deploy is being built. Netlify sets CONTEXT to `production`, `deploy-preview`,
// `branch-deploy` or `dev`; local and CI builds have none and count as production.

/** Whether search engines may index this build (only the production site). */
export function isProductionDeploy(context = process.env.CONTEXT) {
  return context === undefined || context === '' || context === 'production';
}

/**
 * Appended to dist/_headers for every other deploy, so pull-request previews
 * (deploy-preview-12--….netlify.app) never show up in search results as copies of the site.
 * A header, not a robots.txt Disallow: crawlers must be able to fetch a page to see noindex.
 */
export const NOINDEX_HEADERS = `
# Not the production site (added by scripts/prerender.mjs): keep it out of search results.
/*
  X-Robots-Tag: noindex
`;
