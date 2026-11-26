import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import styles from '../Page.module.css';

// Placeholder page; the real details view (and 404 for unknown slugs) arrives in Z1.7.
export function WorkDetails() {
  const { t } = useTranslation();
  const { slug = '' } = useParams();

  return (
    <div className={styles.page}>
      <h1>{t('pages.work.title', { slug })}</h1>
    </div>
  );
}
