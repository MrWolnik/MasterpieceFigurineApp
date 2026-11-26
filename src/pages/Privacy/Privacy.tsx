import { useTranslation } from 'react-i18next';
import styles from '../Page.module.css';

// Placeholder page; the real content arrives in Z3.6.
export function Privacy() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <h1>{t('pages.privacy.title')}</h1>
    </div>
  );
}
