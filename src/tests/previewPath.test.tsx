import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import PreviewPath from '../player/PreviewPath.js'
import PlayerBoard from '../player/PlayerBoard.js'
import type { Payload, SimResult } from '../types/index.js'

const BOARD_PAYLOAD: Payload = {
  version: 1,
  board: { width: 800, height: 550 },
  target: { x: 600, y: 275, radius: 20 },
  maxRicochets: 5,
  shapes: [],
  allowedWalls: ['left', 'top', 'right', 'bottom'],
}

function makePlayerState(phase: 'aiming' | 'result' = 'aiming') {
  return {
    startPoint: { x: 0, y: 275, wall: 'left' as const },
    angleRad: 0,
    phase,
    result: null,
    animFrac: 0,
    ballPos: null,
  }
}

const WIN_PATH = [{ x: 0, y: 300 }, { x: 400, y: 100 }, { x: 800, y: 300 }]
const LOSE_PATH = [{ x: 0, y: 300 }, { x: 400, y: 0 }, { x: 800, y: 300 }]
const SHORT_PATH = [{ x: 0, y: 0 }]

describe('PreviewPath', () => {
  it('renders null when path has fewer than 2 points', () => {
    const { container } = render(<svg><PreviewPath path={SHORT_PATH} outcome="lose" /></svg>)
    expect(container.querySelector('path')).toBeNull()
    expect(container.querySelector('circle')).toBeNull()
  })

  it('renders null for empty path', () => {
    const { container } = render(<svg><PreviewPath path={[]} outcome="lose" /></svg>)
    expect(container.querySelector('path')).toBeNull()
  })

  it('renders an SVG path element for a valid path', () => {
    const { container } = render(<svg><PreviewPath path={WIN_PATH} outcome="win" /></svg>)
    expect(container.querySelector('path')).not.toBeNull()
  })

  it('uses gold stroke for win outcome', () => {
    const { container } = render(<svg><PreviewPath path={WIN_PATH} outcome="win" /></svg>)
    const path = container.querySelector('path')!
    expect(path.getAttribute('stroke')).toBe('#ffd580')
  })

  it('uses light stroke for lose outcome', () => {
    const { container } = render(<svg><PreviewPath path={LOSE_PATH} outcome="lose" /></svg>)
    const path = container.querySelector('path')!
    expect(path.getAttribute('stroke')).toBe('#e6e8ed')
  })

  it('applies a stroke-dasharray', () => {
    const { container } = render(<svg><PreviewPath path={WIN_PATH} outcome="win" /></svg>)
    const path = container.querySelector('path')!
    expect(path.getAttribute('stroke-dasharray')).toBeTruthy()
  })

  it('renders bounce dots at intermediate points only', () => {
    // WIN_PATH has 3 points: start, 1 bounce, end → 1 dot
    const { container } = render(<svg><PreviewPath path={WIN_PATH} outcome="win" /></svg>)
    const dots = container.querySelectorAll('circle')
    expect(dots).toHaveLength(1)
    expect(dots[0].getAttribute('cx')).toBe('400')
    expect(dots[0].getAttribute('cy')).toBe('100')
  })

  it('renders no bounce dots for a 2-point path (no bounces)', () => {
    const straight = [{ x: 0, y: 0 }, { x: 800, y: 0 }]
    const { container } = render(<svg><PreviewPath path={straight} outcome="lose" /></svg>)
    expect(container.querySelectorAll('circle')).toHaveLength(0)
  })

  it('all rendered elements have pointerEvents none', () => {
    const { container } = render(<svg><PreviewPath path={WIN_PATH} outcome="win" /></svg>)
    const g = container.querySelector('g')!
    expect(g.style.pointerEvents).toBe('none')
  })
})

describe('PlayerBoard ricochet counter', () => {
  const winPreview: SimResult = { path: WIN_PATH, outcome: 'win', ricochetCount: 1 }
  const losePreview: SimResult = { path: LOSE_PATH, outcome: 'lose', ricochetCount: 3 }

  // The counter uses text-anchor="end" (top-right); the S-label uses text-anchor="middle"
  const counter = (container: HTMLElement) => container.querySelector('text[text-anchor="end"]')

  it('shows ricochet count and max in top-right corner during aiming', () => {
    const { container } = render(
      <PlayerBoard
        payload={BOARD_PAYLOAD}
        playerState={makePlayerState('aiming')}
        setStart={vi.fn()} setAngle={vi.fn()} aimAt={vi.fn()}
        previewResult={losePreview}
      />
    )
    expect(counter(container)?.textContent).toBe('3 / 5')
  })

  it('counter is gold for a winning preview', () => {
    const { container } = render(
      <PlayerBoard
        payload={BOARD_PAYLOAD}
        playerState={makePlayerState('aiming')}
        setStart={vi.fn()} setAngle={vi.fn()} aimAt={vi.fn()}
        previewResult={winPreview}
      />
    )
    expect(counter(container)?.getAttribute('fill')).toBe('#ffd580')
  })

  it('counter is light for a losing preview', () => {
    const { container } = render(
      <PlayerBoard
        payload={BOARD_PAYLOAD}
        playerState={makePlayerState('aiming')}
        setStart={vi.fn()} setAngle={vi.fn()} aimAt={vi.fn()}
        previewResult={losePreview}
      />
    )
    expect(counter(container)?.getAttribute('fill')).toBe('#e6e8ed')
  })

  it('counter is absent when previewResult is null', () => {
    const { container } = render(
      <PlayerBoard
        payload={BOARD_PAYLOAD}
        playerState={makePlayerState('aiming')}
        setStart={vi.fn()} setAngle={vi.fn()} aimAt={vi.fn()}
        previewResult={null}
      />
    )
    expect(counter(container)).toBeNull()
  })

  it('counter is absent after firing (non-aiming phase)', () => {
    const { container } = render(
      <PlayerBoard
        payload={BOARD_PAYLOAD}
        playerState={makePlayerState('result')}
        setStart={vi.fn()} setAngle={vi.fn()} aimAt={vi.fn()}
        previewResult={winPreview}
      />
    )
    expect(counter(container)).toBeNull()
  })
})
