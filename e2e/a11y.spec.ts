import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from './fixtures';
import { expectNoA11yViolations, sitemapPaths } from './helpers.js';

/**
 * Accessibility checks that run on every page of the site (PLAN Z4.4). Pages come from the built
 * sitemap, so a new work or page is checked without touching this file. States that only appear
 * after an interaction (open menu, form errors, filters) are scanned in their own specs.
 */

/** Pages outside the sitemap that still have to be accessible. */
const EXTRA_PATHS = ['/pl/nie-ma-takiej-strony', '/en/no-such-page'];

/** One page of each kind, for the keyboard walk (a full Tab walk of every page is slow). */
const KEYBOARD_PATHS = [
  '/pl',
  '/en/portfolio',
  '/pl/portfolio/mgla-nad-bagnem', // painting with zoom
  '/en/portfolio/nocny-wartownik', // figurine with turntable
  '/pl/kontakt?kind=painting',
  '/en/privacy',
  '/pl/nie-ma-takiej-strony',
];

async function axeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  return results.violations.map(({ id, help, nodes }) => ({
    id,
    help,
    targets: nodes.map((node) => node.target.join(' ')),
  }));
}

test.describe('every page', () => {
  test('has no detectable accessibility violations', async ({ page, request }) => {
    test.setTimeout(180_000);
    const paths = [...(await sitemapPaths(request)), ...EXTRA_PATHS];
    // 2 languages × (home, portfolio, contact, privacy + works) + the 404 pages.
    expect(paths.length).toBeGreaterThanOrEqual(2 * 5 + EXTRA_PATHS.length);

    for (const path of paths) {
      await page.goto(path);
      expect.soft(await axeViolations(page), path).toEqual([]);
    }
  });

  test('gives every image a text alternative or a named context', async ({ page, request }) => {
    test.setTimeout(120_000);
    for (const path of await sitemapPaths(request)) {
      await page.goto(path);
      const problems = await page.locator('img').evaluateAll((images) =>
        images.flatMap((image) => {
          const alt = image.getAttribute('alt');
          const where = image.getAttribute('src') ?? '(no src)';
          if (alt === null) return [`${where}: no alt attribute`];
          if (alt.trim() !== '') {
            // A file name or a generic word is not a description.
            return /\.(avif|webp|png|jpe?g|gif)$|^(image|obraz|img|photo|zdjęcie)$/i.test(alt)
              ? [`${where}: alt "${alt}" is not descriptive`]
              : [];
          }
          // Decorative (alt=""): the link, card or control around it must carry the name, or
          // a link would be left without one.
          const context = image.closest('a, button, li, figure, [aria-label]');
          const name =
            context?.getAttribute('aria-label') ?? (context as HTMLElement | null)?.innerText;
          return name?.trim() ? [] : [`${where}: decorative image without a named context`];
        }),
      );
      expect.soft(problems, path).toEqual([]);
    }
  });
});

/**
 * What the focused element shows, or why it is not enough. The ring may be drawn on the element
 * or on a wrapper (the file picker's visible area outlines when its hidden input is focused), so
 * any visible outlined element counts; it must not be clipped by an `overflow` ancestor.
 */
function focusRingProblem(): string | null {
  const focused = document.activeElement;
  if (!focused || focused === document.body) return null;
  const label = `${focused.tagName.toLowerCase()} "${(focused.getAttribute('aria-label') ?? (focused as HTMLElement).innerText).trim().slice(0, 40)}"`;

  const ringed = [...document.querySelectorAll('*')].find((element) => {
    const style = getComputedStyle(element);
    if (style.outlineStyle === 'none' || parseFloat(style.outlineWidth) === 0) return false;
    if (style.outlineColor === 'transparent' || style.outlineColor === 'rgba(0, 0, 0, 0)')
      return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.width >= 4 && rect.height >= 4 && element.checkVisibility({ opacityProperty: true })
    );
  });
  if (!ringed) return `${label}: no visible focus indicator`;

  const style = getComputedStyle(ringed);
  const extent = parseFloat(style.outlineWidth) + Math.max(0, parseFloat(style.outlineOffset));
  const rect = ringed.getBoundingClientRect();
  for (
    let parent = ringed.parentElement;
    parent && parent !== document.body;
    parent = parent.parentElement
  ) {
    const { overflowX, overflowY } = getComputedStyle(parent);
    if (overflowX === 'visible' && overflowY === 'visible') continue;
    const box = parent.getBoundingClientRect();
    const tolerance = 0.5;
    if (
      rect.left - extent < box.left - tolerance ||
      rect.right + extent > box.right + tolerance ||
      rect.top - extent < box.top - tolerance ||
      rect.bottom + extent > box.bottom + tolerance
    ) {
      return `${label}: focus ring clipped by ${parent.tagName.toLowerCase()}.${parent.className}`;
    }
  }
  return null;
}

test.describe('keyboard focus', () => {
  test.beforeEach(({ isMobile }, testInfo) => {
    test.skip(isMobile, 'phones have no Tab key');
    // Safari moves Tab only between form controls unless "Press Tab to highlight each item"
    // is on, so a Tab walk there would skip every link.
    test.skip(testInfo.project.name === 'webkit', 'Safari does not Tab to links by default');
  });

  for (const path of KEYBOARD_PATHS) {
    test(`is visible on every focusable element of ${path}`, async ({ page }) => {
      await page.goto(path);
      const problems: string[] = [];
      const seen = new Set<string>();

      for (let step = 0; step < 80; step += 1) {
        await page.keyboard.press('Tab');
        const key = await page.evaluate(() => {
          const element = document.activeElement;
          if (!element || element === document.body) return 'body';
          return [...document.querySelectorAll('*')].indexOf(element).toString();
        });
        if (key === 'body' || seen.has(key)) break; // walked past the last element or wrapped
        seen.add(key);
        const problem = await page.evaluate(focusRingProblem);
        if (problem) problems.push(problem);
      }

      expect(seen.size, 'Tab reached nothing').toBeGreaterThan(3);
      expect(problems).toEqual([]);
    });
  }
});

test.describe('zoom viewer', () => {
  test('has no detectable accessibility violations when open', async ({ page }) => {
    await page.goto('/en/portfolio/mgla-nad-bagnem');
    await page.getByRole('button', { name: /^Zoom/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await expectNoA11yViolations(page);
  });
});
