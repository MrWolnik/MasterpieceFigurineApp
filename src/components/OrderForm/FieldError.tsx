import { useTranslation } from 'react-i18next';
import { isOrderError } from '../../lib/orderSchema';
import styles from './OrderForm.module.css';

/** A field's validation error: zod messages are `form.errors` keys, translated here. */
export function FieldError({ id, message }: { id?: string; message: string }) {
  const { t } = useTranslation();
  return (
    <p id={id} className={styles.error}>
      {isOrderError(message) ? t(`form.errors.${message}`) : message}
    </p>
  );
}
