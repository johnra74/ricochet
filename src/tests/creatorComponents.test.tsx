import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import GhostShape from '../creator/GhostShape.js'
import DragHandle from '../creator/DragHandle.js'
import type { GhostState } from '../hooks/useCreatorState.js'

// ---- GhostShape ----

describe('GhostShape', () => {
  it('renders nothing when ghost is null', () => {
    const { container } = render(<svg><GhostShape ghost={null} /></svg>)
    expect(container.querySelector('rect')).toBeNull()
    expect(container.querySelector('polygon')).toBeNull()
    expect(container.querySelector('circle')).toBeNull()
  })

  it('renders a rect ghost', () => {
    const ghost: GhostState = {
      shapeType: 'rect',
      startSvg: { x: 50, y: 50 },
      currentSvg: { x: 150, y: 130 },
    }
    const { container } = render(<svg><GhostShape ghost={ghost} /></svg>)
    const rect = container.querySelector('rect')
    expect(rect).not.toBeNull()
    expect(Number(rect!.getAttribute('width'))).toBeGreaterThanOrEqual(20)
    expect(Number(rect!.getAttribute('height'))).toBeGreaterThanOrEqual(20)
  })

  it('rect ghost enforces min size of 20 when drag is small', () => {
    const ghost: GhostState = {
      shapeType: 'rect',
      startSvg: { x: 50, y: 50 },
      currentSvg: { x: 55, y: 53 }, // tiny drag
    }
    const { container } = render(<svg><GhostShape ghost={ghost} /></svg>)
    const rect = container.querySelector('rect')!
    expect(Number(rect.getAttribute('width'))).toBe(20)
    expect(Number(rect.getAttribute('height'))).toBe(20)
  })

  it('renders a triangle ghost', () => {
    const ghost: GhostState = {
      shapeType: 'triangle',
      startSvg: { x: 100, y: 100 },
      currentSvg: { x: 200, y: 200 },
    }
    const { container } = render(<svg><GhostShape ghost={ghost} /></svg>)
    expect(container.querySelector('polygon')).not.toBeNull()
  })

  it('renders a circle ghost', () => {
    const ghost: GhostState = {
      shapeType: 'circle',
      startSvg: { x: 200, y: 200 },
      currentSvg: { x: 260, y: 260 },
    }
    const { container } = render(<svg><GhostShape ghost={ghost} /></svg>)
    expect(container.querySelector('circle')).not.toBeNull()
  })

  it('circle ghost enforces min radius of 10', () => {
    const ghost: GhostState = {
      shapeType: 'circle',
      startSvg: { x: 100, y: 100 },
      currentSvg: { x: 102, y: 102 }, // tiny drag → radius would be < 10
    }
    const { container } = render(<svg><GhostShape ghost={ghost} /></svg>)
    const circle = container.querySelector('circle')!
    expect(Number(circle.getAttribute('r'))).toBeGreaterThanOrEqual(10)
  })

  it('ghost shapes have pointer-events none (non-interactive)', () => {
    const ghost: GhostState = {
      shapeType: 'rect',
      startSvg: { x: 0, y: 0 },
      currentSvg: { x: 100, y: 100 },
    }
    const { container } = render(<svg><GhostShape ghost={ghost} /></svg>)
    const rect = container.querySelector('rect')!
    expect(rect.style.pointerEvents).toBe('none')
  })
})

// ---- DragHandle ----

describe('DragHandle', () => {
  const makeSvgRef = () => {
    const ref = createRef<SVGSVGElement>()
    const fakeSvg = {
      createSVGPoint: () => {
        const pt = { x: 0, y: 0 } as SVGPoint & { x: number; y: number }
        pt.matrixTransform = (_m: DOMMatrix) => ({ x: pt.x, y: pt.y } as SVGPoint)
        return pt
      },
      getScreenCTM: () => ({
        inverse: () => ({}) as DOMMatrix,
      } as unknown as DOMMatrix),
    } as unknown as SVGSVGElement
    ;(ref as { current: SVGSVGElement | null }).current = fakeSvg
    return ref
  }

  it('renders a circle handle by default', () => {
    const ref = makeSvgRef()
    const { container } = render(
      <svg><DragHandle x={50} y={50} svgRef={ref} onDrag={vi.fn()} /></svg>
    )
    expect(container.querySelector('circle')).not.toBeNull()
  })

  it('renders a square handle when shape="square"', () => {
    const ref = makeSvgRef()
    const { container } = render(
      <svg><DragHandle x={50} y={50} svgRef={ref} onDrag={vi.fn()} shape="square" /></svg>
    )
    expect(container.querySelector('rect')).not.toBeNull()
  })

  it('calls onDragEnd when pointer is released', () => {
    const ref = makeSvgRef()
    const onDrag = vi.fn()
    const onDragEnd = vi.fn()
    const { container } = render(
      <svg>
        <DragHandle x={50} y={50} svgRef={ref} onDrag={onDrag} onDragEnd={onDragEnd} />
      </svg>
    )
    // The transparent hit circle is the last <circle> rendered
    const circles = container.querySelectorAll('circle')
    const hitCircle = circles[circles.length - 1]
    fireEvent.pointerDown(hitCircle)
    fireEvent.pointerUp(window)
    expect(onDragEnd).toHaveBeenCalledOnce()
  })

  it('removes pointer listeners after drag ends', () => {
    const ref = makeSvgRef()
    const onDrag = vi.fn()
    const { container } = render(
      <svg><DragHandle x={50} y={50} svgRef={ref} onDrag={onDrag} /></svg>
    )
    const circles = container.querySelectorAll('circle')
    const hitCircle = circles[circles.length - 1]
    fireEvent.pointerDown(hitCircle)
    fireEvent.pointerUp(window)
    onDrag.mockClear()
    fireEvent.pointerMove(window, { clientX: 100, clientY: 100 })
    expect(onDrag).not.toHaveBeenCalled()
  })
})
