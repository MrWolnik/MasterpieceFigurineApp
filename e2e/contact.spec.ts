import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './helpers.js';

test.describe('contact page', () => {
  test('shows the about section, contact details and the form', async ({ page }) => {
    await page.goto('/en/contact');

    await expect(page.getByRole('heading', { level: 2, name: 'About me' })).toBeVisible();
    await expect(
      page.getByRole('main').getByRole('link', { name: /^Send an e-mail:/ }),
    ).toHaveAttribute('href', /^mailto:/);
    await expect(page.getByRole('form', { name: 'Order request' })).toBeVisible();
  });

  test('has no accessibility violations, also with errors shown', async ({ page }) => {
    await page.goto('/pl/kontakt?kind=painting');
    await expect(page.getByLabel('Preferowane wymiary')).toBeVisible();
    await expectNoA11yViolations(page);

    await page.getByRole('button', { name: 'Wyślij zgłoszenie' }).click();
    await expect(page.getByText('To pole jest wymagane.')).toBeVisible();
    await expectNoA11yViolations(page);
  });
});

test.describe('privacy policy', () => {
  test('is available in both languages without accessibility violations', async ({ page }) => {
    await page.goto('/pl/prywatnosc');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Polityka prywatności' }),
    ).toBeVisible();
    await expectNoA11yViolations(page);

    await page.goto('/en/privacy');
    await expect(page.getByRole('heading', { level: 1, name: 'Privacy policy' })).toBeVisible();
  });
});

test.describe('order form prefill', () => {
  test('a plain "Contact" link after "I want a similar one" gives a fresh form', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/pl/kontakt?kind=painting&ref=zloty-ogrod');
    await expect(page.getByLabel(/Opis/)).toHaveValue(/Złoty ogród/);

    if (isMobile) await page.getByRole('button', { name: 'Otwórz menu' }).click();
    await page
      .getByRole('navigation', { name: 'Główna nawigacja' })
      .getByRole('link', { name: 'Kontakt' })
      .click();

    await expect(page).toHaveURL(/\/pl\/kontakt$/);
    await expect(page.getByRole('radio', { name: 'Malowanie figurki' })).toBeChecked();
    await expect(page.getByLabel(/Opis/)).toHaveValue('');
  });

  test('switching language translates the prefill but keeps what the user typed', async ({
    page,
  }) => {
    await page.goto('/pl/kontakt?ref=zloty-ogrod');
    await page.getByLabel(/Imię/).fill('Anna');

    await page.getByRole('contentinfo').getByRole('link', { name: /EN/ }).click();

    await expect(page.getByLabel(/Description/)).toHaveValue(/^I would like a work similar to: /);
    await expect(page.getByLabel(/Name/)).toHaveValue('Anna');
  });

  test('switching language keeps a description the user edited', async ({ page }) => {
    await page.goto('/pl/kontakt?ref=zloty-ogrod');
    await page.getByLabel(/Opis/).fill('Mój własny opis zlecenia, dość długi.');

    await page.getByRole('contentinfo').getByRole('link', { name: /EN/ }).click();

    await expect(page.getByLabel(/Description/)).toHaveValue(
      'Mój własny opis zlecenia, dość długi.',
    );
  });
});
