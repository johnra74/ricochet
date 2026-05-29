import { useEffect } from 'react'
import type { Dispatch } from 'react'
import type { CreatorAction } from './useCreatorState.js'

export function useCreatorKeyboard(dispatch: Dispatch<CreatorAction>, selectedIds: string[]): void {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        dispatch({ type: 'DELETE_SELECTED' });
      }
      if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey)) {
        dispatch({ type: 'UNDO' });
      }
      if ((e.key === 'c' || e.key === 'C') && (e.ctrlKey || e.metaKey) && selectedIds.length === 1) {
        e.preventDefault();
        dispatch({ type: 'COPY_SHAPE', id: selectedIds[0] });
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
  }, [dispatch, selectedIds]);
}
