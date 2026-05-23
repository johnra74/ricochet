import { fromAngle, add, scale } from './vector.js'
import { raySegmentIntersect, rayCircleIntersect } from './ray.js'
import { wallSegments, shapeToSegments, circleToGeom } from './shapes.js'
import { reflectDirection, nudgeOrigin, resolveCorner } from './reflect.js'
import { MAX_SIMULATION_STEPS, NUDGE } from '../constants.js'
import type { Vec2, Segment, CircleGeom, Payload, SimResult } from '../types/index.js'

// D — Dependency Inversion: simulate depends on abstract Segment[] and CircleGeom, not Shape subtypes
export function simulate(
  startPos: Vec2,
  angleRad: number,
  payload: Payload,
  extraSegments: Segment[] = [],
  extraCircles: CircleGeom[] = []
): SimResult {
  const { board, target, maxRicochets, shapes } = payload;

  const walls = wallSegments(board);
  const shapeSegs = shapes.flatMap(shapeToSegments);
  const shapeCircles = shapes
    .filter((s) => s.type === 'circle')
    .map(circleToGeom);
  const targetCircle: CircleGeom = { cx: target.x, cy: target.y, radius: target.radius };

  const allSegments: Segment[] = [...walls, ...shapeSegs, ...extraSegments];
  const allCircles: CircleGeom[] = [...shapeCircles, ...extraCircles];

  const path: Vec2[] = [{ ...startPos }];
  let ray = { origin: { ...startPos }, direction: fromAngle(angleRad) };
  let ricochets = 0;
  let steps = 0;

  while (steps < MAX_SIMULATION_STEPS) {
    steps++;

    // Check target circle first (it can be hit along the ray, not just at bounce)
    const targetHit = rayCircleIntersect(ray, targetCircle);

    // Collect all segment hits
    const segHits = allSegments
      .map((s) => raySegmentIntersect(ray, s))
      .filter((h): h is NonNullable<typeof h> => h !== null);

    // Collect all shape-circle hits
    const circleHits = allCircles
      .map((c) => rayCircleIntersect(ray, c))
      .filter((h): h is NonNullable<typeof h> => h !== null);

    const allHits = [...segHits, ...circleHits];

    if (allHits.length === 0) break; // shouldn't happen with walls bounding the space

    // Find nearest obstacle hit
    const nearest = resolveCorner(allHits);

    // If target is hit before the obstacle, we win
    if (targetHit && targetHit.t < nearest.t + NUDGE) {
      path.push(targetHit.point);
      return { path, outcome: 'win', ricochetCount: ricochets };
    }

    path.push(nearest.point);

    // Out of ricochets - stop here
    if (ricochets >= maxRicochets) {
      return { path, outcome: 'lose', ricochetCount: ricochets };
    }

    // Reflect and continue
    const newDir = reflectDirection(ray.direction, nearest.normal);
    ray = {
      origin: nudgeOrigin(nearest.point, nearest.normal),
      direction: newDir,
    };
    ricochets++;
  }

  return { path, outcome: 'lose', ricochetCount: ricochets };
}

// Re-export for convenience — add scale so callers don't need to import from vector
export { add, scale };
