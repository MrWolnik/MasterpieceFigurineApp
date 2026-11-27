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
 * - `static`: prerendered HTML and the first render, with no animation at all. Content on screen
 *   at load just appears: an opacity animation there would push back the Largest Contentful
 *   Paint (Chrome counts the element only once it has faded in).
 * - `waiting`: after hydration, an element that turned out to be off screen is hidden...
 * - `revealed`: ...until it scrolls into view and fades in.
 */
type Phase = 'static' | 'waiting' | 'revealed';

const PHASE_CLASS: Record<Phase, string | undefined> = {
  static: undefined,
  waiting: styles.hidden,
  revealed: styles.revealed,
};

/**
 * Fades and lifts an element in the first time it scrolls into view (PLAN Z4.1). Elements on
 * screen at load, and every element with reduced motion or without IntersectionObserver, are
 * simply shown. The result is spread on the element; nothing in it is meant to be read during
 * render.
 */
export function useReveal<T extends HTMLElement>({
  className,
  delay: delayMs = 0,
}: RevealOptions = {}): RevealProps<T> {
  // A callback ref kept in state, so the observer follows the element if it is replaced.
  const [element, setElement] = useState<T | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>('static');
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
