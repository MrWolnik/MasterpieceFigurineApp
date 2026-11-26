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
interface LanguageSwitcherProps {
  /**
   * Render as a navigation landmark (default). The footer copy passes `false` and renders a
   * labelled group instead, so the page does not get two landmarks with the same name.
   */
  landmark?: boolean;
}

export function LanguageSwitcher({ landmark = true }: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const current = useLanguage();
  const Wrapper = landmark ? 'nav' : 'div';
  const wrapperProps = landmark ? {} : { role: 'group' };

  return (
    <Wrapper {...wrapperProps} aria-label={t('languageSwitcher.label')}>
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
    </Wrapper>
  );
}
