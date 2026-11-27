import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { stubIntersectionObserver, stubReducedMotion } from '../test/intersectionObserver';
import { MAX_REVEAL_DELAY_MS, useReveal } from './useReveal';

function Probe({ delay }: { delay?: number }) {
  const reveal = useReveal<HTMLDivElement>({ className: 'own', delay });
  return <div {...reveal} data-testid="probe" />;
}

const probe = () => screen.getByTestId('probe');

describe('useReveal', () => {
  it('stays hidden until the element scrolls into view', () => {
    const Observer = stubIntersectionObserver();
    render(<Probe />);
    expect(probe()).toHaveClass('hidden');

    const [observer] = Observer.instances;
    expect(observer?.elements.has(probe())).toBe(true);
    act(() => {
      observer?.leave();
    });
    expect(probe()).toHaveClass('hidden');

    act(() => {
      observer?.enter();
    });
    expect(probe()).toHaveClass('own', 'revealed');
    expect(probe()).not.toHaveClass('hidden');
  });

  it('reveals only once and then stops observing', () => {
    const Observer = stubIntersectionObserver();
    render(<Probe />);
    const [observer] = Observer.instances;
    act(() => {
      observer?.enter();
    });
    expect(observer?.disconnected).toBe(true);
    expect(Observer.instances).toHaveLength(1);

    // Scrolling away again must not hide it.
    act(() => {
      observer?.leave();
    });
    expect(probe()).toHaveClass('revealed');
  });

  it('shows the element at once with reduced motion and never observes it', () => {
    stubReducedMotion(true);
    const Observer = stubIntersectionObserver();
    render(<Probe />);
    expect(probe()).toHaveClass('revealed');
    expect(Observer.instances).toHaveLength(0);
  });

  it('shows the element at once where IntersectionObserver is missing', () => {
    // jsdom has none by default.
    render(<Probe />);
    expect(probe()).toHaveClass('revealed');
  });

  it('sets the stagger delay as a CSS variable, capped', () => {
    const { rerender } = render(<Probe delay={120} />);
    expect(probe().style.getPropertyValue('--reveal-delay')).toBe('120ms');

    rerender(<Probe delay={5000} />);
    expect(probe().style.getPropertyValue('--reveal-delay')).toBe(
      `${String(MAX_REVEAL_DELAY_MS)}ms`,
    );

    rerender(<Probe />);
    expect(probe().style.getPropertyValue('--reveal-delay')).toBe('');
  });
});
