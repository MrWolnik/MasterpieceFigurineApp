import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { pathFor, type RouteKey } from '../../../lib/routes';
import { useLanguage } from '../../../lib/useLanguage';
import { MenuIcon } from '../icons/MenuIcon';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
import styles from './Header.module.css';
import { useMobileMenu } from './useMobileMenu';

const MENU_ID = 'site-menu';

const navItems = [
  { key: 'portfolio', label: 'layout.nav.portfolio' },
  { key: 'contact', label: 'layout.nav.contact' },
] as const satisfies readonly { key: RouteKey; label: string }[];

/** `/pl/portfolio/x/` → `/pl/portfolio/x` */
function withoutTrailingSlash(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

export function Header() {
  const { t } = useTranslation();
  const language = useLanguage();
  const pathname = withoutTrailingSlash(useLocation().pathname);
  const { isOpen, toggle, close, toggleRef } = useMobileMenu();

  // DOM order (brand, toggle, menu) matches the Tab order on both layouts: on mobile the
  // toggle sits right before the menu it opens; on desktop the toggle is hidden.
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} to={pathFor('home', language)} onClick={close}>
          {t('layout.homeLink')}
        </Link>

        <button
          ref={toggleRef}
          type="button"
          className={styles.menuButton}
          aria-expanded={isOpen}
          aria-controls={MENU_ID}
          aria-label={isOpen ? t('layout.menu.close') : t('layout.menu.open')}
          onClick={toggle}
        >
          <MenuIcon open={isOpen} />
        </button>

        <div id={MENU_ID} className={styles.menu} data-open={isOpen}>
          <nav aria-label={t('layout.nav.label')}>
            <ul className={styles.navList}>
              {navItems.map(({ key, label }) => {
                const to = pathFor(key, language);
                const isCurrentPage = pathname === to;
                // e.g. Portfolio while viewing a work: highlighted, but not "current page".
                const isInSection = isCurrentPage || pathname.startsWith(`${to}/`);
                return (
                  <li key={key}>
                    <Link
                      className={styles.navLink}
                      to={to}
                      aria-current={isCurrentPage ? 'page' : undefined}
                      data-active={isInSection}
                      onClick={close}
                    >
                      {t(label)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
