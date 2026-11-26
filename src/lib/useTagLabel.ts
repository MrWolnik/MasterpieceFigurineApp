import { useTranslation } from 'react-i18next';

/**
 * Returns a function translating a tag id (e.g. `olej`) to its label in the active language.
 * Tags without a translation in `tags.*` fall back to the raw id.
 */
export function useTagLabel(): (tag: string) => string {
  const { t } = useTranslation();
  const labels: Partial<Record<string, string>> = t('tags', { returnObjects: true });
  return (tag) => labels[tag] ?? tag;
}
