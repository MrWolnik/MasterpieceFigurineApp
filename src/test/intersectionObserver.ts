import { vi } from 'vitest';

/**
 * jsdom has no IntersectionObserver. `stubIntersectionObserver()` installs this stand-in for one
 * test (vitest unstubs globals afterwards); `enter()`/`leave()` play the browser's callbacks.
 */
export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  readonly elements = new Set<Element>();
  disconnected = false;

  private readonly callback: IntersectionObserverCallback;
  readonly options: IntersectionObserverInit | undefined;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element) {
    this.elements.add(element);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
    this.disconnected = true;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  enter() {
    this.notify(true);
  }

  leave() {
    this.notify(false);
  }

  private notify(isIntersecting: boolean) {
    const entries = [...this.elements].map(
      (target) => ({ target, isIntersecting }) as IntersectionObserverEntry,
    );
    // Cast: the fake implements only what the app uses.
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

export function stubIntersectionObserver(): typeof FakeIntersectionObserver {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  return FakeIntersectionObserver;
}

/** Stubs matchMedia so only `prefers-reduced-motion: reduce` matches (when `reduce`). */
export function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion: reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}
