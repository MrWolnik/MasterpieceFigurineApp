// Generates AVIF/WebP variants of the images in public/ into public/img (git-ignored).
// Runs before `npm run dev` and `npm run build`; only new or changed images are processed.
// Usage: node scripts/optimize-images.mjs
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimizeImages } from './image-pipeline.mjs';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const started = performance.now();
const { generated, upToDate } = await optimizeImages(publicDir);
const seconds = ((performance.now() - started) / 1000).toFixed(1);
console.log(
  `Images: ${String(generated)} optimised, ${String(upToDate)} up to date (${seconds} s).`,
);
