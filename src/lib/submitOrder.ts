import { i18nFor } from './i18n';
import type { Order } from './orderSchema';

/** Name of the Netlify form; the static copy in `index.html` declares the same name and fields. */
export const ORDER_FORM_NAME = 'order';
export const HONEYPOT_FIELD = 'bot-field';
/** Netlify keeps one file per field, so each photo gets its own field. */
export const PHOTO_FIELDS = ['photo1', 'photo2', 'photo3'] as const;

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
  order.files.forEach((file, index) => {
    const field = PHOTO_FIELDS[index];
    if (field) data.set(field, file);
  });
  data.set('consent', 'yes');
  return data;
}

/** Sends the order to Netlify Forms as `multipart/form-data`; rejects on a network or HTTP error. */
export async function submitOrder(order: Order): Promise<void> {
  // No Content-Type header: the browser sets multipart with the boundary itself.
  const response = await fetch('/', { method: 'POST', body: orderFormData(order) });
  if (!response.ok) throw new Error(`Form submission failed: ${String(response.status)}`);
}
