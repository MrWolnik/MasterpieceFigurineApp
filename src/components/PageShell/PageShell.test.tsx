import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageShell } from './PageShell';

describe('PageShell', () => {
  it('renders its children in a div by default', () => {
    const { container } = render(<PageShell>Content</PageShell>);

    const shell = container.firstElementChild;
    expect(shell?.tagName).toBe('DIV');
    expect(shell).toHaveTextContent('Content');
  });

  it('renders the requested element', () => {
    render(
      <PageShell as="article">
        <h1>Title</h1>
      </PageShell>,
    );

    expect(screen.getByRole('article')).toContainElement(screen.getByRole('heading'));
  });

  it('keeps its own class next to the page class', () => {
    const { container } = render(<PageShell className="page">Content</PageShell>);

    const classes = container.firstElementChild?.classList;
    expect(classes).toContain('page');
    expect(classes?.length).toBe(2);
  });
});
