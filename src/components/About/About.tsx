import { useTranslation } from 'react-i18next';
import styles from './About.module.css';

interface Step {
  title: string;
  text: string;
}

/** "About me": Julia's story, what she takes on and the 4 steps of a commission. */
export function About() {
  const { t } = useTranslation();
  const paragraphs: string[] = t('pages.contact.about.paragraphs', { returnObjects: true });
  const steps: Step[] = t('pages.contact.about.steps', { returnObjects: true });

  return (
    <section className={styles.about} aria-labelledby="about-title">
      <h2 id="about-title">{t('pages.contact.about.title')}</h2>
      {paragraphs.map((text) => (
        <p key={text}>{text}</p>
      ))}
      <p className={styles.commissions}>{t('pages.contact.about.commissions')}</p>
      <h3>{t('pages.contact.about.processTitle')}</h3>
      <ol className={styles.steps}>
        {steps.map((step) => (
          <li key={step.title} className={styles.step}>
            <strong>{step.title}</strong>
            <span>{step.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
