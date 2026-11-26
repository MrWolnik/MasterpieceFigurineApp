import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { Footer } from './Footer/Footer';
import { Header } from './Header/Header';
import styles from './Layout.module.css';

const MAIN_ID = 'main';

/** Shell of every language-prefixed page: skip link, header, page content and footer. */
export function Layout() {
  const { t } = useTranslation();

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href={`#${MAIN_ID}`}>
        {t('layout.skipToContent')}
      </a>
      <Header />
      {/* tabIndex -1 lets the skip link move keyboard focus into the content. */}
      <main id={MAIN_ID} className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
