import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Figurine } from '../../lib/works';
import { renderWithProviders, sampleWork } from '../../test/test-utils';
import { FeaturedWorks } from './FeaturedWorks';

function figurine(slug: string): Figurine {
  const work = sampleWork(slug);
  if (work.kind !== 'figurine') throw new Error(`${slug} is not a figurine`);
  return work;
}

describe('FeaturedWorks', () => {
  it('shows a 360° preview for figurines with frames, linked to their details', () => {
    renderWithProviders(<FeaturedWorks works={[figurine('nocny-wartownik')]} />);

    expect(screen.getByRole('slider', { name: /Podgląd 360°: Nocny wartownik/ })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Nocny wartownik' })).toHaveAttribute(
      'href',
      '/pl/portfolio/nocny-wartownik',
    );
  });

  it('shows the cover for figurines without frames', () => {
    const { container } = renderWithProviders(
      <FeaturedWorks works={[figurine('krasnoludzki-kowal')]} />,
    );

    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/works/krasnoludzki-kowal/cover.svg',
    );
  });

  it('lists every work and links to the whole portfolio', () => {
    renderWithProviders(
      <FeaturedWorks works={[figurine('nocny-wartownik'), figurine('smocza-kaplanka')]} />,
      { language: 'en' },
    );

    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'See the whole portfolio' })).toHaveAttribute(
      'href',
      '/en/portfolio',
    );
  });
});
