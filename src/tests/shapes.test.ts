import { describe, it, expect } from 'vitest'
import {
  rectToSegments,
  triangleToSegments,
  circleToGeom,
  wallSegments,
  shapeToSegments,
} from '../physics/shapes.js'
import { dot, len } from '../physics/vector.js'
import type { RectShape, TriShape, CircShape, Board } from '../types/index.js'

const PREC = 6

function normalsPointOutward(segments: ReturnType<typeof rectToSegments>) {
  for (const seg of segments) {
    expect(len(seg.normal)).toBeCloseTo(1, PREC)
  }
}

describe('rectToSegments', () => {
  const rect: RectShape = {
    id: 'r1', type: 'rect', cx: 100, cy: 100, width: 40, height: 20, rotation: 0,
  }

  it('produces 4 segments', () => {
    expect(rectToSegments(rect)).toHaveLength(4)
  })

  it('all normals are unit length', () => {
    normalsPointOutward(rectToSegments(rect))
  })

  it('axis-aligned rect has NSEW normals', () => {
    const segs = rectToSegments(rect)
    // Use approximate comparison to avoid -0 vs 0 issues (Object.is(-0, 0) is false)
    const hasNormal = (nx: number, ny: number) =>
      segs.some((s) => Math.abs(s.normal.x - nx) < 0.01 && Math.abs(s.normal.y - ny) < 0.01)
    expect(hasNormal(0, -1)).toBe(true)  // top edge
    expect(hasNormal(0, 1)).toBe(true)   // bottom edge
    expect(hasNormal(-1, 0)).toBe(true)  // left edge
    expect(hasNormal(1, 0)).toBe(true)   // right edge
  })

  it('rotated rect still has unit-length normals', () => {
    const rotated: RectShape = { ...rect, rotation: 45 }
    normalsPointOutward(rectToSegments(rotated))
  })

  it('normals point away from center (dot with outward vector > 0)', () => {
    const segs = rectToSegments(rect)
    for (const seg of segs) {
      const midX = (seg.p1.x + seg.p2.x) / 2 - rect.cx
      const midY = (seg.p1.y + seg.p2.y) / 2 - rect.cy
      const outward = { x: midX, y: midY }
      expect(dot(seg.normal, outward)).toBeGreaterThan(0)
    }
  })
})

describe('triangleToSegments', () => {
  const tri: TriShape = {
    id: 't1', type: 'triangle', cx: 200, cy: 200, base: 60, height: 80, rotation: 0,
  }

  it('produces 3 segments', () => {
    expect(triangleToSegments(tri)).toHaveLength(3)
  })

  it('all normals are unit length', () => {
    normalsPointOutward(triangleToSegments(tri))
  })

  it('normals point away from center', () => {
    const segs = triangleToSegments(tri)
    for (const seg of segs) {
      const midX = (seg.p1.x + seg.p2.x) / 2 - tri.cx
      const midY = (seg.p1.y + seg.p2.y) / 2 - tri.cy
      const outward = { x: midX, y: midY }
      expect(dot(seg.normal, outward)).toBeGreaterThan(0)
    }
  })

  it('rotated triangle still has 3 unit-length normals', () => {
    const rotated: TriShape = { ...tri, rotation: 90 }
    const segs = triangleToSegments(rotated)
    expect(segs).toHaveLength(3)
    normalsPointOutward(segs)
  })
})

describe('circleToGeom', () => {
  it('extracts geometry from a circle shape', () => {
    const shape: CircShape = { id: 'c1', type: 'circle', cx: 50, cy: 80, radius: 25 }
    expect(circleToGeom(shape)).toEqual({ cx: 50, cy: 80, radius: 25 })
  })

  it('works with any numeric struct that has cx/cy/radius', () => {
    const geom = circleToGeom({ cx: 0, cy: 0, radius: 10 })
    expect(geom.radius).toBe(10)
  })
})

describe('wallSegments', () => {
  const board: Board = { width: 800, height: 550 }

  it('produces 4 wall segments', () => {
    expect(wallSegments(board)).toHaveLength(4)
  })

  it('top wall normal points inward (down)', () => {
    const segs = wallSegments(board)
    const top = segs.find((s) => s.p1.y === 0 && s.p2.y === 0)
    expect(top).toBeDefined()
    expect(top!.normal).toEqual({ x: 0, y: 1 })
  })

  it('bottom wall normal points inward (up)', () => {
    const segs = wallSegments(board)
    const bottom = segs.find((s) => s.p1.y === board.height && s.p2.y === board.height)
    expect(bottom).toBeDefined()
    expect(bottom!.normal).toEqual({ x: 0, y: -1 })
  })

  it('left wall normal points inward (right)', () => {
    const segs = wallSegments(board)
    const left = segs.find((s) => s.p2.x === 0 && s.p1.x === 0)
    expect(left).toBeDefined()
    expect(left!.normal).toEqual({ x: 1, y: 0 })
  })

  it('right wall normal points inward (left)', () => {
    const segs = wallSegments(board)
    const right = segs.find((s) => s.p1.x === board.width && s.p2.x === board.width)
    expect(right).toBeDefined()
    expect(right!.normal).toEqual({ x: -1, y: 0 })
  })
})

describe('shapeToSegments (registry dispatch)', () => {
  it('dispatches rect', () => {
    const rect: RectShape = { id: 'r', type: 'rect', cx: 0, cy: 0, width: 10, height: 10, rotation: 0 }
    expect(shapeToSegments(rect)).toHaveLength(4)
  })

  it('dispatches triangle', () => {
    const tri: TriShape = { id: 't', type: 'triangle', cx: 0, cy: 0, base: 10, height: 10, rotation: 0 }
    expect(shapeToSegments(tri)).toHaveLength(3)
  })

  it('dispatches circle → empty segments (handled as CircleGeom)', () => {
    const circ: CircShape = { id: 'c', type: 'circle', cx: 0, cy: 0, radius: 10 }
    expect(shapeToSegments(circ)).toHaveLength(0)
  })
})
