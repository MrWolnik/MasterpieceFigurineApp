import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { Hero } from './Hero';

describe('Hero', () => {
  it("shows Julia's name, photo and description in Polish", () => {
    renderWithProviders(<Hero nextSectionId="next" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Julia' })).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Julia przy swoim stanowisku malarskim' }),
    ).toHaveAttribute('src', '/julia.svg');
    expect(screen.getByText(/Każde zlecenie wyceniam indywidualnie/)).toBeInTheDocument();
  });

  it('links the order button to the contact page in the active language', () => {
    renderWithProviders(<Hero nextSectionId="next" />, { language: 'en' });

    expect(screen.getByRole('link', { name: 'Order a painting' })).toHaveAttribute(
      'href',
      '/en/contact',
    );
  });

  it('points the scroll indicator at the next section', () => {
    renderWithProviders(<Hero nextSectionId="featured" />);

    expect(screen.getByRole('link', { name: 'Przewiń do wyróżnionych prac' })).toHaveAttribute(
      'href',
      '#featured',
    );
  });
});
