import { describe, it, expect } from 'vitest'
import {
  add, sub, scale, dot, len, normalize, rotate, lerp,
  distance, perp, fromAngle, angleTo,
} from '../physics/vector.js'

const PREC = 10

describe('add', () => {
  it('adds two vectors', () => {
    expect(add({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 })
  })
  it('adds negative components', () => {
    expect(add({ x: -1, y: 5 }, { x: 2, y: -3 })).toEqual({ x: 1, y: 2 })
  })
})

describe('sub', () => {
  it('subtracts two vectors', () => {
    expect(sub({ x: 5, y: 3 }, { x: 2, y: 1 })).toEqual({ x: 3, y: 2 })
  })
})

describe('scale', () => {
  it('scales a vector', () => {
    expect(scale({ x: 2, y: -3 }, 3)).toEqual({ x: 6, y: -9 })
  })
  it('scales by zero yields zero vector', () => {
    const r = scale({ x: 99, y: -7 }, 0)
    expect(r.x).toBeCloseTo(0, 10)
    expect(r.y).toBeCloseTo(0, 10)
  })
  it('scales by negative', () => {
    expect(scale({ x: 1, y: 2 }, -1)).toEqual({ x: -1, y: -2 })
  })
})

describe('dot', () => {
  it('computes dot product', () => {
    expect(dot({ x: 1, y: 2 }, { x: 3, y: 4 })).toBe(11)
  })
  it('orthogonal vectors have dot = 0', () => {
    expect(dot({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(0)
  })
  it('parallel unit vectors have dot = 1', () => {
    expect(dot({ x: 1, y: 0 }, { x: 1, y: 0 })).toBe(1)
  })
})

describe('len', () => {
  it('computes length', () => {
    expect(len({ x: 3, y: 4 })).toBe(5)
  })
  it('zero vector has length 0', () => {
    expect(len({ x: 0, y: 0 })).toBe(0)
  })
  it('unit vector has length 1', () => {
    expect(len({ x: 1, y: 0 })).toBeCloseTo(1, PREC)
  })
})

describe('normalize', () => {
  it('produces a unit vector', () => {
    const n = normalize({ x: 3, y: 4 })
    expect(len(n)).toBeCloseTo(1, PREC)
    expect(n.x).toBeCloseTo(0.6, PREC)
    expect(n.y).toBeCloseTo(0.8, PREC)
  })
  it('zero vector returns {0,0} without crashing', () => {
    expect(normalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 })
  })
  it('already-unit vector stays unit', () => {
    const n = normalize({ x: 0, y: 1 })
    expect(n.x).toBeCloseTo(0, PREC)
    expect(n.y).toBeCloseTo(1, PREC)
  })
})

describe('rotate', () => {
  it('rotates 90° CCW', () => {
    const r = rotate({ x: 1, y: 0 }, Math.PI / 2)
    expect(r.x).toBeCloseTo(0, PREC)
    expect(r.y).toBeCloseTo(1, PREC)
  })
  it('rotates 180°', () => {
    const r = rotate({ x: 1, y: 0 }, Math.PI)
    expect(r.x).toBeCloseTo(-1, PREC)
    expect(r.y).toBeCloseTo(0, PREC)
  })
  it('rotates 0° is identity', () => {
    const r = rotate({ x: 3, y: 4 }, 0)
    expect(r.x).toBeCloseTo(3, PREC)
    expect(r.y).toBeCloseTo(4, PREC)
  })
})

describe('lerp', () => {
  it('t=0 returns a', () => {
    expect(lerp({ x: 0, y: 0 }, { x: 10, y: 10 }, 0)).toEqual({ x: 0, y: 0 })
  })
  it('t=1 returns b', () => {
    expect(lerp({ x: 0, y: 0 }, { x: 10, y: 10 }, 1)).toEqual({ x: 10, y: 10 })
  })
  it('t=0.5 returns midpoint', () => {
    const r = lerp({ x: 0, y: 0 }, { x: 10, y: 20 }, 0.5)
    expect(r).toEqual({ x: 5, y: 10 })
  })
})

describe('distance', () => {
  it('distance between same point is 0', () => {
    expect(distance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0)
  })
  it('3-4-5 triangle', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })
})

describe('perp', () => {
  it('perpendicular of {1,0} is {0,1}', () => {
    const r = perp({ x: 1, y: 0 })
    expect(r.x).toBeCloseTo(0, 10)
    expect(r.y).toBeCloseTo(1, 10)
  })
  it('perpendicular of {0,1} is {-1,0}', () => {
    const r = perp({ x: 0, y: 1 })
    expect(r.x).toBeCloseTo(-1, 10)
    expect(r.y).toBeCloseTo(0, 10)
  })
  it('perp is orthogonal (dot = 0)', () => {
    const v = { x: 3, y: 4 }
    expect(dot(v, perp(v))).toBeCloseTo(0, PREC)
  })
})

describe('fromAngle', () => {
  it('angle 0 is {1,0}', () => {
    const v = fromAngle(0)
    expect(v.x).toBeCloseTo(1, PREC)
    expect(v.y).toBeCloseTo(0, PREC)
  })
  it('angle π/2 is {0,1}', () => {
    const v = fromAngle(Math.PI / 2)
    expect(v.x).toBeCloseTo(0, PREC)
    expect(v.y).toBeCloseTo(1, PREC)
  })
  it('result is always unit length', () => {
    expect(len(fromAngle(1.234))).toBeCloseTo(1, PREC)
  })
})

describe('angleTo', () => {
  it('right is 0', () => {
    expect(angleTo({ x: 0, y: 0 }, { x: 1, y: 0 })).toBeCloseTo(0, PREC)
  })
  it('down is π/2 (SVG y-down)', () => {
    expect(angleTo({ x: 0, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(Math.PI / 2, PREC)
  })
  it('left is ±π', () => {
    expect(Math.abs(angleTo({ x: 0, y: 0 }, { x: -1, y: 0 }))).toBeCloseTo(Math.PI, PREC)
  })
})
