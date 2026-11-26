import { expect, test, type Page, type Request } from '@playwright/test';

/** Intercepts the Netlify POST to `/` and returns the captured request once it is sent. */
function interceptNetlify(page: Page): Promise<Request> {
  return new Promise((resolve) => {
    void page.route('**/', async (route) => {
      const request = route.request();
      if (request.method() !== 'POST') return route.fallback();
      resolve(request);
      return route.fulfill({ status: 200, body: '' });
    });
  });
}

/** Value of one text field in a multipart body. */
function field(body: string, name: string): string | undefined {
  const match = new RegExp(`name="${name}"\r\n\r\n([^\r]*)`).exec(body);
  return match?.[1];
}

const gif = {
  name: 'ref.gif',
  mimeType: 'image/gif',
  buffer: Buffer.from('R0lGODlhAQABAAAAACw=', 'base64'),
};

test.describe('order form', () => {
  test('sends a figurine order with a photo', async ({ page }) => {
    const sent = interceptNetlify(page);
    await page.goto('/pl/kontakt');

    await page.getByLabel(/Imię/).fill('Anna');
    await page.getByLabel('Telefon').fill('+48 600 123 456');
    await page.getByLabel(/Opis/).fill('Space Marine w barwach zakonu, styl pokazowy.');
    await page.getByLabel('Zdjęcie Twojej figurki').setInputFiles(gif);
    await expect(page.getByText('ref.gif')).toBeVisible();
    await page.getByRole('checkbox', { name: /Wyrażam zgodę/ }).check();
    await page.getByRole('button', { name: 'Wyślij zgłoszenie' }).click();

    const body = (await sent).postDataBuffer()?.toString('latin1') ?? '';
    expect(field(body, 'form-name')).toBe('order');
    expect(field(body, 'kind')).toBe('figurine');
    expect(field(body, 'phone')).toBe('+48 600 123 456');
    expect(body).toContain('filename="ref.gif"');
    expect(body).not.toContain('name="dimensions"');
    await expect(page.getByRole('heading', { name: 'Dziękuję za zgłoszenie!' })).toBeVisible();
  });

  test('sends a painting order with size and technique', async ({ page }) => {
    const sent = interceptNetlify(page);
    await page.goto('/en/contact?kind=painting');

    await page.getByLabel(/Name/).fill('Anna');
    await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill('anna@example.com');
    await page.getByLabel(/Description/).fill('A misty marsh at night, cold blue palette.');
    await page.getByLabel('Preferred size').fill('50 × 70 cm');
    await page.getByLabel('Technique').selectOption('oil');
    await page.getByRole('checkbox', { name: /I agree/ }).check();
    await page.getByRole('button', { name: 'Send request' }).click();

    const body = (await sent).postDataBuffer()?.toString('utf8') ?? '';
    expect(field(body, 'kind')).toBe('painting');
    expect(field(body, 'technique')).toBe('oil');
    expect(field(body, 'dimensions')).toBe('50 × 70 cm');
    expect(field(body, 'subject')).toBe('[Obraz] Nowe zgłoszenie – Anna');
    await expect(page.getByRole('heading', { name: 'Thank you for your request!' })).toBeVisible();
  });
});
