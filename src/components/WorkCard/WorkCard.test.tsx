import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, sampleWork as work } from '../../test/test-utils';
import { WorkCard } from './WorkCard';

describe('WorkCard', () => {
  it('shows the title in Polish and links to the Polish details page', () => {
    renderWithProviders(<WorkCard work={work('nocny-wartownik')} />);
    const link = screen.getByRole('link', { name: /Nocny wartownik/ });
    expect(link).toHaveAttribute('href', '/pl/portfolio/nocny-wartownik');
    expect(screen.getByRole('heading', { level: 2, name: 'Nocny wartownik' })).toBeInTheDocument();
  });

  it('shows the title in English and links to the English details page', () => {
    renderWithProviders(<WorkCard work={work('nocny-wartownik')} />, {
      route: '/en',
      language: 'en',
    });
    const link = screen.getByRole('link', { name: /Night Sentinel/ });
    expect(link).toHaveAttribute('href', '/en/portfolio/nocny-wartownik');
  });

  it('lists translated tags', () => {
    renderWithProviders(<WorkCard work={work('mgla-nad-bagnem')} />, { language: 'en' });
    const tags = within(screen.getByRole('list', { name: 'Tags' })).getAllByRole('listitem');
    expect(tags.map((tag) => tag.textContent)).toEqual(['Oil', 'Landscape']);
  });

  it('marks a figurine with turntable frames with the figurine icon and a 360° badge', () => {
    renderWithProviders(<WorkCard work={work('nocny-wartownik')} />);
    expect(screen.getByRole('img', { name: 'Figurka' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Obraz' })).not.toBeInTheDocument();
    expect(screen.getByText('Podgląd 360°')).toBeInTheDocument();
  });

  it('shows no 360° badge for a figurine without frames', () => {
    renderWithProviders(<WorkCard work={work('krasnoludzki-kowal')} />);
    expect(screen.getByRole('img', { name: 'Figurka' })).toBeInTheDocument();
    expect(screen.queryByText('Podgląd 360°')).not.toBeInTheDocument();
  });

  it('marks a painting with the painting icon', () => {
    renderWithProviders(<WorkCard work={work('mgla-nad-bagnem')} />);
    expect(screen.getByRole('img', { name: 'Obraz' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Figurka' })).not.toBeInTheDocument();
    expect(screen.queryByText('Podgląd 360°')).not.toBeInTheDocument();
  });

  it('crops the cover using coverFocus and loads it lazily by default', () => {
    const { container } = renderWithProviders(<WorkCard work={work('portret-rycerki')} />);
    const cover = container.querySelector('img');
    expect(cover).toHaveAttribute('src', '/works/portret-rycerki/cover.svg');
    expect(cover).toHaveAttribute('loading', 'lazy');
    expect(cover).toHaveStyle({ objectPosition: '50% 25%' });
  });

  it('loads the cover eagerly when asked', () => {
    const { container } = renderWithProviders(<WorkCard work={work('portret-rycerki')} eager />);
    expect(container.querySelector('img')).toHaveAttribute('loading', 'eager');
  });
});
