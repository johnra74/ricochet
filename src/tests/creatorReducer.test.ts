/**
 * Tests for the creator reducer logic, extracted from useCreatorState.
 * We test by rendering the hook via renderHook so the real reducer runs.
 */
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCreatorState } from '../hooks/useCreatorState.js'
import { DEFAULT_BOARD, DEFAULT_TARGET, DEFAULT_MAX_RICOCHETS } from '../constants.js'
import type { Payload } from '../types/index.js'

const BASE_PAYLOAD: Payload = {
  version: 1,
  board: { width: 600, height: 400 },
  target: { x: 300, y: 200, radius: 20 },
  maxRicochets: 3,
  shapes: [],
  allowedWalls: ['left', 'top'],
}

describe('useCreatorState — initial state', () => {
  it('starts with default board when no payload given', () => {
    const { result } = renderHook(() => useCreatorState())
    expect(result.current.state.board).toEqual(DEFAULT_BOARD)
  })

  it('starts with default target', () => {
    const { result } = renderHook(() => useCreatorState())
    expect(result.current.state.target).toEqual(DEFAULT_TARGET)
  })

  it('starts with default maxRicochets', () => {
    const { result } = renderHook(() => useCreatorState())
    expect(result.current.state.maxRicochets).toBe(DEFAULT_MAX_RICOCHETS)
  })

  it('initialises from payload', () => {
    const { result } = renderHook(() => useCreatorState(BASE_PAYLOAD))
    expect(result.current.state.board).toEqual(BASE_PAYLOAD.board)
    expect(result.current.state.target).toEqual(BASE_PAYLOAD.target)
    expect(result.current.state.maxRicochets).toBe(BASE_PAYLOAD.maxRicochets)
    expect(result.current.state.allowedWalls).toEqual(BASE_PAYLOAD.allowedWalls)
  })

  it('validated starts false', () => {
    const { result } = renderHook(() => useCreatorState())
    expect(result.current.state.validated).toBe(false)
  })
})

describe('SET_TOOL', () => {
  it('changes active tool and clears selection', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'SET_TOOL', tool: 'rect' }))
    expect(result.current.state.activeTool).toBe('rect')
    expect(result.current.state.selectedId).toBeNull()
  })
})

describe('SELECT / DESELECT', () => {
  it('SELECT sets selectedId and switches tool to select', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'SELECT', id: 'some-id' }))
    expect(result.current.state.selectedId).toBe('some-id')
    expect(result.current.state.activeTool).toBe('select')
  })

  it('DESELECT clears selectedId', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'SELECT', id: 'x' }))
    act(() => result.current.dispatch({ type: 'DESELECT' }))
    expect(result.current.state.selectedId).toBeNull()
  })
})

describe('GHOST cycle', () => {
  it('GHOST_START creates ghost', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({
      type: 'GHOST_START',
      shapeType: 'rect',
      pt: { x: 100, y: 100 },
    }))
    expect(result.current.state.ghost).not.toBeNull()
    expect(result.current.state.ghost!.shapeType).toBe('rect')
  })

  it('GHOST_MOVE updates currentSvg', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 0, y: 0 } }))
    act(() => result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 100, y: 80 } }))
    expect(result.current.state.ghost!.currentSvg).toEqual({ x: 100, y: 80 })
  })

  it('GHOST_COMMIT adds a rect shape', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 50, y: 50 } }))
    act(() => result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 150, y: 130 } }))
    act(() => result.current.dispatch({ type: 'GHOST_COMMIT' }))
    expect(result.current.state.shapes).toHaveLength(1)
    expect(result.current.state.shapes[0].type).toBe('rect')
    expect(result.current.state.ghost).toBeNull()
    expect(result.current.state.activeTool).toBe('select')
  })

  it('GHOST_COMMIT adds a triangle shape', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'triangle', pt: { x: 50, y: 50 } }))
    act(() => result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 150, y: 130 } }))
    act(() => result.current.dispatch({ type: 'GHOST_COMMIT' }))
    expect(result.current.state.shapes[0].type).toBe('triangle')
  })

  it('GHOST_COMMIT adds a circle shape', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'circle', pt: { x: 200, y: 200 } }))
    act(() => result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 260, y: 260 } }))
    act(() => result.current.dispatch({ type: 'GHOST_COMMIT' }))
    expect(result.current.state.shapes[0].type).toBe('circle')
  })

  it('GHOST_COMMIT resets validated', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'MARK_VALIDATED' }))
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 0, y: 0 } }))
    act(() => result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 100, y: 100 } }))
    act(() => result.current.dispatch({ type: 'GHOST_COMMIT' }))
    expect(result.current.state.validated).toBe(false)
  })

  it('GHOST_CANCEL removes ghost without adding shape', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 0, y: 0 } }))
    act(() => result.current.dispatch({ type: 'GHOST_CANCEL' }))
    expect(result.current.state.ghost).toBeNull()
    expect(result.current.state.shapes).toHaveLength(0)
  })

  it('GHOST_COMMIT with zero drag falls back to min size', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 100, y: 100 } }))
    // No move — same point
    act(() => result.current.dispatch({ type: 'GHOST_COMMIT' }))
    const shape = result.current.state.shapes[0]
    expect(shape.type).toBe('rect')
    if (shape.type === 'rect') {
      expect(shape.width).toBeGreaterThanOrEqual(20)
      expect(shape.height).toBeGreaterThanOrEqual(20)
    }
  })
})

