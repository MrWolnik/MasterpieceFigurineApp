import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { pathFor } from '../../lib/routes';
import { useLanguage } from '../../lib/useLanguage';
import type { Neighbours } from '../../lib/works';
import styles from './WorkDetails.module.css';

/** "Previous / Next" links between works of the same kind; an end of the list has no link. */
export function WorkNav({ previous, next }: Neighbours) {
  const { t } = useTranslation();
  const language = useLanguage();

  if (!previous && !next) return null;

  return (
    <nav className={styles.nav} aria-label={t('pages.work.nav')}>
      {previous && (
        <Link
          className={styles.navLink}
          rel="prev"
          to={pathFor('work', language, { slug: previous.slug })}
        >
          ← {t('pages.work.previous', { title: previous.title[language] })}
        </Link>
      )}
      {next && (
        <Link
          className={`${styles.navLink ?? ''} ${styles.navNext ?? ''}`}
          rel="next"
          to={pathFor('work', language, { slug: next.slug })}
        >
          {t('pages.work.next', { title: next.title[language] })} →
        </Link>
      )}
    </nav>
  );
}
