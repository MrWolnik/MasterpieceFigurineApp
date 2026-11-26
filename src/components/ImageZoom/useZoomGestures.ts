import { useRef, useState, type PointerEvent, type RefObject } from 'react';
import { useNonPassiveWheel } from './useNonPassiveWheel';
import { INITIAL_ZOOM, panBy, zoomAt, type Point, type Size, type ZoomState } from './zoomMath';

/** Scale used by a double click / double tap when the image is not zoomed. */
const DOUBLE_TAP_SCALE = 2.5;
/** Wheel delta (px) that doubles or halves the zoom. */
const WHEEL_PX_PER_DOUBLING = 400;

/** The stage centre: zooming here keeps the image centred. */
const CENTRE: Point = { x: 0, y: 0 };

interface Pinch {
  distance: number;
  centre: Point;
  start: ZoomState;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Zoom and pan for an image inside a viewport ("stage"): wheel and double click zoom at the
 * cursor, two pointers pinch, one pointer drags when zoomed. All moves stay within bounds.
 */
export function useZoomGestures(
  stageRef: RefObject<HTMLElement | null>,
  imageRef: RefObject<HTMLElement | null>,
) {
  const [state, setState] = useState<ZoomState>(INITIAL_ZOOM);
  const pointers = useRef(new Map<number, Point>());
  const pinch = useRef<Pinch | null>(null);

  // --- Measuring ---

  /** Image size at 1× and viewport size; layout sizes ignore the CSS transform. */
  function sizes(): [Size, Size] {
    const image = imageRef.current;
    const stage = stageRef.current;
    return [
      { width: image?.offsetWidth ?? 0, height: image?.offsetHeight ?? 0 },
      { width: stage?.clientWidth ?? 0, height: stage?.clientHeight ?? 0 },
    ];
  }

  /** Converts client coordinates to a point relative to the stage centre. */
  function toStage(clientX: number, clientY: number): Point {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return CENTRE;
    return { x: clientX - rect.left - rect.width / 2, y: clientY - rect.top - rect.height / 2 };
  }

  // --- Zoom and pan actions (also used by the toolbar and keyboard) ---

  /** Multiplies the zoom by `factor`, keeping the point under `focus` in place. */
  function zoomBy(factor: number, focus: Point = CENTRE) {
    setState((current) => zoomAt(current, current.scale * factor, focus, ...sizes()));
  }

  function pan(dx: number, dy: number) {
    setState((current) => panBy(current, dx, dy, ...sizes()));
  }

  function reset() {
    setState(INITIAL_ZOOM);
  }

  // --- Wheel ---

  useNonPassiveWheel(stageRef, (event) => {
    event.preventDefault();
    zoomBy(2 ** (-event.deltaY / WHEEL_PX_PER_DOUBLING), toStage(event.clientX, event.clientY));
  });

  // --- Pointers: one drags, two pinch ---

  function startPinch() {
    const [a, b] = [...pointers.current.values()];
    pinch.current =
      a && b ? { distance: distance(a, b), centre: midpoint(a, b), start: state } : null;
  }

  function endPointer(event: PointerEvent<HTMLElement>) {
    pointers.current.delete(event.pointerId);
    pinch.current = null;
  }

  const handlers = {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic or already released pointers cannot be captured; the gesture still works.
      }
      pointers.current.set(event.pointerId, toStage(event.clientX, event.clientY));
      if (pointers.current.size === 2) startPinch();
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      const previous = pointers.current.get(event.pointerId);
      if (!previous) return;
      const point = toStage(event.clientX, event.clientY);
      pointers.current.set(event.pointerId, point);

      const current = pinch.current;
      if (current && pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()];
        if (!a || !b || current.distance === 0) return;
        const scale = current.start.scale * (distance(a, b) / current.distance);
        const centre = midpoint(a, b);
        const [image, viewport] = sizes();
        const zoomed = zoomAt(current.start, scale, current.centre, image, viewport);
        // Moving both fingers together also pans.
        setState(
          panBy(zoomed, centre.x - current.centre.x, centre.y - current.centre.y, image, viewport),
        );
      } else if (pointers.current.size === 1) {
        pan(point.x - previous.x, point.y - previous.y);
      }
    },
    onPointerUp: endPointer,
    onPointerCancel: endPointer,
    onDoubleClick(event: { clientX: number; clientY: number }) {
      if (state.scale > 1) reset();
      else zoomBy(DOUBLE_TAP_SCALE / state.scale, toStage(event.clientX, event.clientY));
    },
  };

  return { state, zoomBy, pan, reset, handlers };
}
