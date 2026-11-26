import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { OrderSuccess } from './OrderSuccess';

describe('OrderSuccess', () => {
  it('is focused and announced, and lets the user start again', async () => {
    const onReset = vi.fn();
    const { user } = renderWithProviders(<OrderSuccess onReset={onReset} />, { language: 'en' });

    expect(screen.getByRole('status')).toHaveFocus();
    expect(
      screen.getByRole('heading', { name: 'Thank you for your request!' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Send another request' }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
