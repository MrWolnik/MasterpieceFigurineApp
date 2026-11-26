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

// jsdom has no pointer capture; components that drag (Turntable) call it on pointerdown.
if (!('setPointerCapture' in Element.prototype)) {
  Object.assign(Element.prototype, {
    setPointerCapture: () => undefined,
    releasePointerCapture: () => undefined,
    hasPointerCapture: () => false,
  });
}

// jsdom has no modal dialogs. Minimal stand-in: open/close toggle the `open` attribute and
// close() fires the `close` event, like the browser does.
if (!('showModal' in HTMLDialogElement.prototype)) {
  Object.assign(HTMLDialogElement.prototype, {
    showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
    close(this: HTMLDialogElement) {
      if (!this.hasAttribute('open')) return;
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    },
  });
}

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
