import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { REDUCED_MOTION_QUERY, usePrefersReducedMotion } from './usePrefersReducedMotion';

/** matchMedia stand-in whose reduced-motion answer can be flipped like the OS setting. */
function stubSetting(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  const matchMedia = vi.fn((query: string) => ({
    get matches() {
      return query === REDUCED_MOTION_QUERY && matches;
    },
    media: query,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  }));
  vi.stubGlobal('matchMedia', matchMedia);
  return {
    listeners,
    set(value: boolean) {
      matches = value;
      for (const listener of listeners) listener();
    },
  };
}

describe('usePrefersReducedMotion', () => {
  it('is false when the user allows motion', () => {
    stubSetting(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it('is true when the user asked for reduced motion', () => {
    stubSetting(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('follows a change of the OS setting and unsubscribes on unmount', () => {
    const setting = stubSetting(false);
    const { result, unmount } = renderHook(() => usePrefersReducedMotion());

    act(() => {
      setting.set(true);
    });
    expect(result.current).toBe(true);

    unmount();
    expect(setting.listeners.size).toBe(0);
  });
});
