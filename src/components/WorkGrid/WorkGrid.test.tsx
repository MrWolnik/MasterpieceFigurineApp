import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { getWorks } from '../../lib/works';
import { WorkGrid } from './WorkGrid';

describe('WorkGrid', () => {
  it('renders one tile per work, in order', () => {
    const works = getWorks();
    renderWithProviders(<WorkGrid works={works} />, { language: 'en' });
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(works.map((w) => w.title.en));
  });

  it('loads only the first two covers eagerly', () => {
    const { container } = renderWithProviders(<WorkGrid works={getWorks()} />);
    const loading = [...container.querySelectorAll('img')].map((img) =>
      img.getAttribute('loading'),
    );
    expect(loading.slice(0, 2)).toEqual(['eager', 'eager']);
    expect(loading.slice(2).every((value) => value === 'lazy')).toBe(true);
  });

  it('shows a message when there are no works', () => {
    renderWithProviders(<WorkGrid works={[]} />);
    expect(screen.getByText('Brak prac do wyświetlenia.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('wraps tiles in a list', () => {
    renderWithProviders(<WorkGrid works={getWorks({ kind: 'painting' })} />);
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(3);
    for (const article of articles) expect(article.parentElement?.tagName).toBe('LI');
  });
});
