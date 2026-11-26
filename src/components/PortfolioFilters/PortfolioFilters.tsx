import { useTranslation } from 'react-i18next';
import { useTagLabel } from '../../lib/useTagLabel';
import type { WorkKind } from '../../lib/works';
import styles from './PortfolioFilters.module.css';

interface PortfolioFiltersProps {
  kind: WorkKind | undefined;
  tag: string | undefined;
  /** Tags available for the current kind. */
  tags: readonly string[];
  onKindChange: (kind: WorkKind | undefined) => void;
  onTagChange: (tag: string | undefined) => void;
}

/** Toggle buttons for the kind and tag filters; state lives in the parent (the URL). */
export function PortfolioFilters({
  kind,
  tag,
  tags,
  onKindChange,
  onTagChange,
}: PortfolioFiltersProps) {
  const { t } = useTranslation();
  const tagLabel = useTagLabel();

  const kindOptions = [
    { value: undefined, label: t('works.filters.all') },
    { value: 'figurine', label: t('works.filters.figurines') },
    { value: 'painting', label: t('works.filters.paintings') },
  ] as const;

  return (
    <div className={styles.filters}>
      <div className={styles.kinds} role="group" aria-label={t('works.filters.kindLabel')}>
        {kindOptions.map(({ value, label }) => (
          <button
            key={label}
            type="button"
            className={styles.kind}
            aria-pressed={kind === value}
            onClick={() => {
              onKindChange(value);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {tags.length > 0 && (
        <div className={styles.tags} role="group" aria-label={t('works.filters.tagLabel')}>
          <button
            type="button"
            className={styles.tag}
            aria-pressed={tag === undefined}
            onClick={() => {
              onTagChange(undefined);
            }}
          >
            {t('works.filters.allTags')}
          </button>
          {tags.map((value) => (
            <button
              key={value}
              type="button"
              className={styles.tag}
              aria-pressed={tag === value}
              onClick={() => {
                // Clicking the active tag again clears it.
                onTagChange(tag === value ? undefined : value);
              }}
            >
              {tagLabel(value)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
