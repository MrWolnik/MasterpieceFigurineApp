import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

/** Width from which the full navigation is shown and the hamburger is hidden (tokens.css `md`). */
export const DESKTOP_MEDIA_QUERY = '(min-width: 900px)';

/**
 * Open/close state of the mobile menu. It closes on Esc (focus goes back to the toggle),
 * on navigation to another page, and when the window grows to the desktop layout.
 */
export function useMobileMenu() {
  const { pathname } = useLocation();
  // The menu is open only on the page it was opened on, so navigating closes it
  // without an effect that syncs state to the location.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const isOpen = openOn === pathname;
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpenOn(null);
  }, []);

  const toggle = useCallback(() => {
    setOpenOn((current) => (current === pathname ? null : pathname));
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenOn(null);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof window.matchMedia !== 'function') {
      return;
    }
    const desktop = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setOpenOn(null);
      }
    };
    desktop.addEventListener('change', onChange);
    return () => {
      desktop.removeEventListener('change', onChange);
    };
  }, [isOpen]);

  return { isOpen, toggle, close, toggleRef };
}
