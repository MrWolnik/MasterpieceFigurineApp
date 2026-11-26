import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Hero } from '../../components/Hero/Hero';
import styles from './Home.module.css';

const FEATURED_ID = 'featured';
/** Class on <html> that turns on full-screen snapping (see Home.module.css). */
export const SNAP_CLASS = 'home-snap';

export function Home() {
  const { t } = useTranslation();

  // The page scrolls on <html>, so snapping must be set there, and only while Home is shown.
  useEffect(() => {
    document.documentElement.classList.add(SNAP_CLASS);
    return () => {
      document.documentElement.classList.remove(SNAP_CLASS);
    };
  }, []);

  return (
    <div className={styles.home}>
      <Hero nextSectionId={FEATURED_ID} />
      {/* Filled with featured works in Z2.3. */}
      <section id={FEATURED_ID} className={styles.featured} aria-labelledby="featured-title">
        <h2 id="featured-title">{t('home.featured.title')}</h2>
      </section>
    </div>
  );
}
