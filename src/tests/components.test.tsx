import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import Board from '../shared/Board.js'
import ShapeRenderer from '../shared/ShapeRenderer.js'
import Target from '../shared/Target.js'
import ResultOverlay from '../player/ResultOverlay.js'
import type { SimResult, RectShape, TriShape, CircShape } from '../types/index.js'

// ---- Board ----

describe('Board', () => {
  const board = { width: 400, height: 300 }

  it('renders an SVG with correct viewBox', () => {
    const ref = createRef<SVGSVGElement>()
    const { container } = render(<Board board={board} svgRef={ref} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('viewBox')).toBe('0 0 400 300')
  })

  it('renders 4 wall lines', () => {
    const ref = createRef<SVGSVGElement>()
    const { container } = render(<Board board={board} svgRef={ref} />)
    const lines = container.querySelectorAll('line')
    expect(lines.length).toBe(4)
  })

  it('renders children inside SVG', () => {
    const ref = createRef<SVGSVGElement>()
    const { container } = render(
      <Board board={board} svgRef={ref}>
        <circle data-testid="child" cx={10} cy={10} r={5} />
      </Board>
    )
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull()
  })

  it('shows allowed walls with orange stroke', () => {
    const ref = createRef<SVGSVGElement>()
    const { container } = render(
      <Board board={board} svgRef={ref} allowedWalls={['top']} />
    )
    const lines = container.querySelectorAll('line')
    const orangeLines = Array.from(lines).filter((l) => l.getAttribute('stroke') === '#ff6b1a')
    expect(orangeLines.length).toBe(1)
  })

  it('calls onPointerDown handler', () => {
    const handler = vi.fn()
    const ref = createRef<SVGSVGElement>()
    const { container } = render(
      <Board board={board} svgRef={ref} onPointerDown={handler} />
    )
    fireEvent.pointerDown(container.querySelector('svg')!)
    expect(handler).toHaveBeenCalledOnce()
  })
})

// ---- ShapeRenderer ----

