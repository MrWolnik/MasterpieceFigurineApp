import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createMemoryRouter, MemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import { createI18n, type Language } from '../lib/i18n';

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial URL for the in-memory router. Defaults to `/pl`. */
  route?: string;
  /** UI language. Defaults to Polish. */
  language?: Language;
}

interface RenderWithProvidersResult extends RenderResult {
  user: UserEvent;
}

/** Renders `ui` inside the app providers (router + i18n) and returns a ready user-event instance. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/pl', language = 'pl', ...options }: ProviderOptions = {},
): RenderWithProvidersResult {
  const i18n = createI18n(language);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </I18nextProvider>
    );
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}

/**
 * Renders a route tree in a memory router starting at `route`. Use it for code that needs real
 * routes (layouts, loaders, redirects); the routes provide their own i18n through `Layout`.
 */
export function renderRoutes(routes: RouteObject[], { route = '/pl' }: { route?: string } = {}) {
  const router = createMemoryRouter(routes, { initialEntries: [route] });
  render(<RouterProvider router={router} />);
  return { router, user: userEvent.setup() };
}
