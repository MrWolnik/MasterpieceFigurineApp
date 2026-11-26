import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import { describe, expect, it } from 'vitest';
import { filtersToParams, parseFilters, usePortfolioFilters } from './usePortfolioFilters';

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

describe('usePortfolioFilters', () => {
  function renderFilters(route = '/en/portfolio') {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    );
    return renderHook(
      () => ({ filters: usePortfolioFilters(), location: useLocation(), navigate: useNavigate() }),
      {
        wrapper,
      },
    );
  }

  it('keeps both changes when kind and tag are set before a re-render', () => {
    const { result } = renderFilters();

    act(() => {
      result.current.filters.setKind('figurine');
      result.current.filters.setTag('dnd');
    });

    expect(result.current.location.search).toBe('?kind=figurine&tag=dnd');
    expect(result.current.filters).toMatchObject({ kind: 'figurine', tag: 'dnd' });
  });

  it('builds on the URL again after an outside navigation', () => {
    const { result } = renderFilters();

    act(() => {
      result.current.filters.setTag('dnd');
    });
    act(() => {
      void result.current.navigate('/en/portfolio?kind=painting');
    });
    act(() => {
      result.current.filters.setTag('olej');
    });

    expect(result.current.location.search).toBe('?kind=painting&tag=olej');
  });

  it('drops a tag that the new kind does not use', () => {
    const { result } = renderFilters('/en/portfolio?tag=nmm');

    act(() => {
      result.current.filters.setKind('painting');
    });

    expect(result.current.location.search).toBe('?kind=painting');
  });
});
