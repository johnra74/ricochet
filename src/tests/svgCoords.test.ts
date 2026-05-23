import { describe, it, expect, vi } from 'vitest'
import { createRef } from 'react'
import { clientToSvg } from '../hooks/useSvgCoords.js'
import type { RefObject } from 'react'

function makeSvgRef(ctm: DOMMatrix | null): RefObject<SVGSVGElement | null> {
  const ref = createRef<SVGSVGElement>()
  const fakeSvg = {
    createSVGPoint: () => ({
      x: 0,
      y: 0,
      matrixTransform(m: DOMMatrix) {
        return { x: this.x - (m as unknown as { e: number }).e, y: this.y - (m as unknown as { f: number }).f }
      },
    }),
    getScreenCTM: () => ctm,
  } as unknown as SVGSVGElement
  ;(ref as { current: SVGSVGElement | null }).current = fakeSvg
  return ref
}

describe('clientToSvg', () => {
  it('returns {0,0} when svgRef is null', () => {
    const ref = createRef<SVGSVGElement>()
    expect(clientToSvg(100, 200, ref)).toEqual({ x: 0, y: 0 })
  })

  it('returns {0,0} when getScreenCTM returns null', () => {
    const ref = makeSvgRef(null)
    expect(clientToSvg(100, 200, ref)).toEqual({ x: 0, y: 0 })
  })

  it('uses matrixTransform to convert coordinates', () => {
    // We make a fake ref whose matrixTransform subtracts (10, 20) from inputs
    const ref = createRef<SVGSVGElement>()
    const fakeSvg = {
      createSVGPoint: () => {
        const pt = { x: 0, y: 0 } as SVGPoint & { x: number; y: number }
        pt.matrixTransform = (_m: DOMMatrix) => ({ x: pt.x - 10, y: pt.y - 20 } as SVGPoint)
        return pt
      },
      getScreenCTM: () => ({
        inverse: () => ({ e: 10, f: 20 } as unknown as DOMMatrix),
      } as unknown as DOMMatrix),
    } as unknown as SVGSVGElement
    ;(ref as { current: SVGSVGElement | null }).current = fakeSvg

    const result = clientToSvg(50, 80, ref)
    expect(result.x).toBe(40)  // 50 - 10
    expect(result.y).toBe(60)  // 80 - 20
  })
})
