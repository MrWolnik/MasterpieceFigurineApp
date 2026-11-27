import { describe, expect, it } from 'vitest';
import { renderPage } from './entry-server';

const template = `<!doctype html>
<html lang="pl">
  <head>
    <title>MasterpieceFigurineJ</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

describe('renderPage', () => {
  it('renders a page with its content, language, head tags and hydration data', async () => {
    const html = await renderPage('/en/contact', template);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<title>Contact and commissions | MasterpieceFigurineJ</title>');
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

  it('refuses a path that redirects instead of rendering a page', async () => {
    await expect(renderPage('/en/kontakt', template)).rejects.toThrow(/redirect/);
  });
});
