import { useTranslation } from 'react-i18next';
import { PortfolioFilters } from '../../components/PortfolioFilters/PortfolioFilters';
import { WorkGrid } from '../../components/WorkGrid/WorkGrid';
import { usePortfolioFilters } from '../../lib/usePortfolioFilters';
import { getTags, getWorks } from '../../lib/works';
import styles from './Portfolio.module.css';

export function Portfolio() {
  const { t } = useTranslation();
  const { kind, tag, setKind, setTag } = usePortfolioFilters();
  const works = getWorks({ kind, tag });

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1>{t('pages.portfolio.title')}</h1>
        <p className={styles.lead}>{t('pages.portfolio.intro')}</p>
      </header>
      <div className={styles.results}>
        <PortfolioFilters
          kind={kind}
          tag={tag}
          tags={getTags(kind)}
          onKindChange={setKind}
          onTagChange={setTag}
        />
        {/* Announces the new result count to screen readers after a filter change. */}
        <p className={styles.count} role="status">
          {t('works.filters.count', { count: works.length })}
        </p>
        <WorkGrid works={works} />
      </div>
    </div>
  );
}
