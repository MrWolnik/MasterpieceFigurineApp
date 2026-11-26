/** Wraps any frame index into `0 … total - 1`, in both directions (-1 → total - 1). */
export function wrapFrame(index: number, total: number): number {
  return ((index % total) + total) % total;
}

/**
 * Frame shown while dragging: every `pxPerFrame` pixels moves one frame.
 * Dragging right advances the frames (same direction as the right arrow key).
 */
export function frameFromDrag(
  startFrame: number,
  deltaX: number,
  total: number,
  pxPerFrame: number,
): number {
  return wrapFrame(startFrame + Math.trunc(deltaX / pxPerFrame), total);
}

/** Rotation angle of a frame, rounded to whole degrees (frame 12 of 36 → 120°). */
export function frameAngle(index: number, total: number): number {
  return Math.round((360 / total) * index);
}

/** Public path of frame `index` (0-based): `/works/<slug>/frames/001.webp`. */
export function framePath(slug: string, index: number, format: string): string {
  return `/works/${slug}/frames/${String(index + 1).padStart(3, '0')}.${format}`;
}
