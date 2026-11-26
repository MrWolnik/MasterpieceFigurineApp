import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { pathFor } from '../../lib/routes';
import { useLanguage } from '../../lib/useLanguage';
import { useTagLabel } from '../../lib/useTagLabel';
import type { Work } from '../../lib/works';
import styles from './WorkCard.module.css';
import { WorkKindIcon } from './WorkKindIcon';

interface WorkCardProps {
  work: Work;
  /** Load the cover eagerly; use for tiles visible on first paint (LCP). */
  eager?: boolean;
}

export function WorkCard({ work, eager = false }: WorkCardProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const tagLabel = useTagLabel();
  const title = work.title[language];
  const hasTurntable = work.kind === 'figurine' && work.frames !== undefined;

  return (
    <article className={styles.card}>
      <Link className={styles.link} to={pathFor('work', language, { slug: work.slug })}>
        <div className={styles.media}>
          <img
            className={styles.cover}
            src={work.cover}
            alt=""
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            style={{ objectPosition: work.coverFocus }}
          />
          <span className={styles.badges}>
            <span className={styles.badge} role="img" aria-label={t(`works.kind.${work.kind}`)}>
              <WorkKindIcon kind={work.kind} />
            </span>
            {hasTurntable && <span className={styles.badge}>{t('works.turntable')}</span>}
          </span>
        </div>
        <h3 className={styles.title}>{title}</h3>
      </Link>
      {work.tags.length > 0 && (
        <ul className={styles.tags} aria-label={t('works.tagsLabel')}>
          {work.tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              {tagLabel(tag)}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
