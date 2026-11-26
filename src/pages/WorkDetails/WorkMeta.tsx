import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../lib/useLanguage';
import type { Work } from '../../lib/works';
import styles from './WorkDetails.module.css';

/** Kind, and for paintings medium, size and year, as a description list. */
export function WorkMeta({ work }: { work: Work }) {
  const { t } = useTranslation();
  const language = useLanguage();

  const rows: [string, string][] = [[t('pages.work.kindLabel'), t(`works.kind.${work.kind}`)]];
  if (work.kind === 'painting') {
    rows.push(
      [t('pages.work.medium'), work.medium[language]],
      [t('pages.work.size'), work.size],
      [t('pages.work.year'), String(work.year)],
    );
  }

  return (
    <dl className={styles.meta}>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.metaRow}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
