import { useLayoutEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Outlet } from 'react-router';
import { i18nFor, type Language } from '../../lib/i18n';
import { Footer } from './Footer/Footer';
import { Header } from './Header/Header';
import styles from './Layout.module.css';
import { MAIN_CONTENT_ID } from './mainContent';

interface LayoutProps {
  /** Language of the rendered route; it drives translations and `<html lang>`. */
  lang: Language;
}

/** Shell of every page: skip link, header, page content and footer, in the route's language. */
export function Layout({ lang }: LayoutProps) {
  // Before paint, so assistive tech never reads the new page with the old language.
  useLayoutEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const i18n = i18nFor(lang);

  return (
    <I18nextProvider i18n={i18n}>
      <div className={styles.shell}>
        <a className={styles.skipLink} href={`#${MAIN_CONTENT_ID}`}>
          {i18n.t('layout.skipToContent')}
        </a>
        <Header />
        {/* tabIndex -1 lets the skip link and NavigationFocus move keyboard focus here. */}
        <main id={MAIN_CONTENT_ID} className={styles.main} tabIndex={-1}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </I18nextProvider>
  );
}
