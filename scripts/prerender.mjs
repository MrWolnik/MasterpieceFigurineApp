// Prerenders every page to static HTML after `vite build` (PLAN Z4.2), so search engines and
// link previews get the title, description, hreflang links and content without running JS.
// Also writes sitemap.xml and robots.txt. Usage: node scripts/prerender.mjs (part of `npm run build`).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssrOutDir = join(root, 'node_modules/.tmp/ssr');

// A server build of src/entry-server.tsx, with the same Vite config as the browser build.
await build({
  root,
  logLevel: 'warn',
  build: {
    ssr: 'src/entry-server.tsx',
    outDir: ssrOutDir,
    emptyOutDir: true,
    copyPublicDir: false,
  },
});

const { renderPage, prerenderPaths, buildSitemap, buildRobots } = await import(
  pathToFileURL(join(ssrOutDir, 'entry-server.js')).href
);

// dist/index.html stays the bare shell for `/` (language redirect) and unknown paths (404).
const template = readFileSync(join(dist, 'index.html'), 'utf8');
const paths = prerenderPaths();

// `/pl/portfolio` → `pl/portfolio.html`: Netlify and `vite preview` serve it at the clean URL,
// without the trailing-slash redirect a `pl/portfolio/index.html` would get.
for (const path of paths) {
  const file = join(dist, `${path}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, await renderPage(path, template));
}

writeFileSync(join(dist, 'sitemap.xml'), buildSitemap());
writeFileSync(join(dist, 'robots.txt'), buildRobots());

console.log(`Prerendered ${String(paths.length)} pages, sitemap.xml and robots.txt.`);
