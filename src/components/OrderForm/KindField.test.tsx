import { screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { emptyOrder, type OrderFormValues } from '../../lib/orderSchema';
import { renderWithProviders } from '../../test/test-utils';
import { KindField } from './KindField';

/** KindField plus the painting-only inputs it clears (registered, as PaintingFields does). */
function Harness({ defaults }: { defaults: Partial<OrderFormValues> }) {
  const { register, resetField } = useForm<OrderFormValues>({
    defaultValues: emptyOrder(defaults),
  });
  return (
    <>
      <KindField register={register} resetField={resetField} />
      <input aria-label="dimensions" {...register('dimensions')} />
      <input aria-label="technique" {...register('technique')} />
    </>
  );
}

describe('KindField', () => {
  it('offers both order types in a labelled group with the current one chosen', () => {
    renderWithProviders(<Harness defaults={{ kind: 'painting' }} />);

    const group = screen.getByRole('group', { name: 'Rodzaj zlecenia' });
    expect(group).toContainElement(screen.getByRole('radio', { name: 'Malowanie figurki' }));
    expect(screen.getByRole('radio', { name: 'Obraz na zamówienie' })).toBeChecked();
  });

  it('drops the painting-only answers when the type changes', async () => {
    const { user } = renderWithProviders(
      <Harness defaults={{ kind: 'painting', dimensions: '50 × 70 cm', technique: 'oil' }} />,
    );
    expect(screen.getByLabelText('dimensions')).toHaveValue('50 × 70 cm');

    await user.click(screen.getByRole('radio', { name: 'Malowanie figurki' }));

    expect(screen.getByRole('radio', { name: 'Malowanie figurki' })).toBeChecked();
    expect(screen.getByLabelText('dimensions')).toHaveValue('');
    expect(screen.getByLabelText('technique')).toHaveValue('');
  });
});
