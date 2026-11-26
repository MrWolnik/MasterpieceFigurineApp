import { useTranslation } from 'react-i18next';
import styles from '../Page.module.css';

// Placeholder home page. Hero and featured works arrive in Etap 2.
export function Home() {
  const { t } = useTranslation();

  return (
    <main className={styles.page}>
      <h1>{t('app.title')}</h1>
      <p>{t('app.tagline')}</p>
    </main>
  );
}
