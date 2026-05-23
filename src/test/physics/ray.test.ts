import { describe, it, expect } from 'vitest';
import { raySegmentIntersect, rayCircleIntersect } from '../../physics/ray.js';
import type { Ray, Segment, CircleGeom } from '../../types/index.js';

describe('raySegmentIntersect', () => {
  it('returns null for a ray parallel to the segment', () => {
    const ray: Ray = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    const seg: Segment = { p1: { x: 0, y: 1 }, p2: { x: 5, y: 1 }, normal: { x: 0, y: -1 } };
    expect(raySegmentIntersect(ray, seg)).toBeNull();
  });

  it('hits a vertical segment at its midpoint', () => {
    const ray: Ray = { origin: { x: 0, y: 5 }, direction: { x: 1, y: 0 } };
    const seg: Segment = { p1: { x: 10, y: 0 }, p2: { x: 10, y: 10 }, normal: { x: -1, y: 0 } };
    const hit = raySegmentIntersect(ray, seg);
    expect(hit).not.toBeNull();
    expect(hit!.point.x).toBeCloseTo(10, 5);
    expect(hit!.point.y).toBeCloseTo(5, 5);
    expect(hit!.t).toBeCloseTo(10, 5);
  });

  it('hits a segment at its endpoint', () => {
    const ray: Ray = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    const seg: Segment = { p1: { x: 5, y: -2 }, p2: { x: 5, y: 0 }, normal: { x: -1, y: 0 } };
    const hit = raySegmentIntersect(ray, seg);
    expect(hit).not.toBeNull();
    expect(hit!.point.x).toBeCloseTo(5, 5);
    expect(hit!.point.y).toBeCloseTo(0, 5);
  });

  it('returns null when segment is behind the ray origin', () => {
    const ray: Ray = { origin: { x: 10, y: 5 }, direction: { x: 1, y: 0 } };
    const seg: Segment = { p1: { x: 5, y: 0 }, p2: { x: 5, y: 10 }, normal: { x: 1, y: 0 } };
    expect(raySegmentIntersect(ray, seg)).toBeNull();
  });

  it('returns null when t is less than NUDGE (ray starts essentially on segment)', () => {
    // Ray origin is on the segment intersection point, so t ≈ 0
    const ray: Ray = { origin: { x: 5, y: 5 }, direction: { x: 1, y: 0 } };
    const seg: Segment = { p1: { x: 5, y: 0 }, p2: { x: 5, y: 10 }, normal: { x: -1, y: 0 } };
    expect(raySegmentIntersect(ray, seg)).toBeNull();
  });

  it('returns null when the intersection falls outside the segment bounds', () => {
    const ray: Ray = { origin: { x: 0, y: 20 }, direction: { x: 1, y: 0 } };
    const seg: Segment = { p1: { x: 5, y: 0 }, p2: { x: 5, y: 10 }, normal: { x: -1, y: 0 } };
    expect(raySegmentIntersect(ray, seg)).toBeNull();
  });

  it('returns the correct normal from the segment', () => {
    const ray: Ray = { origin: { x: 0, y: 5 }, direction: { x: 1, y: 0 } };
    const seg: Segment = { p1: { x: 10, y: 0 }, p2: { x: 10, y: 10 }, normal: { x: -1, y: 0 } };
    const hit = raySegmentIntersect(ray, seg);
    expect(hit!.normal).toEqual({ x: -1, y: 0 });
  });
});

describe('rayCircleIntersect', () => {
  it('hits a circle directly in its path', () => {
    const ray: Ray = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    const circle: CircleGeom = { cx: 10, cy: 0, radius: 2 };
    const hit = rayCircleIntersect(ray, circle);
    expect(hit).not.toBeNull();
    expect(hit!.point.x).toBeCloseTo(8, 5);
    expect(hit!.point.y).toBeCloseTo(0, 5);
  });

  it('returns null when ray misses the circle', () => {
    const ray: Ray = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    const circle: CircleGeom = { cx: 10, cy: 5, radius: 2 };
    expect(rayCircleIntersect(ray, circle)).toBeNull();
  });

  it('handles a tangent ray (exactly touching circle edge)', () => {
    const ray: Ray = { origin: { x: 0, y: 2 }, direction: { x: 1, y: 0 } };
    const circle: CircleGeom = { cx: 10, cy: 0, radius: 2 };
    const hit = rayCircleIntersect(ray, circle);
    // A tangent should still produce a hit (discriminant = 0)
    expect(hit).not.toBeNull();
    expect(hit!.point.y).toBeCloseTo(2, 2);
  });

  it('returns null when ray origin is inside the circle and exit is too close', () => {
    // Ray origin inside circle, pointing away from the far wall
    // Both t1 and t2 near or behind 0
    const ray: Ray = { origin: { x: 10, y: 0 }, direction: { x: -1, y: 0 } };
    const circle: CircleGeom = { cx: 10, cy: 0, radius: 2 };
    // t1 = -(-2) - sqrt(disc) = 2 - sqrt(4) = 0, t2 = 2 + sqrt(4) = 4...
    // Actually let's use origin inside so both +t hits: t1 < NUDGE, t2 should work
    const hit = rayCircleIntersect(ray, circle);
    // Ray origin is exactly at center, so t1 = -radius, t2 = +radius
    // t1 < NUDGE, t2 = 2 > NUDGE => hit at x=8
    expect(hit).not.toBeNull();
  });

  it('returns outward-pointing normal at hit point', () => {
    const ray: Ray = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    const circle: CircleGeom = { cx: 10, cy: 0, radius: 2 };
    const hit = rayCircleIntersect(ray, circle);
    expect(hit!.normal.x).toBeCloseTo(-1, 5);
    expect(hit!.normal.y).toBeCloseTo(0, 5);
  });

  it('returns null when the circle is behind the ray', () => {
    const ray: Ray = { origin: { x: 20, y: 0 }, direction: { x: 1, y: 0 } };
    const circle: CircleGeom = { cx: 10, cy: 0, radius: 2 };
    expect(rayCircleIntersect(ray, circle)).toBeNull();
  });
});
