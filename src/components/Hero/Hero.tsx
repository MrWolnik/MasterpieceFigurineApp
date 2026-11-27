import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { site } from '../../config/site';
import { pathFor } from '../../lib/routes';
import { useLanguage } from '../../lib/useLanguage';
import { useReveal } from '../../lib/useReveal';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { ResponsiveImage } from '../ResponsiveImage/ResponsiveImage';
import styles from './Hero.module.css';

/** Delay between the Hero text lines as they come in. */
const STAGGER_MS = 100;

interface HeroProps {
  /** Id of the section the scroll indicator jumps to. */
  nextSectionId: string;
}

/** Full-screen intro: Julia's photo, who she is, an order button and a scroll indicator. */
export function Hero({ nextSectionId }: HeroProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  // The text comes in line by line; the portrait stays put, as it is the page's LCP image.
  const eyebrow = useReveal<HTMLParagraphElement>({ className: styles.eyebrow });
  const title = useReveal<HTMLHeadingElement>({ className: styles.title, delay: STAGGER_MS });
  const lead = useReveal<HTMLParagraphElement>({ className: styles.lead, delay: 2 * STAGGER_MS });
  const cta = useReveal<HTMLAnchorElement>({ className: styles.cta, delay: 3 * STAGGER_MS });

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.photo}>
        {/* The first thing on the page: load it right away. */}
        <ResponsiveImage
          src={site.portrait}
          alt={t('home.hero.portraitAlt')}
          // The left column of 5/11 on desktop (Hero.module.css), full width on phones.
          sizes="(min-width: 56.25rem) 45vw, 100vw"
          loading="eager"
          fetchPriority="high"
        />
      </div>
      <div className={styles.text}>
        <p {...eyebrow}>{t('app.tagline')}</p>
        <h1 id="hero-title" {...title}>
          {site.artistName}
        </h1>
        <p {...lead}>{t('home.hero.lead')}</p>
        <Link {...cta} to={pathFor('contact', language)}>
          {t('home.hero.cta')}
        </Link>
      </div>
      <a className={styles.scroll} href={`#${nextSectionId}`} aria-label={t('home.hero.scroll')}>
        <ChevronDownIcon />
      </a>
    </section>
  );
}
