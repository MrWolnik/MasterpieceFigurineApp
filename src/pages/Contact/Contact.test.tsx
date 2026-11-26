import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderPage } from '../../test/test-utils';
import { Contact } from './Contact';

describe('Contact page', () => {
  it('shows the title, the about section and the contact details', () => {
    renderPage(<Contact />, { path: '/:lang/kontakt', route: '/pl/kontakt' });

    expect(screen.getByRole('heading', { level: 1, name: 'Kontakt' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'O mnie' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Dane kontaktowe' })).toBeInTheDocument();
  });
});
