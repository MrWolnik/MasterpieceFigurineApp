import { expect, test, type Locator, type Page } from '@playwright/test';

// A short screen, so the last portfolio tile is surely below the fold.
test.use({ viewport: { width: 390, height: 700 } });

/** The grid cell of the last portfolio tile; the reveal class sits on the <li>. */
function lastTile(page: Page): Locator {
  return page.getByRole('article').last().locator('xpath=..');
}

test.describe('with motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('a tile below the fold fades in once it is scrolled into view', async ({ page }) => {
    await page.goto('/pl/portfolio');
    const tile = lastTile(page);
    await expect(tile).toHaveCSS('opacity', '0');

    await tile.scrollIntoViewIfNeeded();
    await expect(tile).toHaveCSS('opacity', '1');

    // Revealed for good: scrolling back up does not hide it again.
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await expect(tile).toHaveCSS('opacity', '1');
  });

  test('the Hero text comes in on load', async ({ page }) => {
    await page.goto('/pl');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('opacity', '1');
    await expect(page.getByRole('link', { name: 'Zamów malowanie' })).toHaveCSS('opacity', '1');
  });
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('content is visible at once, without animating', async ({ page }) => {
    await page.goto('/pl/portfolio');
    const tile = lastTile(page);
    await expect(tile).toHaveCSS('opacity', '1');
    await expect(tile).toHaveCSS('animation-name', 'none');
  });
});
