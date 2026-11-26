import { screen, within } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { getWorks } from '../../lib/works';
import { renderWithProviders } from '../../test/test-utils';
import { Portfolio } from './Portfolio';

function LocationProbe() {
  const { search } = useLocation();
  return <span data-testid="search">{search}</span>;
}

function renderPortfolio(route = '/en/portfolio') {
  return renderWithProviders(
    <Routes>
      <Route
        path="/:lang/portfolio"
        element={
          <>
            <Portfolio />
            <LocationProbe />
          </>
        }
      />
    </Routes>,
    { route, language: route.startsWith('/en') ? 'en' : 'pl' },
  );
}

const tileTitles = () => screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
const tagButtons = () =>
  within(screen.getByRole('group', { name: 'Tags' }))
    .getAllByRole('button')
    .map((b) => b.textContent);

describe('Portfolio', () => {
  it('renders the heading, intro and a tile for every work', () => {
    renderPortfolio('/pl/portfolio');

    expect(screen.getByRole('heading', { level: 1, name: 'Portfolio' })).toBeInTheDocument();
    expect(screen.getByText(/Wybrane prace/)).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(getWorks().length);
    expect(screen.getByRole('status')).toHaveTextContent('Liczba prac: 8');
  });

  it('filters by kind and updates the URL and the result count', async () => {
    const { user } = renderPortfolio();

    await user.click(screen.getByRole('button', { name: 'Paintings' }));

    expect(tileTitles()).toEqual(getWorks({ kind: 'painting' }).map((w) => w.title.en));
    expect(screen.getByTestId('search')).toHaveTextContent('?kind=painting');
    expect(screen.getByRole('status')).toHaveTextContent('Works shown: 3');
  });

  it('limits the tag list to the chosen kind', async () => {
    const { user } = renderPortfolio();
    expect(tagButtons()).toEqual(expect.arrayContaining(['Oil', 'Warhammer']));

    await user.click(screen.getByRole('button', { name: 'Paintings' }));
    expect(tagButtons()).toContain('Oil');
    expect(tagButtons()).not.toContain('Warhammer');

    await user.click(screen.getByRole('button', { name: 'Figurines' }));
    expect(tagButtons()).toContain('Warhammer');
    expect(tagButtons()).not.toContain('Oil');
  });

  it('filters by tag and writes it to the URL', async () => {
    const { user } = renderPortfolio('/en/portfolio?kind=figurine');

    await user.click(screen.getByRole('button', { name: 'NMM' }));

    expect(tileTitles()).toEqual(getWorks({ kind: 'figurine', tag: 'nmm' }).map((w) => w.title.en));
    expect(screen.getByTestId('search')).toHaveTextContent('?kind=figurine&tag=nmm');
  });

  it('drops a tag that the new kind does not use', async () => {
    const { user } = renderPortfolio('/en/portfolio?tag=nmm');

    await user.click(screen.getByRole('button', { name: 'Paintings' }));

    expect(screen.getByTestId('search')).toHaveTextContent('?kind=painting');
    expect(screen.getByTestId('search')).not.toHaveTextContent('tag=');
    expect(tileTitles()).toHaveLength(3);
  });

  it('reads filters from the URL on entry', () => {
    renderPortfolio('/en/portfolio?kind=painting&tag=olej');

    expect(tileTitles()).toEqual(['Mist over the Marsh']);
    expect(screen.getByRole('button', { name: 'Oil' })).toHaveAttribute('aria-pressed', 'true');
  });
});
