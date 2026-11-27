import { expect, test, type Page } from '@playwright/test';

// Runs on the real painting page (production build), so it covers what visitors get.
const PAGE = '/pl/portfolio/mgla-nad-bagnem';

const HI_RES = '/works/mgla-nad-bagnem/full@2x.svg';

async function openViewer(page: Page) {
  await page.goto(PAGE);
  await page.getByRole('button', { name: 'Powiększ obraz: Mgła nad bagnem' }).click();
  const dialog = page.getByRole('dialog', { name: 'Podgląd obrazu: Mgła nad bagnem' });
  await expect(dialog).toBeVisible();
  return dialog;
}

const level = (page: Page) => page.getByText(/^Powiększenie: \d+%$/);

test.describe('image zoom', () => {
  test('loads the high-resolution image only after opening', async ({ page }) => {
    const hiResRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().endsWith(HI_RES)) hiResRequests.push(request.url());
    });

    await page.goto(PAGE);
    await expect(page.getByRole('button', { name: /Powiększ obraz/ })).toBeVisible();
    expect(hiResRequests).toEqual([]);

    const dialog = await openViewer(page);
    await expect(dialog.getByRole('img')).toHaveAttribute('src', HI_RES);
    expect(hiResRequests.length).toBeGreaterThan(0);
  });

  test('buttons, wheel and Esc', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop interactions');
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

  test('pinch zooms the image', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'touch profile only');
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

test.describe('image zoom on a phone', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('toolbar buttons fit the screen and do not overlap', async ({ page }) => {
    const dialog = await openViewer(page);

    const boxes = await dialog.locator('button, output').evaluateAll((els) =>
      els.map((el) => {
        // Measure the text itself, not its box: text can spill out of a box that fits.
        const range = document.createRange();
        range.selectNodeContents(el);
        const box = el.getBoundingClientRect();
        const text = range.getBoundingClientRect();
        return {
          left: Math.min(box.left, text.left),
          right: Math.max(box.right, text.right),
          top: Math.min(box.top, text.top),
          bottom: Math.max(box.bottom, text.bottom),
        };
      }),
    );
    for (const [i, a] of boxes.entries()) {
      expect(a.left).toBeGreaterThanOrEqual(0);
      expect(a.right).toBeLessThanOrEqual(360);
      for (const b of boxes.slice(i + 1)) {
        const overlap =
          a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        expect(overlap).toBe(false);
      }
    }
  });
});
