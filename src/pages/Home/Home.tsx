import { useTranslation } from 'react-i18next';
import { site } from '../../config/site';
import styles from '../Page.module.css';

// Placeholder home page. Hero and featured works arrive in Etap 2.
export function Home() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <h1>{site.brand}</h1>
      <p>{t('app.tagline')}</p>
    </div>
  );
}
