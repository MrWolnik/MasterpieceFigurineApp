import { z } from 'zod';
import { workSchema, type Work, type WorkKind } from './works.schema';

export type { Figurine, Painting, Work, WorkKind } from './works.schema';

export interface WorkFilter {
  kind?: WorkKind;
  tag?: string;
}

/** File name without directory and `.json`, e.g. `/src/content/works/a-b.json` → `a-b`. */
function fileSlug(path: string): string {
  return path.replace(/^.*\//, '').replace(/\.json$/, '');
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
    return result.data;
  });

  const seen = new Set<string>();
  for (const { slug } of works) {
    if (seen.has(slug)) throw new Error(`Duplicate work slug "${slug}"`);
    seen.add(slug);
  }

  return sortWorks(works);
}

/** Sorts by `order`, then by slug so equal orders stay deterministic. */
export function sortWorks(works: readonly Work[]): Work[] {
  return [...works].sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

export function filterWorks(works: readonly Work[], { kind, tag }: WorkFilter = {}): Work[] {
  return works.filter((work) => (!kind || work.kind === kind) && (!tag || work.tags.includes(tag)));
}

export function collectTags(works: readonly Work[], kind?: WorkKind): string[] {
  const tags = new Set(filterWorks(works, { kind }).flatMap((work) => work.tags));
  return [...tags].sort((a, b) => a.localeCompare(b));
}

const allWorks = parseWorks(
  import.meta.glob('/src/content/works/*.json', { eager: true, import: 'default' }),
);

/** All works, sorted by `order`, optionally filtered by kind and/or tag. */
export function getWorks(filter: WorkFilter = {}): Work[] {
  return filterWorks(allWorks, filter);
}

export function getFeatured(): Work[] {
  return allWorks.filter((work) => work.featured);
}

export function getBySlug(slug: string): Work | undefined {
  return allWorks.find((work) => work.slug === slug);
}

/** Unique tags (alphabetical) used by all works or by works of one kind. */
export function getTags(kind?: WorkKind): string[] {
  return collectTags(allWorks, kind);
}
