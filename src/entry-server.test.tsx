import { describe, expect, it } from 'vitest';
import { renderPage } from './entry-server';

const template = `<!doctype html>
<html lang="pl">
  <head>
    <title>MasterpieceFigurine</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

describe('renderPage', () => {
  it('renders a page with its content, language, head tags and hydration data', async () => {
    const html = await renderPage('/en/contact', template);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<title>Contact and commissions | MasterpieceFigurine</title>');
    expect(html).toMatch(/<link rel="alternate" hreflang="pl" href="[^"]+\/pl\/kontakt"/);
    expect(html).toMatch(/<h1[^>]*>Contact<\/h1>/);
    expect(html).toContain('window.__staticRouterHydrationData');
  });

  it('renders the order form empty and disabled until the browser takes over', async () => {
    const html = await renderPage('/pl/kontakt', template);
    // No prefill (only the browser knows the query), and no typing before hydration.
    expect(html).toMatch(/<textarea[^>]*name="description"[^>]*><\/textarea>/);
    expect(html).toMatch(/<form[^>]*>\s*<h2>[^<]+<\/h2><fieldset[^>]* disabled=""/);
  });

  it('shows the e-mail only in its bot-proof text form', async () => {
    const html = await renderPage('/pl', template);
    expect(html).not.toContain('mailto:');
    expect(html).toContain('[at]');
  });

  it("links the page's own chunks and preloads the fonts of its language", async () => {
    const build = {
      manifest: {
        'index.html': { file: 'assets/index.js', isEntry: true },
        'src/pages/Contact/Contact.tsx': { file: 'assets/Contact.js', css: ['assets/Contact.css'] },
      },
      assetFiles: [
        'cinzel-latin-wght-normal-A.woff2',
        'inter-latin-wght-normal-B.woff2',
        'cinzel-latin-ext-wght-normal-C.woff2',
        'inter-latin-ext-wght-normal-D.woff2',
      ],
    };
    const builtTemplate = template.replace(
      '</head>',
      '<script type="module" crossorigin src="/assets/index.js"></script></head>',
    );
    const html = await renderPage('/pl/kontakt', builtTemplate, build);
    expect(html).toContain('<link rel="stylesheet" crossorigin href="/assets/Contact.css">');
    expect(html).toContain('href="/assets/inter-latin-ext-wght-normal-D.woff2"');
    // The JS (entry and page chunk) is fetched by the inline loader after the first paint.
    expect(html).not.toContain('src="/assets/index.js"');
    expect(html).toMatch(/for \(const href of \["\/assets\/Contact\.js"\]\)/);
    expect(html).toContain('import("/assets/index.js")');

    const english = await renderPage('/en', builtTemplate, build);
    expect(english).not.toContain('latin-ext');
    expect(english).toMatch(/for \(const href of \[\]\)/);
  });

  it('refuses a path that redirects instead of rendering a page', async () => {
    await expect(renderPage('/en/kontakt', template)).rejects.toThrow(/redirect/);
  });
});
