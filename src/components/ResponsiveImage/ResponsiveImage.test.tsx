import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResponsiveImage } from './ResponsiveImage';

function renderImage(extra: Partial<Parameters<typeof ResponsiveImage>[0]> = {}) {
  const { container } = render(
    <ResponsiveImage src="/works/a/cover.jpg" alt="Cover" sizes="50vw" {...extra} />,
  );
  const sources = [...container.querySelectorAll('source')];
  const img = container.querySelector('img');
  if (!img) throw new Error('no <img>');
  return { picture: container.querySelector('picture'), sources, img };
}

describe('ResponsiveImage', () => {
  it('offers AVIF first, then WebP, each in every width', () => {
    const { sources } = renderImage();
    expect(sources.map((source) => source.type)).toEqual(['image/avif', 'image/webp']);
    expect(sources[0]?.getAttribute('srcset')).toBe(
      '/img/works/a/cover-480.avif 480w, /img/works/a/cover-800.avif 800w, ' +
        '/img/works/a/cover-1200.avif 1200w, /img/works/a/cover-1600.avif 1600w',
    );
    for (const source of sources) expect(source.getAttribute('sizes')).toBe('50vw');
  });

  it('falls back to a medium WebP and keeps the alt text and classes on the <img>', () => {
    const { img } = renderImage({ className: 'cover', style: { objectPosition: '10% 20%' } });
    expect(img).toHaveAttribute('src', '/img/works/a/cover-800.webp');
    expect(img).toHaveAttribute('alt', 'Cover');
    expect(img).toHaveClass('cover');
    expect(img).toHaveStyle({ objectPosition: '10% 20%' });
  });

  it('loads lazily by default, eagerly and with priority when asked', () => {
    expect(renderImage().img).toHaveAttribute('loading', 'lazy');
    const { img } = renderImage({ loading: 'eager', fetchPriority: 'high' });
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchpriority', 'high');
  });
});
