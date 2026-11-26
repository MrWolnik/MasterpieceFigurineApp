import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './helpers.js';

test.describe('styleguide (dev only)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/styleguide');
    await expect(page.getByRole('heading', { level: 1, name: 'Styleguide' })).toBeVisible();
  });

  test('renders every section', async ({ page }) => {
    for (const name of ['Colours', 'Typography', 'Spacing', 'Shape, elevation and focus']) {
      await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
    }
  });

  test('has no colour-contrast or other accessibility violations', async ({ page }) => {
    await expectNoA11yViolations(page);
  });

  test('loads Cinzel and Inter, including the latin-ext subset for Polish letters', async ({
    page,
  }) => {
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts]
        .filter((font) => font.status === 'loaded')
        .map((font) => `${font.family.replace(/["']/g, '')}|${font.unicodeRange}`);
    });

    // Polish letters ą, ę, ł, ń, ś, ź, ż live in latin-ext (U+0100–U+017F).
    const hasLatinExt = (family: string) =>
      loaded.some((entry) => entry.startsWith(`${family}|`) && entry.includes('U+100-2BA'));

    expect(hasLatinExt('Cinzel Variable'), loaded.join('\n')).toBe(true);
    expect(hasLatinExt('Inter Variable'), loaded.join('\n')).toBe(true);

    // The heading font is actually applied (not a fallback stack).
    const headingFont = await page
      .getByRole('heading', { level: 1, name: 'Styleguide' })
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(headingFont).toContain('Cinzel Variable');
  });
});
