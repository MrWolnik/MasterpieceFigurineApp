import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { pathFor } from '../../lib/routes';
import { useLanguage } from '../../lib/useLanguage';
import { useReveal } from '../../lib/useReveal';
import type { Figurine } from '../../lib/works';
import { ResponsiveImage } from '../ResponsiveImage/ResponsiveImage';
import { Turntable } from '../Turntable/Turntable';
import styles from './FeaturedWorks.module.css';

interface FeaturedWorksProps {
  works: readonly Figurine[];
}

/** Featured figurines with a 360° preview (or the cover), each linking to its details. */
export function FeaturedWorks({ works }: FeaturedWorksProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const list = useReveal<HTMLUListElement>({ className: styles.list });
  const cta = useReveal<HTMLAnchorElement>({ className: styles.cta, delay: 150 });

  return (
    <div className={styles.featured}>
      <ul {...list}>
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
                  <ResponsiveImage
                    className={styles.cover}
                    src={work.cover}
                    alt=""
                    // At most 22rem wide (FeaturedWorks.module.css).
                    sizes="(min-width: 25rem) 22rem, 100vw"
                  />
                )}
              </div>
              <h3 className={styles.title}>
                <Link to={pathFor('work', language, { slug: work.slug })}>{title}</Link>
              </h3>
            </li>
          );
        })}
      </ul>
      <Link {...cta} to={pathFor('portfolio', language)}>
        {t('home.featured.cta')}
      </Link>
    </div>
  );
}
