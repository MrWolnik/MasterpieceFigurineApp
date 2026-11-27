import { describe, expect, it } from 'vitest';
import { FRAME_WIDTH, IMAGE_WIDTHS, imageVariants, isFrame, srcSet, variantUrl } from './images';

describe('variantUrl', () => {
  it('puts the variant under /img with its width and format', () => {
    expect(variantUrl('/works/a/cover.jpg', 800, 'avif')).toBe('/img/works/a/cover-800.avif');
    expect(variantUrl('/julia.svg', 480, 'webp')).toBe('/img/julia-480.webp');
  });

  it('only replaces the file extension', () => {
    expect(variantUrl('/works/a.b/full@2x.png', 1200, 'webp')).toBe(
      '/img/works/a.b/full@2x-1200.webp',
    );
    expect(variantUrl('/works/a/no-extension', 480, 'webp')).toBe(
      '/img/works/a/no-extension-480.webp',
    );
  });
});

describe('srcSet', () => {
  it('lists every width with its descriptor', () => {
    expect(srcSet('/x.png', 'webp').split(', ')).toEqual(
      IMAGE_WIDTHS.map((width) => `/img/x-${String(width)}.webp ${String(width)}w`),
    );
  });
});

describe('imageVariants', () => {
  it('makes every width in AVIF and WebP for a photo', () => {
    const variants = imageVariants('/works/a/cover.jpg');
    expect(variants).toHaveLength(IMAGE_WIDTHS.length * 2);
    expect(variants).toContainEqual({
      url: '/img/works/a/cover-1600.avif',
      width: 1600,
      format: 'avif',
    });
  });

  it('makes one WebP for a turntable frame', () => {
    expect(isFrame('/works/a/frames/001.svg')).toBe(true);
    expect(isFrame('/works/frames.jpg')).toBe(false);
    expect(imageVariants('/works/a/frames/001.svg')).toEqual([
      {
        url: `/img/works/a/frames/001-${String(FRAME_WIDTH)}.webp`,
        width: FRAME_WIDTH,
        format: 'webp',
      },
    ]);
  });
});
