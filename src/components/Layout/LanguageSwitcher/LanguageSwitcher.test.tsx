import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../test/test-utils';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('links to the same page in every language and marks the current one', () => {
    renderWithProviders(<LanguageSwitcher />, { route: '/pl/kontakt?kind=painting' });

    const polish = screen.getByRole('link', { name: 'PL – Polski' });
    const english = screen.getByRole('link', { name: 'EN – English' });

    expect(polish).toHaveAttribute('href', '/pl/kontakt?kind=painting');
    expect(polish).toHaveAttribute('aria-current', 'true');
    expect(english).toHaveAttribute('href', '/en/contact?kind=painting');
    expect(english).toHaveAttribute('hreflang', 'en');
    expect(english).toHaveAttribute('lang', 'en');
    expect(english).not.toHaveAttribute('aria-current');
  });

  it('is a labelled navigation landmark in the current language', () => {
    renderWithProviders(<LanguageSwitcher />, { route: '/en/privacy', language: 'en' });

    expect(screen.getByRole('navigation', { name: 'Language' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'PL – Polski' })).toHaveAttribute(
      'href',
      '/pl/prywatnosc',
    );
    expect(screen.getByRole('link', { name: 'EN – English' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });
});

describe('LanguageSwitcher without landmark', () => {
  it('renders a labelled group instead of a navigation landmark', () => {
    renderWithProviders(<LanguageSwitcher landmark={false} />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Język' })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
