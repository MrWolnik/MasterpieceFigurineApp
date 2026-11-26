import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { NotFound } from './NotFound';

describe('NotFound', () => {
  it('explains the error and links to the Polish home page', () => {
    renderWithProviders(<NotFound />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Nie znaleziono strony' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Wróć na stronę główną' })).toHaveAttribute(
      'href',
      '/pl',
    );
  });

  it('links to the English home page in English', () => {
    renderWithProviders(<NotFound />, { language: 'en' });

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to the home page' })).toHaveAttribute(
      'href',
      '/en',
    );
  });
});
