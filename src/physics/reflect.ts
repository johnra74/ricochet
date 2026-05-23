import { sub, scale, dot, normalize, add } from './vector.js'
import type { Vec2, HitResult } from '../types/index.js'

export function reflectDirection(direction: Vec2, normal: Vec2): Vec2 {
  const d = direction;
  const n = normal;
  const proj = 2 * dot(d, n);
  return normalize(sub(d, scale(n, proj)));
}

export function nudgeOrigin(point: Vec2, normal: Vec2): Vec2 {
  return add(point, scale(normal, 1e-4));
}

// If two hits are at nearly the same t, it's a corner - average the normals
export function resolveCorner(hits: HitResult[]): HitResult {
  if (hits.length < 2) return hits[0];
  hits.sort((a, b) => a.t - b.t);
  const first = hits[0];
  const second = hits[1];
  if (Math.abs(first.t - second.t) < 1e-4) {
    const avgNormal = normalize({
      x: first.normal.x + second.normal.x,
      y: first.normal.y + second.normal.y,
    });
    return { ...first, normal: avgNormal };
  }
  return first;
}
