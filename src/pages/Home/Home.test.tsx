import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { Home } from './Home';

describe('Home', () => {
  it('shows the hero and a featured section the scroll indicator points to', () => {
    renderWithProviders(<Home />);

    expect(screen.getByRole('heading', { level: 1, name: 'Julia' })).toBeInTheDocument();
    const featured = screen.getByRole('region', { name: 'Wyróżnione prace' });
    expect(featured).toHaveAttribute('id', 'featured');
    expect(screen.getByRole('link', { name: 'Przewiń do wyróżnionych prac' })).toHaveAttribute(
      'href',
      `#${featured.id}`,
    );
  });

  it('is translated to English', () => {
    renderWithProviders(<Home />, { language: 'en' });

    expect(screen.getByText('Figurine painting and commissioned paintings')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Featured works' })).toBeInTheDocument();
  });
});
