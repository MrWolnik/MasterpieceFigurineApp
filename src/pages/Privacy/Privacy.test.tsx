import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { site } from '../../config/site';
import { renderPage } from '../../test/test-utils';
import { Privacy } from './Privacy';

describe('Privacy page', () => {
  it('renders the policy in Polish', () => {
    renderPage(<Privacy />, { path: '/:lang/prywatnosc', route: '/pl/prywatnosc' });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Polityka prywatności' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Twoje prawa' })).toBeInTheDocument();
    expect(screen.getByText(/Netlify, Inc\./)).toBeInTheDocument();
  });

  it('renders the policy in English with the contact e-mail', () => {
    renderPage(<Privacy />, { path: '/:lang/privacy', route: '/en/privacy' });

    expect(screen.getByRole('heading', { level: 1, name: 'Privacy policy' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(6);
    expect(screen.getByRole('link', { name: /Send an e-mail/ })).toHaveAttribute(
      'href',
      `mailto:${site.contactEmail}`,
    );
  });
});
