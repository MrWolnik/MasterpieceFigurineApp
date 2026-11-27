import { describe, expect, it } from 'vitest';
import { fillTemplate } from './htmlTemplate';
import type { PageMeta } from './seo';

const template = `<!doctype html>
<html lang="pl">
  <head>
    <title>Shell</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

const meta: PageMeta = {
  lang: 'en',
  title: 'Contact & <commissions>',
  tags: [{ tag: 'meta', attrs: { name: 'description', content: 'Hello' } }],
};

describe('fillTemplate', () => {
  it('sets the language, title, head tags and app markup', () => {
    const html = fillTemplate(template, meta, '<main>App</main>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<title>Contact &amp; &lt;commissions&gt;</title>');
    expect(html).toMatch(/<meta name="description" content="Hello" data-seo>\s*<\/head>/);
    expect(html).toContain('<div id="root"><main>App</main></div>');
    expect(html).not.toContain('Shell');
  });

  it('fails loudly when the template has changed shape', () => {
    expect(() => fillTemplate(template.replace('<div id="root"></div>', ''), meta, '')).toThrow(
      /missing <div id="root"><\/div>/,
    );
    expect(() => fillTemplate(template.replace('<title>Shell</title>', ''), meta, '')).toThrow(
      /missing <title>/,
    );
  });
});
