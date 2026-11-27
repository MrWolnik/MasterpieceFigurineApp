import { describe, expect, it } from 'vitest';
import { deferScripts, fillTemplate } from './htmlTemplate';
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
    const html = fillTemplate(template, { path: '/en/contact', meta, appHtml: '<main>App</main>' });
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<title>Contact &amp; &lt;commissions&gt;</title>');
    expect(html).toMatch(/<meta name="description" content="Hello" data-seo>\s*<\/head>/);
    expect(html).toContain('<div id="root" data-path="/en/contact"><main>App</main></div>');
    expect(html).not.toContain('Shell');
  });

  it('places preload tags right after the title', () => {
    const html = fillTemplate(template, {
      path: '/en',
      meta,
      appHtml: '',
      preloadHtml: '<link rel="modulepreload" href="/a.js">',
    });
    expect(html).toMatch(/<\/title>\s*<link rel="modulepreload" href="\/a.js">/);
  });

  it('fails loudly when the template has changed shape', () => {
    expect(() =>
      fillTemplate(template.replace('<div id="root"></div>', ''), { path: '/', meta, appHtml: '' }),
    ).toThrow(/missing <div id="root"><\/div>/);
    expect(() =>
      fillTemplate(template.replace('<title>Shell</title>', ''), { path: '/', meta, appHtml: '' }),
    ).toThrow(/missing <title>/);
  });
});

describe('deferScripts', () => {
  const built = `<head>
    <script type="module" crossorigin src="/assets/index-A.js"></script>
    <link rel="modulepreload" crossorigin href="/assets/vendor-B.js">
    <link rel="stylesheet" crossorigin href="/assets/index-C.css">
  </head>`;

  it('replaces the entry script and module preloads with a loader that runs after paint', () => {
    const html = deferScripts(built, ['/assets/Page-D.js', '/assets/vendor-B.js']);
    expect(html).not.toContain('src="/assets/index-A.js"');
    expect(html).not.toContain('<link rel="modulepreload"');
    expect(html).toContain('<link rel="stylesheet" crossorigin href="/assets/index-C.css">');
    expect(html).toContain('for (const href of ["/assets/vendor-B.js","/assets/Page-D.js"])');
    expect(html).toContain('import("/assets/index-A.js")');
    expect(html).toContain('requestAnimationFrame(');
  });

  it('fails the build when the template has no entry script', () => {
    expect(() => deferScripts('<head></head>', [])).toThrow(/entry <script/);
  });
});
