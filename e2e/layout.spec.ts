import { expect, test } from './fixtures';
import { expectNoA11yViolations, urlOf } from './helpers.js';

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
      banner.getByRole('link', { name: 'MasterpieceFigurine' }),
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

    await expect(page).toHaveURL(urlOf('/pl/kontakt'));
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
    await expect(page).toHaveURL(urlOf('/pl/portfolio'));
    await expect(page.getByRole('heading', { level: 1, name: 'Portfolio' })).toBeVisible();
    await expect(nav).toBeHidden();
    await expect(page.getByRole('button', { name: 'Otwórz menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  test('Tab goes from the toggle into the open menu, and Enter lands focus on the new page', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'WebKit does not tab to links by default');
    await page.goto('/pl');
    const toggle = page.getByRole('button', { name: 'Otwórz menu' });

    await toggle.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    const portfolio = page.getByRole('navigation', { name: 'Główna nawigacja' }).getByRole('link', {
      name: 'Portfolio',
    });
    await expect(portfolio).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(urlOf('/pl/portfolio'));
    await expect(page.getByRole('main')).toBeFocused();
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

    await expectNoA11yViolations(page);
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
    await expect(page).toHaveURL(urlOf('/en/privacy'));
  });

  test('links every social network from the footer, opening in a new tab', async ({ page }) => {
    await page.goto('/pl');

    const list = page.getByRole('contentinfo').getByRole('list', { name: 'Media społecznościowe' });
    const links = list.getByRole('link');
    await expect(links).toHaveCount(4);
    for (const network of ['Instagram', 'Facebook', 'TikTok', 'YouTube']) {
      const link = list.getByRole('link', { name: `${network} (otwiera się w nowej karcie)` });
      await expect(link).toHaveAttribute('href', /^https:\/\//);
      await expect(link).toHaveAttribute('target', '_blank');
    }
  });
});

// Every page sits in the shared PageShell container (PLAN Z4.5).
test.describe('page container', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.skip(({ isMobile }) => isMobile, 'Desktop layout only');

  const pages = [
    { path: '/pl/portfolio', maxWidth: 1200 }, // --container-max: 75rem
    { path: '/en/portfolio/mgla-nad-bagnem', maxWidth: 1200 },
    { path: '/pl/kontakt', maxWidth: 1200 },
    { path: '/en/privacy', maxWidth: 768 }, // reading width: 48rem
    { path: '/pl/nie-ma-takiej-strony', maxWidth: 1200 },
  ];

  for (const { path, maxWidth } of pages) {
    test(`${path} is centred and at most ${String(maxWidth)} px wide`, async ({ page }) => {
      await page.goto(path);
      const shell = page.getByRole('main').locator('> *').first();
      const box = await shell.boundingBox();
      // clientWidth leaves out a classic scrollbar, which the viewport size includes.
      const width = await page.evaluate(() => document.documentElement.clientWidth);
      if (!box) throw new Error('no layout box');

      expect(box.width).toBeCloseTo(maxWidth, 0);
      expect(box.x).toBeCloseTo((width - box.width) / 2, 0);
    });
  }
});
