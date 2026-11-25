import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';
import { renderWithProviders } from './test/test-utils';

describe('App', () => {
  it('renders the Polish tagline by default', () => {
    renderWithProviders(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'MasterpieceFigurineJ' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Malowanie figurek i obrazy na zamówienie')).toBeInTheDocument();
  });

  it('renders the English tagline when the language is English', () => {
    renderWithProviders(<App />, { language: 'en' });

    expect(screen.getByText('Figurine painting and commissioned paintings')).toBeInTheDocument();
  });
});
