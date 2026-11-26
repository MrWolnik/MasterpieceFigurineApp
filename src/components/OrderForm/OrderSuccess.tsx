import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './OrderForm.module.css';

/** Confirmation shown in place of the form; focused so screen readers announce it. */
export function OrderSuccess({ onReset }: { onReset: () => void }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div ref={ref} className={styles.form} role="status" tabIndex={-1}>
      <h2>{t('form.success.title')}</h2>
      <p>{t('form.success.text')}</p>
      <button className={styles.submit} type="button" onClick={onReset}>
        {t('form.success.again')}
      </button>
    </div>
  );
}
