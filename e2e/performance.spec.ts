import { expect, test, type Page } from './fixtures';

/** Paths of every request the page makes from now on. */
function trackRequests(page: Page): string[] {
  const paths: string[] = [];
  page.on('request', (request) => paths.push(new URL(request.url()).pathname));
  return paths;
}

const preloads = (html: string, rel: string) =>
  [...html.matchAll(new RegExp(`<link rel="${rel}"[^>]*href="([^"]+)"`, 'g'))].map(
    (match) => match[1] ?? '',
  );

test.describe('code splitting', () => {
  test('the portfolio does not download the contact page and its form', async ({ page }) => {
    const requests = trackRequests(page);
    await page.goto('/pl/portfolio');
    await expect(page.getByRole('heading', { level: 1, name: 'Portfolio' })).toBeVisible();

    expect(requests.some((path) => /\/assets\/Portfolio-[\w-]+\.js$/.test(path))).toBe(true);
    expect(requests.some((path) => /\/assets\/Contact-[\w-]+\.js$/.test(path))).toBe(false);
  });

  test('the contact page chunk loads when the user goes there', async ({ page, isMobile }) => {
    const requests = trackRequests(page);
    await page.goto('/pl');
    if (isMobile) await page.getByRole('button', { name: 'Otwórz menu' }).click();
    await page
      .getByRole('navigation', { name: 'Główna nawigacja' })
      .getByRole('link', { name: 'Kontakt' })
      .click();

    await expect(page.getByRole('heading', { level: 1, name: 'Kontakt' })).toBeVisible();
    expect(requests.some((path) => /\/assets\/Contact-[\w-]+\.js$/.test(path))).toBe(true);
  });
});

/** The JS files the inline loader of a prerendered page fetches after the first paint. */
function deferredScripts(html: string): string[] {
  const loader = /<script type="module">([^<]*import\([^<]*)<\/script>/.exec(html)?.[1] ?? '';
  return [...loader.matchAll(/"(\/assets\/[^"]+\.js)"/g)].map((match) => match[1] ?? '');
}

test.describe('prerendered pages', () => {
  test("link their own stylesheet and their language's fonts up front", async ({ request }) => {
    const polish = await (await request.get('/pl/kontakt')).text();
    expect(preloads(polish, 'stylesheet')).toContainEqual(
      expect.stringMatching(/\/assets\/Contact-[\w-]+\.css$/),
    );
    const polishFonts = preloads(polish, 'preload');
    expect(polishFonts).toContainEqual(expect.stringMatching(/inter-latin-wght-normal/));
    expect(polishFonts).toContainEqual(expect.stringMatching(/inter-latin-ext-wght-normal/));

    const english = await (await request.get('/en/contact')).text();
    const englishFonts = preloads(english, 'preload');
    expect(englishFonts).toContainEqual(expect.stringMatching(/cinzel-latin-wght-normal/));
    expect(englishFonts.some((href) => href.includes('latin-ext'))).toBe(false);
  });

  test('load their JS only after the first paint, the page chunk with the entry', async ({
    request,
  }) => {
    const html = await (await request.get('/pl/kontakt')).text();
    // Nothing in the markup fetches JS straight away…
    expect(html).not.toMatch(/<script[^>]+src=/);
    expect(preloads(html, 'modulepreload')).toEqual([]);
    // …the inline loader does, entry and page chunk together.
    const scripts = deferredScripts(html);
    expect(scripts).toContainEqual(expect.stringMatching(/\/assets\/index-[\w-]+\.js$/));
    expect(scripts).toContainEqual(expect.stringMatching(/\/assets\/Contact-[\w-]+\.js$/));
  });

  test('every preloaded and deferred file exists', async ({ request }) => {
    for (const path of ['/pl', '/en/portfolio', '/pl/portfolio/nocny-wartownik', '/pl/kontakt']) {
      const html = await (await request.get(path)).text();
      for (const href of [
        ...preloads(html, 'preload'),
        ...preloads(html, 'stylesheet'),
        ...deferredScripts(html),
      ]) {
        expect((await request.get(href)).status(), `${path}: ${href}`).toBe(200);
      }
    }
  });
});

/**
 * AVIF where the browser decodes it; Playwright's WebKit on Windows does not, and then the
 * `<picture>` falls back to WebP (Safari on Apple devices decodes AVIF).
 */
function modernFormat(browserName: string, os = process.platform): RegExp {
  return browserName === 'webkit' && os === 'win32' ? /\.(avif|webp)$/ : /\.avif$/;
}

test.describe('images', () => {
  test('tiles load small modern formats instead of the source files', async ({
    page,
    browserName,
  }) => {
    const requests = trackRequests(page);
    await page.goto('/pl/portfolio');
    const firstCover = page.getByRole('article').first().locator('img');
    await expect(firstCover).toHaveJSProperty('complete', true);

    const covers = requests.filter((path) => path.includes('/cover'));
    expect(covers.length).toBeGreaterThan(0);
    for (const path of covers) {
      expect(path).toMatch(/^\/img\/works\/.+-\d+\.\w+$/);
      expect(path).toMatch(modernFormat(browserName));
    }
    expect(await firstCover.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(
      0,
    );
  });

  test('the Hero portrait loads first, not lazily', async ({ page, browserName }) => {
    await page.goto('/pl');
    const portrait = page.getByRole('img', { name: 'Julia przy swoim stanowisku malarskim' });
    await expect(portrait).toHaveAttribute('loading', 'eager');
    await expect(portrait).toHaveAttribute('fetchpriority', 'high');
    await expect(portrait).toHaveJSProperty('complete', true);
    const current = await portrait.evaluate((img: HTMLImageElement) => img.currentSrc);
    expect(current).toMatch(/\/img\/julia-\d+\.\w+$/);
    expect(current).toMatch(modernFormat(browserName));
  });
});
