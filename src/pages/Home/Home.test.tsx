import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { Home } from './Home';

describe('Home', () => {
  it('renders the Polish tagline by default', () => {
    renderWithProviders(<Home />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'MasterpieceFigurineJ' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Malowanie figurek i obrazy na zamówienie')).toBeInTheDocument();
  });

  it('renders the English tagline when the language is English', () => {
    renderWithProviders(<Home />, { language: 'en' });

    expect(screen.getByText('Figurine painting and commissioned paintings')).toBeInTheDocument();
  });
});
