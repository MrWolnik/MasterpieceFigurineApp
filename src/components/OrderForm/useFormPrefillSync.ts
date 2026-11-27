import { useLayoutEffect, useRef } from 'react';
import type { UseFormGetFieldState, UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import type { OrderFormValues } from '../../lib/orderSchema';

/**
 * When the language changes, swaps the prefilled description ("I want a similar one to: …") for
 * the new language's text, unless the user has already edited it.
 */
export function useTranslatedPrefill(
  prefill: string,
  getValues: UseFormGetValues<OrderFormValues>,
  setValue: UseFormSetValue<OrderFormValues>,
) {
  const previous = useRef(prefill);

  // Layout effect: applied in the same commit that enables the form after hydration, so no
  // keystroke can land in between.
  useLayoutEffect(() => {
    if (previous.current !== prefill && getValues('description') === previous.current) {
      setValue('description', prefill);
    }
    previous.current = prefill;
  }, [prefill, getValues, setValue]);
}

/**
 * Prerendered HTML cannot know the URL query, so `?kind=` reaches the form only after hydration
 * (see useOrderPrefill). Applies it then without remounting the form, so nothing the user has
 * typed is lost, and only if they have not picked an order type themselves.
 */
export function useLatePrefillKind(
  prefill: OrderFormValues['kind'],
  getFieldState: UseFormGetFieldState<OrderFormValues>,
  setValue: UseFormSetValue<OrderFormValues>,
) {
  useLayoutEffect(() => {
    // Touched too: picking a type and switching back leaves it clean but chosen.
    const { isDirty, isTouched } = getFieldState('kind');
    if (!isDirty && !isTouched) setValue('kind', prefill);
  }, [prefill, getFieldState, setValue]);
}
