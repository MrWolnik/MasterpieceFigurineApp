import { expect, test } from './fixtures';

// A narrow phone: nothing on these pages may make the page scroll sideways.
test.use({ viewport: { width: 360, height: 740 } });

const pages = [
  '/pl',
  '/pl/portfolio',
  '/pl/portfolio/nocny-wartownik',
  '/pl/portfolio/lesny-zwiadowca',
  '/pl/portfolio/mgla-nad-bagnem',
  '/pl/kontakt?kind=painting',
  '/pl/prywatnosc',
];

for (const path of pages) {
  test(`${path} has no horizontal overflow`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
}
