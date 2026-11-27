import type { ReactNode } from 'react';
import { fieldAria, type FieldAria } from './fieldAria';
import { FieldError } from './FieldError';
import styles from './OrderForm.module.css';

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
  const { aria, hintId, errorId } = fieldAria(id, { required, hint, error });

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children(aria)}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && <FieldError id={errorId} message={error} />}
    </div>
  );
}
