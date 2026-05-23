import { describe, it, expect } from 'vitest'
import { simulate } from '../physics/simulate.js'
import type { Payload, Vec2 } from '../types/index.js'

function makePayload(overrides: Partial<Payload> = {}): Payload {
  return {
    version: 1,
    board: { width: 800, height: 600 },
    target: { x: 750, y: 300, radius: 20 },
    maxRicochets: 5,
    shapes: [],
    allowedWalls: ['left', 'right', 'top', 'bottom'],
    ...overrides,
  }
}

describe('simulate — basic trajectory', () => {
  it('straight shot to the right wall → lose (no target hit)', () => {
    // Target is off the horizontal path (y=100, ball travels along y=300)
    const payload = makePayload({ target: { x: 750, y: 100, radius: 20 }, maxRicochets: 0 })
    const start: Vec2 = { x: 0, y: 300 }
    const result = simulate(start, 0, payload) // angle 0 = right
    expect(result.outcome).toBe('lose')
    expect(result.path.length).toBeGreaterThan(1)
    expect(result.ricochetCount).toBe(0)
  })

  it('path always starts at startPos', () => {
    const start: Vec2 = { x: 50, y: 100 }
    const result = simulate(start, 0, makePayload())
    expect(result.path[0]).toEqual(start)
  })

  it('direct shot hits target → win', () => {
    const target = { x: 700, y: 300, radius: 30 }
    const payload = makePayload({ target, maxRicochets: 0 })
    const start: Vec2 = { x: 0, y: 300 }
    const result = simulate(start, 0, payload) // perfectly horizontal
    expect(result.outcome).toBe('win')
    expect(result.ricochetCount).toBe(0)
  })

  it('path ends near target center on win', () => {
    const target = { x: 700, y: 300, radius: 30 }
    const payload = makePayload({ target, maxRicochets: 0 })
    const start: Vec2 = { x: 0, y: 300 }
    const result = simulate(start, 0, payload)
    const last = result.path[result.path.length - 1]
    const dx = last.x - target.x
    const dy = last.y - target.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    expect(dist).toBeLessThanOrEqual(target.radius + 1)
  })
})

describe('simulate — wall bouncing', () => {
  it('ball bouncing off bottom wall increments ricochet count', () => {
    // Target is far off to the side; ball goes straight down and bounces off bottom
    const payload = makePayload({
      target: { x: 10, y: 10, radius: 5 }, // far from straight-down path
      maxRicochets: 1,
    })
    const start: Vec2 = { x: 400, y: 0 }
    const result = simulate(start, Math.PI / 2, payload) // straight down
    expect(result.ricochetCount).toBeGreaterThanOrEqual(1)
  })

  it('exceeding maxRicochets returns lose', () => {
    const payload = makePayload({ maxRicochets: 1 })
    // Aim so it bounces indefinitely between walls (vertical shot)
    const start: Vec2 = { x: 400, y: 0 }
    const result = simulate(start, Math.PI / 2, payload)
    expect(result.outcome).toBe('lose')
  })
})

describe('simulate — with shapes', () => {
  it('a circle obstacle can be hit', () => {
    const payload = makePayload({
      shapes: [{ id: 'c1', type: 'circle', cx: 400, cy: 300, radius: 30 }],
      maxRicochets: 1,
      target: { x: 750, y: 300, radius: 20 },
    })
    const start: Vec2 = { x: 0, y: 300 }
    const result = simulate(start, 0, payload)
    // Ball hits circle, should bounce — ricochetCount >= 1
    expect(result.ricochetCount).toBeGreaterThanOrEqual(1)
  })

  it('a rect obstacle can be hit', () => {
    const payload = makePayload({
      shapes: [{
        id: 'r1', type: 'rect', cx: 400, cy: 300,
        width: 100, height: 20, rotation: 0,
      }],
      maxRicochets: 1,
      target: { x: 750, y: 300, radius: 20 },
    })
    const start: Vec2 = { x: 0, y: 300 }
    const result = simulate(start, 0, payload)
    expect(result.ricochetCount).toBeGreaterThanOrEqual(1)
  })

  it('a triangle obstacle can be hit', () => {
    const payload = makePayload({
      shapes: [{
        id: 't1', type: 'triangle', cx: 400, cy: 300,
        base: 80, height: 60, rotation: 0,
      }],
      maxRicochets: 1,
      target: { x: 750, y: 300, radius: 20 },
    })
    const start: Vec2 = { x: 0, y: 300 }
    const result = simulate(start, 0, payload)
    expect(result.ricochetCount).toBeGreaterThanOrEqual(1)
  })
})

describe('simulate — extra segments/circles', () => {
  it('accepts extraSegments that act as obstacles', () => {
    const payload = makePayload({ maxRicochets: 1 })
    const extraSeg = {
      p1: { x: 200, y: 0 },
      p2: { x: 200, y: 600 },
      normal: { x: -1, y: 0 },
    }
    const start: Vec2 = { x: 0, y: 300 }
    const result = simulate(start, 0, payload, [extraSeg])
    // Extra vertical wall at x=200 should cause a bounce
    expect(result.path.some((p) => Math.abs(p.x - 200) < 2)).toBe(true)
  })
})

describe('simulate — SimResult structure', () => {
  it('result has path, outcome, ricochetCount', () => {
    const result = simulate({ x: 0, y: 300 }, 0, makePayload())
    expect(result).toHaveProperty('path')
    expect(result).toHaveProperty('outcome')
    expect(result).toHaveProperty('ricochetCount')
    expect(Array.isArray(result.path)).toBe(true)
    expect(['win', 'lose']).toContain(result.outcome)
    expect(typeof result.ricochetCount).toBe('number')
  })

  it('ricochetCount never exceeds maxRicochets', () => {
    const payload = makePayload({ maxRicochets: 3 })
    const result = simulate({ x: 0, y: 300 }, Math.PI / 4, payload)
    expect(result.ricochetCount).toBeLessThanOrEqual(3)
  })
})
