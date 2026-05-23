/**
 * Tests for the pure helper functions in useAnimationLoop:
 * buildPathData (via interpolatePath behaviour) and interpolatePath
 * are not exported, but we test them indirectly through the hook.
 *
 * We also test the hook's running/stop logic with fake rAF.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnimationLoop } from '../hooks/useAnimationLoop.js'
import type { Vec2 } from '../types/index.js'

// ---- rAF mock helpers ----
let rafCallbacks: Map<number, FrameRequestCallback> = new Map()
let rafId = 0

function setupFakeRaf() {
  rafCallbacks = new Map()
  rafId = 0
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    const id = ++rafId
    rafCallbacks.set(id, cb)
    return id
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    rafCallbacks.delete(id)
  })
}

function tickRaf(timestamp: number) {
  const cbs = [...rafCallbacks.entries()]
  rafCallbacks.clear()
  for (const [, cb] of cbs) cb(timestamp)
}

describe('useAnimationLoop', () => {
  beforeEach(() => setupFakeRaf())
  afterEach(() => vi.restoreAllMocks())

  const path: Vec2[] = [{ x: 0, y: 0 }, { x: 100, y: 0 }]

  it('does not call onProgress when not running', () => {
    const onProgress = vi.fn()
    const onComplete = vi.fn()
    renderHook(() => useAnimationLoop(path, false, onProgress, onComplete))
    tickRaf(0)
    expect(onProgress).not.toHaveBeenCalled()
  })

  it('does not call onProgress when path has fewer than 2 points', () => {
    const onProgress = vi.fn()
    const onComplete = vi.fn()
    renderHook(() => useAnimationLoop([{ x: 0, y: 0 }], true, onProgress, onComplete))
    tickRaf(0)
    expect(onProgress).not.toHaveBeenCalled()
  })

  it('calls onProgress with frac=0 on first tick', () => {
    const onProgress = vi.fn()
    const onComplete = vi.fn()
    renderHook(() => useAnimationLoop(path, true, onProgress, onComplete))
    act(() => tickRaf(1000))
    expect(onProgress).toHaveBeenCalled()
    const { frac } = onProgress.mock.calls[0][0]
    expect(frac).toBeCloseTo(0, 5)
  })

  it('calls onProgress with increasing frac over time', () => {
    const onProgress = vi.fn()
    const onComplete = vi.fn()
    renderHook(() => useAnimationLoop(path, true, onProgress, onComplete))
    act(() => {
      tickRaf(1000)    // start time set to 1000, elapsed=0
      tickRaf(1900)    // elapsed = 900ms
    })
    const fracs = onProgress.mock.calls.map((c) => c[0].frac)
    expect(fracs[fracs.length - 1]).toBeGreaterThan(0)
  })

  it('calls onComplete and stops rAF when frac reaches 1', () => {
    const onProgress = vi.fn()
    const onComplete = vi.fn()
    renderHook(() => useAnimationLoop(path, true, onProgress, onComplete))
    act(() => {
      tickRaf(1000)             // start
      tickRaf(1000 + 99999)     // well past ANIMATION_DURATION → frac = 1
    })
    expect(onComplete).toHaveBeenCalledOnce()
    expect(rafCallbacks.size).toBe(0) // no more pending frames
  })

  it('ballPos moves from start toward end of path', () => {
    const onProgress = vi.fn()
    const onComplete = vi.fn()
    renderHook(() => useAnimationLoop(path, true, onProgress, onComplete))
    act(() => {
      tickRaf(1000)
      tickRaf(1000 + 99999) // full animation
    })
    const lastCall = onProgress.mock.calls[onProgress.mock.calls.length - 1][0]
    expect(lastCall.ballPos.x).toBeGreaterThan(0)
  })

  it('stops animation when running switches to false', () => {
    const onProgress = vi.fn()
    const onComplete = vi.fn()
    const { rerender } = renderHook(
      ({ running }: { running: boolean }) =>
        useAnimationLoop(path, running, onProgress, onComplete),
      { initialProps: { running: true } }
    )
    act(() => tickRaf(1000))
    rerender({ running: false })
    onProgress.mockClear()
    act(() => tickRaf(2000))
    expect(onProgress).not.toHaveBeenCalled()
  })
})
