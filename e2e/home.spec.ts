import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './helpers.js';

test.describe('home page', () => {
  test('renders the brand heading', async ({ page }) => {
    await page.goto('/pl');

    await expect(page).toHaveTitle('MasterpieceFigurineJ');
    await expect(
      page.getByRole('heading', { level: 1, name: 'MasterpieceFigurineJ' }),
    ).toBeVisible();
  });

  test('has no detectable accessibility violations', async ({ page }) => {
    await page.goto('/pl');

    await expectNoA11yViolations(page);
  });
});

test.describe('production build', () => {
  test('does not include the dev-only styleguide', async ({ page }) => {
    await page.goto('/styleguide');

    await expect(page.getByRole('heading', { name: 'Styleguide' })).toHaveCount(0);
  });
});
