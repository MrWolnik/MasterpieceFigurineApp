import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('renders the brand heading', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('MasterpieceFigurineJ');
    await expect(
      page.getByRole('heading', { level: 1, name: 'MasterpieceFigurineJ' }),
    ).toBeVisible();
  });

  test('has no detectable accessibility violations', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
});

test.describe('production build', () => {
  test('does not include the dev-only styleguide', async ({ page }) => {
    await page.goto('/styleguide');

    await expect(page.getByRole('heading', { name: 'Styleguide' })).toHaveCount(0);
  });
});
