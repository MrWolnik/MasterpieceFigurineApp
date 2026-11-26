import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, urlOf } from './helpers.js';

test.describe('work details page', () => {
  test('a figurine with frames shows the 360° turntable', async ({ page }) => {
    await page.goto('/pl/portfolio/nocny-wartownik');

    await expect(page.getByRole('heading', { level: 1, name: 'Nocny wartownik' })).toBeVisible();
    await expect(page.getByRole('slider', { name: /Podgląd 360°/ })).toBeVisible();
  });

  test('a painting shows the zoomable image with its size', async ({ page }) => {
    await page.goto('/en/portfolio/mgla-nad-bagnem');

    await expect(
      page.getByRole('button', { name: 'Zoom image: Mist over the Marsh' }),
    ).toBeVisible();
    await expect(page.getByText('70 × 50 cm')).toBeVisible();
    await expect(page.getByText('Oil on canvas')).toBeVisible();
  });

  test('an unknown slug shows the 404 page', async ({ page }) => {
    await page.goto('/pl/portfolio/nie-ma-takiej-pracy');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Nie znaleziono strony' }),
    ).toBeVisible();
  });

  test('"I want a similar one" on a painting opens contact with the kind and work', async ({
    page,
  }) => {
    await page.goto('/pl/portfolio/mgla-nad-bagnem');

    await page.getByRole('link', { name: 'Chcę podobną' }).click();

    // Z3.3 adds the form; it must then preset "Obraz" and put the work into the description.
    await expect(page).toHaveURL(urlOf('/pl/kontakt\\?kind=painting&ref=mgla-nad-bagnem'));
    await expect(page.getByRole('heading', { level: 1, name: 'Kontakt' })).toBeVisible();
  });

  test('next link moves to the next work of the same kind', async ({ page }) => {
    await page.goto('/pl/portfolio/mgla-nad-bagnem');

    await page.getByRole('link', { name: /Następna: Portret rycerki/ }).click();

    await expect(page).toHaveURL(urlOf('/pl/portfolio/portret-rycerki'));
    await expect(page.getByRole('heading', { level: 1, name: 'Portret rycerki' })).toBeVisible();
  });

  for (const path of ['/pl/portfolio/nocny-wartownik', '/en/portfolio/mgla-nad-bagnem']) {
    test(`${path} has no detectable accessibility violations`, async ({ page }) => {
      await page.goto(path);
      await expectNoA11yViolations(page);
    });
  }
});
