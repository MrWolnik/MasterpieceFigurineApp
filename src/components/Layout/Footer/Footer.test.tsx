import { screen, within } from '@testing-library/react';
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

  it('shows the copyright with the build year and brand', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByText(`© ${String(__BUILD_YEAR__)} ${site.brand}`)).toBeInTheDocument();
  });

  it('lists social media in the order of the config', () => {
    renderWithProviders(<Footer />);

    const list = screen.getByRole('list', { name: 'Media społecznościowe' });
    const links = within(list).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('aria-label'))).toEqual(
      site.socials.map(({ label }) => `${label} (otwiera się w nowej karcie)`),
    );
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      site.socials.map(({ url }) => url),
    );
  });
});
