import { useEffect } from 'react'
import type { Dispatch } from 'react'
import type { CreatorAction } from './useCreatorState.js'

// S — Single Responsibility: keyboard shortcut handling extracted from useCreatorState
export function useCreatorKeyboard(dispatch: Dispatch<CreatorAction>, selectedId: string | null): void {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        dispatch({ type: 'DELETE_SHAPE', id: selectedId });
      }
      if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) {
        dispatch({ type: 'UNDO' });
      }
      if ((e.key === 'c' || e.key === 'C') && (e.ctrlKey || e.metaKey) && selectedId) {
        e.preventDefault();
        dispatch({ type: 'COPY_SHAPE', id: selectedId });
      }
      if ((e.key === 'v' || e.key === 'V') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        dispatch({ type: 'PASTE_SHAPE' });
      }
      if (e.key === 'Escape') {
        dispatch({ type: 'GHOST_CANCEL' });
        dispatch({ type: 'DESELECT' });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dispatch, selectedId]);
}
