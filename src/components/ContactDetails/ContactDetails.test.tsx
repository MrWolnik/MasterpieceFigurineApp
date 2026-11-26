import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { site } from '../../config/site';
import { renderWithProviders } from '../../test/test-utils';
import { ContactDetails } from './ContactDetails';

describe('ContactDetails', () => {
  it('shows the e-mail from site.ts as a mailto link', () => {
    renderWithProviders(<ContactDetails />, { language: 'en' });

    expect(
      screen.getByRole('link', { name: `Send an e-mail: ${site.contactEmail}` }),
    ).toHaveAttribute('href', `mailto:${site.contactEmail}`);
  });

  it('shows the social media list', () => {
    renderWithProviders(<ContactDetails />);

    expect(screen.getByRole('list', { name: 'Media społecznościowe' })).toBeInTheDocument();
  });
});
