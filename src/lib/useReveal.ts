import { useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react';
import styles from '../styles/reveal.module.css';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** Upper bound for `delay`, so a long staggered list never keeps content waiting. */
export const MAX_REVEAL_DELAY_MS = 400;

/** Reveal a bit after the element's top edge crosses the bottom of the screen. */
const ROOT_MARGIN = '0px 0px -40px 0px';

/** Props to spread on the revealed element: `<li {...reveal}>`. */
const subscribeNever = () => () => undefined;
const hasIntersectionObserver = () => typeof IntersectionObserver !== 'undefined';
/** Prerendered HTML (Z4.2) renders like a browser with IntersectionObserver, so hydration agrees. */
const assumeSupported = () => true;

export interface RevealProps<T extends HTMLElement> {
  /** Callback ref for the element to reveal. */
  ref: (element: T | null) => void;
  /** The element's own classes plus the reveal state class. */
  className: string;
  style: CSSProperties | undefined;
}

interface RevealOptions {
  /** The element's own class(es), merged with the reveal class. */
  className?: string | undefined;
  /** Stagger for items revealed together; capped at {@link MAX_REVEAL_DELAY_MS}. */
  delay?: number;
}

/**
 * Fades and lifts an element in the first time it scrolls into view (PLAN Z4.1).
 * With reduced motion, or without IntersectionObserver, the element is shown at once.
 * The result is spread on the element; nothing in it is meant to be read during render.
 */
export function useReveal<T extends HTMLElement>({
  className,
  delay: delayMs = 0,
}: RevealOptions = {}): RevealProps<T> {
  // A callback ref kept in state, so the observer follows the element if it is replaced.
  const [element, setElement] = useState<T | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  // Starts false on every render path, so prerendered HTML and hydration agree.
  const [seen, setSeen] = useState(false);
  const supported = useSyncExternalStore(subscribeNever, hasIntersectionObserver, assumeSupported);

  useEffect(() => {
    if (seen || reducedMotion || !supported || !element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: ROOT_MARGIN },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [element, seen, reducedMotion, supported]);

  const revealed = seen || reducedMotion || !supported;
  const delay = Math.min(Math.max(delayMs, 0), MAX_REVEAL_DELAY_MS);

  return {
    ref: setElement,
    className: [className, revealed ? styles.revealed : styles.hidden].filter(Boolean).join(' '),
    // Custom properties are not in CSSProperties, hence the cast.
    style: delay > 0 ? ({ '--reveal-delay': `${String(delay)}ms` } as CSSProperties) : undefined,
  };
}
