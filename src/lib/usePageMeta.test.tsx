import { act, render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { getPageMeta, SEO_ATTRIBUTE } from './seo';
import { absoluteUrl } from './siteUrl';
import { applyPageMeta, usePageMeta } from './usePageMeta';

const seoTags = () => [...document.head.querySelectorAll(`[${SEO_ATTRIBUTE}]`)];
const canonical = () => document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');

afterEach(() => {
  for (const tag of seoTags()) tag.remove();
  document.title = '';
});

describe('applyPageMeta', () => {
  it('sets the title and adds the page tags', () => {
    applyPageMeta(document, getPageMeta('/en/contact'));
    expect(document.title).toBe('Contact and commissions | MasterpieceFigurine');
    expect(canonical()).toBe(absoluteUrl('/en/contact'));
    expect(document.head.querySelector('script[type="application/ld+json"]')).not.toBeNull();
  });

  it("replaces the previous page's tags instead of piling them up", () => {
    applyPageMeta(document, getPageMeta('/en/contact'));
    const count = getPageMeta('/pl/portfolio').tags.length;
    applyPageMeta(document, getPageMeta('/pl/portfolio'));
    expect(seoTags()).toHaveLength(count);
    expect(canonical()).toBe(absoluteUrl('/pl/portfolio'));
    expect(document.head.querySelector('script[type="application/ld+json"]')).toBeNull();
  });

  it('leaves head tags it does not own alone', () => {
    const charset = document.createElement('meta');
    charset.setAttribute('charset', 'UTF-8');
    document.head.append(charset);
    applyPageMeta(document, getPageMeta('/pl'));
    expect(charset.isConnected).toBe(true);
    charset.remove();
  });
});

describe('usePageMeta', () => {
  function Probe() {
    usePageMeta();
    return null;
  }

  it('follows client-side navigation', async () => {
    const router = createMemoryRouter([{ path: '*', Component: Probe }], {
      initialEntries: ['/pl/kontakt'],
    });
    render(<RouterProvider router={router} />);
    expect(canonical()).toBe(absoluteUrl('/pl/kontakt'));

    await act(() => router.navigate('/en/privacy'));
    expect(document.title).toBe('Privacy policy | MasterpieceFigurine');
    expect(canonical()).toBe(absoluteUrl('/en/privacy'));
  });
});
