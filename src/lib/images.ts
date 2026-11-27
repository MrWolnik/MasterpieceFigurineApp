/**
 * Names of the optimised image variants. Shared by the components (srcset) and by
 * scripts/optimize-images.mjs, which generates the files into `public/img/` before `dev` and
 * `build`. No imports, so Node can load this file directly.
 */

/** Widths generated for every photo; `srcset` lets the browser pick the smallest that fits. */
export const IMAGE_WIDTHS = [480, 800, 1200, 1600] as const;

/** Formats generated for every photo, best compression first (`<source>` order matters). */
export const IMAGE_FORMATS = ['avif', 'webp'] as const;
export type ImageFormat = (typeof IMAGE_FORMATS)[number];

/** Turntable frames: one WebP size, as 36 frames are preloaded in turn (no srcset). */
export const FRAME_WIDTH = 800;

/** Where the variants are served from (the folder is generated and git-ignored). */
export const VARIANTS_DIR = '/img';

export interface ImageVariant {
  url: string;
  width: number;
  format: ImageFormat;
}

/** `/works/a/cover.svg` → `/img/works/a/cover-800.avif`. */
export function variantUrl(src: string, width: number, format: ImageFormat): string {
  return `${VARIANTS_DIR}${src.replace(/\.[^./]+$/, '')}-${String(width)}.${format}`;
}

/** `srcset` value listing every width of `src` in one format. */
export function srcSet(src: string, format: ImageFormat): string {
  return IMAGE_WIDTHS.map((width) => `${variantUrl(src, width, format)} ${String(width)}w`).join(
    ', ',
  );
}

export function isFrame(src: string): boolean {
  return /\/frames\/[^/]+$/.test(src);
}

/** Every variant generated for a source image. */
export function imageVariants(src: string): ImageVariant[] {
  if (isFrame(src)) {
    return [{ url: variantUrl(src, FRAME_WIDTH, 'webp'), width: FRAME_WIDTH, format: 'webp' }];
  }
  return IMAGE_FORMATS.flatMap((format) =>
    IMAGE_WIDTHS.map((width) => ({ url: variantUrl(src, width, format), width, format })),
  );
}
