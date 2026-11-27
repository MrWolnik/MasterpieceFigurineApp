/** The ARIA attributes that tie a control to its hint and error (see FormField). */
export interface FieldAria {
  id: string;
  'aria-required'?: boolean;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
}

interface FieldAriaOptions {
  required?: boolean;
  hint?: string;
  error?: string;
}

/**
 * Ids of a field's hint and error (`<id>-hint`, `<id>-error`, present only when there is text)
 * and the control's ARIA attributes pointing at them, error first.
 */
export function fieldAria(id: string, { required, hint, error }: FieldAriaOptions = {}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const aria: FieldAria = {
    id,
    'aria-required': required,
    'aria-invalid': Boolean(error),
    'aria-describedby': [errorId, hintId].filter(Boolean).join(' ') || undefined,
  };
  return { aria, hintId, errorId };
}
