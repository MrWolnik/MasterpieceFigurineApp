import type { UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TECHNIQUES, type OrderFormValues } from '../../lib/orderSchema';
import { FormField } from './FormField';
import styles from './OrderForm.module.css';

/** Fields that only make sense for a commissioned painting; they fade in when it is chosen. */
export function PaintingFields({ register }: { register: UseFormRegister<OrderFormValues> }) {
  const { t } = useTranslation();

  return (
    <div className={[styles.row, styles.reveal].join(' ')}>
      <FormField id="order-dimensions" label={t('form.dimensions.label')}>
        {(aria) => (
          <input
            className={styles.input}
            type="text"
            placeholder={t('form.dimensions.placeholder')}
            {...aria}
            {...register('dimensions')}
          />
        )}
      </FormField>
      <FormField id="order-technique" label={t('form.technique.label')}>
        {(aria) => (
          <select className={styles.input} {...aria} {...register('technique')}>
            <option value="">{t('form.technique.choose')}</option>
            {TECHNIQUES.map((technique) => (
              <option key={technique} value={technique}>
                {t(`form.technique.${technique}`)}
              </option>
            ))}
          </select>
        )}
      </FormField>
    </div>
  );
}
