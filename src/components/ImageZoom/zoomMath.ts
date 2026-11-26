export const MIN_SCALE = 1;
export const MAX_SCALE = 5;
/** Multiplier for one press of +/−. */
export const ZOOM_STEP = 1.5;

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Zoom state: the image is drawn at its fitted size, scaled by `scale` around its centre and
 * moved by (`x`, `y`) pixels from the viewport centre.
 */
export interface ZoomState extends Point {
  scale: number;
}

export const INITIAL_ZOOM: ZoomState = { scale: 1, x: 0, y: 0 };

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/** Largest offset along one axis that still keeps the image covering the viewport. */
function maxOffset(imageLength: number, scale: number, viewportLength: number): number {
  return Math.max(0, (imageLength * scale - viewportLength) / 2);
}

function clampAxis(value: number, limit: number): number {
  // `+ 0` turns -0 into 0, which keeps equality checks and test output simple.
  return Math.min(limit, Math.max(-limit, value)) + 0;
}

/**
 * Keeps a scaled image inside the viewport: no empty edge appears while panning, and an image
 * smaller than the viewport on an axis stays centred on it.
 */
export function clampOffset(state: ZoomState, image: Size, viewport: Size): ZoomState {
  const scale = clampScale(state.scale);
  return {
    scale,
    x: clampAxis(state.x, maxOffset(image.width, scale, viewport.width)),
    y: clampAxis(state.y, maxOffset(image.height, scale, viewport.height)),
  };
}

/**
 * Zooms to `nextScale` keeping the image point under `focus` (relative to the viewport centre)
 * in place, the way zooming at the cursor or between two fingers feels natural.
 */
export function zoomAt(
  state: ZoomState,
  nextScale: number,
  focus: Point,
  image: Size,
  viewport: Size,
): ZoomState {
  const scale = clampScale(nextScale);
  const ratio = scale / state.scale;
  return clampOffset(
    {
      scale,
      x: focus.x - (focus.x - state.x) * ratio,
      y: focus.y - (focus.y - state.y) * ratio,
    },
    image,
    viewport,
  );
}

/** Moves the image by (`dx`, `dy`) within the allowed bounds. */
export function panBy(state: ZoomState, dx: number, dy: number, image: Size, viewport: Size) {
  return clampOffset({ ...state, x: state.x + dx, y: state.y + dy }, image, viewport);
}
