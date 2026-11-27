import { useTranslation } from 'react-i18next';
import type { Work } from '../../lib/works';
import styles from './WorkGrid.module.css';
import { WorkGridItem } from './WorkGridItem';

/** Tiles above the fold on most screens; their covers load eagerly for a faster LCP. */
const EAGER_COUNT = 2;

interface WorkGridProps {
  works: readonly Work[];
  /** Heading level of the tile titles (2 under a page `h1`, 3 inside an `h2` section). */
  headingLevel?: 2 | 3;
}

export function WorkGrid({ works, headingLevel = 2 }: WorkGridProps) {
  const { t } = useTranslation();

  if (works.length === 0) {
    return <p className={styles.empty}>{t('works.empty')}</p>;
  }

  return (
    <ul className={styles.grid}>
      {works.map((work, index) => (
        <WorkGridItem
          key={work.slug}
          work={work}
          index={index}
          eager={index < EAGER_COUNT}
          headingLevel={headingLevel}
        />
      ))}
    </ul>
  );
}
