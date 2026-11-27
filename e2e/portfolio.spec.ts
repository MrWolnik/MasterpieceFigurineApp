import { expect, test } from './fixtures';
import { expectNoA11yViolations, urlOf } from './helpers.js';

// Keep in sync with src/content/works (8 sample works, sorted by `order`).
const WORK_COUNT = 8;

test.describe('portfolio page', () => {
  test('shows every work', async ({ page }) => {
    await page.goto('/pl/portfolio');

    await expect(page.getByRole('heading', { level: 1, name: 'Portfolio' })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(WORK_COUNT);
    await expect(page.getByRole('link', { name: /Nocny wartownik/ })).toBeVisible();
  });

  test('clicking a tile opens the work details', async ({ page }) => {
    await page.goto('/en/portfolio');

    await page.getByRole('link', { name: /Mist over the Marsh/ }).click();

    await expect(page).toHaveURL(urlOf('/en/portfolio/mgla-nad-bagnem'));
  });
});

// Screenshots for manual review, attached to the HTML report (not compared against baselines,
// because rendering differs between local Windows/macOS machines and the Linux CI runner).
test.describe('portfolio screenshots', () => {
  for (const width of [360, 768, 1440]) {
    test(`at ${String(width)} px`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium', 'screenshots are taken in Chromium only');

      await page.setViewportSize({ width, height: 900 });
      await page.goto('/pl/portfolio');
      const covers = page.locator('article img');
      await expect(covers).toHaveCount(WORK_COUNT);
      // Force lazy covers to load so the full-page shot is complete.
      for (const cover of await covers.all()) await cover.scrollIntoViewIfNeeded();
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });

      // No horizontal overflow at any width.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);

      await testInfo.attach(`portfolio-${String(width)}px`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
    });
  }
});

test.describe('portfolio filters', () => {
  test('entering with ?kind= shows only that kind', async ({ page }) => {
    await page.goto('/en/portfolio?kind=painting');

    await expect(page.getByRole('article')).toHaveCount(3);
    await expect(page.getByRole('button', { name: 'Paintings' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('entering with ?kind= and ?tag= shows the filtered list', async ({ page }) => {
    await page.goto('/pl/portfolio?kind=painting&tag=olej');

    await expect(page.getByRole('article')).toHaveCount(1);
    await expect(page.getByRole('link', { name: /Mgła nad bagnem/ })).toBeVisible();
  });

  test('entering with ?tag= alone filters across kinds', async ({ page }) => {
    await page.goto('/en/portfolio?tag=warhammer');

    await expect(page.getByRole('article')).toHaveCount(3);
  });

  test('clicking filters updates the URL and keeps it across a language switch', async ({
    page,
  }) => {
    await page.goto('/en/portfolio');

    await page.getByRole('button', { name: 'Figurines' }).click();
    // Choosing a kind drops the other kind's tags, so the tag buttons move. Wait for the new
    // layout, as a user would; otherwise the next click can land where D&D used to be.
    await expect(page.getByRole('button', { name: 'Figurines' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.getByRole('button', { name: 'D&D' }).click();

    await expect(page).toHaveURL(urlOf('/en/portfolio\\?kind=figurine&tag=dnd'));
    await expect(page.getByRole('article')).toHaveCount(2);

    await page.getByRole('link', { name: 'PL – Polski' }).first().click();
    await expect(page).toHaveURL(urlOf('/pl/portfolio\\?kind=figurine&tag=dnd'));
    await expect(page.getByRole('article')).toHaveCount(2);
  });

  test('filtered view has no detectable accessibility violations', async ({ page }) => {
    await page.goto('/pl/portfolio?kind=painting&tag=olej');
    await expect(page.getByRole('article')).toHaveCount(1);

    await expectNoA11yViolations(page);
  });
});
