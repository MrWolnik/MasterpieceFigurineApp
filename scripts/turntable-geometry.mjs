// Pure geometry for the placeholder turntable frames, kept separate so it can be unit-tested.

/** Radius of the figurine's cylindrical body in SVG units. */
export const BODY_RADIUS = 80;

/**
 * Projects a point on a cylinder of `radius`, `offset` degrees around from the gold stripe,
 * for a turntable rotated by `angle` degrees (0° = stripe faces the viewer).
 * Returns the horizontal position relative to the centre, the depth (cos, > 0 = towards the
 * viewer), the foreshortened width factor and whether the point is on the visible half.
 */
export function surfacePoint(angle, offset = 0, radius = BODY_RADIUS) {
  const theta = ((angle + offset) * Math.PI) / 180;
  const depth = Math.cos(theta);
  return {
    x: radius * Math.sin(theta),
    depth,
    width: Math.abs(depth),
    front: depth > 1e-9,
  };
}
