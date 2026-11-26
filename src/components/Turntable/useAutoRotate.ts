import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react';

/** Delay between auto-rotation frames; 36 frames ≈ 3 s per turn. */
export const AUTO_ROTATE_INTERVAL_MS = 80;

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', onChange);
  return () => {
    query.removeEventListener('change', onChange);
  };
}

/** Follows the OS setting live, so switching it on stops a running rotation. */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
  );
}

/** Whether `ref` is on screen and the tab is visible; true where IntersectionObserver is missing. */
function useIsVisible(ref: RefObject<HTMLElement | null>): boolean {
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(() => document.visibilityState !== 'hidden');

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      setOnScreen(entry?.isIntersecting ?? true);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  useEffect(() => {
    const update = () => {
      setTabVisible(document.visibilityState !== 'hidden');
    };
    document.addEventListener('visibilitychange', update);
    return () => {
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return onScreen && tabVisible;
}

/**
 * Calls `step` on an interval while `enabled`, the element is visible and the user has not
 * asked for reduced motion. Pauses off screen or in a hidden tab.
 */
export function useAutoRotate(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  step: () => void,
): void {
  const visible = useIsVisible(ref);
  const reducedMotion = usePrefersReducedMotion();
  const active = enabled && visible && !reducedMotion;

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(step, AUTO_ROTATE_INTERVAL_MS);
    return () => {
      window.clearInterval(id);
    };
  }, [active, step]);
}
