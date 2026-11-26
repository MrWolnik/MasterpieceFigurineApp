import { useTranslation } from 'react-i18next';
import styles from '../Page.module.css';

// Placeholder page; the real content arrives in Etap 1.
export function Portfolio() {
  const { t } = useTranslation();

  return (
    <main className={styles.page}>
      <h1>{t('pages.portfolio.title')}</h1>
    </main>
  );
}
