import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCreatorKeyboard } from '../hooks/useCreatorKeyboard.js'
import type { CreatorAction } from '../hooks/useCreatorState.js'

function fireKey(key: string, extra: Partial<KeyboardEventInit> = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...extra }))
}

describe('useCreatorKeyboard', () => {
  it('Delete dispatches DELETE_SHAPE when a shape is selected', () => {
    const dispatch = vi.fn()
    renderHook(() => useCreatorKeyboard(dispatch as React.Dispatch<CreatorAction>, 'shape-1'))
    fireKey('Delete')
    expect(dispatch).toHaveBeenCalledWith({ type: 'DELETE_SHAPE', id: 'shape-1' })
  })

  it('Backspace dispatches DELETE_SHAPE when a shape is selected', () => {
    const dispatch = vi.fn()
    renderHook(() => useCreatorKeyboard(dispatch as React.Dispatch<CreatorAction>, 'shape-2'))
    fireKey('Backspace')
    expect(dispatch).toHaveBeenCalledWith({ type: 'DELETE_SHAPE', id: 'shape-2' })
  })

  it('Delete does NOT dispatch when no shape is selected', () => {
    const dispatch = vi.fn()
    renderHook(() => useCreatorKeyboard(dispatch as React.Dispatch<CreatorAction>, null))
    fireKey('Delete')
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('Ctrl+Z dispatches UNDO', () => {
    const dispatch = vi.fn()
    renderHook(() => useCreatorKeyboard(dispatch as React.Dispatch<CreatorAction>, null))
    fireKey('z', { ctrlKey: true })
    expect(dispatch).toHaveBeenCalledWith({ type: 'UNDO' })
  })

  it('Meta+Z dispatches UNDO (macOS)', () => {
    const dispatch = vi.fn()
    renderHook(() => useCreatorKeyboard(dispatch as React.Dispatch<CreatorAction>, null))
    fireKey('Z', { metaKey: true })
    expect(dispatch).toHaveBeenCalledWith({ type: 'UNDO' })
  })

  it('Escape dispatches GHOST_CANCEL and DESELECT', () => {
    const dispatch = vi.fn()
    renderHook(() => useCreatorKeyboard(dispatch as React.Dispatch<CreatorAction>, 'some-id'))
    fireKey('Escape')
    expect(dispatch).toHaveBeenCalledWith({ type: 'GHOST_CANCEL' })
    expect(dispatch).toHaveBeenCalledWith({ type: 'DESELECT' })
  })

  it('Ctrl+C dispatches COPY_SHAPE when a shape is selected', () => {
    const dispatch = vi.fn()
    renderHook(() => useCreatorKeyboard(dispatch as React.Dispatch<CreatorAction>, 'shape-3'))
    fireKey('c', { ctrlKey: true })
    expect(dispatch).toHaveBeenCalledWith({ type: 'COPY_SHAPE', id: 'shape-3' })
  })

  it('Ctrl+C does NOT dispatch when no shape is selected', () => {
    const dispatch = vi.fn()
    renderHook(() => useCreatorKeyboard(dispatch as React.Dispatch<CreatorAction>, null))
    fireKey('c', { ctrlKey: true })
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('Ctrl+V dispatches PASTE_SHAPE', () => {
    const dispatch = vi.fn()
    renderHook(() => useCreatorKeyboard(dispatch as React.Dispatch<CreatorAction>, null))
    fireKey('v', { ctrlKey: true })
    expect(dispatch).toHaveBeenCalledWith({ type: 'PASTE_SHAPE' })
  })

  it('Meta+C dispatches COPY_SHAPE (macOS)', () => {
    const dispatch = vi.fn()
    renderHook(() => useCreatorKeyboard(dispatch as React.Dispatch<CreatorAction>, 'shape-4'))
    fireKey('c', { metaKey: true })
    expect(dispatch).toHaveBeenCalledWith({ type: 'COPY_SHAPE', id: 'shape-4' })
  })

  it('ignores Delete when focus is on an INPUT element', () => {
    const dispatch = vi.fn()
    renderHook(() => useCreatorKeyboard(dispatch as React.Dispatch<CreatorAction>, 'shape-1'))
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    const event = new KeyboardEvent('keydown', { key: 'Delete', bubbles: true })
    Object.defineProperty(event, 'target', { value: input })
    window.dispatchEvent(event)
    expect(dispatch).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })

  it('removes event listener on unmount', () => {
    const dispatch = vi.fn()
    const { unmount } = renderHook(() =>
      useCreatorKeyboard(dispatch as React.Dispatch<CreatorAction>, 'shape-1')
    )
    unmount()
    fireKey('Delete')
    expect(dispatch).not.toHaveBeenCalled()
  })
})
