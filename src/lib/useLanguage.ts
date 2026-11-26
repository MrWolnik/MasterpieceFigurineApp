import { useTranslation } from 'react-i18next';
import { defaultLanguage, isLanguage, type Language } from './i18n';

/** The active UI language, narrowed to the supported `Language` union. */
export function useLanguage(): Language {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  return isLanguage(language) ? language : defaultLanguage;
}
