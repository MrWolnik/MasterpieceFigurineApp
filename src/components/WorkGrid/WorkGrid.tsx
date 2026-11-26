import { useTranslation } from 'react-i18next';
import type { Work } from '../../lib/works';
import { WorkCard } from '../WorkCard/WorkCard';
import styles from './WorkGrid.module.css';

/** Tiles above the fold on most screens; their covers load eagerly for a faster LCP. */
const EAGER_COUNT = 2;

export function WorkGrid({ works }: { works: readonly Work[] }) {
  const { t } = useTranslation();

  if (works.length === 0) {
    return <p className={styles.empty}>{t('works.empty')}</p>;
  }

  return (
    <ul className={styles.grid}>
      {works.map((work, index) => (
        <li key={work.slug}>
          <WorkCard work={work} eager={index < EAGER_COUNT} />
        </li>
      ))}
    </ul>
  );
}
