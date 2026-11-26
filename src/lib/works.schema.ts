import { z } from 'zod';

/** Text shown in both site languages. */
const localized = z.strictObject({ pl: z.string().min(1), en: z.string().min(1) });

/** Public path of an asset, e.g. `/works/<slug>/cover.webp`. */
const assetPath = z.string().regex(/^\/\S+$/, 'must be an absolute public path');

const baseFields = {
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be kebab-case'),
  title: localized,
  description: localized,
  tags: z.array(z.string().regex(/^[a-z0-9&-]+$/, 'must be lowercase')).default([]),
  cover: assetPath,
  /** CSS `object-position` used to crop the tile cover. */
  coverFocus: z.string().min(1).default('50% 50%'),
  images: z.array(assetPath).default([]),
  featured: z.boolean().default(false),
  order: z.number().int(),
};

export const figurineSchema = z.strictObject({
  kind: z.literal('figurine'),
  ...baseFields,
  /** Number of 360° turntable frames; when absent, a plain gallery is shown. */
  frames: z.number().int().min(2).max(72).optional(),
  /** File format of the frames in `/works/<slug>/frames/001.<format>`. */
  framesFormat: z.enum(['webp', 'svg']).default('webp'),
});

export const paintingSchema = z.strictObject({
  kind: z.literal('painting'),
  ...baseFields,
  image: assetPath,
  imageHiRes: assetPath,
  medium: localized,
  size: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
});

export const workSchema = z.discriminatedUnion('kind', [figurineSchema, paintingSchema]);

/** Every work kind, in display order (filters list them in this order). */
export const WORK_KINDS = workSchema.options.map((option) => option.shape.kind.value);

export type Figurine = z.infer<typeof figurineSchema>;
export type Painting = z.infer<typeof paintingSchema>;
export type Work = z.infer<typeof workSchema>;
export type WorkKind = Work['kind'];
