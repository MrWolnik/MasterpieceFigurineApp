import { useTranslation } from 'react-i18next';
import type { SocialLink } from '../../../config/site';
import { SocialIcon } from '../icons/SocialIcon';
import styles from './SocialLinks.module.css';

interface SocialLinksProps {
  socials: readonly SocialLink[];
  /**
   * When no link is set at all, show every network as a grey placeholder.
   * Meant for development only, so the footer layout can be judged before links exist.
   */
  showPlaceholders?: boolean;
}

export function SocialLinks({ socials, showPlaceholders = false }: SocialLinksProps) {
  const { t } = useTranslation();
  const linked = socials.filter((social) => social.url.trim() !== '');

  if (linked.length === 0) {
    if (!showPlaceholders) {
      return null;
    }
    return (
      <ul className={styles.list} aria-label={t('layout.footer.social')}>
        {socials.map(({ id, label }) => {
          const name = t('layout.footer.placeholder', { label });
          return (
            <li key={id}>
              <span className={styles.placeholder} role="img" aria-label={name} title={name}>
                <SocialIcon id={id} />
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className={styles.list} aria-label={t('layout.footer.social')}>
      {linked.map(({ id, label, url }) => (
        <li key={id}>
          <a
            className={styles.link}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('layout.footer.newTab', { label })}
          >
            <SocialIcon id={id} />
          </a>
        </li>
      ))}
    </ul>
  );
}
