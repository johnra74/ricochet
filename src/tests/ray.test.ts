import { describe, it, expect } from 'vitest'
import { raySegmentIntersect, rayCircleIntersect } from '../physics/ray.js'
import type { Ray, Segment, CircleGeom } from '../types/index.js'

const PREC = 6

// ---- raySegmentIntersect ----

describe('raySegmentIntersect', () => {
  const rightRay: Ray = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }

  it('hits a vertical segment directly ahead', () => {
    const seg: Segment = {
      p1: { x: 5, y: -1 },
      p2: { x: 5, y: 1 },
      normal: { x: -1, y: 0 },
    }
    const hit = raySegmentIntersect(rightRay, seg)
    expect(hit).not.toBeNull()
    expect(hit!.t).toBeCloseTo(5, PREC)
    expect(hit!.point.x).toBeCloseTo(5, PREC)
    expect(hit!.point.y).toBeCloseTo(0, PREC)
    expect(hit!.normal).toEqual({ x: -1, y: 0 })
  })

  it('returns null for a segment behind the ray', () => {
    const seg: Segment = {
      p1: { x: -5, y: -1 },
      p2: { x: -5, y: 1 },
      normal: { x: 1, y: 0 },
    }
    expect(raySegmentIntersect(rightRay, seg)).toBeNull()
  })

  it('returns null for a parallel segment', () => {
    const seg: Segment = {
      p1: { x: 0, y: 1 },
      p2: { x: 10, y: 1 },
      normal: { x: 0, y: -1 },
    }
    expect(raySegmentIntersect(rightRay, seg)).toBeNull()
  })

  it('returns null when ray misses the segment extent', () => {
    const seg: Segment = {
      p1: { x: 5, y: 2 },
      p2: { x: 5, y: 10 },
      normal: { x: -1, y: 0 },
    }
    expect(raySegmentIntersect(rightRay, seg)).toBeNull()
  })

  it('hits at the endpoint of a segment', () => {
    const seg: Segment = {
      p1: { x: 5, y: 0 },
      p2: { x: 5, y: 5 },
      normal: { x: -1, y: 0 },
    }
    const hit = raySegmentIntersect(rightRay, seg)
    expect(hit).not.toBeNull()
    expect(hit!.t).toBeCloseTo(5, PREC)
  })

  it('diagonal ray hits diagonal segment', () => {
    const ray: Ray = {
      origin: { x: 0, y: 0 },
      direction: { x: Math.SQRT1_2, y: Math.SQRT1_2 },
    }
    const seg: Segment = {
      p1: { x: 0, y: 5 },
      p2: { x: 5, y: 0 },
      normal: { x: Math.SQRT1_2, y: Math.SQRT1_2 },
    }
    const hit = raySegmentIntersect(ray, seg)
    expect(hit).not.toBeNull()
    expect(hit!.point.x).toBeCloseTo(2.5, PREC)
    expect(hit!.point.y).toBeCloseTo(2.5, PREC)
  })
})

// ---- rayCircleIntersect ----

describe('rayCircleIntersect', () => {
  const rightRay: Ray = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }

  it('hits a circle directly ahead', () => {
    const circle: CircleGeom = { cx: 10, cy: 0, radius: 2 }
    const hit = rayCircleIntersect(rightRay, circle)
    expect(hit).not.toBeNull()
    expect(hit!.t).toBeCloseTo(8, PREC) // 10 - 2
    expect(hit!.point.x).toBeCloseTo(8, PREC)
    expect(hit!.point.y).toBeCloseTo(0, PREC)
    // Normal points left (away from center toward hit point)
    expect(hit!.normal.x).toBeCloseTo(-1, PREC)
    expect(hit!.normal.y).toBeCloseTo(0, PREC)
  })

  it('returns null when ray misses the circle', () => {
    const circle: CircleGeom = { cx: 10, cy: 5, radius: 1 }
    expect(rayCircleIntersect(rightRay, circle)).toBeNull()
  })

  it('returns null when circle is behind origin', () => {
    const circle: CircleGeom = { cx: -10, cy: 0, radius: 2 }
    expect(rayCircleIntersect(rightRay, circle)).toBeNull()
  })

  it('ray tangent to circle returns a hit', () => {
    const circle: CircleGeom = { cx: 10, cy: 1, radius: 1 }
    const hit = rayCircleIntersect(rightRay, circle)
    // Tangent: disc ≈ 0, still hits
    expect(hit).not.toBeNull()
    expect(hit!.point.y).toBeCloseTo(0, 3)
  })

  it('origin inside circle returns the exit hit (positive t)', () => {
    const ray: Ray = { origin: { x: 10, y: 0 }, direction: { x: 1, y: 0 } }
    const circle: CircleGeom = { cx: 10, cy: 0, radius: 5 }
    const hit = rayCircleIntersect(ray, circle)
    expect(hit).not.toBeNull()
    expect(hit!.t).toBeCloseTo(5, PREC) // exits at x=15
    expect(hit!.point.x).toBeCloseTo(15, PREC)
  })

  it('normal points away from circle center', () => {
    const ray: Ray = { origin: { x: 0, y: 5 }, direction: { x: 0, y: -1 } }
    const circle: CircleGeom = { cx: 0, cy: 0, radius: 2 }
    const hit = rayCircleIntersect(ray, circle)
    expect(hit).not.toBeNull()
    // hit at (0,2), normal = normalize((0,2)-(0,0)) = (0,1)
    expect(hit!.normal.x).toBeCloseTo(0, PREC)
    expect(hit!.normal.y).toBeCloseTo(1, PREC)
  })
})
