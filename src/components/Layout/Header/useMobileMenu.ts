import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

/** Width from which the full navigation is shown and the hamburger is hidden (tokens.css `md`). */
const DESKTOP_MEDIA_QUERY = '(min-width: 900px)';

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

  const close = () => {
    setOpenOn(null);
  };

  const toggle = () => {
    setOpenOn(isOpen ? null : pathname);
  };

  // While open: close on Escape or when the layout switches to desktop.
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
    const desktop = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const onLayoutChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setOpenOn(null);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onLayoutChange);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onLayoutChange);
    };
  }, [isOpen]);

  return { isOpen, toggle, close, toggleRef };
}
