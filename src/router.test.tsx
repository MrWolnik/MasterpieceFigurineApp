import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from './lib/i18n';
import { createAppRoutes } from './router';

function renderApp(initialEntry: string) {
  const i18n = createI18n();
  const router = createMemoryRouter(createAppRoutes(i18n), { initialEntries: [initialEntry] });
  render(
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>,
  );
  return { router, user: userEvent.setup() };
}

function mockBrowserLanguages(languages: string[]) {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages);
}

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.lang = '';
});

describe('app routes', () => {
  it.each([
    [['en-US'], '/en'],
    [['pl-PL'], '/pl'],
    [['de-DE'], '/pl'],
  ])('redirects / for browser languages %j to %s', async (browserLanguages, expected) => {
    mockBrowserLanguages(browserLanguages);
    const { router } = renderApp('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'MasterpieceFigurineJ' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(expected);
  });

  it.each([
    ['/pl/portfolio', 'Portfolio', 'pl'],
    ['/pl/portfolio/nocny-wartownik', 'Praca: nocny-wartownik', 'pl'],
    ['/pl/kontakt', 'Kontakt', 'pl'],
    ['/pl/prywatnosc', 'Polityka prywatności', 'pl'],
    ['/en/portfolio', 'Portfolio', 'en'],
    ['/en/portfolio/nocny-wartownik', 'Work: nocny-wartownik', 'en'],
    ['/en/contact', 'Contact', 'en'],
    ['/en/privacy', 'Privacy policy', 'en'],
  ])('renders %s in the right language', async (path, heading, lang) => {
    renderApp(path);

    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe(lang);
  });

  it('switches language on the same page and updates <html lang>', async () => {
    const { router, user } = renderApp('/pl/kontakt?kind=painting');
    await screen.findByRole('heading', { level: 1, name: 'Kontakt' });
    expect(document.documentElement.lang).toBe('pl');

    await user.click(screen.getByRole('link', { name: 'EN – English' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Contact' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/en/contact');
    expect(router.state.location.search).toBe('?kind=painting');
    expect(document.documentElement.lang).toBe('en');
  });

  it("redirects another language's slug to the canonical page", async () => {
    const { router } = renderApp('/en/kontakt?kind=painting');

    expect(await screen.findByRole('heading', { level: 1, name: 'Contact' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/en/contact');
    expect(router.state.location.search).toBe('?kind=painting');
  });

  it('shows the 404 page in the language of the prefix for unknown pages', async () => {
    renderApp('/en/no-such-page');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');
  });

  it('shows the 404 page in the browser language for an unknown prefix', async () => {
    mockBrowserLanguages(['en-GB']);
    renderApp('/de/kontakt');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to the home page' })).toHaveAttribute(
      'href',
      '/en',
    );
  });
});
