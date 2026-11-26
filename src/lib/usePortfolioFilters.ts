import { useSearchParams } from 'react-router';
import { getTags, type WorkFilter, type WorkKind } from './works';

const kinds: readonly WorkKind[] = ['figurine', 'painting'];

function isWorkKind(value: string | null): value is WorkKind {
  return kinds.includes(value as WorkKind);
}

/**
 * Reads unknown or mismatched values as "no filter", so a hand-edited or stale URL
 * (`?kind=sculpture`, a tag that the chosen kind does not use) still shows a sensible list.
 */
export function parseFilters(params: URLSearchParams): WorkFilter {
  const rawKind = params.get('kind');
  const kind = isWorkKind(rawKind) ? rawKind : undefined;
  const rawTag = params.get('tag');
  const tag = rawTag && getTags(kind).includes(rawTag) ? rawTag : undefined;
  return { kind, tag };
}

/** Serialises filters into URL params, leaving out empty values (`?kind=painting&tag=olej`). */
export function filtersToParams({ kind, tag }: WorkFilter): URLSearchParams {
  const params = new URLSearchParams();
  if (kind) params.set('kind', kind);
  if (tag) params.set('tag', tag);
  return params;
}

/** Portfolio filter state kept in the URL, so filtered views can be linked and shared. */
export function usePortfolioFilters() {
  const [params, setParams] = useSearchParams();
  const filters = parseFilters(params);

  function update(next: WorkFilter) {
    // Replace, not push: toggling filters should not fill the Back button history.
    setParams(filtersToParams(next), { replace: true, preventScrollReset: true });
  }

  return {
    ...filters,
    /** Changes the kind; drops the tag when the new kind does not use it. */
    setKind: (kind: WorkKind | undefined) => {
      const tag = filters.tag && getTags(kind).includes(filters.tag) ? filters.tag : undefined;
      update({ kind, tag });
    },
    setTag: (tag: string | undefined) => {
      update({ kind: filters.kind, tag });
    },
  };
}
