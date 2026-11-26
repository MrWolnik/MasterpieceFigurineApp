import { useRef } from 'react';
import { useSearchParams } from 'react-router';
import { getTags, WORK_KINDS, type WorkFilter, type WorkKind } from './works';

function isWorkKind(value: string | null): value is WorkKind {
  return WORK_KINDS.includes(value as WorkKind);
}

/** `tag` if works of `kind` use it, otherwise no tag filter. */
function tagIfUsed(kind: WorkKind | undefined, tag: string | null | undefined): string | undefined {
  return tag && getTags(kind).includes(tag) ? tag : undefined;
}

/**
 * Reads unknown or mismatched values as "no filter", so a hand-edited or stale URL
 * (`?kind=sculpture`, a tag that the chosen kind does not use) still shows a sensible list.
 */
export function parseFilters(params: URLSearchParams): WorkFilter {
  const rawKind = params.get('kind');
  const kind = isWorkKind(rawKind) ? rawKind : undefined;
  return { kind, tag: tagIfUsed(kind, params.get('tag')) };
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
  const search = params.toString();

  // Two quick clicks can both run before React Router re-renders with the new URL, so the
  // second update must build on the first one, not on the (stale) `filters` of this render.
  // `pending` remembers the last write and the URL it was based on; it only applies while no
  // newer render has happened. A ref synced in an effect is not enough: an effect from an older
  // render can run after a click and overwrite the newer value.
  const pending = useRef<{ from: string; filters: WorkFilter } | null>(null);
  const current = (): WorkFilter =>
    pending.current?.from === search ? pending.current.filters : filters;

  function update(next: WorkFilter) {
    pending.current = { from: search, filters: next };
    // Replace, not push: toggling filters should not fill the Back button history.
    setParams(filtersToParams(next), { replace: true, preventScrollReset: true });
  }

  return {
    ...filters,
    /** Changes the kind; drops the tag when the new kind does not use it. */
    setKind: (kind: WorkKind | undefined) => {
      update({ kind, tag: tagIfUsed(kind, current().tag) });
    },
    setTag: (tag: string | undefined) => {
      update({ kind: current().kind, tag });
    },
  };
}
