import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { pathFor } from '../../lib/routes';
import { useLanguage } from '../../lib/useLanguage';
import type { Figurine } from '../../lib/works';
import { Turntable } from '../Turntable/Turntable';
import styles from './FeaturedWorks.module.css';

interface FeaturedWorksProps {
  works: readonly Figurine[];
}

/** Featured figurines with a 360° preview (or the cover), each linking to its details. */
export function FeaturedWorks({ works }: FeaturedWorksProps) {
  const { t } = useTranslation();
  const language = useLanguage();

  return (
    <div className={styles.featured}>
      <ul className={styles.list}>
        {works.map((work) => {
          const title = work.title[language];
          return (
            <li key={work.slug} className={styles.item}>
              <div className={styles.media}>
                {work.frames ? (
                  <Turntable
                    slug={work.slug}
                    frames={work.frames}
                    format={work.framesFormat}
                    title={title}
                    autoRotate
                  />
                ) : (
                  <img className={styles.cover} src={work.cover} alt="" loading="lazy" />
                )}
              </div>
              <h3 className={styles.title}>
                <Link to={pathFor('work', language, { slug: work.slug })}>{title}</Link>
              </h3>
            </li>
          );
        })}
      </ul>
      <Link className={styles.cta} to={pathFor('portfolio', language)}>
        {t('home.featured.cta')}
      </Link>
    </div>
  );
}
