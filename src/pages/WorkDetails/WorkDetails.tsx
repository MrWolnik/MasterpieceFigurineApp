import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { pathFor } from '../../lib/routes';
import { useLanguage } from '../../lib/useLanguage';
import { useTagLabel } from '../../lib/useTagLabel';
import { filtersToParams } from '../../lib/usePortfolioFilters';
import { getBySlug, getNeighbours } from '../../lib/works';
import { NotFound } from '../NotFound/NotFound';
import styles from './WorkDetails.module.css';
import { WorkMedia } from './WorkMedia';
import { WorkMeta } from './WorkMeta';
import { WorkNav } from './WorkNav';

/** Details of one work: media by kind, description, tags, neighbours and an order link. */
export function WorkDetails() {
  const { t } = useTranslation();
  const language = useLanguage();
  const tagLabel = useTagLabel();
  const { slug = '' } = useParams();
  const work = getBySlug(slug);

  if (!work) return <NotFound />;

  const title = work.title[language];
  const portfolio = pathFor('portfolio', language);
  // The contact form (Z3.3) reads `kind` and `ref` to preset the order type and description.
  const orderParams = new URLSearchParams({ kind: work.kind, ref: work.slug });

  return (
    <article className={styles.page}>
      <Link className={styles.back} to={portfolio}>
        ← {t('pages.work.backToPortfolio')}
      </Link>
      <div className={styles.layout}>
        {/* Keyed by slug: "Next" reuses this page, and the turntable/zoom must start fresh. */}
        <WorkMedia key={work.slug} work={work} title={title} />
        <div className={styles.info}>
          <h1 className={styles.title}>{title}</h1>
          <WorkMeta work={work} />
          <p className={styles.description}>{work.description[language]}</p>
          {work.tags.length > 0 && (
            <ul className={styles.tags} aria-label={t('works.tagsLabel')}>
              {work.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    className={styles.tag}
                    to={`${portfolio}?${filtersToParams({ tag }).toString()}`}
                  >
                    {tagLabel(tag)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className={styles.order}>
            <Link
              className={styles.cta}
              to={`${pathFor('contact', language)}?${orderParams.toString()}`}
            >
              {t('pages.work.orderSimilar')}
            </Link>
            <p className={styles.hint}>{t('pages.work.orderSimilarHint')}</p>
          </div>
        </div>
      </div>
      <WorkNav {...getNeighbours(work.slug)} />
    </article>
  );
}
