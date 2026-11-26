import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('keyboard navigation (desktop)', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop layout only');

  test('the skip link is the first stop and moves focus into the content', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'WebKit does not tab to links by default');
    await page.goto('/pl');

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Przejdź do treści' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();

    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
  });

  test('reaches every header link in order and opens a page with Enter', async ({
    page,
    browserName,
  }) => {
    // Safari only tabs to links when "Press Tab to highlight each item" is on; Playwright's
    // WebKit follows that default, so link order is checked in Chromium and Firefox.
    test.skip(browserName === 'webkit', 'WebKit does not tab to links by default');
    await page.goto('/pl');
    const banner = page.getByRole('banner');

    const expectedOrder = [
      page.getByRole('link', { name: 'Przejdź do treści' }),
      banner.getByRole('link', { name: 'MasterpieceFigurineJ' }),
      banner.getByRole('link', { name: 'Portfolio' }),
      banner.getByRole('link', { name: 'Kontakt' }),
      banner.getByRole('link', { name: 'PL – Polski' }),
      banner.getByRole('link', { name: 'EN – English' }),
    ];
    for (const target of expectedOrder) {
      await page.keyboard.press('Tab');
      await expect(target).toBeFocused();
    }

    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(banner.getByRole('link', { name: 'Kontakt' })).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/pl\/kontakt$/);
    await expect(banner.getByRole('link', { name: 'Kontakt' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('shows the navigation without a menu button', async ({ page }) => {
    await page.goto('/pl');

    await expect(page.getByRole('navigation', { name: 'Główna nawigacja' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Otwórz menu' })).toBeHidden();
  });
});

test.describe('mobile menu (phone viewport)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens, navigates and closes', async ({ page }) => {
    await page.goto('/pl');
    const nav = page.getByRole('navigation', { name: 'Główna nawigacja' });
    const toggle = page.getByRole('button', { name: 'Otwórz menu' });

    await expect(nav).toBeHidden();
    await toggle.click();
    await expect(page.getByRole('button', { name: 'Zamknij menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(nav).toBeVisible();

    await nav.getByRole('link', { name: 'Portfolio' }).click();
    await expect(page).toHaveURL(/\/pl\/portfolio$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Portfolio' })).toBeVisible();
    await expect(nav).toBeHidden();
    await expect(page.getByRole('button', { name: 'Otwórz menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  test('closes on Escape and returns focus to the button', async ({ page }) => {
    await page.goto('/en');

    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await page.keyboard.press('Escape');

    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
  });

  test('has no detectable accessibility violations with the menu open', async ({ page }) => {
    await page.goto('/pl');
    await page.getByRole('button', { name: 'Otwórz menu' }).click();
    await expect(page.getByRole('navigation', { name: 'Główna nawigacja' })).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
});

test.describe('footer', () => {
  test('shows the e-mail and links to the privacy policy', async ({ page }) => {
    await page.goto('/en');
    const footer = page.getByRole('contentinfo');

    await expect(footer.getByRole('link', { name: /^Send an e-mail:/ })).toHaveAttribute(
      'href',
      /^mailto:/,
    );
    await footer.getByRole('link', { name: 'Privacy policy' }).click();
    await expect(page).toHaveURL(/\/en\/privacy$/);
  });

  test('hides social icons without links in production', async ({ page }) => {
    await page.goto('/pl');

    // site.ts has no social links yet and this suite runs against the production build.
    await expect(
      page.getByRole('contentinfo').getByRole('list', { name: 'Media społecznościowe' }),
    ).toHaveCount(0);
  });
});
