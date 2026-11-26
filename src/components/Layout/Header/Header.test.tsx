import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/test-utils';
import { Header } from './Header';

function menuButton() {
  return screen.getByRole('button', { name: /menu/i });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Header', () => {
  it('links the brand to the home page and shows the navigation', () => {
    renderWithProviders(<Header />, { route: '/pl' });

    expect(screen.getByRole('link', { name: 'MasterpieceFigurineJ' })).toHaveAttribute(
      'href',
      '/pl',
    );
    const nav = screen.getByRole('navigation', { name: 'Główna nawigacja' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveAttribute(
      'href',
      '/pl/portfolio',
    );
    expect(screen.getByRole('link', { name: 'Kontakt' })).toHaveAttribute('href', '/pl/kontakt');
    expect(screen.getByRole('navigation', { name: 'Język' })).toBeInTheDocument();
  });

  it('uses English paths and labels in English', () => {
    renderWithProviders(<Header />, { route: '/en', language: 'en' });

    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/en/contact');
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  it.each([
    ['/pl/kontakt', 'Kontakt'],
    ['/pl/portfolio', 'Portfolio'],
    ['/pl/portfolio/nocny-wartownik', 'Portfolio'],
  ])('highlights the active page link on %s', (route, active) => {
    renderWithProviders(<Header />, { route });

    for (const name of ['Portfolio', 'Kontakt']) {
      const link = screen.getByRole('link', { name });
      if (name === active) {
        expect(link).toHaveAttribute('aria-current', 'page');
      } else {
        expect(link).not.toHaveAttribute('aria-current');
      }
    }
  });

  it('highlights nothing on the home page', () => {
    renderWithProviders(<Header />, { route: '/pl' });

    expect(screen.getByRole('link', { name: 'Portfolio' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Kontakt' })).not.toHaveAttribute('aria-current');
  });

  it('opens and closes the menu with the toggle button', async () => {
    const { user } = renderWithProviders(<Header />);
    const nav = screen.getByRole('navigation', { name: 'Główna nawigacja' });

    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton()).toHaveAttribute('aria-controls', nav.id);
    expect(nav).toHaveAttribute('data-open', 'false');

    await user.click(menuButton());
    expect(menuButton()).toHaveAttribute('aria-expanded', 'true');
    expect(menuButton()).toHaveAccessibleName('Zamknij menu');
    expect(nav).toHaveAttribute('data-open', 'true');

    await user.click(menuButton());
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton()).toHaveAccessibleName('Otwórz menu');
  });

  it('closes the menu on Escape and returns focus to the toggle', async () => {
    const { user } = renderWithProviders(<Header />);

    await user.click(menuButton());
    await user.tab(); // focus moves into the page
    await user.keyboard('{Escape}');

    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton()).toHaveFocus();
  });

  it('closes the menu after navigating to another page', async () => {
    const { user } = renderWithProviders(<Header />);

    await user.click(menuButton());
    await user.click(screen.getByRole('link', { name: 'Kontakt' }));

    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('link', { name: 'Kontakt' })).toHaveAttribute('aria-current', 'page');
  });

  it('closes the menu when following a link to the current page', async () => {
    const { user } = renderWithProviders(<Header />, { route: '/pl/kontakt' });

    await user.click(menuButton());
    await user.click(screen.getByRole('link', { name: 'Kontakt' }));

    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the menu when the window grows to the desktop layout', async () => {
    let notify: ((event: MediaQueryListEvent) => void) | undefined;
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
          notify = listener;
        },
        removeEventListener: vi.fn(),
      })),
    );
    const { user } = renderWithProviders(<Header />);

    await user.click(menuButton());
    expect(menuButton()).toHaveAttribute('aria-expanded', 'true');

    act(() => {
      notify?.({ matches: true } as MediaQueryListEvent);
    });
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
  });
});
