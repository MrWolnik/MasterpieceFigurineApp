import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, urlOf } from './helpers.js';

test.describe('home page', () => {
  test('shows the hero with Julia and the site title', async ({ page }) => {
    await page.goto('/pl');

    await expect(page).toHaveTitle('MasterpieceFigurineJ');
    await expect(page.getByRole('heading', { level: 1, name: 'Julia' })).toBeVisible();
    await expect(page.getByRole('img', { name: /Julia/ })).toBeVisible();
  });

  test('the order button leads to the contact page', async ({ page }) => {
    await page.goto('/en');

    await page.getByRole('link', { name: 'Order a painting' }).click();

    await expect(page).toHaveURL(urlOf('/en/contact'));
    await expect(page.getByRole('heading', { level: 1, name: 'Contact' })).toBeVisible();
  });

  test('the scroll indicator brings the featured section below the header', async ({ page }) => {
    await page.goto('/pl');

    await page.getByRole('link', { name: 'Przewiń do wyróżnionych prac' }).click();

    const heading = page.getByRole('heading', { level: 2, name: 'Wyróżnione prace' });
    await expect(heading).toBeInViewport();
    // Not hidden under the sticky header.
    const headerBottom = await page
      .getByRole('banner')
      .evaluate((el) => el.getBoundingClientRect().bottom);
    await expect
      .poll(() => heading.evaluate((el) => el.getBoundingClientRect().top))
      .toBeGreaterThanOrEqual(headerBottom);
  });

  test('has no detectable accessibility violations', async ({ page }) => {
    await page.goto('/pl');

    await expectNoA11yViolations(page);
  });
});

// Screenshots for manual review, attached to the HTML report (see portfolio.spec.ts).
test.describe('home screenshots', () => {
  for (const width of [360, 768, 1440]) {
    test(`hero fills the screen at ${String(width)} px`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium', 'screenshots are taken in Chromium only');

      await page.setViewportSize({ width, height: 800 });
      await page.goto('/pl');
      const hero = page.getByRole('region', { name: 'Julia' });
      await expect(hero).toBeVisible();

      // Header + hero take at least the full screen, and the CTA is visible without scrolling.
      const heroBottom = await hero.evaluate((el) => el.getBoundingClientRect().bottom);
      expect(heroBottom).toBeGreaterThanOrEqual(800 - 1);
      await expect(page.getByRole('link', { name: 'Zamów malowanie' })).toBeInViewport();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);

      await testInfo.attach(`home-${String(width)}px`, {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    });
  }
});

test.describe('production build', () => {
  test('does not include the dev-only styleguide', async ({ page }) => {
    await page.goto('/styleguide');

    await expect(page.getByRole('heading', { name: 'Styleguide' })).toHaveCount(0);
  });
});
