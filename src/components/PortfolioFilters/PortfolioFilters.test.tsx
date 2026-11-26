import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { PortfolioFilters } from './PortfolioFilters';

function setup(props: Partial<Parameters<typeof PortfolioFilters>[0]> = {}) {
  const onKindChange = vi.fn();
  const onTagChange = vi.fn();
  const result = renderWithProviders(
    <PortfolioFilters
      kind={undefined}
      tag={undefined}
      tags={['olej', 'akwarela']}
      onKindChange={onKindChange}
      onTagChange={onTagChange}
      {...props}
    />,
    { language: 'en' },
  );
  return { ...result, onKindChange, onTagChange };
}

describe('PortfolioFilters', () => {
  it('marks the active kind and tag as pressed', () => {
    setup({ kind: 'painting', tag: 'olej' });
    expect(screen.getByRole('button', { name: 'Paintings' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Oil' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All tags' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('reports kind changes', async () => {
    const { user, onKindChange } = setup();
    await user.click(screen.getByRole('button', { name: 'Figurines' }));
    expect(onKindChange).toHaveBeenCalledWith('figurine');
    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(onKindChange).toHaveBeenLastCalledWith(undefined);
  });

  it('selects a tag and clears it on a second click or with "All tags"', async () => {
    const { user, onTagChange } = setup({ tag: 'olej' });
    await user.click(screen.getByRole('button', { name: 'Watercolour' }));
    expect(onTagChange).toHaveBeenLastCalledWith('akwarela');
    await user.click(screen.getByRole('button', { name: 'Oil' }));
    expect(onTagChange).toHaveBeenLastCalledWith(undefined);
    await user.click(screen.getByRole('button', { name: 'All tags' }));
    expect(onTagChange).toHaveBeenLastCalledWith(undefined);
  });

  it('renders only the given tags, in a labelled group', () => {
    setup();
    const group = screen.getByRole('group', { name: 'Tags' });
    expect(
      within(group)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['All tags', 'Oil', 'Watercolour']);
  });

  it('hides the tag group when there are no tags', () => {
    setup({ tags: [] });
    expect(screen.queryByRole('group', { name: 'Tags' })).not.toBeInTheDocument();
  });
});
