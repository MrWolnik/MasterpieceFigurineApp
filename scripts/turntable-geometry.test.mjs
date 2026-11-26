import { describe, expect, it } from 'vitest';
import { BODY_RADIUS, surfacePoint } from './turntable-geometry.mjs';

describe('surfacePoint', () => {
  it('puts the stripe in front at 0° and behind at 180°', () => {
    expect(surfacePoint(0)).toMatchObject({ x: 0, front: true });
    expect(surfacePoint(180).front).toBe(false);
  });

  it('moves the stripe to opposite sides at 90° and 270°', () => {
    expect(surfacePoint(90).x).toBeCloseTo(BODY_RADIUS);
    expect(surfacePoint(270).x).toBeCloseTo(-BODY_RADIUS);
  });

  it('applies the offset around the body', () => {
    expect(surfacePoint(0, 90).x).toBeCloseTo(BODY_RADIUS);
    expect(surfacePoint(90, 90).front).toBe(false);
  });
});
