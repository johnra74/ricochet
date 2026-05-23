import { dot, sub, add, scale, normalize } from './vector.js'
import { EPSILON, NUDGE } from '../constants.js'
import type { Ray, Segment, CircleGeom, HitResult } from '../types/index.js'

// Returns { t, point, normal } or null
export function raySegmentIntersect(ray: Ray, seg: Segment): HitResult | null {
  const d = ray.direction;
  const e = sub(seg.p2, seg.p1);
  const det = d.x * e.y - d.y * e.x;

  if (Math.abs(det) < EPSILON) return null; // parallel

  const diff = sub(seg.p1, ray.origin);
  const t = (diff.x * e.y - diff.y * e.x) / det;
  const u = (diff.x * d.y - diff.y * d.x) / det;

  if (t < NUDGE || u < -EPSILON || u > 1 + EPSILON) return null;

  const point = add(ray.origin, scale(d, t));
  return { t, point, normal: seg.normal };
}

// Returns { t, point, normal } or null
export function rayCircleIntersect(ray: Ray, circle: CircleGeom): HitResult | null {
  const oc = sub(ray.origin, { x: circle.cx, y: circle.cy });
  const d = ray.direction;

  const b = dot(oc, d);
  const c = dot(oc, oc) - circle.radius * circle.radius;
  const disc = b * b - c;

  if (disc < 0) return null;

  const sqrtDisc = Math.sqrt(disc);
  const t1 = -b - sqrtDisc;
  const t2 = -b + sqrtDisc;

  const t = t1 > NUDGE ? t1 : t2 > NUDGE ? t2 : null;
  if (t === null) return null;

  const point = add(ray.origin, scale(d, t));
  const normal = normalize(sub(point, { x: circle.cx, y: circle.cy }));
  return { t, point, normal };
}