describe('UPDATE_SHAPE', () => {
  it('updates shape properties', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 0, y: 0 } }))
    act(() => result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 100, y: 100 } }))
    act(() => result.current.dispatch({ type: 'GHOST_COMMIT' }))
    const id = result.current.state.shapes[0].id
    act(() => result.current.dispatch({ type: 'UPDATE_SHAPE', id, updates: { cx: 999 } }))
    expect(result.current.state.shapes[0].cx).toBe(999)
    expect(result.current.state.validated).toBe(false)
  })
})

describe('DELETE_SHAPE', () => {
  it('removes the shape', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 0, y: 0 } }))
    act(() => result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 100, y: 100 } }))
    act(() => result.current.dispatch({ type: 'GHOST_COMMIT' }))
    const id = result.current.state.shapes[0].id
    act(() => result.current.dispatch({ type: 'DELETE_SHAPE', id }))
    expect(result.current.state.shapes).toHaveLength(0)
  })

  it('clears selectedId if deleted shape was selected', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 0, y: 0 } }))
    act(() => result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 100, y: 100 } }))
    act(() => result.current.dispatch({ type: 'GHOST_COMMIT' }))
    const id = result.current.state.shapes[0].id
    act(() => result.current.dispatch({ type: 'SELECT', id }))
    act(() => result.current.dispatch({ type: 'DELETE_SHAPE', id }))
    expect(result.current.state.selectedId).toBeNull()
  })
})

describe('SET_TARGET / SET_BOARD / SET_MAX_RICOCHETS', () => {
  it('SET_TARGET updates target and resets validated', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'MARK_VALIDATED' }))
    act(() => result.current.dispatch({ type: 'SET_TARGET', updates: { x: 123, y: 456 } }))
    expect(result.current.state.target.x).toBe(123)
    expect(result.current.state.validated).toBe(false)
  })

  it('SET_BOARD updates board', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'SET_BOARD', updates: { width: 500 } }))
    expect(result.current.state.board.width).toBe(500)
    expect(result.current.state.validated).toBe(false)
  })

  it('SET_MAX_RICOCHETS updates maxRicochets', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'SET_MAX_RICOCHETS', value: 10 }))
    expect(result.current.state.maxRicochets).toBe(10)
    expect(result.current.state.validated).toBe(false)
  })
})

describe('UNDO', () => {
  it('undoes the last shape addition', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 0, y: 0 } }))
    act(() => result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 100, y: 100 } }))
    act(() => result.current.dispatch({ type: 'GHOST_COMMIT' }))
    expect(result.current.state.shapes).toHaveLength(1)
    act(() => result.current.dispatch({ type: 'UNDO' }))
    expect(result.current.state.shapes).toHaveLength(0)
  })

  it('UNDO with empty history is a no-op', () => {
    const { result } = renderHook(() => useCreatorState())
    expect(result.current.state.shapes).toHaveLength(0)
    act(() => result.current.dispatch({ type: 'UNDO' }))
    expect(result.current.state.shapes).toHaveLength(0)
  })
})

describe('TOGGLE_WALL', () => {
  it('removes a wall from allowedWalls', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'TOGGLE_WALL', wall: 'top' }))
    expect(result.current.state.allowedWalls).not.toContain('top')
  })

  it('re-adds a wall when toggled again', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'TOGGLE_WALL', wall: 'top' }))
    act(() => result.current.dispatch({ type: 'TOGGLE_WALL', wall: 'top' }))
    expect(result.current.state.allowedWalls).toContain('top')
  })

  it('prevents removing the last wall', () => {
    const { result } = renderHook(() => useCreatorState())
    // Remove all but one
    act(() => result.current.dispatch({ type: 'TOGGLE_WALL', wall: 'top' }))
    act(() => result.current.dispatch({ type: 'TOGGLE_WALL', wall: 'right' }))
    act(() => result.current.dispatch({ type: 'TOGGLE_WALL', wall: 'bottom' }))
    // Now only 'left' remains — trying to remove it should be a no-op
    const before = result.current.state.allowedWalls.length
    act(() => result.current.dispatch({ type: 'TOGGLE_WALL', wall: 'left' }))
    expect(result.current.state.allowedWalls.length).toBe(before)
  })
})

