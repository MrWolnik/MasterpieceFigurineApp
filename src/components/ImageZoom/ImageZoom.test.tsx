import { fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { ImageZoom } from './ImageZoom';

/** Records which images were requested in the background and lets tests finish loading them. */
const requested: string[] = [];
class RecordingImage {
  onload: (() => void) | null = null;
  set src(url: string) {
    requested.push(url);
    setTimeout(() => this.onload?.(), 0);
  }
}

beforeEach(() => {
  requested.length = 0;
  vi.stubGlobal('Image', RecordingImage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderZoom() {
  return renderWithProviders(
    <ImageZoom src="/works/a/full.svg" hiResSrc="/works/a/full@2x.svg" alt="Mist over the Marsh" />,
    { language: 'en' },
  );
}

const openButton = () => screen.getByRole('button', { name: 'Zoom image: Mist over the Marsh' });
const level = () => screen.getByText(/^Zoom: \d+%$/);

describe('ImageZoom', () => {
  it('shows the whole image without loading the high-resolution file', () => {
    renderZoom();
    expect(screen.getByRole('img', { name: 'Mist over the Marsh' })).toHaveAttribute(
      'src',
      '/works/a/full.svg',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(requested).toEqual([]);
  });

  it('opens the viewer and then loads the high-resolution image', async () => {
    const { user } = renderZoom();
    await user.click(openButton());

    const dialog = screen.getByRole('dialog', { name: 'Image viewer: Mist over the Marsh' });
    expect(dialog).toBeVisible();
    expect(requested).toEqual(['/works/a/full@2x.svg']);
    const zoomed = () => screen.getAllByRole('img', { name: 'Mist over the Marsh' })[1];
    await vi.waitFor(() => {
      expect(zoomed()).toHaveAttribute('src', '/works/a/full@2x.svg');
    });
  });

  it('+ and − change the zoom within 1×–5×', async () => {
    const { user } = renderZoom();
    await user.click(openButton());
    const zoomIn = screen.getByRole('button', { name: 'Zoom in' });
    const zoomOut = screen.getByRole('button', { name: 'Zoom out' });

    expect(level()).toHaveTextContent('Zoom: 100%');
    expect(zoomOut).toBeDisabled();

    await user.click(zoomIn);
    expect(level()).toHaveTextContent('Zoom: 150%');
    expect(zoomOut).toBeEnabled();

    for (let i = 0; i < 5; i++) await user.click(zoomIn);
    expect(level()).toHaveTextContent('Zoom: 500%');
    expect(zoomIn).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Fit to screen' }));
    expect(level()).toHaveTextContent('Zoom: 100%');
  });

  it('keyboard shortcuts zoom in, out and reset', async () => {
    const { user } = renderZoom();
    await user.click(openButton());

    await user.keyboard('++');
    expect(level()).toHaveTextContent('Zoom: 225%');
    await user.keyboard('-');
    expect(level()).toHaveTextContent('Zoom: 150%');
    await user.keyboard('0');
    expect(level()).toHaveTextContent('Zoom: 100%');
  });

  it('the mouse wheel zooms in and out', async () => {
    const { user } = renderZoom();
    await user.click(openButton());
    const stage = screen.getByTestId('zoom-stage');

    fireEvent.wheel(stage, { deltaY: -400 });
    expect(level()).toHaveTextContent('Zoom: 200%');
    fireEvent.wheel(stage, { deltaY: 400 });
    expect(level()).toHaveTextContent('Zoom: 100%');
  });

  it('Esc closes the viewer and returns focus to the image', async () => {
    const { user } = renderZoom();
    await user.click(openButton());
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(openButton()).toHaveFocus();
  });

  it('the close button closes the viewer and resets the zoom', async () => {
    const { user } = renderZoom();
    await user.click(openButton());
    await user.click(screen.getByRole('button', { name: 'Zoom in' }));

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(openButton()).toHaveFocus();

    await user.click(openButton());
    expect(level()).toHaveTextContent('Zoom: 100%');
  });
});
