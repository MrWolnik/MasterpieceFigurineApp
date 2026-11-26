import { describe, expect, it } from 'vitest';
import { frameAngle, frameFromDrag, framePath, wrapFrame } from './turntableMath';

describe('wrapFrame', () => {
  it.each([
    [0, 0],
    [35, 35],
    [36, 0],
    [37, 1],
    [-1, 35],
    [-36, 0],
    [-37, 35],
    [72, 0],
  ])('wraps %i to %i for 36 frames', (index, expected) => {
    expect(wrapFrame(index, 36)).toBe(expected);
  });
});

describe('frameFromDrag', () => {
  it('moves one frame per pxPerFrame pixels', () => {
    expect(frameFromDrag(0, 10, 36, 10)).toBe(1);
    expect(frameFromDrag(0, 19, 36, 10)).toBe(1);
    expect(frameFromDrag(0, 9, 36, 10)).toBe(0);
  });

  it('wraps forwards past the last frame (35 → 0)', () => {
    expect(frameFromDrag(35, 10, 36, 10)).toBe(0);
  });

  it('wraps backwards past the first frame (0 → 35)', () => {
    expect(frameFromDrag(0, -10, 36, 10)).toBe(35);
  });

  it('handles drags longer than a full turn', () => {
    expect(frameFromDrag(5, 370, 36, 10)).toBe(6);
    expect(frameFromDrag(5, -370, 36, 10)).toBe(4);
  });
});

describe('frameAngle', () => {
  it('converts a frame to degrees', () => {
    expect(frameAngle(0, 36)).toBe(0);
    expect(frameAngle(12, 36)).toBe(120);
    expect(frameAngle(1, 24)).toBe(15);
  });
});

describe('framePath', () => {
  it('builds a 1-based, zero-padded path', () => {
    expect(framePath('a', 0, 'webp')).toBe('/works/a/frames/001.webp');
    expect(framePath('a', 35, 'svg')).toBe('/works/a/frames/036.svg');
  });
});
