import { i18nFor } from './i18n';
import type { Order } from './orderSchema';

/** Name of the Netlify form; the static copy in `index.html` declares the same name and fields. */
const ORDER_FORM_NAME = 'order';
export const HONEYPOT_FIELD = 'bot-field';
/** One photo per order keeps a submission under Netlify's request size limit. */
const PHOTO_FIELD = 'photo';

/** E-mail subject for Julia, always in Polish, e.g. "[Obraz] Nowe zgłoszenie – Anna". */
export function orderSubject(order: Pick<Order, 'kind' | 'name'>): string {
  const t = i18nFor('pl').t;
  return t('form.subject', { kind: t(`works.kind.${order.kind}`), name: order.name });
}

/** The multipart body Netlify Forms expects. Painting-only fields are sent only for a painting. */
export function orderFormData(order: Order): FormData {
  const data = new FormData();
  data.set('form-name', ORDER_FORM_NAME);
  data.set('subject', orderSubject(order));
  data.set('kind', order.kind);
  data.set('name', order.name);
  data.set('email', order.email);
  data.set('phone', order.phone);
  data.set('description', order.description);
  data.set('deadline', order.deadline);
  if (order.kind === 'painting') {
    data.set('dimensions', order.dimensions);
    data.set('technique', order.technique);
  }
  const [photo] = order.files;
  if (photo) data.set(PHOTO_FIELD, photo);
  data.set('consent', 'yes');
  return data;
}

/** Sends the order to Netlify Forms as `multipart/form-data`; rejects on a network or HTTP error. */
export async function submitOrder(order: Order): Promise<void> {
  // No Content-Type header: the browser sets multipart with the boundary itself.
  const response = await fetch('/', { method: 'POST', body: orderFormData(order) });
  if (!response.ok) throw new Error(`Form submission failed: ${String(response.status)}`);
}
