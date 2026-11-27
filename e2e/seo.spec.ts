import { expect, test, type APIRequestContext } from './fixtures';

/** Paths of every page listed in the built sitemap.xml (the site's own list of pages). */
async function sitemapPaths(request: APIRequestContext): Promise<string[]> {
  const response = await request.get('/sitemap.xml');
  expect(response.ok()).toBe(true);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1] ?? '').pathname);
}

/** The value of `attribute` on the first tag in `html` that matches `selector` (a regex source). */
function attribute(html: string, selector: string, name: string): string | undefined {
  const tag = new RegExp(`<[^>]*${selector}[^>]*>`).exec(html)?.[0];
  return tag ? new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1] : undefined;
}

test.describe('prerendered HTML (before any JavaScript runs)', () => {
  test('every page in the sitemap has its language, title, description, hreflang and content', async ({
    request,
  }) => {
    const paths = await sitemapPaths(request);
    // 2 languages × (home, portfolio, contact, privacy + every work).
    expect(paths.length).toBeGreaterThanOrEqual(2 * 5);

    for (const path of paths) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      const html = await response.text();
      const lang = path.split('/')[1];

      expect(html, path).toContain(`<html lang="${lang ?? ''}">`);
      const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
      expect(title, path).toMatch(/.+ \| MasterpieceFigurineJ$/);
      expect(attribute(html, 'name="description"', 'content'), path).toBeTruthy();
      expect(attribute(html, 'rel="canonical"', 'href'), path).toMatch(new RegExp(`${path}$`));
      for (const hreflang of ['pl', 'en', 'x-default']) {
        expect(
          attribute(html, `hreflang="${hreflang}"`, 'href'),
          `${path} ${hreflang}`,
        ).toBeTruthy();
      }
      expect(attribute(html, 'property="og:image"', 'content'), path).toMatch(/\/og-image\.png$/);
      // The page itself is in the markup, not only an empty #root.
      expect(html, path).toMatch(/<h1[^>]*>[^<]+/);
    }
  });

  test('x-default points to the Polish version', async ({ request }) => {
    const html = await (await request.get('/en/contact')).text();
    expect(attribute(html, 'hreflang="x-default"', 'href')).toMatch(/\/pl\/kontakt$/);
  });

  test('the home page carries Person structured data without the e-mail', async ({ request }) => {
    const html = await (await request.get('/pl')).text();
    const json = /<script type="application\/ld\+json"[^>]*>([^<]+)<\/script>/.exec(html)?.[1];
    expect(JSON.parse(json ?? '{}')).toMatchObject({ '@type': 'Person', name: 'Julia' });
    expect(json).not.toContain('@gmail');
  });

  test('robots.txt allows crawling and names the sitemap; the share image exists', async ({
    request,
  }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Allow: /');
    expect(robots).toMatch(/Sitemap: \S+\/sitemap\.xml/);

    const image = await request.get('/og-image.png');
    expect(image.ok()).toBe(true);
    expect(image.headers()['content-type']).toBe('image/png');
  });
});

test.describe('hydration', () => {
  const pages = [
    '/pl',
    '/en',
    '/pl/portfolio',
    '/en/portfolio/mgla-nad-bagnem',
    '/pl/portfolio/nocny-wartownik',
    '/pl/kontakt',
    // The query is unknown to the prerendered HTML; the prefill must not cause a mismatch.
    '/en/contact?kind=painting&ref=mgla-nad-bagnem',
    '/en/privacy',
  ];

  for (const path of pages) {
    test(`${path} hydrates without errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));

      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      // Interactive after hydration: the e-mail link is only built in the browser.
      await expect(
        page.getByRole('contentinfo').getByRole('link', { name: /e-mail/ }),
      ).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test('the order prefill still applies on a prerendered contact page', async ({ page }) => {
    await page.goto('/en/contact?kind=painting&ref=mgla-nad-bagnem');
    await expect(page.getByRole('radio', { name: 'Commissioned painting' })).toBeChecked();
    await expect(page.getByRole('textbox', { name: /description/i })).toHaveValue(
      /Mist over the Marsh/,
    );
  });

  test('the title and canonical link follow client-side navigation', async ({ page }) => {
    await page.goto('/pl');
    // The Hero button, as the header menu is collapsed on phones.
    await page.getByRole('link', { name: 'Zamów malowanie' }).click();
    await expect(page).toHaveTitle('Kontakt i zamówienia | MasterpieceFigurineJ');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/pl\/kontakt$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  });
});
