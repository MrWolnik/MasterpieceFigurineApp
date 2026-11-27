import { act, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getWorks } from '../../lib/works';
import { stubIntersectionObserver } from '../../test/intersectionObserver';
import { renderWithProviders } from '../../test/test-utils';
import { WorkGrid } from './WorkGrid';
import { TILE_STAGGER_MS } from './WorkGridItem';

/** The grid's <li> elements (tags inside a card are list items too). */
const tiles = () =>
  screen.getAllByRole('article').map((article) => {
    const tile = article.parentElement;
    if (!tile) throw new Error('tile without a grid cell');
    return tile;
  });

describe('WorkGridItem', () => {
  it('fades each tile in when it scrolls into view', () => {
    const Observer = stubIntersectionObserver();
    renderWithProviders(<WorkGrid works={getWorks()} />);
    expect(tiles().every((tile) => tile.classList.contains('hidden'))).toBe(true);

    act(() => {
      Observer.instances[0]?.enter();
    });
    expect(tiles()[0]).toHaveClass('revealed');
    expect(tiles()[1]).toHaveClass('hidden');
  });

  it('staggers the tiles of a row of four', () => {
    renderWithProviders(<WorkGrid works={getWorks()} />);
    const delays = tiles().map((tile) => tile.style.getPropertyValue('--reveal-delay'));
    const step = (n: number) => (n === 0 ? '' : `${String(n * TILE_STAGGER_MS)}ms`);
    expect(delays.slice(0, 5)).toEqual([step(0), step(1), step(2), step(3), step(0)]);
  });
});
