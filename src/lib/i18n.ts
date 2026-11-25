import i18next, { type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import pl from '../locales/pl.json';

export const languages = ['pl', 'en'] as const;
export type Language = (typeof languages)[number];
export const defaultLanguage: Language = 'pl';

export const resources = {
  pl: { translation: pl },
  en: { translation: en },
} as const;

/**
 * Creates an independent, synchronously initialised i18next instance.
 * A factory (instead of one global instance) keeps tests isolated from each other.
 */
export function createI18n(lng: Language = defaultLanguage): i18n {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    lng,
    fallbackLng: defaultLanguage,
    supportedLngs: languages,
    resources,
    initAsync: false,
    interpolation: { escapeValue: false }, // React already escapes output
  });
  return instance;
}
