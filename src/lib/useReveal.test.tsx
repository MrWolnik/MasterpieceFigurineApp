import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { stubIntersectionObserver, stubReducedMotion } from '../test/intersectionObserver';
import { MAX_REVEAL_DELAY_MS, useReveal } from './useReveal';

function Probe({ delay }: { delay?: number }) {
  const reveal = useReveal<HTMLDivElement>({ className: 'own', delay });
  return <div {...reveal} data-testid="probe" />;
}

const probe = () => screen.getByTestId('probe');

describe('useReveal', () => {
  it('fades in on load from CSS alone, already in the prerendered HTML', () => {
    expect(renderToString(<Probe />)).toMatch(/class="own revealed"/);
  });

  it('keeps an element that is on screen at load as it is, without a second fade', () => {
    const Observer = stubIntersectionObserver();
    render(<Probe />);
    expect(probe()).toHaveClass('own', 'revealed');
    act(() => {
      Observer.instances[0]?.enter();
    });
    expect(probe()).toHaveClass('own', 'revealed');
    expect(Observer.instances[0]?.disconnected).toBe(true);
  });

  it('hides an off-screen element until it scrolls into view, then fades it in', () => {
    const Observer = stubIntersectionObserver();
    render(<Probe />);
    const [observer] = Observer.instances;
    expect(observer?.elements.has(probe())).toBe(true);

    act(() => {
      observer?.leave();
    });
    expect(probe()).toHaveClass('own', 'hidden');

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
      observer?.leave();
    });
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

  it('never hides anything with reduced motion, and does not observe', () => {
    stubReducedMotion(true);
    const Observer = stubIntersectionObserver();
    render(<Probe />);
    expect(probe()).toHaveAttribute('class', 'own');
    expect(Observer.instances).toHaveLength(0);
  });

  it('never hides anything where IntersectionObserver is missing', () => {
    // jsdom has none by default.
    render(<Probe />);
    expect(probe()).toHaveAttribute('class', 'own');
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
