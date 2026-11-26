import { expect, test } from '@playwright/test';

// Runs against the dev server: until Z1.7 the turntable is only mounted on /styleguide.

test.describe('turntable (styleguide demo)', () => {
  test('dragging changes the frame', async ({ page }) => {
    await page.goto('/styleguide');
    const slider = page.getByRole('slider', { name: /Nocny wartownik/ });
    await slider.scrollIntoViewIfNeeded();
    const box = await slider.boundingBox();
    if (!box) throw new Error('turntable not visible');
    const y = box.y + box.height / 2;

    await page.mouse.move(box.x + 50, y);
    await page.mouse.down();
    const before = await slider.getAttribute('aria-valuenow');
    await page.mouse.move(box.x + 50 + box.width / 4, y, { steps: 5 });
    await page.mouse.up();

    // A quarter of the width is a quarter turn (≈ 90°) from where the drag started.
    await expect(slider).not.toHaveAttribute('aria-valuenow', before ?? '');
    const angle = Number(await slider.getAttribute('aria-valuenow'));
    expect(Math.abs(angle - Number(before) - 90) % 360).toBeLessThanOrEqual(10);
    await expect(slider.locator('img')).toHaveAttribute('src', /frames\/0\d\d\.svg$/);
  });

  test('arrow keys rotate the figurine', async ({ page }) => {
    await page.goto('/styleguide');
    const slider = page.getByRole('slider', { name: /Nocny wartownik/ });

    await slider.focus();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');

    await expect(slider).toHaveAttribute('aria-valuenow', '10');
    await expect(slider.locator('img')).toHaveAttribute('src', /frames\/002\.svg$/);
  });
});
