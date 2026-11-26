import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { About } from './About';

describe('About', () => {
  it('says Julia takes figurine and painting commissions, quoted individually', () => {
    renderWithProviders(<About />);

    expect(screen.getByRole('heading', { level: 2, name: 'O mnie' })).toBeInTheDocument();
    expect(screen.getByText(/zlecenia na malowanie figurek i na obrazy/)).toBeInTheDocument();
  });

  it('lists the 4 collaboration steps in order, including the custom quote', () => {
    renderWithProviders(<About />, { language: 'en' });

    const steps = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(steps).toHaveLength(4);
    expect(steps[1]).toHaveTextContent('Custom quote');
  });
});
