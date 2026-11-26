import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { createI18n } from '../../lib/i18n';
import { Layout } from './Layout';

function renderLayout() {
  const router = createMemoryRouter(
    [{ path: '/pl', Component: Layout, children: [{ index: true, element: <h1>Child</h1> }] }],
    { initialEntries: ['/pl'] },
  );
  render(
    <I18nextProvider i18n={createI18n()}>
      <RouterProvider router={router} />
    </I18nextProvider>,
  );
}

describe('Layout', () => {
  it('renders header, footer and the child page inside the main landmark', async () => {
    renderLayout();

    const heading = await screen.findByRole('heading', { name: 'Child' });
    expect(screen.getByRole('main')).toContainElement(heading);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('starts with a skip link that targets the focusable main content', async () => {
    renderLayout();
    await screen.findByRole('heading', { name: 'Child' });

    const skipLink = screen.getAllByRole('link')[0];
    expect(skipLink).toHaveTextContent('Przejdź do treści');
    expect(skipLink).toHaveAttribute('href', '#main');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });

  it('has a single navigation landmark per name', async () => {
    renderLayout();
    await screen.findByRole('heading', { name: 'Child' });

    const names = screen.getAllByRole('navigation').map((nav) => nav.getAttribute('aria-label'));
    expect(new Set(names).size).toBe(names.length);
  });
});
