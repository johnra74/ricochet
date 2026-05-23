import { describe, it, expect } from 'vitest'
import { reflectDirection, nudgeOrigin, resolveCorner } from '../physics/reflect.js'
import { len } from '../physics/vector.js'
import type { HitResult } from '../types/index.js'

const PREC = 8

describe('reflectDirection', () => {
  it('bounces horizontal ray off a vertical wall (normal points right)', () => {
    const reflected = reflectDirection({ x: 1, y: 0 }, { x: -1, y: 0 })
    expect(reflected.x).toBeCloseTo(-1, PREC)
    expect(reflected.y).toBeCloseTo(0, PREC)
  })

  it('bounces downward ray off a floor (normal points up)', () => {
    const reflected = reflectDirection({ x: 0, y: 1 }, { x: 0, y: -1 })
    expect(reflected.x).toBeCloseTo(0, PREC)
    expect(reflected.y).toBeCloseTo(-1, PREC)
  })

  it('45° ray bounces off horizontal wall', () => {
    const d = { x: Math.SQRT1_2, y: Math.SQRT1_2 }
    const reflected = reflectDirection(d, { x: 0, y: -1 })
    expect(reflected.x).toBeCloseTo(Math.SQRT1_2, PREC)
    expect(reflected.y).toBeCloseTo(-Math.SQRT1_2, PREC)
  })

  it('result is always a unit vector', () => {
    const reflected = reflectDirection(
      { x: 0.6, y: 0.8 },
      { x: -1, y: 0 },
    )
    expect(len(reflected)).toBeCloseTo(1, PREC)
  })

  it('glancing reflection preserves speed (unit length)', () => {
    const angle = Math.PI / 6
    const d = { x: Math.cos(angle), y: Math.sin(angle) }
    const reflected = reflectDirection(d, { x: 0, y: -1 })
    expect(len(reflected)).toBeCloseTo(1, PREC)
  })
})

describe('nudgeOrigin', () => {
  it('moves point in normal direction by small amount', () => {
    const nudged = nudgeOrigin({ x: 0, y: 0 }, { x: 1, y: 0 })
    expect(nudged.x).toBeCloseTo(1e-4, 10)
    expect(nudged.y).toBeCloseTo(0, 10)
  })

  it('works with diagonal normal', () => {
    const nudged = nudgeOrigin({ x: 5, y: 5 }, { x: 0, y: -1 })
    expect(nudged.x).toBeCloseTo(5, 10)
    expect(nudged.y).toBeCloseTo(5 - 1e-4, 10)
  })
})

describe('resolveCorner', () => {
  const makeHit = (t: number, nx: number, ny: number): HitResult => ({
    t,
    point: { x: t, y: 0 },
    normal: { x: nx, y: ny },
  })

  it('single hit returns itself', () => {
    const hit = makeHit(5, 1, 0)
    const result = resolveCorner([hit])
    expect(result).toBe(hit)
  })

  it('two hits far apart returns the nearer one', () => {
    const near = makeHit(3, 1, 0)
    const far = makeHit(10, 0, 1)
    expect(resolveCorner([near, far])).toEqual(near)
    expect(resolveCorner([far, near])).toEqual(near) // order-independent
  })

  it('two hits at nearly same t averages normals', () => {
    const h1 = makeHit(5.0, 1, 0)
    const h2 = makeHit(5.0 + 5e-5, 0, 1) // within 1e-4
    const result = resolveCorner([h1, h2])
    // avg of (1,0) and (0,1) normalized = (√2/2, √2/2)
    expect(result.normal.x).toBeCloseTo(Math.SQRT1_2, 6)
    expect(result.normal.y).toBeCloseTo(Math.SQRT1_2, 6)
  })

  it('two hits just outside 1e-4 threshold returns nearer without averaging', () => {
    const near = makeHit(5.0, 1, 0)
    const far = makeHit(5.0 + 2e-4, 0, 1) // outside threshold
    const result = resolveCorner([near, far])
    expect(result.normal).toEqual({ x: 1, y: 0 })
  })
})
