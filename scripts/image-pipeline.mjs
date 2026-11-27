// Generates the AVIF/WebP variants named in src/lib/images.ts from the source images in
// `public/` (photos of works, the portrait). Used by scripts/optimize-images.mjs.
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import sharp from 'sharp';
import { VARIANTS_DIR, imageVariants } from '../src/lib/images.ts';

const SOURCE_EXTENSIONS = /\.(svg|png|jpe?g|webp|avif)$/i;

/** Files in `public/` that are not photos and keep their own format. */
const SKIPPED = new Set(['/favicon.svg', '/og-image.png']);

const ENCODERS = {
  avif: (image) => image.avif({ quality: 55, effort: 4 }),
  webp: (image) => image.webp({ quality: 78 }),
};

/**
 * Whether a public path (`/works/a/cover.jpg`) is a source image to optimise. High-resolution
 * `@2x` files are left alone: the zoom viewer loads them as they are, at full detail.
 */
export function isSourceImage(publicPath) {
  return (
    SOURCE_EXTENSIONS.test(publicPath) &&
    !SKIPPED.has(publicPath) &&
    !/@2x\.[^./]+$/.test(publicPath) &&
    !publicPath.startsWith(`${VARIANTS_DIR}/`)
  );
}

/** Outputs must be regenerated when one is missing or older than the source. */
export function isStale(sourceMtimeMs, outputMtimesMs) {
  return outputMtimesMs.some((mtime) => mtime === undefined || mtime < sourceMtimeMs);
}

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function mtime(path) {
  try {
    return statSync(path).mtimeMs;
  } catch {
    return undefined;
  }
}

/** A sharp pipeline for one output width; SVGs are rasterised sharply at that width. */
async function load(file, width) {
  if (!file.endsWith('.svg')) {
    return sharp(file).resize({ width, withoutEnlargement: true });
  }
  const { width: intrinsic = width } = await sharp(file).metadata();
  return sharp(file, { density: Math.ceil((72 * width) / intrinsic) }).resize({ width });
}

/**
 * Writes the missing or outdated variants of every source image under `publicDir` into
 * `publicDir/img`. Returns how many sources were processed and how many were up to date.
 */
export async function optimizeImages(publicDir) {
  const sources = listFiles(publicDir)
    .map((file) => ({ file, publicPath: `/${relative(publicDir, file).split(sep).join('/')}` }))
    .filter(({ publicPath }) => isSourceImage(publicPath));

  let generated = 0;
  for (const { file, publicPath } of sources) {
    const variants = imageVariants(publicPath).map((variant) => ({
      ...variant,
      out: join(publicDir, ...variant.url.split('/')),
    }));
    if (
      !isStale(
        statSync(file).mtimeMs,
        variants.map(({ out }) => mtime(out)),
      )
    )
      continue;

    await Promise.all(
      variants.map(async ({ out, width, format }) => {
        mkdirSync(dirname(out), { recursive: true });
        await ENCODERS[format](await load(file, width)).toFile(out);
      }),
    );
    generated += 1;
  }
  return { generated, upToDate: sources.length - generated };
}
