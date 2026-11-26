import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Language } from '../../lib/i18n';
import { renderRoutes } from '../../test/test-utils';
import { Layout } from './Layout';

function renderLayout(lang: Language = 'pl') {
  renderRoutes(
    [
      {
        path: `/${lang}`,
        element: <Layout lang={lang} />,
        children: [{ index: true, element: <h1>Child</h1> }],
      },
    ],
    { route: `/${lang}` },
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

  it('renders in the language of its route and sets <html lang>', async () => {
    renderLayout('en');
    await screen.findByRole('heading', { name: 'Child' });

    expect(screen.getAllByRole('link')[0]).toHaveTextContent('Skip to content');
    expect(document.documentElement.lang).toBe('en');
  });
});
