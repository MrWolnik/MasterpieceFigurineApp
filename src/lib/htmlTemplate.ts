import { renderHeadTags, type PageMeta } from './seo';

const ROOT = '<div id="root"></div>';
const ENTRY_SCRIPT = /<script type="module" crossorigin src="([^"]+)"><\/script>/;
const MODULE_PRELOAD = /[ \t]*<link rel="modulepreload" crossorigin href="([^"]+)">\n?/g;

function escapeText(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export interface PrerenderedPage {
  /** The URL path the page was rendered for, kept on `#root` as `data-path`. */
  path: string;
  meta: PageMeta;
  appHtml: string;
  /** Preload and stylesheet tags, placed right after the title so they start early. */
  preloadHtml?: string;
  /**
   * When set, the JS starts loading only after the first paint (see {@link deferScripts}), and
   * these chunks (the page's own) are fetched along with the entry.
   */
  scripts?: readonly string[];
}

/** Hidden tabs get no animation frames; the JS starts after this long there. */
const START_TIMEOUT_MS = 1000;

/**
 * Swaps the template's entry `<script>` and its module preloads for a tiny inline loader that
 * starts downloading the app right after the first paint. Until then the page's text, styles
 * and images have the connection to themselves instead of sharing it with ~130 kB of JS; the
 * page is complete without JS (links work, the order form is disabled until hydration).
 * Measured with Lighthouse on a throttled phone: LCP 2.3 s instead of 3.9 s.
 */
export function deferScripts(html: string, scripts: readonly string[]): string {
  const entry = ENTRY_SCRIPT.exec(html)?.[1];
  if (!entry) throw new Error('index.html template is missing the entry <script type="module">');
  const modules = [
    ...new Set([...[...html.matchAll(MODULE_PRELOAD)].map((match) => match[1] ?? ''), ...scripts]),
  ];
  const loader = [
    'let started = false;',
    'const start = () => {',
    '  if (started) return;',
    '  started = true;',
    `  for (const href of ${JSON.stringify(modules)}) {`,
    "    const link = document.createElement('link');",
    "    link.rel = 'modulepreload';",
    "    link.crossOrigin = '';",
    '    link.href = href;',
    '    document.head.append(link);',
    '  }',
    `  import(${JSON.stringify(entry)});`,
    '};',
    'requestAnimationFrame(() => setTimeout(start));',
    `setTimeout(start, ${String(START_TIMEOUT_MS)});`,
  ].join(' ');
  return html
    .replace(MODULE_PRELOAD, '')
    .replace(ENTRY_SCRIPT, `<script type="module">${loader}</script>`);
}

function escapeAttribute(value: string): string {
  return escapeText(value).replaceAll('"', '&quot;');
}

/**
 * Fills the built `index.html` with one prerendered page: `<html lang>`, the title, preload
 * tags, the SEO head tags and the app markup inside `#root`, which also records the page's path
 * (main.tsx hydrates only at that URL). Throws if the template has changed shape, so a broken
 * build never ships pages without their content.
 */
export function fillTemplate(
  template: string,
  { path, meta, appHtml, preloadHtml = '', scripts }: PrerenderedPage,
): string {
  for (const marker of ['<html lang="', '<title>', '</head>', ROOT]) {
    if (!template.includes(marker)) {
      throw new Error(`index.html template is missing ${marker}`);
    }
  }
  const html = template
    .replace(/<html lang="[^"]*"/, `<html lang="${meta.lang}"`)
    .replace(
      /<title>[^<]*<\/title>/,
      `<title>${escapeText(meta.title)}</title>${
        preloadHtml
          ? `
    ${preloadHtml}`
          : ''
      }`,
    )
    .replace(
      '</head>',
      `  ${renderHeadTags(meta.tags)}
  </head>`,
    )
    .replace(ROOT, `<div id="root" data-path="${escapeAttribute(path)}">${appHtml}</div>`);
  return scripts ? deferScripts(html, scripts) : html;
}
