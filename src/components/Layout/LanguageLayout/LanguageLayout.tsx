import { Outlet } from 'react-router';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
import styles from './LanguageLayout.module.css';

// Minimal shell for every language-prefixed page. The full Header and Footer arrive in Z0.6.
export function LanguageLayout() {
  return (
    <>
      <header className={styles.header}>
        <LanguageSwitcher />
      </header>
      <Outlet />
    </>
  );
}
