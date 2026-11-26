import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { OrderForm } from './OrderForm';

function renderForm(route = '/pl/kontakt', language: 'pl' | 'en' = 'pl') {
  const onSubmit = vi.fn(() => Promise.resolve());
  return {
    onSubmit,
    ...renderWithProviders(<OrderForm onSubmit={onSubmit} />, { route, language }),
  };
}

describe('OrderForm', () => {
  it('starts with a figurine and no painting fields', () => {
    renderForm();

    expect(screen.getByRole('radio', { name: 'Malowanie figurki' })).toBeChecked();
    expect(screen.queryByLabelText('Preferowane wymiary')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Technika')).not.toBeInTheDocument();
  });

  it('shows size and technique for a painting and clears them when going back', async () => {
    const { user } = renderForm();

    await user.click(screen.getByRole('radio', { name: 'Obraz na zamówienie' }));
    await user.type(screen.getByLabelText('Preferowane wymiary'), '50 × 70 cm');
    await user.selectOptions(screen.getByLabelText('Technika'), 'Olej');

    await user.click(screen.getByRole('radio', { name: 'Malowanie figurki' }));
    expect(screen.queryByLabelText('Preferowane wymiary')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Obraz na zamówienie' }));
    expect(screen.getByLabelText('Preferowane wymiary')).toHaveValue('');
    expect(screen.getByLabelText('Technika')).toHaveValue('');
  });

  it('changes the description hint with the order type', async () => {
    const { user } = renderForm();
    const description = screen.getByLabelText(/Opis – co chcesz osiągnąć/);
    expect(description).toHaveAttribute('placeholder', expect.stringMatching(/figurka/));

    await user.click(screen.getByRole('radio', { name: 'Obraz na zamówienie' }));
    expect(description).toHaveAttribute('placeholder', expect.stringMatching(/obraz zawiśnie/));
  });

  it('?kind=painting presets the painting order', () => {
    renderForm('/en/contact?kind=painting', 'en');

    expect(screen.getByRole('radio', { name: 'Commissioned painting' })).toBeChecked();
    expect(screen.getByLabelText('Preferred size')).toBeInTheDocument();
  });

  it('shows errors next to the right fields, linked for screen readers', async () => {
    const { user, onSubmit } = renderForm();

    await user.type(screen.getByLabelText(/Opis/), 'Za krótko');
    await user.click(screen.getByRole('button', { name: 'Wyślij zgłoszenie' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Imię/)).toHaveAccessibleDescription('To pole jest wymagane.');
    expect(screen.getByLabelText('E-mail')).toHaveAccessibleDescription(
      'Podaj e-mail albo telefon.',
    );
    expect(screen.getByLabelText(/Opis/)).toHaveAccessibleDescription(
      'Opis musi mieć co najmniej 20 znaków.',
    );
    expect(screen.getByLabelText(/Opis/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('checkbox', { name: /Wyrażam zgodę/ })).toHaveAccessibleDescription(
      'Zgoda jest wymagana, żeby wysłać zgłoszenie.',
    );
  });

  it('submits a valid figurine order without painting fields', async () => {
    const { user, onSubmit } = renderForm();

    await user.type(screen.getByLabelText(/Imię/), 'Anna');
    await user.type(screen.getByLabelText('Telefon'), '+48 600 123 456');
    await user.type(screen.getByLabelText(/Opis/), 'Space Marine w barwach zakonu.');
    await user.click(screen.getByRole('checkbox', { name: /Wyrażam zgodę/ }));
    await user.click(screen.getByRole('button', { name: 'Wyślij zgłoszenie' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    const [order] = onSubmit.mock.calls[0] as unknown as [Record<string, unknown>];
    expect(order).toMatchObject({ kind: 'figurine', name: 'Anna', phone: '+48 600 123 456' });
    expect(order).not.toHaveProperty('dimensions');
  });
});
