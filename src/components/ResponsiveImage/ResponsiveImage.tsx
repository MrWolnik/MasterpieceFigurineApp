import type { CSSProperties } from 'react';
import { IMAGE_FORMATS, srcSet, variantUrl } from '../../lib/images';

/** Fallback for the (rare) browser that supports neither AVIF nor WebP `<source>`s. */
const FALLBACK_WIDTH = 800;

interface ResponsiveImageProps {
  /** Source image path in `public/`, e.g. `/works/<slug>/cover.jpg`. */
  src: string;
  alt: string;
  /** How wide the image is shown, so the browser picks the right file, e.g. `(min-width: 60rem) 33vw, 100vw`. */
  sizes: string;
  className?: string;
  style?: CSSProperties;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * An image in AVIF or WebP at the width the layout needs (variants from
 * scripts/optimize-images.mjs). The `<picture>` has `display: contents` (global.css), so styles
 * and layout apply to the `<img>` as if it stood alone.
 */
export function ResponsiveImage({
  src,
  alt,
  sizes,
  className,
  style,
  loading = 'lazy',
  fetchPriority,
}: ResponsiveImageProps) {
  return (
    <picture>
      {IMAGE_FORMATS.map((format) => (
        <source key={format} type={`image/${format}`} srcSet={srcSet(src, format)} sizes={sizes} />
      ))}
      <img
        className={className}
        style={style}
        src={variantUrl(src, FALLBACK_WIDTH, 'webp')}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
      />
    </picture>
  );
}
