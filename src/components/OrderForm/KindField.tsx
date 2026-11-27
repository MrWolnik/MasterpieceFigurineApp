import type { UseFormRegister, UseFormResetField } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { OrderFormValues } from '../../lib/orderSchema';
import { WORK_KINDS } from '../../lib/works';
import styles from './OrderForm.module.css';

interface KindFieldProps {
  register: UseFormRegister<OrderFormValues>;
  resetField: UseFormResetField<OrderFormValues>;
}

/** The order type (figurine or painting); switching it drops the painting-only answers. */
export function KindField({ register, resetField }: KindFieldProps) {
  const { t } = useTranslation();

  return (
    <fieldset className={styles.kinds}>
      <legend className={styles.label}>{t('form.kind.legend')}</legend>
      {WORK_KINDS.map((value) => (
        <label key={value} className={styles.kind}>
          <input
            type="radio"
            value={value}
            {...register('kind', {
              onChange: () => {
                // Painting-only answers must not linger (or be sent) after switching back.
                resetField('dimensions', { defaultValue: '' });
                resetField('technique', { defaultValue: '' });
              },
            })}
          />
          <span>{t(`form.kind.${value}`)}</span>
        </label>
      ))}
    </fieldset>
  );
}
