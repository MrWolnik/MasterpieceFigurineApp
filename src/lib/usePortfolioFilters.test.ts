import { describe, expect, it } from 'vitest';
import { filtersToParams, parseFilters } from './usePortfolioFilters';

const parse = (query: string) => parseFilters(new URLSearchParams(query));

describe('parseFilters', () => {
  it('reads kind and tag', () => {
    expect(parse('kind=painting&tag=olej')).toEqual({ kind: 'painting', tag: 'olej' });
  });

  it('reads a tag without a kind', () => {
    expect(parse('tag=nmm')).toEqual({ kind: undefined, tag: 'nmm' });
  });

  it('ignores an unknown kind', () => {
    expect(parse('kind=sculpture')).toEqual({ kind: undefined, tag: undefined });
  });

  it('ignores an unknown tag', () => {
    expect(parse('tag=nope')).toEqual({ kind: undefined, tag: undefined });
  });

  it('ignores a tag that the chosen kind does not use', () => {
    expect(parse('kind=painting&tag=warhammer')).toEqual({ kind: 'painting', tag: undefined });
  });
});

describe('filtersToParams', () => {
  it('writes only the set values', () => {
    expect(filtersToParams({ kind: 'painting', tag: 'olej' }).toString()).toBe(
      'kind=painting&tag=olej',
    );
    expect(filtersToParams({ tag: 'nmm' }).toString()).toBe('tag=nmm');
    expect(filtersToParams({}).toString()).toBe('');
  });
});
