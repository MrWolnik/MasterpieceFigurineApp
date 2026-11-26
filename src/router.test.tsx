import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createAppRoutes } from './router';
import { renderRoutes } from './test/test-utils';

function renderApp(route: string) {
  return renderRoutes(createAppRoutes(), { route });
}

function mockBrowserLanguages(languages: string[]) {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages);
}

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

    await user.click(
      within(screen.getByRole('banner')).getByRole('link', { name: 'EN – English' }),
    );

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

  it.each([
    ['/EN/contact', '/en/contact', 'Contact'],
    ['/en/Contact', '/en/contact', 'Contact'],
    ['/PL', '/pl', 'MasterpieceFigurineJ'],
    ['/pl/Portfolio/x', '/pl/portfolio/x', 'Praca: x'],
  ])('redirects %s to the lower-case canonical URL %s', async (path, expected, heading) => {
    const { router } = renderApp(path);

    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(expected);
  });

  it('keeps the language of the page on screen when a language switch is interrupted', async () => {
    const { router } = renderApp('/pl/kontakt');
    await screen.findByRole('heading', { level: 1, name: 'Kontakt' });

    void router.navigate('/en/contact');
    await router.navigate('/pl/portfolio');

    expect(await screen.findByRole('heading', { level: 1, name: 'Portfolio' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kontakt' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('pl');
  });

  it('moves focus to the main content after navigating, but not on the first load', async () => {
    const { user } = renderApp('/pl');
    await screen.findByRole('heading', { level: 1, name: 'MasterpieceFigurineJ' });
    expect(screen.getByRole('main')).not.toHaveFocus();

    await user.click(within(screen.getByRole('banner')).getByRole('link', { name: 'Kontakt' }));

    await screen.findByRole('heading', { level: 1, name: 'Kontakt' });
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('moves focus to the main content after switching language', async () => {
    const { user } = renderApp('/pl/kontakt');
    await screen.findByRole('heading', { level: 1, name: 'Kontakt' });

    await user.click(
      within(screen.getByRole('banner')).getByRole('link', { name: 'EN – English' }),
    );

    await screen.findByRole('heading', { level: 1, name: 'Contact' });
    expect(screen.getByRole('main')).toHaveFocus();
  });
});
