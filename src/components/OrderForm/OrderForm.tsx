import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Controller,
  useForm,
  useWatch,
  type Resolver,
  type UseFormGetValues,
  type UseFormSetValue,
} from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { createOrderSchema, type Order, type OrderFormValues } from '../../lib/orderSchema';
import { pathFor } from '../../lib/routes';
import { HONEYPOT_FIELD } from '../../lib/submitOrder';
import { useLanguage } from '../../lib/useLanguage';
import { WORK_KINDS } from '../../lib/works';
import { Dropzone } from '../Dropzone/Dropzone';
import { FieldError } from './FieldError';
import { FormField } from './FormField';
import { OrderSuccess } from './OrderSuccess';
import styles from './OrderForm.module.css';
import { PaintingFields } from './PaintingFields';
import { useOrderPrefill } from './useOrderPrefill';

interface OrderFormProps {
  onSubmit: (order: Order) => Promise<void>;
}

/**
 * When the language changes, swaps the prefilled description ("I want a similar one to: …") for
 * the new language's text, unless the user has already edited it.
 */
function useTranslatedPrefill(
  prefill: string,
  getValues: UseFormGetValues<OrderFormValues>,
  setValue: UseFormSetValue<OrderFormValues>,
) {
  const previous = useRef(prefill);

  useEffect(() => {
    if (previous.current !== prefill && getValues('description') === previous.current) {
      setValue('description', prefill);
    }
    previous.current = prefill;
  }, [prefill, getValues, setValue]);
}

/** The order request form; `?kind=` and `?ref=` in the URL preset it. */
export function OrderForm({ onSubmit }: OrderFormProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const defaultValues = useOrderPrefill();
  const schema = useMemo(() => createOrderSchema(), []);
  const {
    register,
    handleSubmit,
    resetField,
    reset,
    getValues,
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
  useTranslatedPrefill(defaultValues.description, getValues, setValue);
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

      <FormField id="order-name" label={t('form.name.label')} required error={errors.name?.message}>
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

      <div className={styles.field}>
        <label className={styles.consent}>
          <input
            type="checkbox"
            aria-required
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'order-consent-error' : undefined}
            {...register('consent')}
          />
          <span>
            <Trans
              i18nKey="form.consent.label"
              components={{ policy: <Link to={pathFor('privacy', language)} target="_blank" /> }}
            />
            <span aria-hidden="true"> *</span>
          </span>
        </label>
        {errors.consent?.message && (
          <FieldError id="order-consent-error" message={errors.consent.message} />
        )}
      </div>

      {status === 'failed' && (
        <p className={styles.failure} role="alert">
          {t('form.failure')}
        </p>
      )}

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? t('form.sending') : t('form.submit')}
      </button>
    </form>
  );
}
