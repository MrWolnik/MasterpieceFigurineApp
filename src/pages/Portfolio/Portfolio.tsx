import { useTranslation } from 'react-i18next';
import { WorkGrid } from '../../components/WorkGrid/WorkGrid';
import { getWorks } from '../../lib/works';
import styles from './Portfolio.module.css';

export function Portfolio() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1>{t('pages.portfolio.title')}</h1>
        <p className={styles.lead}>{t('pages.portfolio.intro')}</p>
      </header>
      <WorkGrid works={getWorks()} />
    </div>
  );
}
