import { useEffect, useRef, type RefObject } from 'react';

/**
 * Calls `onWheel` for wheel events on `ref`. React registers wheel listeners as passive, so
 * `preventDefault()` (to stop the page from scrolling) needs a native, non-passive listener.
 */
export function useNonPassiveWheel(
  ref: RefObject<HTMLElement | null>,
  onWheel: (event: WheelEvent) => void,
): void {
  // The native listener is added once; this ref hands it the latest handler (and state).
  const handlerRef = useRef(onWheel);
  useEffect(() => {
    handlerRef.current = onWheel;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const listener = (event: WheelEvent) => {
      handlerRef.current(event);
    };
    element.addEventListener('wheel', listener, { passive: false });
    return () => {
      element.removeEventListener('wheel', listener);
    };
  }, [ref]);
}
