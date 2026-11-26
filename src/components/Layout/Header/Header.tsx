import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router';
import { pathFor, type RouteKey } from '../../../lib/routes';
import { useLanguage } from '../../../lib/useLanguage';
import { MenuIcon } from '../icons/MenuIcon';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
import styles from './Header.module.css';
import { useMobileMenu } from './useMobileMenu';

const NAV_ID = 'primary-navigation';

const navItems = [
  { key: 'portfolio', label: 'layout.nav.portfolio' },
  { key: 'contact', label: 'layout.nav.contact' },
] as const satisfies readonly { key: RouteKey; label: string }[];

export function Header() {
  const { t } = useTranslation();
  const language = useLanguage();
  const { isOpen, toggle, close, toggleRef } = useMobileMenu();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} to={pathFor('home', language)} onClick={close}>
          {t('layout.homeLink')}
        </Link>

        <nav
          id={NAV_ID}
          className={styles.nav}
          data-open={isOpen}
          aria-label={t('layout.nav.label')}
        >
          <ul className={styles.navList}>
            {navItems.map(({ key, label }) => (
              <li key={key}>
                <NavLink className={styles.navLink} to={pathFor(key, language)} onClick={close}>
                  {t(label)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher />
          <button
            ref={toggleRef}
            type="button"
            className={styles.menuButton}
            aria-expanded={isOpen}
            aria-controls={NAV_ID}
            aria-label={isOpen ? t('layout.menu.close') : t('layout.menu.open')}
            onClick={toggle}
          >
            <MenuIcon open={isOpen} />
          </button>
        </div>
      </div>
    </header>
  );
}
