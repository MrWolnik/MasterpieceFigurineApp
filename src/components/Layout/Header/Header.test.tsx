import { act, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/test-utils';
import { Header } from './Header';

function menuButton() {
  return screen.getByRole('button', { name: /menu/i });
}

describe('Header', () => {
  it('links the brand to the home page and shows the navigation', () => {
    renderWithProviders(<Header />, { route: '/pl' });

    expect(screen.getByRole('link', { name: 'MasterpieceFigurineJ' })).toHaveAttribute(
      'href',
      '/pl',
    );
    screen.getByRole('navigation', { name: 'Główna nawigacja' }); // throws if missing
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
    ['/pl/kontakt', 'Kontakt', 'Portfolio'],
    ['/pl/portfolio', 'Portfolio', 'Kontakt'],
    ['/pl/portfolio/', 'Portfolio', 'Kontakt'],
  ])('marks the link of the current page on %s', (route, current, other) => {
    renderWithProviders(<Header />, { route });

    const currentLink = screen.getByRole('link', { name: current });
    expect(currentLink).toHaveAttribute('aria-current', 'page');
    expect(currentLink).toHaveAttribute('data-active', 'true');
    const otherLink = screen.getByRole('link', { name: other });
    expect(otherLink).not.toHaveAttribute('aria-current');
    expect(otherLink).toHaveAttribute('data-active', 'false');
  });

  it('highlights the section on a work page without calling it the current page', () => {
    renderWithProviders(<Header />, { route: '/pl/portfolio/nocny-wartownik' });

    const portfolio = screen.getByRole('link', { name: 'Portfolio' });
    expect(portfolio).toHaveAttribute('data-active', 'true');
    expect(portfolio).not.toHaveAttribute('aria-current');
  });

  it('puts the toggle right before the menu it controls, so Tab enters the open menu', () => {
    renderWithProviders(<Header />);

    const menu = document.getElementById(menuButton().getAttribute('aria-controls') ?? '');
    expect(menu).not.toBeNull();
    expect(menuButton().nextElementSibling).toBe(menu);
    expect(menu).toContainElement(screen.getByRole('navigation', { name: 'Główna nawigacja' }));
    expect(menu).toContainElement(screen.getByRole('navigation', { name: 'Język' }));
  });

  it('highlights nothing on the home page', () => {
    renderWithProviders(<Header />, { route: '/pl' });

    expect(screen.getByRole('link', { name: 'Portfolio' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Kontakt' })).not.toHaveAttribute('aria-current');
  });

  it('opens and closes the menu with the toggle button', async () => {
    const { user } = renderWithProviders(<Header />);
    const menu = document.getElementById('site-menu');

    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton()).toHaveAttribute('aria-controls', 'site-menu');
    expect(menu).toHaveAttribute('data-open', 'false');

    await user.click(menuButton());
    expect(menuButton()).toHaveAttribute('aria-expanded', 'true');
    expect(menuButton()).toHaveAccessibleName('Zamknij menu');
    expect(menu).toHaveAttribute('data-open', 'true');

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
