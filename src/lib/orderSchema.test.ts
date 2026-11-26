import { describe, expect, it } from 'vitest';
import { createOrderSchema, emptyOrder, isoDate, type OrderFormValues } from './orderSchema';

const today = new Date(2026, 10, 26); // 26 Nov 2026
const schema = createOrderSchema(today);

const valid = (overrides: Partial<OrderFormValues> = {}) =>
  emptyOrder({
    name: 'Anna',
    email: 'anna@example.com',
    description: 'Space Marine w barwach zakonu, styl pokazowy.',
    consent: true,
    ...overrides,
  });

function errorsOf(values: OrderFormValues) {
  const result = schema.safeParse(values);
  return result.success
    ? {}
    : Object.fromEntries(result.error.issues.map((issue) => [issue.path.join('.'), issue.message]));
}

describe('order schema', () => {
  it('accepts an e-mail without a phone', () => {
    expect(schema.safeParse(valid()).success).toBe(true);
  });

  it('accepts a phone without an e-mail', () => {
    expect(schema.safeParse(valid({ email: '', phone: '+48 600 123 456' })).success).toBe(true);
  });

  it('requires an e-mail or a phone', () => {
    expect(errorsOf(valid({ email: '', phone: '' }))).toEqual({ email: 'contact' });
  });

  it('rejects a malformed e-mail and a phone without a country code', () => {
    expect(errorsOf(valid({ email: 'anna@', phone: '600123456' }))).toEqual({
      email: 'email',
      phone: 'phone',
    });
  });

  it('rejects a deadline in the past but accepts today', () => {
    expect(errorsOf(valid({ deadline: '2026-11-25' }))).toEqual({ deadline: 'deadlinePast' });
    expect(schema.safeParse(valid({ deadline: isoDate(today) })).success).toBe(true);
  });

  it('rejects a too short description', () => {
    expect(errorsOf(valid({ description: 'Za krótko' }))).toEqual({
      description: 'descriptionShort',
    });
  });

  it('requires a name and consent', () => {
    expect(errorsOf(valid({ name: '  ', consent: false }))).toEqual({
      name: 'required',
      consent: 'consent',
    });
  });

  it('ignores painting fields for a figurine', () => {
    const order = schema.parse(valid({ dimensions: '50 × 70 cm', technique: 'oil' }));

    expect(order).not.toHaveProperty('dimensions');
    expect(order).not.toHaveProperty('technique');
  });

  it('keeps painting fields for a painting', () => {
    const order = schema.parse(
      valid({ kind: 'painting', dimensions: '50 × 70 cm', technique: 'oil' }),
    );

    expect(order).toMatchObject({ kind: 'painting', dimensions: '50 × 70 cm', technique: 'oil' });
  });

  it('allows at most 3 files', () => {
    const files = Array.from({ length: 4 }, (_, i) => new File(['x'], `${String(i)}.png`));
    expect(errorsOf(valid({ files }))).toEqual({ files: 'tooManyFiles' });
  });
});
