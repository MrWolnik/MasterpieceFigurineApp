import { useSyncExternalStore } from 'react';

const noSubscription = () => () => undefined;

/**
 * `false` while rendering static HTML (prerender) and during hydration, `true` afterwards and in
 * any render that starts in the browser. Lets browser-only content (the URL query, a `mailto:`
 * link) appear right after hydration without a mismatch with the prerendered markup.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}