describe('ShapeRenderer', () => {
  it('renders a rect as <rect>', () => {
    const shape: RectShape = { id: 'r1', type: 'rect', cx: 100, cy: 100, width: 60, height: 40, rotation: 0 }
    const { container } = render(<svg><ShapeRenderer shape={shape} /></svg>)
    expect(container.querySelector('rect')).not.toBeNull()
  })

  it('renders a triangle as <polygon>', () => {
    const shape: TriShape = { id: 't1', type: 'triangle', cx: 100, cy: 100, base: 60, height: 40, rotation: 0 }
    const { container } = render(<svg><ShapeRenderer shape={shape} /></svg>)
    expect(container.querySelector('polygon')).not.toBeNull()
  })

  it('renders a circle as <circle>', () => {
    const shape: CircShape = { id: 'c1', type: 'circle', cx: 100, cy: 100, radius: 30 }
    const { container } = render(<svg><ShapeRenderer shape={shape} /></svg>)
    expect(container.querySelector('circle')).not.toBeNull()
  })

  it('selected rect has white stroke', () => {
    const shape: RectShape = { id: 'r1', type: 'rect', cx: 100, cy: 100, width: 60, height: 40, rotation: 0 }
    const { container } = render(<svg><ShapeRenderer shape={shape} selected /></svg>)
    const rect = container.querySelector('rect')!
    expect(rect.getAttribute('stroke')).toBe('#fff')
  })

  it('calls onClick when clicked', () => {
    const handler = vi.fn()
    const shape: CircShape = { id: 'c1', type: 'circle', cx: 50, cy: 50, radius: 20 }
    const { container } = render(<svg><ShapeRenderer shape={shape} onClick={handler} /></svg>)
    fireEvent.click(container.querySelector('circle')!)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('dimmed rect has reduced opacity in fill', () => {
    const shape: RectShape = { id: 'r1', type: 'rect', cx: 100, cy: 100, width: 60, height: 40, rotation: 0 }
    const { container } = render(<svg><ShapeRenderer shape={shape} dimmed /></svg>)
    const rect = container.querySelector('rect')!
    // dimmed fill ends with '55', not '99'
    expect(rect.getAttribute('fill')).toMatch(/55$/)
  })
})

// ---- Target ----

describe('Target', () => {
  it('renders 3 circles (bullseye rings)', () => {
    const { container } = render(<svg><Target target={{ x: 200, y: 150, radius: 20 }} /></svg>)
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(3)
  })

  it('renders 2 crosshair lines', () => {
    const { container } = render(<svg><Target target={{ x: 200, y: 150, radius: 20 }} /></svg>)
    const lines = container.querySelectorAll('line')
    expect(lines.length).toBe(2)
  })

  it('outer circle has the correct radius', () => {
    const { container } = render(<svg><Target target={{ x: 200, y: 150, radius: 25 }} /></svg>)
    const circles = container.querySelectorAll('circle')
    expect(circles[0].getAttribute('r')).toBe('25')
  })
})

// ---- ResultOverlay ----

const WIN_RESULT: SimResult = { path: [], outcome: 'win', ricochetCount: 2 }
const LOSE_RESULT: SimResult = { path: [], outcome: 'lose', ricochetCount: 5 }

describe('ResultOverlay', () => {
  it('shows "Target Hit!" on win', () => {
    render(
      <ResultOverlay result={WIN_RESULT} maxRicochets={5} isTestMode={false} onReset={vi.fn()} />
    )
    expect(screen.getByText('Target Hit!')).toBeInTheDocument()
  })

  it('shows "Out of Ricochets!" on lose', () => {
    render(
      <ResultOverlay result={LOSE_RESULT} maxRicochets={5} isTestMode={false} onReset={vi.fn()} />
    )
    expect(screen.getByText('Out of Ricochets!')).toBeInTheDocument()
  })

  it('shows ricochet count detail', () => {
    render(
      <ResultOverlay result={WIN_RESULT} maxRicochets={5} isTestMode={false} onReset={vi.fn()} />
    )
    expect(screen.getByText('2 / 5 ricochets used')).toBeInTheDocument()
  })

  it('calls onReset when Try Again is clicked', () => {
    const onReset = vi.fn()
    render(
      <ResultOverlay result={WIN_RESULT} maxRicochets={5} isTestMode={false} onReset={onReset} />
    )
    fireEvent.click(screen.getByText('Try Again'))
    expect(onReset).toHaveBeenCalledOnce()
  })

  it('shows Edit button when onBackToEditor is provided', () => {
    render(
      <ResultOverlay
        result={WIN_RESULT} maxRicochets={5} isTestMode
        onReset={vi.fn()} onBackToEditor={vi.fn()}
      />
    )
    expect(screen.getByText('✏ Edit')).toBeInTheDocument()
  })

  it('calls onBackToEditor when Edit is clicked', () => {
    const onBackToEditor = vi.fn()
    render(
      <ResultOverlay
        result={WIN_RESULT} maxRicochets={5} isTestMode
        onReset={vi.fn()} onBackToEditor={onBackToEditor}
      />
    )
    fireEvent.click(screen.getByText('✏ Edit'))
    expect(onBackToEditor).toHaveBeenCalledOnce()
  })

  it('shows share block in test mode on win with shareUrl', () => {
    render(
      <ResultOverlay
        result={WIN_RESULT} maxRicochets={5} isTestMode
        onReset={vi.fn()} shareUrl="https://example.com/?g=abc" onShare={vi.fn()}
      />
    )
    expect(screen.getByRole('textbox')).toHaveValue('https://example.com/?g=abc')
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('shows "Copied!" after copy in test mode', () => {
    render(
      <ResultOverlay
        result={WIN_RESULT} maxRicochets={5} isTestMode
        onReset={vi.fn()} shareUrl="https://example.com/?g=abc" copied
        onShare={vi.fn()}
      />
    )
    expect(screen.getByText('Copied!')).toBeInTheDocument()
  })

  it('does not show share block on lose in test mode', () => {
    const { container } = render(
      <ResultOverlay
        result={LOSE_RESULT} maxRicochets={5} isTestMode
        onReset={vi.fn()} shareUrl="https://example.com/?g=abc" onShare={vi.fn()}
      />
    )
    expect(container.querySelector('.share-block')).toBeNull()
  })

  it('shows remix/start-fresh links in non-test mode', () => {
    render(
      <ResultOverlay
        result={WIN_RESULT} maxRicochets={5} isTestMode={false}
        onReset={vi.fn()} remixUrl="/?g=abc&edit=1"
      />
    )
    expect(screen.getByText('Remix this level')).toBeInTheDocument()
    expect(screen.getByText('Start fresh')).toBeInTheDocument()
  })

  it('does not show remix links in test mode', () => {
    const { container } = render(
      <ResultOverlay
        result={WIN_RESULT} maxRicochets={5} isTestMode
        onReset={vi.fn()}
      />
    )
    expect(container.querySelector('.make-your-own')).toBeNull()
  })

  it('calls onShare when Copy is clicked', () => {
    const onShare = vi.fn()
    render(
      <ResultOverlay
        result={WIN_RESULT} maxRicochets={5} isTestMode
        onReset={vi.fn()} shareUrl="https://example.com/?g=abc" onShare={onShare}
      />
    )
    fireEvent.click(screen.getByText('Copy'))
    expect(onShare).toHaveBeenCalledOnce()
  })

  it('applies win CSS class on win', () => {
    const { container } = render(
      <ResultOverlay result={WIN_RESULT} maxRicochets={5} isTestMode={false} onReset={vi.fn()} />
    )
    expect(container.querySelector('.result-overlay')).toHaveClass('win')
  })

  it('applies lose CSS class on lose', () => {
    const { container } = render(
      <ResultOverlay result={LOSE_RESULT} maxRicochets={5} isTestMode={false} onReset={vi.fn()} />
    )
    expect(container.querySelector('.result-overlay')).toHaveClass('lose')
  })
})
