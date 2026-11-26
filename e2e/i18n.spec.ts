import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
  { pl: '/pl', en: '/en', plHeading: 'MasterpieceFigurineJ', enHeading: 'MasterpieceFigurineJ' },
  { pl: '/pl/portfolio', en: '/en/portfolio', plHeading: 'Portfolio', enHeading: 'Portfolio' },
  {
    pl: '/pl/portfolio/nocny-wartownik',
    en: '/en/portfolio/nocny-wartownik',
    plHeading: 'Praca: nocny-wartownik',
    enHeading: 'Work: nocny-wartownik',
  },
  { pl: '/pl/kontakt', en: '/en/contact', plHeading: 'Kontakt', enHeading: 'Contact' },
  {
    pl: '/pl/prywatnosc',
    en: '/en/privacy',
    plHeading: 'Polityka prywatności',
    enHeading: 'Privacy policy',
  },
] as const;

/** Matches a URL ending exactly in `path` (paths here contain no regex metacharacters). */
const urlOf = (path: string) => new RegExp(`${path}$`);

for (const [locale, expected] of [
  ['en-US', '/en'],
  ['pl-PL', '/pl'],
  ['de-DE', '/pl'],
] as const) {
  test.describe(`redirect from / with browser locale ${locale}`, () => {
    test.use({ locale });

    test(`goes to ${expected}`, async ({ page }) => {
      await page.goto('/');

      await expect(page).toHaveURL(urlOf(expected));
      await expect(page.locator('html')).toHaveAttribute('lang', expected.slice(1));
    });
  });
}

test.describe('language switcher', () => {
  for (const { pl, en, plHeading, enHeading } of pages) {
    test(`switches ${pl} ↔ ${en}`, async ({ page }) => {
      await page.goto(pl);
      await expect(page.getByRole('heading', { level: 1, name: plHeading })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', 'pl');

      await page.getByRole('banner').getByRole('link', { name: 'EN – English' }).click();
      await expect(page).toHaveURL(urlOf(en));
      await expect(page.getByRole('heading', { level: 1, name: enHeading })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');

      await page.getByRole('banner').getByRole('link', { name: 'PL – Polski' }).click();
      await expect(page).toHaveURL(urlOf(pl));
      await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
    });
  }
});

test('a slug from the other language redirects to the canonical page', async ({ page }) => {
  await page.goto('/en/kontakt');

  await expect(page).toHaveURL(urlOf('/en/contact'));
  await expect(page.getByRole('heading', { level: 1, name: 'Contact' })).toBeVisible();
});

test.describe('404 page', () => {
  test('shows for an unknown page in the language of the prefix', async ({ page }) => {
    await page.goto('/en/no-such-page');

    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.getByRole('link', { name: 'Back to the home page' }).click();
    await expect(page).toHaveURL(urlOf('/en'));
  });

  test('shows for an unknown language prefix', async ({ page }) => {
    await page.goto('/de/kontakt');

    await expect(
      page.getByRole('heading', { level: 1, name: /Nie znaleziono strony|Page not found/ }),
    ).toBeVisible();
  });

  test('has no detectable accessibility violations', async ({ page }) => {
    await page.goto('/pl/nie-ma-takiej-strony');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Nie znaleziono strony' }),
    ).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
});
