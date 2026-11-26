import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './server';

// jsdom has no matchMedia. Default: no media query matches. Tests can override it with
// `vi.stubGlobal('matchMedia', …)`; vitest restores this default after each test.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  // Cast: the deprecated addListener/removeListener are left out on purpose.
  value: (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    }) as unknown as MediaQueryList,
});

// Any request without a matching handler fails the test, so no test hits the real network.
beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
  document.documentElement.lang = '';
});

afterAll(() => {
  server.close();
});
