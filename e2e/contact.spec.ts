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
