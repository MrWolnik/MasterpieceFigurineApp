import { useTranslation } from 'react-i18next';
import { Hero } from '../../components/Hero/Hero';
import styles from './Home.module.css';

const FEATURED_ID = 'featured';

export function Home() {
  const { t } = useTranslation();

  return (
    <>
      <Hero nextSectionId={FEATURED_ID} />
      {/* Filled with featured works in Z2.3. */}
      <section id={FEATURED_ID} className={styles.featured} aria-labelledby="featured-title">
        <h2 id="featured-title">{t('home.featured.title')}</h2>
      </section>
    </>
  );
}
