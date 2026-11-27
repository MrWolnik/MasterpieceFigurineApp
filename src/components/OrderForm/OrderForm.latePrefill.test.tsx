import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { emptyOrder, type OrderFormValues } from '../../lib/orderSchema';
import { renderWithProviders } from '../../test/test-utils';
import { OrderForm } from './OrderForm';

// On a prerendered page the URL prefill arrives only after hydration; this stands in for that.
const prefill = vi.hoisted(() => ({ current: undefined as OrderFormValues | undefined }));
vi.mock('./useOrderPrefill', () => ({
  useOrderPrefill: () => prefill.current ?? emptyOrder(),
}));

const LATE = emptyOrder({ kind: 'painting', description: 'Chcę podobną pracę do: Złoty ogród. ' });

function renderForm() {
  prefill.current = emptyOrder();
  const view = renderWithProviders(<OrderForm onSubmit={() => Promise.resolve()} />);
  const arrive = () => {
    prefill.current = LATE;
    view.rerender(<OrderForm onSubmit={() => Promise.resolve()} />);
  };
  return { ...view, arrive };
}

const painting = () => screen.getByRole('radio', { name: 'Obraz na zamówienie' });
const figurine = () => screen.getByRole('radio', { name: 'Malowanie figurki' });
const description = () => screen.getByLabelText(/Opis – co chcesz osiągnąć/);

describe('OrderForm prefill that arrives after hydration', () => {
  it('fills the order type and description in, keeping what the user typed', async () => {
    const { user, arrive } = renderForm();
    await user.type(screen.getByLabelText(/Imię/), 'Anna');

    arrive();

    expect(painting()).toBeChecked();
    expect(description()).toHaveValue(LATE.description);
    expect(screen.getByLabelText(/Imię/)).toHaveValue('Anna');
  });

  it('keeps an order type and a description the user already chose', async () => {
    const { user, arrive } = renderForm();
    await user.click(painting());
    await user.click(figurine());
    await user.type(description(), 'Mój własny opis zlecenia.');

    arrive();

    expect(figurine()).toBeChecked();
    expect(description()).toHaveValue('Mój własny opis zlecenia.');
  });
});
