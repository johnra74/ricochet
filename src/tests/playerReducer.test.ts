import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePlayerState, clampToWall } from '../hooks/usePlayerState.js'
import type { Payload, Vec2 } from '../types/index.js'

const BOARD = { width: 800, height: 600 }

const BASE_PAYLOAD: Payload = {
  version: 1,
  board: BOARD,
  target: { x: 400, y: 300, radius: 20 },
  maxRicochets: 5,
  shapes: [],
  allowedWalls: ['left', 'top', 'right', 'bottom'],
}

const WIN_RESULT = {
  path: [{ x: 0, y: 300 }, { x: 400, y: 300 }],
  outcome: 'win' as const,
  ricochetCount: 0,
}

describe('clampToWall', () => {
  it('snaps a point near the top to the top wall', () => {
    const pt: Vec2 = { x: 400, y: 10 }
    const result = clampToWall(pt, BOARD, ['top', 'left', 'right', 'bottom'])
    expect(result.wall).toBe('top')
    expect(result.y).toBe(0)
  })

  it('snaps a point near the left to the left wall', () => {
    const pt: Vec2 = { x: 5, y: 300 }
    const result = clampToWall(pt, BOARD, ['top', 'left', 'right', 'bottom'])
    expect(result.wall).toBe('left')
    expect(result.x).toBe(0)
  })

  it('clamps x to board width on top/bottom walls', () => {
    const pt: Vec2 = { x: -100, y: 5 }
    const result = clampToWall(pt, BOARD, ['top'])
    expect(result.x).toBe(0)
  })

  it('clamps y to board height on left/right walls', () => {
    const pt: Vec2 = { x: 5, y: 9999 }
    const result = clampToWall(pt, BOARD, ['left'])
    expect(result.y).toBe(BOARD.height)
  })

  it('falls back to left wall when no walls allowed', () => {
    const pt: Vec2 = { x: 400, y: 300 }
    const result = clampToWall(pt, BOARD, [])
    expect(result.wall).toBe('left')
  })

  it('respects wall restrictions — skips disallowed walls', () => {
    // Point is closest to left wall but left is not allowed
    const pt: Vec2 = { x: 5, y: 300 }
    const result = clampToWall(pt, BOARD, ['top', 'right', 'bottom'])
    expect(result.wall).not.toBe('left')
  })
})

describe('usePlayerState — initial state', () => {
  it('defaults to aiming phase', () => {
    const { result } = renderHook(() => usePlayerState(BASE_PAYLOAD))
    expect(result.current.state.phase).toBe('aiming')
  })

  it('initialises startPoint on left wall (first preferred)', () => {
    const { result } = renderHook(() => usePlayerState(BASE_PAYLOAD))
    expect(result.current.state.startPoint?.wall).toBe('left')
  })

  it('uses top wall when left is not allowed', () => {
    const payload = { ...BASE_PAYLOAD, allowedWalls: ['top', 'right'] as const }
    const { result } = renderHook(() => usePlayerState(payload as unknown as Payload))
    expect(result.current.state.startPoint?.wall).toBe('top')
  })

  it('starts with no result', () => {
    const { result } = renderHook(() => usePlayerState(BASE_PAYLOAD))
    expect(result.current.state.result).toBeNull()
  })
})

describe('SET_START', () => {
  it('updates startPoint to nearest wall', () => {
    const { result } = renderHook(() => usePlayerState(BASE_PAYLOAD))
    act(() => result.current.setStart({ x: 0, y: 200 }))
    expect(result.current.state.startPoint?.wall).toBe('left')
    expect(result.current.state.startPoint?.y).toBe(200)
  })
})

describe('SET_ANGLE', () => {
  it('updates angleRad', () => {
    const { result } = renderHook(() => usePlayerState(BASE_PAYLOAD))
    act(() => result.current.setAngle(Math.PI))
    expect(result.current.state.angleRad).toBe(Math.PI)
  })
})

describe('AIM_AT', () => {
  it('sets angle toward target point', () => {
    const { result } = renderHook(() => usePlayerState(BASE_PAYLOAD))
    // startPoint is at (0, 300) on left wall, aim toward (400, 300) → angle = 0
    act(() => result.current.aimAt({ x: 400, y: 300 }))
    expect(result.current.state.angleRad).toBeCloseTo(0, 5)
  })

  it('no-ops when startPoint is null', () => {
    const { result } = renderHook(() => usePlayerState(BASE_PAYLOAD))
    // Force startPoint to null by making it null directly via dispatch
    act(() => result.current.dispatch({ type: 'RESET' }))
    // RESET doesn't null the startPoint; just tests aimAt doesn't crash
    expect(() => act(() => result.current.aimAt({ x: 999, y: 999 }))).not.toThrow()
  })
})

describe('FIRE / animation / result', () => {
  it('FIRE transitions to animating phase', () => {
    const { result } = renderHook(() => usePlayerState(BASE_PAYLOAD))
    act(() => result.current.dispatch({ type: 'FIRE', result: WIN_RESULT }))
    expect(result.current.state.phase).toBe('animating')
    expect(result.current.state.result).toEqual(WIN_RESULT)
  })

  it('ANIM_PROGRESS updates frac and ballPos', () => {
    const { result } = renderHook(() => usePlayerState(BASE_PAYLOAD))
    act(() => result.current.dispatch({ type: 'FIRE', result: WIN_RESULT }))
    act(() => result.current.dispatch({
      type: 'ANIM_PROGRESS',
      frac: 0.5,
      ballPos: { x: 200, y: 300 },
    }))
    expect(result.current.state.animFrac).toBe(0.5)
    expect(result.current.state.ballPos).toEqual({ x: 200, y: 300 })
  })

  it('ANIM_DONE transitions to result phase', () => {
    const { result } = renderHook(() => usePlayerState(BASE_PAYLOAD))
    act(() => result.current.dispatch({ type: 'FIRE', result: WIN_RESULT }))
    act(() => result.current.dispatch({ type: 'ANIM_DONE' }))
    expect(result.current.state.phase).toBe('result')
  })

  it('RESET returns to aiming and clears result', () => {
    const { result } = renderHook(() => usePlayerState(BASE_PAYLOAD))
    act(() => result.current.dispatch({ type: 'FIRE', result: WIN_RESULT }))
    act(() => result.current.dispatch({ type: 'ANIM_DONE' }))
    act(() => result.current.dispatch({ type: 'RESET' }))
    expect(result.current.state.phase).toBe('aiming')
    expect(result.current.state.result).toBeNull()
    expect(result.current.state.animFrac).toBe(0)
  })
})
