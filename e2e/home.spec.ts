import { expect, test } from './fixtures';
import { urlOf } from './helpers.js';

test.describe('home page', () => {
  test('shows the hero with Julia and the site title', async ({ page }) => {
    await page.goto('/pl');

    await expect(page).toHaveTitle(
      'Julia – malowanie figurek i obrazy na zamówienie | MasterpieceFigurineJ',
    );
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

  test('featured works are visible after scrolling, with a 360° preview', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/pl');

    await page.getByRole('link', { name: 'Przewiń do wyróżnionych prac' }).click();

    const featured = page.getByRole('region', { name: 'Wyróżnione prace' });
    await expect(featured.getByRole('slider', { name: /Nocny wartownik/ })).toBeInViewport();
    const rest = [
      featured.getByRole('link', { name: 'Smocza kapłanka' }),
      featured.getByRole('link', { name: 'Zobacz całe portfolio' }),
    ];
    for (const item of rest) {
      // On desktop the whole section fits one screen; on phones the works are stacked.
      if (isMobile) await item.scrollIntoViewIfNeeded();
      await expect(item).toBeInViewport();
    }
  });

  test('a featured work links to its details', async ({ page }) => {
    await page.goto('/pl');

    await page.getByRole('link', { name: 'Nocny wartownik' }).click();

    await expect(page).toHaveURL(urlOf('/pl/portfolio/nocny-wartownik'));
  });

  test('the portfolio link works', async ({ page }) => {
    await page.goto('/en');

    await page.getByRole('link', { name: 'See the whole portfolio' }).click();

    await expect(page).toHaveURL(urlOf('/en/portfolio'));
    await expect(page.getByRole('heading', { level: 1, name: 'Portfolio' })).toBeVisible();
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

test.describe('full-screen scrolling', () => {
  const snapType = (page: import('@playwright/test').Page) =>
    page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType);

  test('snaps from the hero to the featured works on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'snapping is desktop only');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/pl');
    await expect.poll(() => snapType(page)).toBe('y mandatory');

    // A small scroll (one arrow press) moves a whole screen: the featured section ends up
    // right under the header. (Playwright's synthetic wheel does not snap like a real mouse.)
    await page.keyboard.press('ArrowDown');
    const heading = page.getByRole('heading', { level: 2, name: 'Wyróżnione prace' });
    const headerBottom = await page
      .getByRole('banner')
      .evaluate((el) => el.getBoundingClientRect().bottom);
    await expect
      .poll(() =>
        page
          .getByRole('region', { name: 'Wyróżnione prace' })
          .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
      )
      .toBe(Math.round(headerBottom));
    await expect(heading).toBeInViewport();
  });

  test('the footer stays reachable at the bottom of the page', async ({ page, isMobile }) => {
    test.skip(isMobile, 'snapping is desktop only');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/pl');
    await expect.poll(() => snapType(page)).not.toBe('none');

    await page.keyboard.press('End');

    await expect(page.getByRole('contentinfo')).toBeInViewport();
    await page.waitForTimeout(500); // a wrong snap would pull the page back up here
    await expect(page.getByRole('contentinfo')).toBeInViewport();
  });

  test('does not snap on phones or on other pages', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/pl');
    await expect(page.getByRole('heading', { level: 1, name: 'Julia' })).toBeVisible();
    expect(await snapType(page)).toBe('none');

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/pl/portfolio');
    await expect(page.getByRole('heading', { level: 1, name: 'Portfolio' })).toBeVisible();
    expect(await snapType(page)).toBe('none');
  });
});
