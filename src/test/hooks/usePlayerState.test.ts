import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlayerState, clampToWall } from '../../hooks/usePlayerState.js';
import type { Payload, Board, Vec2 } from '../../types/index.js';

function makePayload(overrides: Partial<Payload> = {}): Payload {
  return {
    version: 1,
    board: { width: 800, height: 600 },
    target: { x: 400, y: 300, radius: 20 },
    maxRicochets: 5,
    shapes: [],
    allowedWalls: ['top', 'bottom', 'left', 'right'],
    ...overrides,
  };
}

describe('clampToWall', () => {
  const board: Board = { width: 800, height: 600 };

  it('clamps a point near the left wall to the left wall', () => {
    const result = clampToWall({ x: 5, y: 300 }, board, ['left', 'right', 'top', 'bottom']);
    expect(result.wall).toBe('left');
    expect(result.x).toBe(0);
    expect(result.y).toBe(300);
  });

  it('clamps a point near the top wall to the top wall', () => {
    const result = clampToWall({ x: 400, y: 5 }, board, ['top', 'bottom', 'left', 'right']);
    expect(result.wall).toBe('top');
    expect(result.y).toBe(0);
    expect(result.x).toBe(400);
  });

  it('clamps a point near the right wall to the right wall', () => {
    const result = clampToWall({ x: 795, y: 300 }, board, ['right']);
    expect(result.wall).toBe('right');
    expect(result.x).toBe(800);
  });

  it('clamps a point near the bottom wall to the bottom wall', () => {
    const result = clampToWall({ x: 400, y: 595 }, board, ['bottom']);
    expect(result.wall).toBe('bottom');
    expect(result.y).toBe(600);
  });

  it('when only one wall is allowed, always clamps to that wall', () => {
    const result = clampToWall({ x: 10, y: 10 }, board, ['right']);
    expect(result.wall).toBe('right');
  });

  it('returns default left-wall position when no walls are allowed', () => {
    const result = clampToWall({ x: 400, y: 300 }, board, []);
    expect(result.wall).toBe('left');
    expect(result.x).toBe(0);
  });

  it('clamps x coordinate to board bounds', () => {
    const result = clampToWall({ x: -100, y: 300 }, board, ['top']);
    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.x).toBeLessThanOrEqual(board.width);
  });
});

describe('usePlayerState', () => {
  it('initial state has startPoint on the first allowed wall', () => {
    const payload = makePayload({ allowedWalls: ['left', 'top', 'right', 'bottom'] });
    const { result } = renderHook(() => usePlayerState(payload));
    expect(result.current.state.startPoint).not.toBeNull();
    expect(result.current.state.startPoint?.wall).toBe('left');
  });

  it('initial state defaults to aiming phase', () => {
    const { result } = renderHook(() => usePlayerState(makePayload()));
    expect(result.current.state.phase).toBe('aiming');
  });

  it('initial state has no result', () => {
    const { result } = renderHook(() => usePlayerState(makePayload()));
    expect(result.current.state.result).toBeNull();
  });

  it('SET_ANGLE updates angleRad', () => {
    const { result } = renderHook(() => usePlayerState(makePayload()));
    act(() => {
      result.current.dispatch({ type: 'SET_ANGLE', rad: Math.PI / 4 });
    });
    expect(result.current.state.angleRad).toBeCloseTo(Math.PI / 4, 10);
  });

  it('SET_START clamps to nearest allowed wall', () => {
    const payload = makePayload({ allowedWalls: ['top', 'bottom'] });
    const { result } = renderHook(() => usePlayerState(payload));
    act(() => {
      result.current.dispatch({
        type: 'SET_START',
        pt: { x: 400, y: 5 },
        board: payload.board,
        allowedWalls: payload.allowedWalls,
      });
    });
    expect(result.current.state.startPoint?.wall).toBe('top');
    expect(result.current.state.startPoint?.y).toBe(0);
  });

  it('FIRE transitions phase to animating', () => {
    const { result } = renderHook(() => usePlayerState(makePayload()));
    const simResult = {
      path: [{ x: 0, y: 300 }, { x: 400, y: 300 }],
      outcome: 'win' as const,
      ricochetCount: 0,
    };
    act(() => {
      result.current.dispatch({ type: 'FIRE', result: simResult });
    });
    expect(result.current.state.phase).toBe('animating');
    expect(result.current.state.result).toEqual(simResult);
  });

  it('ANIM_DONE transitions phase to result', () => {
    const { result } = renderHook(() => usePlayerState(makePayload()));
    const simResult = {
      path: [{ x: 0, y: 300 }, { x: 400, y: 300 }],
      outcome: 'win' as const,
      ricochetCount: 0,
    };
    act(() => {
      result.current.dispatch({ type: 'FIRE', result: simResult });
    });
    act(() => {
      result.current.dispatch({ type: 'ANIM_DONE' });
    });
    expect(result.current.state.phase).toBe('result');
  });

  it('RESET returns to aiming phase', () => {
    const { result } = renderHook(() => usePlayerState(makePayload()));
    const simResult = {
      path: [{ x: 0, y: 300 }, { x: 400, y: 300 }],
      outcome: 'win' as const,
      ricochetCount: 0,
    };
    act(() => {
      result.current.dispatch({ type: 'FIRE', result: simResult });
    });
    act(() => {
      result.current.dispatch({ type: 'ANIM_DONE' });
    });
    act(() => {
      result.current.dispatch({ type: 'RESET' });
    });
    expect(result.current.state.phase).toBe('aiming');
    expect(result.current.state.result).toBeNull();
  });

  it('ANIM_PROGRESS updates animFrac and ballPos', () => {
    const { result } = renderHook(() => usePlayerState(makePayload()));
    const ballPos: Vec2 = { x: 200, y: 300 };
    act(() => {
      result.current.dispatch({ type: 'ANIM_PROGRESS', frac: 0.5, ballPos });
    });
    expect(result.current.state.animFrac).toBe(0.5);
    expect(result.current.state.ballPos).toEqual(ballPos);
  });

  it('setStart helper dispatches SET_START', () => {
    const payload = makePayload();
    const { result } = renderHook(() => usePlayerState(payload));
    act(() => {
      result.current.setStart({ x: 400, y: 0 });
    });
    expect(result.current.state.startPoint).not.toBeNull();
  });

  it('setAngle helper dispatches SET_ANGLE', () => {
    const { result } = renderHook(() => usePlayerState(makePayload()));
    act(() => {
      result.current.setAngle(Math.PI);
    });
    expect(result.current.state.angleRad).toBeCloseTo(Math.PI, 10);
  });

  it('AIM_AT updates angle based on direction from startPoint', () => {
    const payload = makePayload({ allowedWalls: ['left'] });
    const { result } = renderHook(() => usePlayerState(payload));
    // startPoint should be on left wall at (0, 300)
    act(() => {
      result.current.dispatch({ type: 'AIM_AT', pt: { x: 400, y: 300 } });
    });
    // Aiming from (0, 300) to (400, 300) should be angle ≈ 0
    expect(result.current.state.angleRad).toBeCloseTo(0, 2);
  });
});
