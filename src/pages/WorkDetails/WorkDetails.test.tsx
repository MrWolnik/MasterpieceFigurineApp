import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderPage } from '../../test/test-utils';
import { WorkDetails } from './WorkDetails';

function renderWork(route: string) {
  return renderPage(<WorkDetails />, { path: '/:lang/portfolio/:slug', route });
}

describe('WorkDetails', () => {
  it('shows a figurine with frames as a 360° turntable and its detail photos', () => {
    renderWork('/pl/portfolio/smocza-kaplanka');

    expect(screen.getByRole('heading', { level: 1, name: 'Smocza kapłanka' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /Podgląd 360°/ })).toBeInTheDocument();
    const gallery = screen.getByRole('list', { name: 'Galeria zdjęć' });
    expect(within(gallery).getAllByRole('listitem')).toHaveLength(1);
  });

  it('shows a figurine without frames as a gallery of the cover and photos', () => {
    renderWork('/pl/portfolio/krasnoludzki-kowal');

    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    const gallery = screen.getByRole('list', { name: 'Galeria zdjęć' });
    expect(within(gallery).getAllByRole('button', { name: /Powiększ obraz/ })).toHaveLength(3);
  });

  it('shows a painting with zoom, medium, size and year', () => {
    renderWork('/en/portfolio/mgla-nad-bagnem');

    expect(screen.getByRole('heading', { level: 1, name: 'Mist over the Marsh' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Zoom image: Mist over the Marsh' })).toBeVisible();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    for (const [term, value] of [
      ['Type', 'Painting'],
      ['Medium', 'Oil on canvas'],
      ['Size', '70 × 50 cm'],
      ['Year', /^\d{4}$/],
    ] as const) {
      expect(screen.getByText(term).nextElementSibling).toHaveTextContent(value);
    }
  });

  it('links tags to the filtered portfolio', () => {
    renderWork('/pl/portfolio/mgla-nad-bagnem');

    const tags = screen.getByRole('list', { name: 'Tagi' });
    expect(within(tags).getByRole('link', { name: 'Olej' })).toHaveAttribute(
      'href',
      '/pl/portfolio?tag=olej',
    );
  });

  it('links previous and next works of the same kind only', () => {
    renderWork('/pl/portfolio/portret-rycerki');

    const nav = screen.getByRole('navigation', { name: 'Inne prace tego rodzaju' });
    expect(within(nav).getByRole('link', { name: /Poprzednia: Mgła nad bagnem/ })).toHaveAttribute(
      'href',
      '/pl/portfolio/mgla-nad-bagnem',
    );
    expect(within(nav).getByRole('link', { name: /Następna: Złoty ogród/ })).toHaveAttribute(
      'href',
      '/pl/portfolio/zloty-ogrod',
    );
  });

  it('starts the turntable afresh after moving to the next work', async () => {
    const { user } = renderWork('/pl/portfolio/nocny-wartownik');
    const slider = () => screen.getByRole('slider', { name: /Podgląd 360°/ });

    slider().focus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(slider()).toHaveAttribute('aria-valuenow', '20');

    await user.click(screen.getByRole('link', { name: /Następna: Smocza kapłanka/ }));

    expect(screen.getByRole('heading', { level: 1, name: 'Smocza kapłanka' })).toBeInTheDocument();
    expect(slider()).toHaveAttribute('aria-valuenow', '0');
  });

  it('has no previous link on the first work of a kind', () => {
    renderWork('/pl/portfolio/nocny-wartownik');

    const nav = screen.getByRole('navigation', { name: 'Inne prace tego rodzaju' });
    expect(within(nav).getAllByRole('link')).toHaveLength(1);
    expect(within(nav).getByRole('link')).toHaveAttribute('rel', 'next');
  });

  it('links "I want a similar one" to the contact form with the kind and work', () => {
    renderWork('/en/portfolio/mgla-nad-bagnem');

    expect(screen.getByRole('link', { name: 'I want a similar one' })).toHaveAttribute(
      'href',
      '/en/contact?kind=painting&ref=mgla-nad-bagnem',
    );
  });

  it('shows the 404 page for an unknown slug', () => {
    renderWork('/pl/portfolio/nie-ma-takiej');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Nie znaleziono strony' }),
    ).toBeInTheDocument();
  });
});
