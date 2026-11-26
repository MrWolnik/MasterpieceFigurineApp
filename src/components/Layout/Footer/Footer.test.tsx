import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { site } from '../../../config/site';
import { renderWithProviders } from '../../../test/test-utils';
import { Footer } from './Footer';

describe('Footer', () => {
  it('shows the contact e-mail as a mailto link', () => {
    renderWithProviders(<Footer />);

    expect(
      screen.getByRole('link', { name: `Napisz e-mail: ${site.contactEmail}` }),
    ).toHaveAttribute('href', `mailto:${site.contactEmail}`);
  });

  it('links to the privacy policy in the current language', () => {
    renderWithProviders(<Footer />, { route: '/en', language: 'en' });

    expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute(
      'href',
      '/en/privacy',
    );
  });

  it('has a language switcher that is not a second navigation landmark', () => {
    renderWithProviders(<Footer />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Język' })).toBeInTheDocument();
  });

  it('shows the copyright with the current year and brand', () => {
    renderWithProviders(<Footer />);

    expect(
      screen.getByText(`© ${String(new Date().getFullYear())} ${site.brand}`),
    ).toBeInTheDocument();
  });

  it('lists social media in the order of the config', () => {
    renderWithProviders(<Footer />);

    // No links are configured yet, so tests (DEV mode) see the grey placeholders.
    expect(
      screen.getByRole('list', { name: 'Media społecznościowe' }).querySelectorAll('[data-icon]'),
    ).toHaveLength(site.socials.length);
  });
});
