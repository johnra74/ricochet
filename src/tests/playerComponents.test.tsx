import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import StartPointHandle from '../player/StartPointHandle.js'
import AngleIndicator from '../player/AngleIndicator.js'
import TargetMarker from '../creator/TargetMarker.js'

function makeSvgRef() {
  const ref = createRef<SVGSVGElement>()
  const fakeSvg = {
    createSVGPoint: () => {
      const pt = { x: 0, y: 0 } as SVGPoint & { x: number; y: number }
      pt.matrixTransform = (_m: DOMMatrix) => ({ x: pt.x + 10, y: pt.y + 20 } as SVGPoint)
      return pt
    },
    getScreenCTM: () => ({
      inverse: () => ({}) as DOMMatrix,
    } as unknown as DOMMatrix),
  } as unknown as SVGSVGElement
  ;(ref as { current: SVGSVGElement | null }).current = fakeSvg
  return ref
}

// ---- StartPointHandle ----

describe('StartPointHandle', () => {
  it('renders circles and S label', () => {
    const ref = makeSvgRef()
    const { container } = render(
      <svg><StartPointHandle startPoint={{ x: 0, y: 300 }} svgRef={ref} onMove={vi.fn()} /></svg>
    )
    expect(container.querySelectorAll('circle').length).toBeGreaterThanOrEqual(2)
    expect(container.querySelector('text')?.textContent).toBe('S')
  })

  it('renders at the correct position', () => {
    const ref = makeSvgRef()
    const { container } = render(
      <svg><StartPointHandle startPoint={{ x: 50, y: 120 }} svgRef={ref} onMove={vi.fn()} /></svg>
    )
    const circles = container.querySelectorAll('circle')
    expect(circles[0].getAttribute('cx')).toBe('50')
    expect(circles[0].getAttribute('cy')).toBe('120')
  })

  it('calls onMove during pointer drag', () => {
    const ref = makeSvgRef()
    const onMove = vi.fn()
    const { container } = render(
      <svg><StartPointHandle startPoint={{ x: 0, y: 300 }} svgRef={ref} onMove={onMove} /></svg>
    )
    const group = container.querySelector('g')!
    fireEvent.pointerDown(group)
    fireEvent.pointerMove(window, { clientX: 100, clientY: 200 })
    expect(onMove).toHaveBeenCalled()
  })

  it('stops calling onMove after pointerUp', () => {
    const ref = makeSvgRef()
    const onMove = vi.fn()
    const { container } = render(
      <svg><StartPointHandle startPoint={{ x: 0, y: 300 }} svgRef={ref} onMove={onMove} /></svg>
    )
    const group = container.querySelector('g')!
    fireEvent.pointerDown(group)
    fireEvent.pointerUp(window)
    onMove.mockClear()
    fireEvent.pointerMove(window, { clientX: 99, clientY: 99 })
    expect(onMove).not.toHaveBeenCalled()
  })
})

// ---- AngleIndicator ----

describe('AngleIndicator', () => {
  it('renders an aim line and arrowhead polygon', () => {
    const ref = makeSvgRef()
    const { container } = render(
      <svg>
        <AngleIndicator
          startPoint={{ x: 0, y: 300 }}
          angleRad={0}
          svgRef={ref}
          onAngleChange={vi.fn()}
        />
      </svg>
    )
    expect(container.querySelector('line')).not.toBeNull()
    expect(container.querySelector('polygon')).not.toBeNull()
  })

  it('aim line starts at startPoint', () => {
    const ref = makeSvgRef()
    const { container } = render(
      <svg>
        <AngleIndicator
          startPoint={{ x: 50, y: 80 }}
          angleRad={0}
          svgRef={ref}
          onAngleChange={vi.fn()}
        />
      </svg>
    )
    const line = container.querySelector('line')!
    expect(line.getAttribute('x1')).toBe('50')
    expect(line.getAttribute('y1')).toBe('80')
  })

  it('calls onAngleChange when arrowhead is dragged', () => {
    const ref = makeSvgRef()
    const onAngleChange = vi.fn()
    const { container } = render(
      <svg>
        <AngleIndicator
          startPoint={{ x: 0, y: 0 }}
          angleRad={0}
          svgRef={ref}
          onAngleChange={onAngleChange}
        />
      </svg>
    )
    const polygon = container.querySelector('polygon')!
    fireEvent.pointerDown(polygon)
    fireEvent.pointerMove(window, { clientX: 100, clientY: 50 })
    expect(onAngleChange).toHaveBeenCalled()
  })

  it('stops calling onAngleChange after pointerUp', () => {
    const ref = makeSvgRef()
    const onAngleChange = vi.fn()
    const { container } = render(
      <svg>
        <AngleIndicator
          startPoint={{ x: 0, y: 0 }}
          angleRad={0}
          svgRef={ref}
          onAngleChange={onAngleChange}
        />
      </svg>
    )
    const polygon = container.querySelector('polygon')!
    fireEvent.pointerDown(polygon)
    fireEvent.pointerUp(window)
    onAngleChange.mockClear()
    fireEvent.pointerMove(window, { clientX: 200, clientY: 100 })
    expect(onAngleChange).not.toHaveBeenCalled()
  })
})

// ---- TargetMarker ----

describe('TargetMarker', () => {
  it('renders bullseye rings and crosshairs', () => {
    const ref = makeSvgRef()
    const { container } = render(
      <svg>
        <TargetMarker target={{ x: 400, y: 300, radius: 20 }} svgRef={ref} onMove={vi.fn()} />
      </svg>
    )
    expect(container.querySelectorAll('circle').length).toBeGreaterThanOrEqual(3)
    expect(container.querySelectorAll('line').length).toBeGreaterThanOrEqual(2)
  })

  it('calls onMove during pointer drag', () => {
    const ref = makeSvgRef()
    const onMove = vi.fn()
    const { container } = render(
      <svg>
        <TargetMarker target={{ x: 400, y: 300, radius: 20 }} svgRef={ref} onMove={onMove} />
      </svg>
    )
    const group = container.querySelector('g')!
    fireEvent.pointerDown(group)
    fireEvent.pointerMove(window, { clientX: 300, clientY: 200 })
    expect(onMove).toHaveBeenCalled()
  })

  it('stops calling onMove after pointerUp', () => {
    const ref = makeSvgRef()
    const onMove = vi.fn()
    const { container } = render(
      <svg>
        <TargetMarker target={{ x: 400, y: 300, radius: 20 }} svgRef={ref} onMove={onMove} />
      </svg>
    )
    const group = container.querySelector('g')!
    fireEvent.pointerDown(group)
    fireEvent.pointerUp(window)
    onMove.mockClear()
    fireEvent.pointerMove(window, { clientX: 99, clientY: 99 })
    expect(onMove).not.toHaveBeenCalled()
  })
})
