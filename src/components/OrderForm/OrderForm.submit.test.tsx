import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { submitOrder } from '../../lib/submitOrder';
import { server } from '../../test/server';
import { renderWithProviders } from '../../test/test-utils';
import { OrderForm } from './OrderForm';

/** Captures what the form posts to Netlify and answers with `status`. */
function netlify(status = 200) {
  const requests: FormData[] = [];
  server.use(
    http.post('*/', async ({ request }) => {
      requests.push(await request.formData());
      return new HttpResponse(null, { status });
    }),
  );
  return requests;
}

async function fillValidFigurine(route = '/pl/kontakt') {
  const view = renderWithProviders(<OrderForm onSubmit={submitOrder} />, { route });
  const { user } = view;
  await user.type(screen.getByLabelText(/Imię/), 'Anna');
  await user.type(screen.getByLabelText('E-mail'), 'anna@example.com');
  await user.type(screen.getByLabelText(/Opis/), 'Space Marine w barwach zakonu.');
  await user.click(screen.getByRole('checkbox', { name: /Wyrażam zgodę/ }));
  return view;
}

const send = () => screen.getByRole('button', { name: 'Wyślij zgłoszenie' });

describe('OrderForm submission', () => {
  it('shows a confirmation after a successful submission', async () => {
    const requests = netlify();
    const { user } = await fillValidFigurine();

    await user.click(send());

    expect(
      await screen.findByRole('heading', { name: 'Dziękuję za zgłoszenie!' }),
    ).toBeInTheDocument();
    expect(requests).toHaveLength(1);
    expect(requests[0]?.get('subject')).toBe('[Figurka] Nowe zgłoszenie – Anna');
  });

  it('keeps the data and shows a message when the server fails', async () => {
    netlify(500);
    const { user } = await fillValidFigurine();

    await user.click(send());

    expect(await screen.findByRole('alert')).toHaveTextContent('Nie udało się wysłać zgłoszenia.');
    expect(screen.getByLabelText(/Imię/)).toHaveValue('Anna');
    expect(screen.getByLabelText(/Opis/)).toHaveValue('Space Marine w barwach zakonu.');
  });

  it('does not send anything when the honeypot is filled', async () => {
    const requests = netlify();
    const { user, container } = await fillValidFigurine();
    const honeypot = container.querySelector<HTMLInputElement>('input[name="bot-field"]');
    if (!honeypot) throw new Error('Missing honeypot');

    await user.type(honeypot, 'spam');
    await user.click(send());

    expect(
      await screen.findByRole('heading', { name: 'Dziękuję za zgłoszenie!' }),
    ).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('sends no painting fields for a figurine, even after filling them in', async () => {
    const requests = netlify();
    const { user } = await fillValidFigurine('/pl/kontakt?kind=painting');
    await user.type(screen.getByLabelText('Preferowane wymiary'), '50 × 70 cm');
    await user.click(screen.getByRole('radio', { name: 'Malowanie figurki' }));

    await user.click(send());

    await screen.findByRole('heading', { name: 'Dziękuję za zgłoszenie!' });
    expect(requests[0]?.get('kind')).toBe('figurine');
    expect(requests[0]?.has('dimensions')).toBe(false);
    expect(requests[0]?.has('technique')).toBe(false);
  });
});
