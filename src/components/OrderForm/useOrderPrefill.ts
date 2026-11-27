import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { emptyOrder, type OrderFormValues } from '../../lib/orderSchema';
import { useLanguage } from '../../lib/useLanguage';
import { getBySlug, isWorkKind } from '../../lib/works';

/**
 * Initial form values from the URL: `?kind=painting` presets the order type and
 * `?ref=<slug>` (from "I want a similar one") writes the work's title into the description.
 * Unknown values are ignored.
 */
export function useOrderPrefill(): OrderFormValues {
  const { t } = useTranslation();
  const language = useLanguage();
  const [params] = useSearchParams();
  const kindParam = params.get('kind');
  const work = getBySlug(params.get('ref') ?? '');

  const kind = isWorkKind(kindParam) ? kindParam : (work?.kind ?? 'figurine');
  const description = work ? t('form.description.prefill', { title: work.title[language] }) : '';

  return emptyOrder({ kind, description });
}
