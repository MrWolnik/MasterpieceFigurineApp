import { expect, test, type Page } from '@playwright/test';

// Runs against the dev server: until Z1.7 the viewer is only mounted on /styleguide.

const HI_RES = '/works/mgla-nad-bagnem/full@2x.svg';

async function openViewer(page: Page) {
  await page.goto('/styleguide');
  await page.getByRole('button', { name: 'Powiększ obraz: Mgła nad bagnem' }).click();
  const dialog = page.getByRole('dialog', { name: 'Podgląd obrazu: Mgła nad bagnem' });
  await expect(dialog).toBeVisible();
  return dialog;
}

const level = (page: Page) => page.getByText(/^Powiększenie: \d+%$/);

test.describe('image zoom (styleguide demo)', () => {
  test('loads the high-resolution image only after opening', async ({ page }) => {
    const hiResRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().endsWith(HI_RES)) hiResRequests.push(request.url());
    });

    await page.goto('/styleguide');
    await expect(page.getByRole('button', { name: /Powiększ obraz/ })).toBeVisible();
    expect(hiResRequests).toEqual([]);

    const dialog = await openViewer(page);
    await expect(dialog.getByRole('img')).toHaveAttribute('src', HI_RES);
    expect(hiResRequests.length).toBeGreaterThan(0);
  });

  test('buttons, wheel and Esc', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'dev-only', 'desktop interactions');
    const dialog = await openViewer(page);

    await dialog.getByRole('button', { name: 'Powiększ' }).click();
    await expect(level(page)).toHaveText('Powiększenie: 150%');
    await dialog.getByRole('button', { name: 'Pomniejsz' }).click();
    await expect(level(page)).toHaveText('Powiększenie: 100%');

    const box = await page.getByTestId('zoom-stage').boundingBox();
    if (!box) throw new Error('stage not visible');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -400);
    await expect(level(page)).toHaveText('Powiększenie: 200%');

    // Focus stays inside the modal while tabbing.
    for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', { name: /Powiększ obraz/ })).toBeFocused();
  });

  test('pinch zooms the image', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'dev-only-mobile-webkit', 'touch profile only');
    await openViewer(page);
    const stage = page.getByTestId('zoom-stage');
    await expect(level(page)).toHaveText('Powiększenie: 100%');

    // Playwright cannot perform a native multi-touch gesture, so two touch pointers are
    // dispatched directly: fingers 100 px apart moving to 250 px apart (2.5×).
    await stage.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const fire = (type: string, pointerId: number, x: number) => {
        el.dispatchEvent(
          new PointerEvent(type, {
            pointerId,
            pointerType: 'touch',
            isPrimary: pointerId === 1,
            clientX: x,
            clientY: cy,
            bubbles: true,
            cancelable: true,
          }),
        );
      };
      fire('pointerdown', 1, cx - 50);
      fire('pointerdown', 2, cx + 50);
      for (let step = 1; step <= 5; step++) {
        const half = 50 + step * 15;
        fire('pointermove', 1, cx - half);
        fire('pointermove', 2, cx + half);
      }
      fire('pointerup', 1, cx - 125);
      fire('pointerup', 2, cx + 125);
    });

    await expect(level(page)).toHaveText('Powiększenie: 250%');
    await expect(stage.getByRole('img')).toHaveAttribute('style', /scale\(2\.5\)/);
  });
});
