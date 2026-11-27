import { useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react';
import styles from '../styles/reveal.module.css';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** Upper bound for `delay`, so a long staggered list never keeps content waiting. */
export const MAX_REVEAL_DELAY_MS = 400;

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
 * - `entering`: prerendered HTML and the first render. The element fades in from CSS alone, so
 *   the page animates in on load even before its JS has arrived.
 * - `waiting`: after hydration, an element that turned out to be off screen is hidden...
 * - `revealed`: ...until it scrolls into view and fades in. An element on screen at load stays
 *   `entering` (its load animation is not replayed).
 */
type Phase = 'entering' | 'waiting' | 'revealed';

const PHASE_CLASS: Record<Phase, string | undefined> = {
  entering: styles.revealed,
  waiting: styles.hidden,
  revealed: styles.revealed,
};

/**
 * Fades and lifts an element in (PLAN Z4.1): on page load when it is on screen, otherwise the
 * first time it scrolls into view. With reduced motion, or without IntersectionObserver, the
 * element is simply shown. The result is spread on the element; nothing in it is meant to be
 * read during render.
 */
export function useReveal<T extends HTMLElement>({
  className,
  delay: delayMs = 0,
}: RevealOptions = {}): RevealProps<T> {
  // A callback ref kept in state, so the observer follows the element if it is replaced.
  const [element, setElement] = useState<T | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>('entering');
  const supported = useSyncExternalStore(subscribeNever, hasIntersectionObserver, assumeSupported);

  useEffect(() => {
    if (reducedMotion || !supported || !element) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        // On screen: fade in if it was waiting; if it was there from the start, leave it be.
        setPhase((current) => (current === 'waiting' ? 'revealed' : current));
        observer.disconnect();
      } else {
        setPhase('waiting');
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [element, reducedMotion, supported]);

  const active = !reducedMotion && supported;
  const delay = Math.min(Math.max(delayMs, 0), MAX_REVEAL_DELAY_MS);

  return {
    ref: setElement,
    className: [className, active ? PHASE_CLASS[phase] : undefined].filter(Boolean).join(' '),
    // Custom properties are not in CSSProperties, hence the cast.
    style: delay > 0 ? ({ '--reveal-delay': `${String(delay)}ms` } as CSSProperties) : undefined,
  };
}
