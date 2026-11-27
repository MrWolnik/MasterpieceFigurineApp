import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PageShell } from '../../components/PageShell/PageShell';
import { pathFor } from '../../lib/routes';
import { useLanguage } from '../../lib/useLanguage';
import styles from './NotFound.module.css';

export function NotFound() {
  const { t } = useTranslation();
  const language = useLanguage();

  return (
    <PageShell className={styles.page}>
      <p className={styles.code} aria-hidden="true">
        404
      </p>
      <h1 className={styles.title}>{t('pages.notFound.title')}</h1>
      <p className={styles.description}>{t('pages.notFound.description')}</p>
      <Link to={pathFor('home', language)}>{t('pages.notFound.backHome')}</Link>
    </PageShell>
  );
}
