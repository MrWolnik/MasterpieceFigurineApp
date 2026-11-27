import { screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { emptyOrder, type OrderFormValues } from '../../lib/orderSchema';
import { renderWithProviders } from '../../test/test-utils';
import { ConsentField } from './ConsentField';

function Harness({ error }: { error?: string }) {
  const { register } = useForm<OrderFormValues>({ defaultValues: emptyOrder() });
  return <ConsentField register={register} error={error} />;
}

describe('ConsentField', () => {
  it('is a required checkbox whose label links to the policy in a new tab', () => {
    renderWithProviders(<Harness />, { language: 'en' });

    const checkbox = screen.getByRole('checkbox', { name: /I agree/ });
    expect(checkbox).toBeRequired();
    expect(checkbox).not.toBeChecked();
    expect(checkbox).toHaveAttribute('aria-invalid', 'false');
    expect(checkbox).not.toHaveAttribute('aria-describedby');
    const policy = screen.getByRole('link', { name: 'privacy policy' });
    expect(policy).toHaveAttribute('href', '/en/privacy');
    expect(policy).toHaveAttribute('target', '_blank');
  });

  it('announces its error with the checkbox', () => {
    renderWithProviders(<Harness error="consent" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInvalid();
    expect(checkbox).toHaveAccessibleDescription('Zgoda jest wymagana, żeby wysłać zgłoszenie.');
  });

  it('can be ticked', async () => {
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole('checkbox'));

    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
