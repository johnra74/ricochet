import { describe, it, expect } from 'vitest'
import { shapeBBox } from '../utils/bbox.js'
import type { CircShape, RectShape, TriShape } from '../types/index.js'

describe('shapeBBox', () => {
  it('circle: AABB is cx±r, cy±r', () => {
    const s: CircShape = { id: 'c', type: 'circle', cx: 100, cy: 200, radius: 40 }
    expect(shapeBBox(s)).toEqual({ left: 60, right: 140, top: 160, bottom: 240 })
  })

  it('axis-aligned rect: AABB equals the rect bounds', () => {
    const s: RectShape = { id: 'r', type: 'rect', cx: 100, cy: 100, width: 80, height: 60, rotation: 0 }
    expect(shapeBBox(s)).toMatchObject({ left: 60, right: 140, top: 70, bottom: 130 })
  })

  it('45° rotated square: AABB half-widths equal in both axes', () => {
    const side = 100
    const s: RectShape = { id: 'r', type: 'rect', cx: 0, cy: 0, width: side, height: side, rotation: 45 }
    const bbox = shapeBBox(s)
    const expected = (side / 2) * Math.SQRT2
    expect(bbox.left).toBeCloseTo(-expected, 5)
    expect(bbox.right).toBeCloseTo(expected, 5)
    expect(bbox.top).toBeCloseTo(-expected, 5)
    expect(bbox.bottom).toBeCloseTo(expected, 5)
  })

  it('unrotated triangle: AABB spans base and height correctly', () => {
    const s: TriShape = { id: 't', type: 'triangle', cx: 0, cy: 0, base: 60, height: 90, rotation: 0 }
    const bbox = shapeBBox(s)
    expect(bbox.left).toBeCloseTo(-30, 5)   // -base/2
    expect(bbox.right).toBeCloseTo(30, 5)   // +base/2
    expect(bbox.top).toBeCloseTo(-60, 5)    // -2*height/3
    expect(bbox.bottom).toBeCloseTo(30, 5)  // +height/3
  })

  it('rect bbox center is shape center', () => {
    const s: RectShape = { id: 'r', type: 'rect', cx: 300, cy: 200, width: 120, height: 80, rotation: 30 }
    const bbox = shapeBBox(s)
    expect((bbox.left + bbox.right) / 2).toBeCloseTo(300, 4)
    expect((bbox.top + bbox.bottom) / 2).toBeCloseTo(200, 4)
  })
})
