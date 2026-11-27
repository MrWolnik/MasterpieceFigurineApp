import contentWorks from 'virtual:works';
import { WORK_KINDS } from './workKinds';
import type { Figurine, Work, WorkKind } from './works.schema';

export { WORK_KINDS } from './workKinds';
export type { Figurine, Painting, Work, WorkKind } from './works.schema';

/** Narrows a URL value (e.g. `?kind=`) to a work kind. */
export function isWorkKind(value: unknown): value is WorkKind {
  return (WORK_KINDS as readonly unknown[]).includes(value);
}

export interface WorkFilter {
  kind?: WorkKind;
  tag?: string;
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
// functions below apply them to the site content from `src/content/works`, which arrives
// already validated and sorted at build time (see parseWorks.ts).

const allWorks: readonly Work[] = contentWorks;

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
