import { z } from 'zod';
import { MAX_FILE_COUNT } from './acceptFiles';
import type { WorkKind } from './works';

// Order types are the work kinds, so "I want a similar one" can pass `?kind=` straight on.
export const TECHNIQUES = ['oil', 'acrylic', 'watercolor', 'any'] as const;
export type Technique = (typeof TECHNIQUES)[number];

export const MIN_DESCRIPTION = 20;

/** Error messages are keys under `form.errors` in the locale files. */
export const ORDER_ERRORS = [
  'required',
  'email',
  'phone',
  'contact',
  'descriptionShort',
  'deadlinePast',
  'deadlineInvalid',
  'consent',
  'tooManyFiles',
] as const;
export type OrderError = (typeof ORDER_ERRORS)[number];

export function isOrderError(message: unknown): message is OrderError {
  return (ORDER_ERRORS as readonly unknown[]).includes(message);
}

/** International format: `+`, country code, then 6–14 more digits; spaces and dashes allowed. */
const PHONE = /^\+[1-9](?:[\s-]?\d){6,14}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Local calendar date as `YYYY-MM-DD`, the format of `<input type="date">`. */
export function isoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const optional = (schema: z.ZodType<string, string>) => z.union([z.literal(''), schema]);

/** E-mail or phone must be given. Checks raw input: it also runs when other fields fail. */
function hasContact(order: { email?: unknown; phone?: unknown }): boolean {
  const filled = (value: unknown) => typeof value === 'string' && value.trim() !== '';
  return filled(order.email) || filled(order.phone);
}

/**
 * The order form schema: a union discriminated by `kind`. Painting-only fields exist only in the
 * painting variant; the figurine variant strips them, so they are never sent for a figurine.
 * `today` is injectable for tests.
 */
export function createOrderSchema(today: Date = new Date()) {
  const todayIso = isoDate(today);

  const common = {
    name: z.string().trim().min(1, 'required'),
    email: optional(z.string().trim().pipe(z.email('email'))),
    phone: optional(z.string().trim().regex(PHONE, 'phone')),
    description: z.string().trim().min(MIN_DESCRIPTION, 'descriptionShort'),
    deadline: optional(
      z
        .string()
        .regex(ISO_DATE, 'deadlineInvalid')
        .refine((value) => value >= todayIso, 'deadlinePast'),
    ),
    files: z.array(z.instanceof(File)).max(MAX_FILE_COUNT, 'tooManyFiles'),
    consent: z.literal(true, 'consent'),
  };

  return z
    .discriminatedUnion('kind', [
      z.object({ kind: z.literal('figurine'), ...common }),
      z.object({
        kind: z.literal('painting'),
        ...common,
        dimensions: z.string().trim().max(100),
        technique: z.union([z.literal(''), z.enum(TECHNIQUES)]),
      }),
    ])
    .refine(hasContact, {
      path: ['email'],
      error: 'contact',
      // Run even while other fields are invalid, so all errors show at once.
      when: () => true,
    });
}

export type Order = z.output<ReturnType<typeof createOrderSchema>>;

/** Every field the form can hold; painting-only ones stay empty for a figurine. */
export interface OrderFormValues {
  kind: WorkKind;
  name: string;
  email: string;
  phone: string;
  description: string;
  dimensions: string;
  technique: '' | Technique;
  deadline: string;
  files: File[];
  consent: boolean;
}

export function emptyOrder(overrides: Partial<OrderFormValues> = {}): OrderFormValues {
  return {
    kind: 'figurine',
    name: '',
    email: '',
    phone: '',
    description: '',
    dimensions: '',
    technique: '',
    deadline: '',
    files: [],
    consent: false,
    ...overrides,
  };
}
