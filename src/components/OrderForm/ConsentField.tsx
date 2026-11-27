import type { UseFormRegister } from 'react-hook-form';
import { Trans } from 'react-i18next';
import { Link } from 'react-router';
import type { OrderFormValues } from '../../lib/orderSchema';
import { pathFor } from '../../lib/routes';
import { useLanguage } from '../../lib/useLanguage';
import { fieldAria } from './fieldAria';
import { FieldError } from './FieldError';
import styles from './OrderForm.module.css';

interface ConsentFieldProps {
  register: UseFormRegister<OrderFormValues>;
  /** The zod message (a `form.errors` key) of the consent error, if any. */
  error?: string;
}

/**
 * The required privacy consent. The checkbox sits inside its label (the text holds a link to
 * the policy), so it cannot use FormField's label-above layout, only its ARIA wiring.
 */
export function ConsentField({ register, error }: ConsentFieldProps) {
  const language = useLanguage();
  const { aria, errorId } = fieldAria('order-consent', { required: true, error });

  return (
    <div className={styles.field}>
      <label className={styles.consent}>
        <input type="checkbox" {...aria} {...register('consent')} />
        <span>
          <Trans
            i18nKey="form.consent.label"
            components={{ policy: <Link to={pathFor('privacy', language)} target="_blank" /> }}
          />
          <span aria-hidden="true"> *</span>
        </span>
      </label>
      {error && <FieldError id={errorId} message={error} />}
    </div>
  );
}
