import { useTranslation } from 'react-i18next';
import { site } from '../../config/site';
import { SocialLinks } from '../Layout/SocialLinks/SocialLinks';
import { ProtectedEmail } from '../ProtectedEmail/ProtectedEmail';
import styles from './ContactDetails.module.css';

/** E-mail (bot-protected) and social media from `site.ts`. */
export function ContactDetails() {
  const { t } = useTranslation();
  const showSocials = import.meta.env.DEV || site.socials.some(({ url }) => url.trim() !== '');

  return (
    <section className={styles.details} aria-label={t('pages.contact.details.title')}>
      <h2>{t('pages.contact.details.title')}</h2>
      <p className={styles.row}>
        <span className={styles.label}>{t('pages.contact.details.email')}</span>
        <ProtectedEmail
          className={styles.email}
          address={site.contactEmail}
          label={t('pages.contact.details.emailLink', { email: site.contactEmail })}
        />
      </p>
      {showSocials && (
        <div className={styles.row}>
          <span className={styles.label}>{t('pages.contact.details.social')}</span>
          <SocialLinks socials={site.socials} showPlaceholders={import.meta.env.DEV} />
        </div>
      )}
    </section>
  );
}
