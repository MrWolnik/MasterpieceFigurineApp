/**
 * Every work kind, in display order (filters list them in this order). A plain constant, not
 * derived from the zod schema, so the browser bundle needs no zod; parseWorks.test.ts checks
 * that it matches the schema.
 */
export const WORK_KINDS = ['figurine', 'painting'] as const;
