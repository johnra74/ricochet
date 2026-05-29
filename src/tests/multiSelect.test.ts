import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCreatorState } from '../hooks/useCreatorState.js'

function addRect(dispatch: ReturnType<typeof useCreatorState>['dispatch'], x1 = 0, y1 = 0, x2 = 100, y2 = 100) {
  dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: x1, y: y1 } })
  dispatch({ type: 'GHOST_MOVE', pt: { x: x2, y: y2 } })
  dispatch({ type: 'GHOST_COMMIT' })
}

describe('TOGGLE_SELECTION', () => {
  it('adds id to empty selection', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => { addRect(result.current.dispatch) })
    const id = result.current.state.shapes[0].id
    act(() => result.current.dispatch({ type: 'DESELECT' }))
    act(() => result.current.dispatch({ type: 'TOGGLE_SELECTION', id }))
    expect(result.current.state.selectedIds).toEqual([id])
  })

  it('adds a second id to an existing selection', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => {
      addRect(result.current.dispatch, 0, 0, 50, 50)
      addRect(result.current.dispatch, 200, 0, 300, 100)
    })
    const [id1, id2] = result.current.state.shapes.map((s) => s.id)
    act(() => result.current.dispatch({ type: 'SELECT', id: id1 }))
    act(() => result.current.dispatch({ type: 'TOGGLE_SELECTION', id: id2 }))
    expect(result.current.state.selectedIds).toContain(id1)
    expect(result.current.state.selectedIds).toContain(id2)
    expect(result.current.state.selectedIds).toHaveLength(2)
  })

  it('removes id that is already in the selection', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => { addRect(result.current.dispatch) })
    const id = result.current.state.shapes[0].id
    act(() => result.current.dispatch({ type: 'SELECT', id }))
    expect(result.current.state.selectedIds).toContain(id)
    act(() => result.current.dispatch({ type: 'TOGGLE_SELECTION', id }))
    expect(result.current.state.selectedIds).not.toContain(id)
  })

  it('SELECT replaces a multi-selection with a single id', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => {
      addRect(result.current.dispatch, 0, 0, 50, 50)
      addRect(result.current.dispatch, 200, 0, 300, 100)
    })
    const [id1, id2] = result.current.state.shapes.map((s) => s.id)
    act(() => {
      result.current.dispatch({ type: 'SELECT', id: id1 })
      result.current.dispatch({ type: 'TOGGLE_SELECTION', id: id2 })
    })
    expect(result.current.state.selectedIds).toHaveLength(2)
    act(() => result.current.dispatch({ type: 'SELECT', id: id1 }))
    expect(result.current.state.selectedIds).toEqual([id1])
  })
})

describe('DELETE_SELECTED', () => {
  it('removes all selected shapes in one step', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => {
      addRect(result.current.dispatch, 0, 0, 50, 50)
      addRect(result.current.dispatch, 200, 0, 300, 100)
      addRect(result.current.dispatch, 400, 0, 500, 100)
    })
    const [id1, id2] = result.current.state.shapes.map((s) => s.id)
    act(() => {
      result.current.dispatch({ type: 'SELECT', id: id1 })
      result.current.dispatch({ type: 'TOGGLE_SELECTION', id: id2 })
    })
    act(() => result.current.dispatch({ type: 'DELETE_SELECTED' }))
    expect(result.current.state.shapes).toHaveLength(1)
    expect(result.current.state.selectedIds).toEqual([])
  })

  it('can be undone restoring all deleted shapes', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => {
      addRect(result.current.dispatch, 0, 0, 50, 50)
      addRect(result.current.dispatch, 200, 0, 300, 100)
    })
    const [id1, id2] = result.current.state.shapes.map((s) => s.id)
    act(() => {
      result.current.dispatch({ type: 'SELECT', id: id1 })
      result.current.dispatch({ type: 'TOGGLE_SELECTION', id: id2 })
    })
    act(() => result.current.dispatch({ type: 'DELETE_SELECTED' }))
    expect(result.current.state.shapes).toHaveLength(0)
    act(() => result.current.dispatch({ type: 'UNDO' }))
    expect(result.current.state.shapes).toHaveLength(2)
  })
})

describe('ALIGN', () => {
  it('ALIGN left moves all shapes so left edges coincide at the minimum left', () => {
    const { result } = renderHook(() => useCreatorState())
    // Rect A: cx=50, width=40 → left=30
    // Rect B: cx=200, width=60 → left=170
    // After align left: both should have left=30
    act(() => {
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 30, y: 0 } })
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 70, y: 40 } })
      result.current.dispatch({ type: 'GHOST_COMMIT' })
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 170, y: 0 } })
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 230, y: 40 } })
      result.current.dispatch({ type: 'GHOST_COMMIT' })
    })
    const [id1, id2] = result.current.state.shapes.map((s) => s.id)
    act(() => {
      result.current.dispatch({ type: 'SELECT', id: id1 })
      result.current.dispatch({ type: 'TOGGLE_SELECTION', id: id2 })
    })
    act(() => result.current.dispatch({ type: 'ALIGN', direction: 'left' }))
    const [a, b] = result.current.state.shapes
    expect(a.cx - (a as { width: number }).width / 2).toBeCloseTo(b.cx - (b as { width: number }).width / 2, 5)
  })

  it('ALIGN top moves all shapes so top edges coincide at the minimum top', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => {
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 0, y: 10 } })
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 60, y: 50 } })
      result.current.dispatch({ type: 'GHOST_COMMIT' })
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 200, y: 80 } })
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 260, y: 130 } })
      result.current.dispatch({ type: 'GHOST_COMMIT' })
    })
    const [id1, id2] = result.current.state.shapes.map((s) => s.id)
    act(() => {
      result.current.dispatch({ type: 'SELECT', id: id1 })
      result.current.dispatch({ type: 'TOGGLE_SELECTION', id: id2 })
    })
    act(() => result.current.dispatch({ type: 'ALIGN', direction: 'top' }))
    const [a, b] = result.current.state.shapes
    expect(a.cy - (a as { height: number }).height / 2).toBeCloseTo(b.cy - (b as { height: number }).height / 2, 5)
  })

  it('ALIGN is a no-op when fewer than 2 shapes are selected', () => {
    const { result } = renderHook(() => useCreatorState())
    act(() => { addRect(result.current.dispatch) })
    const id = result.current.state.shapes[0].id
    const originalCx = result.current.state.shapes[0].cx
    act(() => result.current.dispatch({ type: 'SELECT', id }))
    act(() => result.current.dispatch({ type: 'ALIGN', direction: 'left' }))
    expect(result.current.state.shapes[0].cx).toBe(originalCx)
  })
})
