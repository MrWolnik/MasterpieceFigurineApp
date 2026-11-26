import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { Styleguide } from './Styleguide';
import { colorTokens } from './styleguideTokens';

describe('Styleguide', () => {
  it('lists every colour token', () => {
    renderWithProviders(<Styleguide />);

    const colours = screen.getByRole('region', { name: 'Colours' });
    for (const { name } of colorTokens) {
      expect(within(colours).getByText(`--color-${name}`)).toBeInTheDocument();
    }
  });

  it('shows the heading scale with Polish diacritics', () => {
    renderWithProviders(<Styleguide />);

    const typography = screen.getByRole('region', { name: 'Typography' });
    for (const level of [1, 2, 3, 4]) {
      expect(
        within(typography).getByRole('heading', { level, name: /ąćęłńóśźż/ }),
      ).toBeInTheDocument();
    }
  });
});
