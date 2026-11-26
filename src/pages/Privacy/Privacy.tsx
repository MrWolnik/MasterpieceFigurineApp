import { useTranslation } from 'react-i18next';
import { ProtectedEmail } from '../../components/ProtectedEmail/ProtectedEmail';
import { site } from '../../config/site';
import styles from './Privacy.module.css';

interface PolicySection {
  title: string;
  paragraphs: string[];
}

/** Privacy policy (a template Julia completes before launch), in both languages. */
export function Privacy() {
  const { t } = useTranslation();
  const sections: PolicySection[] = t('pages.privacy.sections', { returnObjects: true });

  return (
    <article className={styles.page}>
      <h1>{t('pages.privacy.title')}</h1>
      <p className={styles.draft}>{t('pages.privacy.draft')}</p>
      {sections.map((section) => (
        <section key={section.title} className={styles.section}>
          <h2>{section.title}</h2>
          {section.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </section>
      ))}
      <p>
        {t('pages.privacy.contact')}{' '}
        <ProtectedEmail
          address={site.contactEmail}
          label={t('pages.contact.details.emailLink', { email: site.contactEmail })}
        />
      </p>
      <p className={styles.updated}>{t('pages.privacy.updated')}</p>
    </article>
  );
}
