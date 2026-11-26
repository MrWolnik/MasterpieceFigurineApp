import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { languages } from '../../../lib/i18n';
import { switchLanguagePath } from '../../../lib/routes';
import { useLanguage } from '../../../lib/useLanguage';
import styles from './LanguageSwitcher.module.css';

/**
 * Links to the current page in every supported language. Plain links (not buttons) so the
 * alternatives are crawlable and work before JavaScript loads once pages are prerendered.
 */
export function LanguageSwitcher() {
  const { t } = useTranslation();
  const location = useLocation();
  const current = useLanguage();

  return (
    <nav aria-label={t('languageSwitcher.label')}>
      <ul className={styles.list}>
        {languages.map((language) => {
          const isCurrent = language === current;
          return (
            <li key={language}>
              <Link
                className={styles.link}
                to={switchLanguagePath(location, language)}
                hrefLang={language}
                lang={language}
                aria-label={t(`languages.${language}.name`)}
                aria-current={isCurrent ? 'true' : undefined}
              >
                {t(`languages.${language}.short`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
