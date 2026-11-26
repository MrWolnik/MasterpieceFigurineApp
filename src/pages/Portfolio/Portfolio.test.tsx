import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getWorks } from '../../lib/works';
import { renderWithProviders } from '../../test/test-utils';
import { Portfolio } from './Portfolio';

describe('Portfolio', () => {
  it('renders the heading, intro and a tile for every work', () => {
    renderWithProviders(<Portfolio />, { route: '/pl/portfolio' });

    expect(screen.getByRole('heading', { level: 1, name: 'Portfolio' })).toBeInTheDocument();
    expect(screen.getByText(/Wybrane prace/)).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(getWorks().length);
  });

  it('renders the intro in English', () => {
    renderWithProviders(<Portfolio />, { route: '/en/portfolio', language: 'en' });

    expect(screen.getByText(/Selected works/)).toBeInTheDocument();
  });
});
