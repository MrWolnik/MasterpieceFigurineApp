import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { Turntable } from './Turntable';
import { AUTO_ROTATE_INTERVAL_MS } from './useAutoRotate';

/** jsdom never loads images; this stand-in reports every frame as loaded on the next tick. */
class InstantImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  set src(_url: string) {
    setTimeout(() => this.onload?.(), 0);
  }
}

function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

function renderTurntable(autoRotate = false) {
  return renderWithProviders(
    <Turntable
      slug="demo"
      frames={36}
      format="svg"
      title="Night Sentinel"
      autoRotate={autoRotate}
    />,
    { language: 'en' },
  );
}

const slider = () => screen.getByRole('slider', { name: '360° view: Night Sentinel' });
const frameSrc = () => slider().querySelector('img')?.getAttribute('src');

beforeEach(() => {
  vi.stubGlobal('Image', InstantImage);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Turntable', () => {
  it('shows the first frame right away', () => {
    renderTurntable();
    expect(frameSrc()).toBe('/img/works/demo/frames/001-800.webp');
    expect(slider()).toHaveAttribute('aria-valuenow', '0');
    expect(slider()).toHaveAttribute('aria-valuetext', 'Angle 0°');
  });

  it('shows loading progress until every frame has loaded', async () => {
    renderTurntable();
    expect(screen.getByRole('progressbar', { name: 'Loading the 360° view' })).toBeInTheDocument();
    expect(await screen.findByRole('slider')).toBeInTheDocument();
    await vi.waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('arrow keys change the frame and wrap around', async () => {
    const user = userEvent.setup();
    renderTurntable();
    slider().focus();

    await user.keyboard('{ArrowRight}');
    expect(frameSrc()).toBe('/img/works/demo/frames/002-800.webp');
    expect(slider()).toHaveAttribute('aria-valuenow', '10');

    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(frameSrc()).toBe('/img/works/demo/frames/036-800.webp');
    expect(slider()).toHaveAttribute('aria-valuetext', 'Angle 350°');

    await user.keyboard('{Home}');
    expect(frameSrc()).toBe('/img/works/demo/frames/001-800.webp');
  });

  it('dragging changes the frame', () => {
    renderTurntable();
    const stage = slider();
    vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({ width: 360 } as DOMRect);

    fireEvent.pointerDown(stage, { pointerId: 1, button: 0, clientX: 100 });
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 130 });
    expect(frameSrc()).toBe('/img/works/demo/frames/004-800.webp');

    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 90 });
    expect(frameSrc()).toBe('/img/works/demo/frames/036-800.webp');

    fireEvent.pointerUp(stage, { pointerId: 1 });
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 300 });
    expect(frameSrc()).toBe('/img/works/demo/frames/036-800.webp');
  });

  it('auto-rotates once loaded and stops after the user interacts', async () => {
    vi.useFakeTimers();
    renderTurntable(true);
    await act(async () => {
      await vi.runOnlyPendingTimersAsync(); // frames finish loading
    });

    act(() => {
      vi.advanceTimersByTime(AUTO_ROTATE_INTERVAL_MS * 3);
    });
    expect(frameSrc()).toBe('/img/works/demo/frames/004-800.webp');

    fireEvent.pointerDown(slider(), { pointerId: 1, button: 0, clientX: 0 });
    act(() => {
      vi.advanceTimersByTime(AUTO_ROTATE_INTERVAL_MS * 5);
    });
    expect(frameSrc()).toBe('/img/works/demo/frames/004-800.webp');
  });

  it('does not auto-rotate with prefers-reduced-motion', async () => {
    stubReducedMotion(true);
    vi.useFakeTimers();
    renderTurntable(true);
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    act(() => {
      vi.advanceTimersByTime(AUTO_ROTATE_INTERVAL_MS * 5);
    });
    expect(frameSrc()).toBe('/img/works/demo/frames/001-800.webp');
  });

  it('stops auto-rotating when reduced motion is switched on while open', async () => {
    let reduce = false;
    const listeners = new Set<() => void>();
    vi.stubGlobal('matchMedia', (query: string) => ({
      get matches() {
        return reduce;
      },
      media: query,
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
    }));
    vi.useFakeTimers();
    renderTurntable(true);
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    act(() => {
      reduce = true;
      listeners.forEach((listener) => {
        listener();
      });
    });
    const frame = frameSrc();
    act(() => {
      vi.advanceTimersByTime(AUTO_ROTATE_INTERVAL_MS * 5);
    });
    expect(frameSrc()).toBe(frame);
  });

  it('shows the hint until the first interaction', async () => {
    const user = userEvent.setup();
    renderTurntable();
    const hint = screen.getByText('Drag or use the arrow keys to rotate');
    expect(hint.closest('figcaption')).toHaveAttribute('data-hidden', 'false');

    await user.click(slider());
    expect(hint.closest('figcaption')).toHaveAttribute('data-hidden', 'true');
  });
});
