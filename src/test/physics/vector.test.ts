import { describe, it, expect } from 'vitest';
import { add, sub, scale, dot, len, normalize, rotate, lerp, fromAngle, angleTo } from '../../physics/vector.js';
import type { Vec2 } from '../../types/index.js';

describe('vector utilities', () => {
  describe('add', () => {
    it('adds two vectors component-wise', () => {
      expect(add({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 });
    });

    it('handles negative components', () => {
      expect(add({ x: -1, y: 3 }, { x: 2, y: -5 })).toEqual({ x: 1, y: -2 });
    });

    it('adding zero vector returns original', () => {
      const v: Vec2 = { x: 7, y: -3 };
      expect(add(v, { x: 0, y: 0 })).toEqual(v);
    });
  });

  describe('sub', () => {
    it('subtracts two vectors component-wise', () => {
      expect(sub({ x: 5, y: 3 }, { x: 2, y: 1 })).toEqual({ x: 3, y: 2 });
    });

    it('subtracting a vector from itself gives zero', () => {
      const v: Vec2 = { x: 4, y: -7 };
      expect(sub(v, v)).toEqual({ x: 0, y: 0 });
    });
  });

  describe('scale', () => {
    it('scales a vector by a scalar', () => {
      expect(scale({ x: 2, y: 3 }, 4)).toEqual({ x: 8, y: 12 });
    });

    it('scaling by zero gives zero vector', () => {
      expect(scale({ x: 5, y: -3 }, 0)).toEqual({ x: 0, y: -0 });
    });

    it('scaling by negative reverses direction', () => {
      expect(scale({ x: 1, y: 2 }, -1)).toEqual({ x: -1, y: -2 });
    });
  });

  describe('dot', () => {
    it('computes dot product of two vectors', () => {
      expect(dot({ x: 1, y: 2 }, { x: 3, y: 4 })).toBe(11);
    });

    it('dot product of perpendicular vectors is zero', () => {
      expect(dot({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(0);
    });

    it('dot product of a vector with itself is length squared', () => {
      const v: Vec2 = { x: 3, y: 4 };
      expect(dot(v, v)).toBe(25);
    });
  });

  describe('len', () => {
    it('computes the length of a vector', () => {
      expect(len({ x: 3, y: 4 })).toBe(5);
    });

    it('length of zero vector is zero', () => {
      expect(len({ x: 0, y: 0 })).toBe(0);
    });

    it('length of unit vector is one', () => {
      expect(len({ x: 1, y: 0 })).toBe(1);
    });
  });

  describe('normalize', () => {
    it('normalizes a vector to unit length', () => {
      const n = normalize({ x: 3, y: 4 });
      expect(len(n)).toBeCloseTo(1, 10);
      expect(n.x).toBeCloseTo(0.6, 10);
      expect(n.y).toBeCloseTo(0.8, 10);
    });

    it('normalizing the zero vector returns zero vector', () => {
      expect(normalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
    });

    it('normalizing a unit vector returns the same vector', () => {
      const n = normalize({ x: 1, y: 0 });
      expect(n.x).toBeCloseTo(1, 10);
      expect(n.y).toBeCloseTo(0, 10);
    });
  });

  describe('rotate', () => {
    it('rotates a vector by 90 degrees (pi/2)', () => {
      const result = rotate({ x: 1, y: 0 }, Math.PI / 2);
      expect(result.x).toBeCloseTo(0, 10);
      expect(result.y).toBeCloseTo(1, 10);
    });

    it('rotates a vector by 180 degrees (pi)', () => {
      const result = rotate({ x: 1, y: 0 }, Math.PI);
      expect(result.x).toBeCloseTo(-1, 10);
      expect(result.y).toBeCloseTo(0, 10);
    });

    it('rotating by full rotation (2pi) returns original vector', () => {
      const v: Vec2 = { x: 3, y: 5 };
      const result = rotate(v, 2 * Math.PI);
      expect(result.x).toBeCloseTo(v.x, 10);
      expect(result.y).toBeCloseTo(v.y, 10);
    });

    it('rotating by zero returns original vector', () => {
      const v: Vec2 = { x: 2, y: 7 };
      const result = rotate(v, 0);
      expect(result.x).toBeCloseTo(v.x, 10);
      expect(result.y).toBeCloseTo(v.y, 10);
    });
  });

  describe('lerp', () => {
    it('at t=0 returns point a', () => {
      const a: Vec2 = { x: 1, y: 2 };
      const b: Vec2 = { x: 5, y: 8 };
      expect(lerp(a, b, 0)).toEqual({ x: 1, y: 2 });
    });

    it('at t=1 returns point b', () => {
      const a: Vec2 = { x: 1, y: 2 };
      const b: Vec2 = { x: 5, y: 8 };
      expect(lerp(a, b, 1)).toEqual({ x: 5, y: 8 });
    });

    it('at t=0.5 returns the midpoint', () => {
      const result = lerp({ x: 0, y: 0 }, { x: 4, y: 6 }, 0.5);
      expect(result).toEqual({ x: 2, y: 3 });
    });

    it('at t=0.25 returns a quarter of the way from a to b', () => {
      const result = lerp({ x: 0, y: 0 }, { x: 8, y: 4 }, 0.25);
      expect(result).toEqual({ x: 2, y: 1 });
    });
  });

  describe('fromAngle', () => {
    it('angle 0 gives unit vector pointing right', () => {
      const v = fromAngle(0);
      expect(v.x).toBeCloseTo(1, 10);
      expect(v.y).toBeCloseTo(0, 10);
    });

    it('angle pi/2 gives unit vector pointing down (positive y)', () => {
      const v = fromAngle(Math.PI / 2);
      expect(v.x).toBeCloseTo(0, 10);
      expect(v.y).toBeCloseTo(1, 10);
    });

    it('angle pi gives unit vector pointing left', () => {
      const v = fromAngle(Math.PI);
      expect(v.x).toBeCloseTo(-1, 10);
      expect(v.y).toBeCloseTo(0, 10);
    });

    it('produced vector has unit length', () => {
      const v = fromAngle(1.23);
      expect(len(v)).toBeCloseTo(1, 10);
    });
  });

  describe('angleTo', () => {
    it('angle from origin to point on positive x-axis is 0', () => {
      expect(angleTo({ x: 0, y: 0 }, { x: 5, y: 0 })).toBeCloseTo(0, 10);
    });

    it('angle from origin to point on positive y-axis is pi/2', () => {
      expect(angleTo({ x: 0, y: 0 }, { x: 0, y: 5 })).toBeCloseTo(Math.PI / 2, 10);
    });

    it('angle from origin to point on negative x-axis is pi or -pi', () => {
      const angle = angleTo({ x: 0, y: 0 }, { x: -5, y: 0 });
      expect(Math.abs(angle)).toBeCloseTo(Math.PI, 10);
    });

    it('computes angle between two non-origin points', () => {
      const angle = angleTo({ x: 1, y: 1 }, { x: 2, y: 1 });
      expect(angle).toBeCloseTo(0, 10);
    });
  });
});
