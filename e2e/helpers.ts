import AxeBuilder from '@axe-core/playwright';
import { expect, type APIRequestContext, type Page } from '@playwright/test';

/** Matches a URL that ends exactly in `path` (paths here contain no regex metacharacters). */
export function urlOf(path: string): RegExp {
  return new RegExp(`${path}$`);
}

/** Runs axe on the current page and fails with the full report if anything is found. */
export async function expectNoA11yViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
}

/** Paths of every page listed in the built sitemap.xml (the site's own list of pages). */
export async function sitemapPaths(request: APIRequestContext): Promise<string[]> {
  const response = await request.get('/sitemap.xml');
  expect(response.ok()).toBe(true);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1] ?? '').pathname);
}
