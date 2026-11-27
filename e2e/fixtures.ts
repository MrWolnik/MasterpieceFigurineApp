import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';
export type { APIRequestContext, Locator, Page, Request } from '@playwright/test';

/**
 * Playwright's `test`, with `page.goto` also waiting until the app is interactive. A
 * prerendered page shows (and fires `load`) before its JS has loaded: the JS starts after the
 * first paint (src/lib/htmlTemplate.ts `deferScripts`), so clicking right after `load` could hit
 * a button that does nothing yet. The root route sets `<html data-ready>` once hydrated.
 */
export const test = base.extend({
  page: async ({ page }, provide) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      await page.locator('html[data-ready]').waitFor({ state: 'attached' });
      return response;
    };
    await provide(page);
  },
});
