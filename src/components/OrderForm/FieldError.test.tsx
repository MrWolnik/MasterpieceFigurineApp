import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { FieldError } from './FieldError';

describe('FieldError', () => {
  it('translates a known error key', () => {
    renderWithProviders(<FieldError id="e" message="contact" />, { language: 'en' });

    expect(screen.getByText('Give an e-mail or a phone number.')).toHaveAttribute('id', 'e');
  });

  it('shows any other message as it is', () => {
    renderWithProviders(<FieldError message="Something else" />);

    expect(screen.getByText('Something else')).toBeInTheDocument();
  });
});
