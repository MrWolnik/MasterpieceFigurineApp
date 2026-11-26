import { describe, expect, it } from 'vitest';
import { clampOffset, clampScale, INITIAL_ZOOM, panBy, zoomAt } from './zoomMath';

const image = { width: 400, height: 300 };
const viewport = { width: 400, height: 400 };

describe('clampScale', () => {
  it.each([
    [0.5, 1],
    [1, 1],
    [2.5, 2.5],
    [5, 5],
    [8, 5],
  ])('clamps %f to %f', (scale, expected) => {
    expect(clampScale(scale)).toBe(expected);
  });
});

describe('clampOffset', () => {
  it('keeps the image centred at 1×', () => {
    expect(clampOffset({ scale: 1, x: 50, y: -50 }, image, viewport)).toEqual(INITIAL_ZOOM);
  });

  it('limits panning to the edges of the scaled image', () => {
    // At 2× the image is 800 × 600: 200 px spare on each side horizontally, 100 px vertically.
    expect(clampOffset({ scale: 2, x: 500, y: -500 }, image, viewport)).toEqual({
      scale: 2,
      x: 200,
      y: -100,
    });
  });

  it('allows any offset within the bounds', () => {
    expect(clampOffset({ scale: 2, x: -150, y: 80 }, image, viewport)).toEqual({
      scale: 2,
      x: -150,
      y: 80,
    });
  });

  it('keeps an axis centred while the scaled image is still smaller than the viewport', () => {
    // At 1.2× the height is 360 px < 400 px, so there is nothing to pan vertically.
    expect(clampOffset({ scale: 1.2, x: 10, y: 30 }, image, viewport).y).toBe(0);
  });

  it('clamps the scale as well', () => {
    expect(clampOffset({ scale: 9, x: 0, y: 0 }, image, viewport).scale).toBe(5);
  });
});

describe('zoomAt', () => {
  it('zooming at the centre keeps the image centred', () => {
    expect(zoomAt(INITIAL_ZOOM, 2, { x: 0, y: 0 }, image, viewport)).toEqual({
      scale: 2,
      x: 0,
      y: 0,
    });
  });

  it('keeps the point under the cursor in place', () => {
    // The point 100 px right of centre stays 100 px right of centre after 1× → 2×.
    expect(zoomAt(INITIAL_ZOOM, 2, { x: 100, y: 0 }, image, viewport)).toEqual({
      scale: 2,
      x: -100,
      y: 0,
    });
  });

  it('never zooms beyond 1×–5×', () => {
    expect(zoomAt(INITIAL_ZOOM, 0.2, { x: 0, y: 0 }, image, viewport).scale).toBe(1);
    expect(zoomAt({ scale: 4, x: 0, y: 0 }, 20, { x: 0, y: 0 }, image, viewport).scale).toBe(5);
  });

  it('recentres when zooming back out to 1×', () => {
    expect(zoomAt({ scale: 3, x: 300, y: 200 }, 1, { x: 50, y: 50 }, image, viewport)).toEqual(
      INITIAL_ZOOM,
    );
  });
});

describe('panBy', () => {
  it('moves within bounds and stops at the edge', () => {
    const zoomed = { scale: 2, x: 0, y: 0 };
    expect(panBy(zoomed, 50, -20, image, viewport)).toEqual({ scale: 2, x: 50, y: -20 });
    expect(panBy(zoomed, 1000, 1000, image, viewport)).toEqual({ scale: 2, x: 200, y: 100 });
  });

  it('does nothing at 1×', () => {
    expect(panBy(INITIAL_ZOOM, 50, 50, image, viewport)).toEqual(INITIAL_ZOOM);
  });
});
