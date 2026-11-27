// Renders the default share image public/og-image.png (1200 × 630) with the site's colours
// and fonts. Social networks do not show SVG, so this is a PNG made by a headless browser.
// Usage: node scripts/generate-og-image.mjs (re-run after changing the brand or tagline).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const font = (pkg, file) =>
  readFileSync(join(root, 'node_modules/@fontsource-variable', pkg, 'files', file)).toString(
    'base64',
  );

const pl = JSON.parse(readFileSync(join(root, 'src/locales/pl.json'), 'utf8'));
const en = JSON.parse(readFileSync(join(root, 'src/locales/en.json'), 'utf8'));

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: Cinzel; font-weight: 400 900;
  src: url(data:font/woff2;base64,${font('cinzel', 'cinzel-latin-wght-normal.woff2')}) format('woff2'); }
@font-face { font-family: Cinzel; font-weight: 400 900; unicode-range: U+0100-024F;
  src: url(data:font/woff2;base64,${font('cinzel', 'cinzel-latin-ext-wght-normal.woff2')}) format('woff2'); }
@font-face { font-family: Inter; font-weight: 100 900;
  src: url(data:font/woff2;base64,${font('inter', 'inter-latin-wght-normal.woff2')}) format('woff2'); }
@font-face { font-family: Inter; font-weight: 100 900; unicode-range: U+0100-024F;
  src: url(data:font/woff2;base64,${font('inter', 'inter-latin-ext-wght-normal.woff2')}) format('woff2'); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; display: grid; place-items: center; color: #e8e1d3;
  font-family: Inter, sans-serif;
  background: radial-gradient(ellipse at 50% 40%, #1a1815 0%, #0e0d0b 70%); }
.frame { position: absolute; inset: 32px; border: 1px solid rgb(184 137 59 / 45%); }
.content { text-align: center; display: grid; gap: 28px; justify-items: center; }
.brand { font-family: Cinzel, serif; font-weight: 600; font-size: 76px; letter-spacing: 0.04em; }
.rule { width: 160px; height: 2px; background: #b8893b; }
.tagline { font-size: 32px; color: #e8e1d3; }
.tagline-en { font-size: 24px; color: #9a9183; }
</style></head><body>
<div class="frame"></div>
<div class="content">
  <div class="brand">MasterpieceFigurine<span style="color:#b8893b">J</span></div>
  <div class="rule"></div>
  <div class="tagline">${pl.app.tagline}</div>
  <div class="tagline-en">${en.app.tagline}</div>
</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(root, 'public/og-image.png') });
await browser.close();
console.log('Wrote public/og-image.png');
