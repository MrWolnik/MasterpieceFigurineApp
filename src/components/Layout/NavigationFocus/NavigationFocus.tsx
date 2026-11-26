import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { MAIN_CONTENT_ID } from '../mainContent';

/**
 * Moves keyboard focus to the main content after every client-side page change, so keyboard
 * and screen reader users start on the new page instead of `<body>` or a link that vanished.
 * The first page load is left alone, so the skip link stays the first Tab stop.
 * Lives at the root route, above both languages, so it also runs when the language changes.
 */
export function NavigationFocus() {
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current === pathname) {
      return;
    }
    previousPathname.current = pathname;
    document.getElementById(MAIN_CONTENT_ID)?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return <Outlet />;
}
