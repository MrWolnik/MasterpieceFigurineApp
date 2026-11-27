import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { useHydrated } from './useHydrated';

function Probe() {
  return <p>{useHydrated() ? 'browser' : 'static'}</p>;
}

describe('useHydrated', () => {
  it('is false while rendering static HTML', () => {
    expect(renderToString(<Probe />)).toContain('static');
  });

  it('is true in a render that starts in the browser', () => {
    render(<Probe />);
    expect(screen.getByText('browser')).toBeInTheDocument();
  });
});
