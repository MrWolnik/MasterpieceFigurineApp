import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useRef, useState } from 'react';
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { createOrderSchema, type Order, type OrderFormValues } from '../../lib/orderSchema';
import { HONEYPOT_FIELD } from '../../lib/submitOrder';
import { useHydrated } from '../../lib/useHydrated';
import { Dropzone } from '../Dropzone/Dropzone';
import { ConsentField } from './ConsentField';
import { FormField } from './FormField';
import { KindField } from './KindField';
import { OrderSuccess } from './OrderSuccess';
import styles from './OrderForm.module.css';
import { PaintingFields } from './PaintingFields';
import { useLatePrefillKind, useTranslatedPrefill } from './useFormPrefillSync';
import { useOrderPrefill } from './useOrderPrefill';

interface OrderFormProps {
  onSubmit: (order: Order) => Promise<void>;
}

/** The order request form; `?kind=` and `?ref=` in the URL preset it. */
export function OrderForm({ onSubmit }: OrderFormProps) {
  const { t } = useTranslation();
  const defaultValues = useOrderPrefill();
  // Prerendered HTML shows the form before the JS has loaded; it cannot be sent then, and text
  // typed into it would be unknown to the form state, so it stays disabled until hydration.
  const hydrated = useHydrated();
  const schema = useMemo(() => createOrderSchema(), []);
  const {
    register,
    handleSubmit,
    resetField,
    reset,
    getValues,
    getFieldState,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues, unknown, Order>({
    // The form holds every field flat (unchecked consent, empty painting fields for a figurine),
    // while the schema's input is the stricter union; validation bridges the two at runtime.
    resolver: zodResolver(schema) as unknown as Resolver<OrderFormValues, unknown, Order>,
    defaultValues,
  });
  const kind = useWatch({ control, name: 'kind' });
  // Also fills the description in once the prefill arrives after hydration (it starts empty).
  useTranslatedPrefill(defaultValues.description, getValues, setValue);
  useLatePrefillKind(defaultValues.kind, getFieldState, setValue);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'sent' | 'failed'>('idle');

  async function send(order: Order) {
    setStatus('idle');
    // A filled honeypot means a bot: pretend success and send nothing.
    if (honeypotRef.current?.value) {
      setStatus('sent');
      return;
    }
    try {
      await onSubmit(order);
      setStatus('sent');
    } catch {
      setStatus('failed'); // values stay in the form, so the user can simply retry
    }
  }

  if (status === 'sent') {
    return (
      <OrderSuccess
        onReset={() => {
          reset(defaultValues);
          setStatus('idle');
        }}
      />
    );
  }

  return (
    <form
      className={styles.form}
      // aria-label, not aria-labelledby: the latter crashes Firefox under axe on this page.
      aria-label={t('form.title')}
      noValidate
      onSubmit={(event) => void handleSubmit(send)(event)}
    >
      <h2>{t('form.title')}</h2>
      <fieldset className={styles.controls} disabled={!hydrated}>
        {/* Honeypot: hidden from people and assistive tech, tempting for bots. */}
        <p className={styles.honeypot} aria-hidden="true">
          <label>
            {t('form.honeypot')}
            <input
              ref={honeypotRef}
              name={HONEYPOT_FIELD}
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </p>
        <p className={styles.hint}>{t('form.intro')}</p>

        <KindField register={register} resetField={resetField} />

        <FormField
          id="order-name"
          label={t('form.name.label')}
          required
          error={errors.name?.message}
        >
          {(aria) => (
            <input
              className={styles.input}
              type="text"
              autoComplete="name"
              {...aria}
              {...register('name')}
            />
          )}
        </FormField>

        <div className={styles.row}>
          <FormField id="order-email" label={t('form.email.label')} error={errors.email?.message}>
            {(aria) => (
              <input
                className={styles.input}
                type="email"
                autoComplete="email"
                {...aria}
                {...register('email')}
              />
            )}
          </FormField>
          <FormField
            id="order-phone"
            label={t('form.phone.label')}
            hint={t('form.phone.hint')}
            error={errors.phone?.message}
          >
            {(aria) => (
              <input
                className={styles.input}
                type="tel"
                autoComplete="tel"
                {...aria}
                {...register('phone')}
              />
            )}
          </FormField>
        </div>

        <FormField
          id="order-description"
          label={t('form.description.label')}
          required
          error={errors.description?.message}
        >
          {(aria) => (
            <textarea
              className={styles.input}
              rows={6}
              placeholder={t(`form.description.placeholder.${kind}`)}
              {...aria}
              {...register('description')}
            />
          )}
        </FormField>

        {kind === 'painting' && <PaintingFields register={register} />}

        <FormField
          id="order-deadline"
          label={t('form.deadline.label')}
          hint={t('form.deadline.hint')}
          error={errors.deadline?.message}
        >
          {(aria) => (
            <input className={styles.input} type="date" {...aria} {...register('deadline')} />
          )}
        </FormField>

        <Controller
          control={control}
          name="files"
          render={({ field }) => (
            <Dropzone
              name="files"
              label={t(`form.files.label.${kind}`)}
              hint={t(`form.files.hint.${kind}`)}
              files={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <ConsentField register={register} error={errors.consent?.message} />

        {status === 'failed' && (
          <p className={styles.failure} role="alert">
            {t('form.failure')}
          </p>
        )}

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('form.sending') : t('form.submit')}
        </button>
      </fieldset>
    </form>
  );
}
