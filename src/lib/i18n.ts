import i18next, { type i18n as I18n } from 'i18next';
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

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (languages as readonly string[]).includes(value);
}

/**
 * Picks the first supported language from the browser's preference list
 * (e.g. `navigator.languages`), matching on the primary subtag (`en-GB` → `en`).
 * Falls back to Polish when nothing matches.
 */
export function detectLanguage(preferred: readonly string[]): Language {
  for (const tag of preferred) {
    const primary = tag.split('-')[0]?.toLowerCase();
    if (isLanguage(primary)) {
      return primary;
    }
  }
  return defaultLanguage;
}

/** The current browser's preferred language, or Polish outside a browser. */
export function detectBrowserLanguage(): Language {
  return typeof navigator === 'undefined' ? defaultLanguage : detectLanguage(navigator.languages);
}

/**
 * Creates an independent, synchronously initialised i18next instance.
 * A factory (instead of one global instance) keeps tests isolated from each other.
 */
export function createI18n(lng: Language = defaultLanguage): I18n {
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

const instances = new Map<Language, I18n>();

/**
 * One fixed instance per language, shared by the whole app. The rendered route picks the
 * instance (see `Layout`) instead of switching a global language, so the UI language always
 * matches the URL that is actually on screen, even if a navigation is interrupted.
 */
export function i18nFor(lang: Language): I18n {
  let instance = instances.get(lang);
  if (!instance) {
    instance = createI18n(lang);
    instances.set(lang, instance);
  }
  return instance;
}
