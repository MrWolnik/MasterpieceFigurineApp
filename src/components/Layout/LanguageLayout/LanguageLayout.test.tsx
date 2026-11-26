import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { createI18n } from '../../../lib/i18n';
import { LanguageLayout } from './LanguageLayout';

describe('LanguageLayout', () => {
  it('renders the language switcher and the child page', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/pl',
          Component: LanguageLayout,
          children: [{ index: true, element: <h1>Child</h1> }],
        },
      ],
      { initialEntries: ['/pl'] },
    );
    render(
      <I18nextProvider i18n={createI18n()}>
        <RouterProvider router={router} />
      </I18nextProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Child' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Język' })).toBeInTheDocument();
  });
});