describe('MARK_VALIDATED', () => {
  it('sets validated to true', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'MARK_VALIDATED' }))
    expect(result.current.state.validated).toBe(true)
  })
})

describe('LOAD', () => {
  it('replaces state with payload contents', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'LOAD', payload: BASE_PAYLOAD }))
    expect(result.current.state.board).toEqual(BASE_PAYLOAD.board)
    expect(result.current.state.shapes).toEqual(BASE_PAYLOAD.shapes)
    expect(result.current.state.validated).toBe(false)
  })
})

describe('COPY_SHAPE / PASTE_SHAPE', () => {
  it('COPY_SHAPE stores the shape in clipboard', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 0, y: 0 } }))
    act(() => result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 100, y: 100 } }))
    act(() => result.current.dispatch({ type: 'GHOST_COMMIT' }))
    const id = result.current.state.shapes[0].id
    act(() => result.current.dispatch({ type: 'COPY_SHAPE', id }))
    expect(result.current.state.clipboard).not.toBeNull()
    expect(result.current.state.clipboard!.id).toBe(id)
  })

  it('COPY_SHAPE with unknown id stores null', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'COPY_SHAPE', id: 'nonexistent' }))
    expect(result.current.state.clipboard).toBeNull()
  })

  it('PASTE_SHAPE adds a new shape with offset position', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 0, y: 0 } }))
    act(() => result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 100, y: 100 } }))
    act(() => result.current.dispatch({ type: 'GHOST_COMMIT' }))
    const original = result.current.state.shapes[0]
    act(() => result.current.dispatch({ type: 'COPY_SHAPE', id: original.id }))
    act(() => result.current.dispatch({ type: 'PASTE_SHAPE' }))
    expect(result.current.state.shapes).toHaveLength(2)
    const pasted = result.current.state.shapes[1]
    expect(pasted.cx).toBe(original.cx + 20)
    expect(pasted.cy).toBe(original.cy + 20)
  })

  it('PASTE_SHAPE gives the pasted shape a new unique id', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'circle', pt: { x: 200, y: 200 } }))
    act(() => result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 260, y: 260 } }))
    act(() => result.current.dispatch({ type: 'GHOST_COMMIT' }))
    const original = result.current.state.shapes[0]
    act(() => result.current.dispatch({ type: 'COPY_SHAPE', id: original.id }))
    act(() => result.current.dispatch({ type: 'PASTE_SHAPE' }))
    const pasted = result.current.state.shapes[1]
    expect(pasted.id).not.toBe(original.id)
  })

  it('PASTE_SHAPE selects the pasted shape', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 0, y: 0 } }))
    act(() => result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 80, y: 80 } }))
    act(() => result.current.dispatch({ type: 'GHOST_COMMIT' }))
    const original = result.current.state.shapes[0]
    act(() => result.current.dispatch({ type: 'COPY_SHAPE', id: original.id }))
    act(() => result.current.dispatch({ type: 'PASTE_SHAPE' }))
    const pasted = result.current.state.shapes[1]
    expect(result.current.state.selectedId).toBe(pasted.id)
  })

  it('PASTE_SHAPE with no clipboard is a no-op', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'PASTE_SHAPE' }))
    expect(result.current.state.shapes).toHaveLength(0)
  })

  it('pasting multiple times stacks offsets correctly', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 0, y: 0 } }))
    act(() => result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 100, y: 100 } }))
    act(() => result.current.dispatch({ type: 'GHOST_COMMIT' }))
    const original = result.current.state.shapes[0]
    act(() => result.current.dispatch({ type: 'COPY_SHAPE', id: original.id }))
    act(() => result.current.dispatch({ type: 'PASTE_SHAPE' }))
    act(() => result.current.dispatch({ type: 'PASTE_SHAPE' }))
    expect(result.current.state.shapes).toHaveLength(3)
    // Second paste is from same clipboard (original+20), not cascading
    expect(result.current.state.shapes[2].cx).toBe(original.cx + 20)
  })
})

describe('getPayload', () => {
  it('returns a valid Payload reflecting current state', () => {
    const { result } = renderHook(() => useCreatorState(BASE_PAYLOAD))
    const payload = result.current.getPayload()
    expect(payload.version).toBe(1)
    expect(payload.board).toEqual(BASE_PAYLOAD.board)
    expect(payload.target).toEqual(BASE_PAYLOAD.target)
  })
})
