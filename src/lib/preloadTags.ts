import type { Language } from './i18n';

/** The part of Vite's build manifest (`dist/.vite/manifest.json`) that prerendering reads. */
export interface ManifestChunk {
  file: string;
  isEntry?: boolean;
  imports?: string[];
  css?: string[];
}
export type Manifest = Record<string, ManifestChunk>;

export interface PageAssets {
  scripts: string[];
  styles: string[];
}

/** Keys of the entry chunks and everything they import: `index.html` already links those. */
function entryClosure(manifest: Manifest): Set<string> {
  const closure = new Set<string>();
  const visit = (key: string) => {
    if (closure.has(key)) return;
    closure.add(key);
    for (const imported of manifest[key]?.imports ?? []) visit(imported);
  };
  for (const [key, chunk] of Object.entries(manifest)) if (chunk.isEntry) visit(key);
  return closure;
}

/**
 * The JS chunks and stylesheets a lazily loaded page needs beyond what the entry already loads:
 * its own chunk and the chunks it imports. Prerendered HTML links them, so the page's styles
 * apply before any JS runs and its code downloads in parallel with the entry.
 */
export function pageAssets(manifest: Manifest, module: string | undefined): PageAssets {
  const scripts: string[] = [];
  const styles: string[] = [];
  if (!module) return { scripts, styles };
  if (!manifest[module]) throw new Error(`${module} is not in the build manifest`);

  const skip = entryClosure(manifest);
  const visit = (key: string) => {
    const chunk = manifest[key];
    if (!chunk || skip.has(key)) return;
    skip.add(key);
    scripts.push(`/${chunk.file}`);
    for (const css of chunk.css ?? []) styles.push(`/${css}`);
    for (const imported of chunk.imports ?? []) visit(imported);
  };
  visit(module);
  return { scripts, styles };
}

/**
 * Font files to preload: the Latin subsets of Cinzel (headings) and Inter (text) everywhere, plus
 * Latin Extended on Polish pages (ą, ę, ł…). Other subsets load only if a page needs them.
 */
const FONT_FILES: Record<'all' | Language, readonly RegExp[]> = {
  all: [/^cinzel-latin-wght-normal-[\w-]+\.woff2$/, /^inter-latin-wght-normal-[\w-]+\.woff2$/],
  pl: [
    /^cinzel-latin-ext-wght-normal-[\w-]+\.woff2$/,
    /^inter-latin-ext-wght-normal-[\w-]+\.woff2$/,
  ],
  en: [],
};

/** Picks the fonts to preload for `lang` from the built asset file names. */
export function fontPreloads(assetFiles: readonly string[], lang: Language): string[] {
  return [...FONT_FILES.all, ...FONT_FILES[lang]].map((pattern) => {
    const file = assetFiles.find((name) => pattern.test(name));
    if (!file) throw new Error(`No built font matches ${String(pattern)}`);
    return `/assets/${file}`;
  });
}

/**
 * `<link>` tags for the page's fonts and stylesheets. Its JS chunks are not preloaded here: they
 * load after the first paint, with the entry (htmlTemplate.ts `deferScripts`).
 */
export function renderPreloadTags(fonts: readonly string[], styles: readonly string[]): string {
  return [
    ...fonts.map(
      (href) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="${href}">`,
    ),
    ...styles.map((href) => `<link rel="stylesheet" crossorigin href="${href}">`),
  ].join('\n    ');
}
