import { useTranslation } from 'react-i18next';
import styles from '../Page.module.css';

// Placeholder page; the real content arrives in Etap 3.
export function Contact() {
  const { t } = useTranslation();

  return (
    <main className={styles.page}>
      <h1>{t('pages.contact.title')}</h1>
    </main>
  );
}
