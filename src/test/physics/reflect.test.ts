import { describe, it, expect } from 'vitest';
import { reflectDirection, nudgeOrigin, resolveCorner } from '../../physics/reflect.js';
import type { Vec2, HitResult } from '../../types/index.js';

describe('reflectDirection', () => {
  it('reflects a rightward ray off a leftward-facing vertical wall', () => {
    const direction: Vec2 = { x: 1, y: 0 };
    const normal: Vec2 = { x: -1, y: 0 }; // wall facing left
    const reflected = reflectDirection(direction, normal);
    expect(reflected.x).toBeCloseTo(-1, 5);
    expect(reflected.y).toBeCloseTo(0, 5);
  });

  it('reflects a downward ray off an upward-facing horizontal floor', () => {
    const direction: Vec2 = { x: 0, y: 1 };
    const normal: Vec2 = { x: 0, y: -1 }; // floor facing up
    const reflected = reflectDirection(direction, normal);
    expect(reflected.x).toBeCloseTo(0, 5);
    expect(reflected.y).toBeCloseTo(-1, 5);
  });

  it('reflects off a 45-degree surface correctly', () => {
    // Ray going right, surface normal pointing up-left at 45°
    const direction: Vec2 = { x: 1, y: 0 };
    const n = 1 / Math.sqrt(2);
    const normal: Vec2 = { x: -n, y: n };
    const reflected = reflectDirection(direction, normal);
    // Should be reflected to point downward
    expect(reflected.x).toBeCloseTo(0, 5);
    expect(reflected.y).toBeCloseTo(1, 5);
  });

  it('reflected direction has unit length', () => {
    const direction: Vec2 = { x: 0.6, y: 0.8 };
    const normal: Vec2 = { x: 0, y: -1 };
    const reflected = reflectDirection(direction, normal);
    const l = Math.sqrt(reflected.x ** 2 + reflected.y ** 2);
    expect(l).toBeCloseTo(1, 5);
  });
});

describe('nudgeOrigin', () => {
  it('offsets the point in the normal direction', () => {
    const point: Vec2 = { x: 5, y: 10 };
    const normal: Vec2 = { x: 0, y: -1 };
    const nudged = nudgeOrigin(point, normal);
    expect(nudged.x).toBeCloseTo(5, 10);
    expect(nudged.y).toBeLessThan(10); // moved in negative y direction
  });

  it('nudge offset is the expected 1e-4 times the normal', () => {
    const point: Vec2 = { x: 0, y: 0 };
    const normal: Vec2 = { x: 1, y: 0 };
    const nudged = nudgeOrigin(point, normal);
    expect(nudged.x).toBeCloseTo(1e-4, 10);
    expect(nudged.y).toBeCloseTo(0, 10);
  });
});

describe('resolveCorner', () => {
  it('returns the only hit when given a single-element array', () => {
    const hit: HitResult = { t: 5, point: { x: 5, y: 0 }, normal: { x: -1, y: 0 } };
    expect(resolveCorner([hit])).toBe(hit);
  });

  it('averages normals when two hits are at nearly the same t (corner)', () => {
    const hit1: HitResult = { t: 10, point: { x: 10, y: 10 }, normal: { x: -1, y: 0 } };
    const hit2: HitResult = { t: 10 + 1e-5, point: { x: 10, y: 10 }, normal: { x: 0, y: -1 } };
    const result = resolveCorner([hit1, hit2]);
    const expected = 1 / Math.sqrt(2);
    expect(result.normal.x).toBeCloseTo(-expected, 5);
    expect(result.normal.y).toBeCloseTo(-expected, 5);
  });

  it('returns the nearest hit when two hits are far apart', () => {
    const hit1: HitResult = { t: 5, point: { x: 5, y: 0 }, normal: { x: -1, y: 0 } };
    const hit2: HitResult = { t: 15, point: { x: 15, y: 0 }, normal: { x: 0, y: -1 } };
    const result = resolveCorner([hit1, hit2]);
    expect(result.t).toBe(5);
    expect(result.normal).toEqual({ x: -1, y: 0 });
  });

  it('sorts by t before comparing, so order of input does not matter', () => {
    const hit1: HitResult = { t: 20, point: { x: 20, y: 0 }, normal: { x: -1, y: 0 } };
    const hit2: HitResult = { t: 5, point: { x: 5, y: 0 }, normal: { x: 0, y: 1 } };
    const result = resolveCorner([hit1, hit2]);
    expect(result.t).toBe(5);
  });
});
