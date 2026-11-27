import { z } from 'zod';
import { workSchema, type Work } from './works.schema.ts';

/**
 * Build-time validation of the work files (zod stays out of the browser bundle): the Vite plugin
 * scripts/vite-plugin-works.ts runs this on `src/content/works/*.json`, so an invalid file stops
 * `npm run dev`, `npm run build` and the tests with an error naming the file and field.
 */

/** File name without directory and `.json`, e.g. `/src/content/works/a-b.json` → `a-b`. */
function fileSlug(path: string): string {
  return path.replace(/^.*\//, '').replace(/\.json$/, '');
}

/** Sorts by `order`, then by slug so equal orders stay deterministic. */
export function sortWorks(works: readonly Work[]): Work[] {
  return [...works].sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

/**
 * Validates raw work files (keyed by file path) and returns them sorted.
 * Throws a readable error naming the file and the invalid field.
 */
export function parseWorks(files: Record<string, unknown>): Work[] {
  const works = Object.entries(files).map(([path, data]) => {
    const result = workSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`Invalid work file ${path}:\n${z.prettifyError(result.error)}`);
    }
    if (result.data.slug !== fileSlug(path)) {
      throw new Error(
        `Invalid work file ${path}: slug "${result.data.slug}" must match the file name`,
      );
    }
    const photos = [result.data.cover, ...result.data.images];
    if (new Set(photos).size !== photos.length) {
      throw new Error(`Invalid work file ${path}: images must be unique and not repeat the cover`);
    }
    return result.data;
  });

  const seen = new Set<string>();
  for (const { slug } of works) {
    if (seen.has(slug)) throw new Error(`Duplicate work slug "${slug}"`);
    seen.add(slug);
  }

  return sortWorks(works);
}
