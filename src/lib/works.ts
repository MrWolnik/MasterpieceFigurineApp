import { z } from 'zod';
import { WORK_KINDS, workSchema, type Figurine, type Work, type WorkKind } from './works.schema';

export { WORK_KINDS } from './works.schema';
export type { Figurine, Painting, Work, WorkKind } from './works.schema';

/** Narrows a URL value (e.g. `?kind=`) to a work kind. */
export function isWorkKind(value: unknown): value is WorkKind {
  return (WORK_KINDS as readonly unknown[]).includes(value);
}

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

/** Sorts by `order`, then by slug so equal orders stay deterministic. */
export function sortWorks(works: readonly Work[]): Work[] {
  return [...works].sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

export function filterWorks(works: readonly Work[], { kind, tag }: WorkFilter = {}): Work[] {
  return works.filter((work) => (!kind || work.kind === kind) && (!tag || work.tags.includes(tag)));
}

/** Unique tags (alphabetical) used by all works or by works of one kind. */
export function collectTags(works: readonly Work[], kind?: WorkKind): string[] {
  const tags = new Set(filterWorks(works, { kind }).flatMap((work) => work.tags));
  return [...tags].sort((a, b) => a.localeCompare(b));
}

// The pure helpers above take a list of works, so tests can pass fixtures. The `get*`
// functions below apply them to the site content bundled from `src/content/works`.

const allWorks = parseWorks(
  import.meta.glob('/src/content/works/*.json', { eager: true, import: 'default' }),
);

/** All works, sorted by `order`, optionally filtered by kind and/or tag. */
export function getWorks(filter: WorkFilter = {}): Work[] {
  return filterWorks(allWorks, filter);
}

/** Works marked `featured`, sorted by `order`. */
function getFeatured(): Work[] {
  return allWorks.filter((work) => work.featured);
}

/** Featured figurines for the home page, at most `limit` (PLAN 3.1: 1–3 with a 360° view). */
export function getFeaturedFigurines(limit = 3): Figurine[] {
  return getFeatured()
    .filter((work): work is Figurine => work.kind === 'figurine')
    .slice(0, limit);
}

export function getBySlug(slug: string): Work | undefined {
  return allWorks.find((work) => work.slug === slug);
}

export function getTags(kind?: WorkKind): string[] {
  return collectTags(allWorks, kind);
}

export interface Neighbours {
  previous?: Work;
  next?: Work;
}

/** The works before and after `slug` among works of the same kind (no wrap-around). */
export function findNeighbours(works: readonly Work[], slug: string): Neighbours {
  const current = works.find((work) => work.slug === slug);
  if (!current) return {};
  const sameKind = filterWorks(works, { kind: current.kind });
  const index = sameKind.indexOf(current);
  return { previous: sameKind[index - 1], next: sameKind[index + 1] };
}

export function getNeighbours(slug: string): Neighbours {
  return findNeighbours(allWorks, slug);
}
