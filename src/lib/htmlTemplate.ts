import { renderHeadTags, type PageMeta } from './seo';

const ROOT = '<div id="root"></div>';

function escapeText(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/**
 * Fills the built `index.html` with one prerendered page: `<html lang>`, the title, the SEO
 * head tags and the app markup inside `#root`. Throws if the template has changed shape, so a
 * broken build never ships pages without their content.
 */
export function fillTemplate(template: string, meta: PageMeta, appHtml: string): string {
  for (const marker of ['<html lang="', '<title>', '</head>', ROOT]) {
    if (!template.includes(marker)) {
      throw new Error(`index.html template is missing ${marker}`);
    }
  }
  return template
    .replace(/<html lang="[^"]*"/, `<html lang="${meta.lang}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeText(meta.title)}</title>`)
    .replace('</head>', `  ${renderHeadTags(meta.tags)}\n  </head>`)
    .replace(ROOT, `<div id="root">${appHtml}</div>`);
}
