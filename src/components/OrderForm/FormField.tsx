import type { ReactNode } from 'react';
import { FieldError } from './FieldError';
import styles from './OrderForm.module.css';

interface FieldAria {
  id: string;
  'aria-required'?: boolean;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
}

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  /** The zod message (a `form.errors` key) of the field's error, if any. */
  error?: string;
  children: (aria: FieldAria) => ReactNode;
}

/**
 * Label, control, hint and error of one field. The hint and error are linked to the control
 * through `aria-describedby`, so screen readers read them with the field.
 */
export function FormField({ id, label, required, hint, error, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children({
        id,
        'aria-required': required,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy,
      })}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && <FieldError id={errorId} message={error} />}
    </div>
  );
}
