import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreatorState } from '../../hooks/useCreatorState.js';
import { DEFAULT_BOARD, DEFAULT_TARGET, DEFAULT_MAX_RICOCHETS } from '../../constants.js';
import type { Payload } from '../../types/index.js';

describe('useCreatorState', () => {
  it('initial state has empty shapes array', () => {
    const { result } = renderHook(() => useCreatorState());
    expect(result.current.state.shapes).toEqual([]);
  });

  it('initial state has default board dimensions', () => {
    const { result } = renderHook(() => useCreatorState());
    expect(result.current.state.board).toEqual(DEFAULT_BOARD);
  });

  it('initial state has default target', () => {
    const { result } = renderHook(() => useCreatorState());
    expect(result.current.state.target).toEqual(DEFAULT_TARGET);
  });

  it('initial state has default max ricochets', () => {
    const { result } = renderHook(() => useCreatorState());
    expect(result.current.state.maxRicochets).toBe(DEFAULT_MAX_RICOCHETS);
  });

  it('initial state has no selected shape', () => {
    const { result } = renderHook(() => useCreatorState());
    expect(result.current.state.selectedIds).toEqual([]);
  });

  it('initial state has select as the active tool', () => {
    const { result } = renderHook(() => useCreatorState());
    expect(result.current.state.activeTool).toBe('select');
  });

  it('initialises from an initial payload when provided', () => {
    const payload: Payload = {
      version: 1,
      board: { width: 390, height: 720 },
      target: { x: 195, y: 360, radius: 15 },
      maxRicochets: 3,
      shapes: [{ id: 's1', type: 'circle', cx: 100, cy: 100, radius: 20 }],
      allowedWalls: ['left'],
    };
    const { result } = renderHook(() => useCreatorState(payload));
    expect(result.current.state.board).toEqual(payload.board);
    expect(result.current.state.shapes).toEqual(payload.shapes);
    expect(result.current.state.allowedWalls).toEqual(['left']);
  });

  it('GHOST_START creates a ghost state', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 100, y: 100 } });
    });
    expect(result.current.state.ghost).not.toBeNull();
    expect(result.current.state.ghost?.shapeType).toBe('rect');
  });

  it('GHOST_COMMIT adds a rect shape and clears ghost', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 100, y: 100 } });
    });
    act(() => {
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 200, y: 200 } });
    });
    act(() => {
      result.current.dispatch({ type: 'GHOST_COMMIT' });
    });
    expect(result.current.state.shapes).toHaveLength(1);
    expect(result.current.state.shapes[0].type).toBe('rect');
    expect(result.current.state.ghost).toBeNull();
  });

  it('GHOST_COMMIT adds a triangle shape', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'triangle', pt: { x: 50, y: 50 } });
    });
    act(() => {
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 150, y: 150 } });
    });
    act(() => {
      result.current.dispatch({ type: 'GHOST_COMMIT' });
    });
    expect(result.current.state.shapes[0].type).toBe('triangle');
  });

  it('GHOST_COMMIT adds a circle shape', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'circle', pt: { x: 200, y: 200 } });
    });
    act(() => {
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 250, y: 250 } });
    });
    act(() => {
      result.current.dispatch({ type: 'GHOST_COMMIT' });
    });
    expect(result.current.state.shapes[0].type).toBe('circle');
  });

  it('GHOST_COMMIT selects the new shape and switches to select tool', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 100, y: 100 } });
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 200, y: 200 } });
      result.current.dispatch({ type: 'GHOST_COMMIT' });
    });
    const newId = result.current.state.shapes[0].id;
    expect(result.current.state.selectedIds).toEqual([newId]);
    expect(result.current.state.activeTool).toBe('select');
  });

  it('SELECT updates selectedIds', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'circle', pt: { x: 100, y: 100 } });
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 150, y: 150 } });
      result.current.dispatch({ type: 'GHOST_COMMIT' });
    });
    const id = result.current.state.shapes[0].id;
    act(() => {
      result.current.dispatch({ type: 'DESELECT' });
    });
    expect(result.current.state.selectedIds).toEqual([]);
    act(() => {
      result.current.dispatch({ type: 'SELECT', id });
    });
    expect(result.current.state.selectedIds).toEqual([id]);
  });

  it('DESELECT clears selectedIds', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'circle', pt: { x: 100, y: 100 } });
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 150, y: 150 } });
      result.current.dispatch({ type: 'GHOST_COMMIT' });
    });
    act(() => {
      result.current.dispatch({ type: 'DESELECT' });
    });
    expect(result.current.state.selectedIds).toEqual([]);
  });

  it('UPDATE_SHAPE modifies an existing shape property', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'circle', pt: { x: 100, y: 100 } });
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 150, y: 150 } });
      result.current.dispatch({ type: 'GHOST_COMMIT' });
    });
    const id = result.current.state.shapes[0].id;
    act(() => {
      result.current.dispatch({ type: 'UPDATE_SHAPE', id, updates: { cx: 999 } });
    });
    expect(result.current.state.shapes[0].cx).toBe(999);
  });

  it('UPDATE_SHAPE sets validated to false', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'circle', pt: { x: 100, y: 100 } });
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 150, y: 150 } });
      result.current.dispatch({ type: 'GHOST_COMMIT' });
      result.current.dispatch({ type: 'MARK_VALIDATED' });
    });
    const id = result.current.state.shapes[0].id;
    act(() => {
      result.current.dispatch({ type: 'UPDATE_SHAPE', id, updates: { cx: 500 } });
    });
    expect(result.current.state.validated).toBe(false);
  });

  it('DELETE_SHAPE removes the shape from the list', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 50, y: 50 } });
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 150, y: 150 } });
      result.current.dispatch({ type: 'GHOST_COMMIT' });
    });
    const id = result.current.state.shapes[0].id;
    act(() => {
      result.current.dispatch({ type: 'DELETE_SHAPE', id });
    });
    expect(result.current.state.shapes).toHaveLength(0);
  });

  it('DELETE_SHAPE removes id from selectedIds when the deleted shape was selected', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 50, y: 50 } });
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 150, y: 150 } });
      result.current.dispatch({ type: 'GHOST_COMMIT' });
    });
    const id = result.current.state.shapes[0].id;
    expect(result.current.state.selectedIds).toEqual([id]);
    act(() => {
      result.current.dispatch({ type: 'DELETE_SHAPE', id });
    });
    expect(result.current.state.selectedIds).toEqual([]);
  });

  it('SET_BOARD updates board dimensions and sets validated to false', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'MARK_VALIDATED' });
    });
    act(() => {
      result.current.dispatch({ type: 'SET_BOARD', updates: { width: 400 } });
    });
    expect(result.current.state.board.width).toBe(400);
    expect(result.current.state.validated).toBe(false);
  });

  it('SET_MAX_RICOCHETS updates maxRicochets', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'SET_MAX_RICOCHETS', value: 10 });
    });
    expect(result.current.state.maxRicochets).toBe(10);
  });

  it('TOGGLE_WALL toggles a wall on', () => {
    const { result } = renderHook(() => useCreatorState());
    // First remove all but one wall
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_WALL', wall: 'top' });
      result.current.dispatch({ type: 'TOGGLE_WALL', wall: 'bottom' });
      result.current.dispatch({ type: 'TOGGLE_WALL', wall: 'right' });
    });
    expect(result.current.state.allowedWalls).toEqual(['left']);
    // Add top back
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_WALL', wall: 'top' });
    });
    expect(result.current.state.allowedWalls).toContain('top');
  });

  it('TOGGLE_WALL cannot remove the last wall', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_WALL', wall: 'top' });
      result.current.dispatch({ type: 'TOGGLE_WALL', wall: 'bottom' });
      result.current.dispatch({ type: 'TOGGLE_WALL', wall: 'right' });
    });
    expect(result.current.state.allowedWalls).toEqual(['left']);
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_WALL', wall: 'left' });
    });
    // Still has left wall
    expect(result.current.state.allowedWalls).toEqual(['left']);
  });

  it('MARK_VALIDATED sets validated to true', () => {
    const { result } = renderHook(() => useCreatorState());
    expect(result.current.state.validated).toBe(false);
    act(() => {
      result.current.dispatch({ type: 'MARK_VALIDATED' });
    });
    expect(result.current.state.validated).toBe(true);
  });

  it('UNDO restores the previous shapes', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'rect', pt: { x: 50, y: 50 } });
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 150, y: 150 } });
      result.current.dispatch({ type: 'GHOST_COMMIT' });
    });
    expect(result.current.state.shapes).toHaveLength(1);
    act(() => {
      result.current.dispatch({ type: 'UNDO' });
    });
    expect(result.current.state.shapes).toHaveLength(0);
  });

  it('UNDO is a no-op when history is empty', () => {
    const { result } = renderHook(() => useCreatorState());
    const stateBefore = result.current.state;
    act(() => {
      result.current.dispatch({ type: 'UNDO' });
    });
    expect(result.current.state.shapes).toEqual(stateBefore.shapes);
  });

  it('getPayload returns a correctly shaped Payload object', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'GHOST_START', shapeType: 'circle', pt: { x: 100, y: 100 } });
      result.current.dispatch({ type: 'GHOST_MOVE', pt: { x: 150, y: 150 } });
      result.current.dispatch({ type: 'GHOST_COMMIT' });
    });
    const payload = result.current.getPayload();
    expect(payload.version).toBe(1);
    expect(payload.board).toEqual(result.current.state.board);
    expect(payload.target).toEqual(result.current.state.target);
    expect(payload.maxRicochets).toBe(result.current.state.maxRicochets);
    expect(payload.shapes).toEqual(result.current.state.shapes);
    expect(payload.allowedWalls).toEqual(result.current.state.allowedWalls);
  });

  it('SET_TOOL changes the active tool and clears selection and ghost', () => {
    const { result } = renderHook(() => useCreatorState());
    act(() => {
      result.current.dispatch({ type: 'SET_TOOL', tool: 'rect' });
    });
    expect(result.current.state.activeTool).toBe('rect');
    expect(result.current.state.selectedIds).toEqual([]);
    expect(result.current.state.ghost).toBeNull();
  });
});
