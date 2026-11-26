import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { site } from '../../../config/site';
import { pathFor } from '../../../lib/routes';
import { useLanguage } from '../../../lib/useLanguage';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
import { ProtectedEmail } from '../../ProtectedEmail/ProtectedEmail';
import { SocialLinks } from '../SocialLinks/SocialLinks';
import styles from './Footer.module.css';

export function Footer() {
  const { t } = useTranslation();
  const language = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.contact}>
          <SocialLinks socials={site.socials} showPlaceholders={import.meta.env.DEV} />
          <ProtectedEmail
            className={styles.email}
            address={site.contactEmail}
            label={t('layout.footer.email', { email: site.contactEmail })}
          />
        </div>

        <div className={styles.meta}>
          <LanguageSwitcher landmark={false} />
          <Link className={styles.metaLink} to={pathFor('privacy', language)}>
            {t('layout.footer.privacy')}
          </Link>
          <p className={styles.copyright}>
            {t('layout.footer.copyright', {
              year: new Date().getFullYear(),
              brand: site.brand,
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}
