import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { site } from '../../config/site';
import { pathFor } from '../../lib/routes';
import { useLanguage } from '../../lib/useLanguage';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import styles from './Hero.module.css';

interface HeroProps {
  /** Id of the section the scroll indicator jumps to. */
  nextSectionId: string;
}

/** Full-screen intro: Julia's photo, who she is, an order button and a scroll indicator. */
export function Hero({ nextSectionId }: HeroProps) {
  const { t } = useTranslation();
  const language = useLanguage();

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.photo}>
        {/* The first thing on the page: load it right away. */}
        <img src={site.portrait} alt={t('home.hero.portraitAlt')} fetchPriority="high" />
      </div>
      <div className={styles.text}>
        <p className={styles.eyebrow}>{t('app.tagline')}</p>
        <h1 id="hero-title" className={styles.title}>
          {site.artistName}
        </h1>
        <p className={styles.lead}>{t('home.hero.lead')}</p>
        <Link className={styles.cta} to={pathFor('contact', language)}>
          {t('home.hero.cta')}
        </Link>
      </div>
      <a className={styles.scroll} href={`#${nextSectionId}`} aria-label={t('home.hero.scroll')}>
        <ChevronDownIcon />
      </a>
    </section>
  );
}
