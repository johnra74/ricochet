import { useReducer, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_BOARD, DEFAULT_TARGET, DEFAULT_MAX_RICOCHETS, DEFAULT_ALLOWED_WALLS } from '../constants.js'
import { useCreatorKeyboard } from './useCreatorKeyboard.js'
import { shapeBBox } from '../utils/bbox.js'
import type { Shape, Board, Target, WallName, Payload, Vec2 } from '../types/index.js'

export type ToolName = 'select' | 'rect' | 'triangle' | 'circle' | 'target'

export interface GhostState {
  shapeType: 'rect' | 'triangle' | 'circle';
  startSvg: Vec2;
  currentSvg: Vec2;
}

export interface CreatorState {
  board: Board;
  target: Target;
  maxRicochets: number;
  allowedWalls: WallName[];
  shapes: Shape[];
  selectedIds: string[];
  activeTool: ToolName;
  ghost: GhostState | null;
  history: Shape[][];
  validated: boolean;
  clipboard: Shape | null;
}

export type CreatorAction =
  | { type: 'SET_TOOL'; tool: ToolName }
  | { type: 'SELECT'; id: string }
  | { type: 'TOGGLE_SELECTION'; id: string }
  | { type: 'DESELECT' }
  | { type: 'GHOST_START'; shapeType: 'rect' | 'triangle' | 'circle'; pt: Vec2 }
  | { type: 'GHOST_MOVE'; pt: Vec2 }
  | { type: 'GHOST_COMMIT' }
  | { type: 'GHOST_CANCEL' }
  | { type: 'UPDATE_SHAPE'; id: string; updates: Partial<Shape> }
  | { type: 'DELETE_SHAPE'; id: string }
  | { type: 'DELETE_SELECTED' }
  | { type: 'ALIGN'; direction: 'left' | 'right' | 'top' | 'bottom' }
  | { type: 'SET_TARGET'; updates: Partial<Target> }
  | { type: 'SET_BOARD'; updates: Partial<Board> }
  | { type: 'SET_MAX_RICOCHETS'; value: number }
  | { type: 'UNDO' }
  | { type: 'TOGGLE_WALL'; wall: WallName }
  | { type: 'MARK_VALIDATED' }
  | { type: 'LOAD'; payload: Payload }
  | { type: 'COPY_SHAPE'; id: string }
  | { type: 'PASTE_SHAPE' }

const initialState: CreatorState = {
  board: { ...DEFAULT_BOARD },
  target: { ...DEFAULT_TARGET },
  maxRicochets: DEFAULT_MAX_RICOCHETS,
  allowedWalls: [...DEFAULT_ALLOWED_WALLS],
  shapes: [],
  selectedIds: [],
  activeTool: 'select',
  ghost: null,
  history: [],
  validated: false,
  clipboard: null,
};

function reducer(state: CreatorState, action: CreatorAction): CreatorState {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, activeTool: action.tool, selectedIds: [], ghost: null };

    case 'SELECT':
      return { ...state, selectedIds: [action.id], activeTool: 'select' };

    case 'TOGGLE_SELECTION': {
      const already = state.selectedIds.includes(action.id);
      return {
        ...state,
        selectedIds: already
          ? state.selectedIds.filter((i) => i !== action.id)
          : [...state.selectedIds, action.id],
        activeTool: 'select',
      };
    }

    case 'DESELECT':
      return { ...state, selectedIds: [] };

    case 'GHOST_START':
      return { ...state, ghost: { shapeType: action.shapeType, startSvg: action.pt, currentSvg: action.pt } };

    case 'GHOST_MOVE':
      return state.ghost ? { ...state, ghost: { ...state.ghost, currentSvg: action.pt } } : state;

    case 'GHOST_COMMIT': {
      if (!state.ghost) return state;
      const { shapeType, startSvg, currentSvg } = state.ghost;
      const dx = currentSvg.x - startSvg.x;
      const dy = currentSvg.y - startSvg.y;
      const cx = (startSvg.x + currentSvg.x) / 2;
      const cy = (startSvg.y + currentSvg.y) / 2;

      let newShape: Shape | null = null;
      if (shapeType === 'rect') {
        const width = Math.max(20, Math.abs(dx));
        const height = Math.max(20, Math.abs(dy));
        newShape = { id: uuidv4(), type: 'rect', cx, cy, width, height, rotation: 0 };
      } else if (shapeType === 'triangle') {
        const base = Math.max(20, Math.abs(dx));
        const height = Math.max(20, Math.abs(dy));
        newShape = { id: uuidv4(), type: 'triangle', cx, cy, base, height, rotation: 0 };
      } else if (shapeType === 'circle') {
        const radius = Math.max(10, Math.sqrt(dx * dx + dy * dy) / 2);
        newShape = { id: uuidv4(), type: 'circle', cx: startSvg.x, cy: startSvg.y, radius };
      }

      if (!newShape) return { ...state, ghost: null };

      const newShapes = [...state.shapes, newShape];
      return {
        ...state,
        shapes: newShapes,
        ghost: null,
        selectedIds: [newShape.id],
        activeTool: 'select',
        history: [...state.history, state.shapes],
        validated: false,
      };
    }

    case 'GHOST_CANCEL':
      return { ...state, ghost: null };

    case 'UPDATE_SHAPE': {
      const shapes = state.shapes.map((s) =>
        s.id === action.id ? { ...s, ...action.updates } as Shape : s
      );
      return { ...state, shapes, validated: false };
    }

    case 'DELETE_SHAPE':
      return {
        ...state,
        shapes: state.shapes.filter((s) => s.id !== action.id),
        selectedIds: state.selectedIds.filter((i) => i !== action.id),
        history: [...state.history, state.shapes],
        validated: false,
      };

    case 'DELETE_SELECTED': {
      if (state.selectedIds.length === 0) return state;
      return {
        ...state,
        shapes: state.shapes.filter((s) => !state.selectedIds.includes(s.id)),
        selectedIds: [],
        history: [...state.history, state.shapes],
        validated: false,
      };
    }

    case 'ALIGN': {
      const { direction } = action;
      const selected = state.shapes.filter((s) => state.selectedIds.includes(s.id));
      if (selected.length < 2) return state;
      const infos = selected.map((s) => ({ id: s.id, bbox: shapeBBox(s), cx: s.cx, cy: s.cy }));
      let shapes = state.shapes;
      if (direction === 'left') {
        const target = Math.min(...infos.map((b) => b.bbox.left));
        shapes = shapes.map((s) => { const b = infos.find((i) => i.id === s.id); return b ? { ...s, cx: b.cx + (target - b.bbox.left) } as Shape : s; });
      } else if (direction === 'right') {
        const target = Math.max(...infos.map((b) => b.bbox.right));
        shapes = shapes.map((s) => { const b = infos.find((i) => i.id === s.id); return b ? { ...s, cx: b.cx + (target - b.bbox.right) } as Shape : s; });
      } else if (direction === 'top') {
        const target = Math.min(...infos.map((b) => b.bbox.top));
        shapes = shapes.map((s) => { const b = infos.find((i) => i.id === s.id); return b ? { ...s, cy: b.cy + (target - b.bbox.top) } as Shape : s; });
      } else {
        const target = Math.max(...infos.map((b) => b.bbox.bottom));
        shapes = shapes.map((s) => { const b = infos.find((i) => i.id === s.id); return b ? { ...s, cy: b.cy + (target - b.bbox.bottom) } as Shape : s; });
      }
      return { ...state, shapes, history: [...state.history, state.shapes], validated: false };
    }

    case 'SET_TARGET':
      return { ...state, target: { ...state.target, ...action.updates }, validated: false };

    case 'SET_BOARD':
      return { ...state, board: { ...state.board, ...action.updates }, validated: false };

    case 'SET_MAX_RICOCHETS':
      return { ...state, maxRicochets: action.value, validated: false };

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const history = [...state.history];
      const shapes = history.pop() ?? [];
      return { ...state, shapes, history, selectedIds: [], validated: false };
    }

    case 'TOGGLE_WALL': {
      const wall = action.wall;
      const current = state.allowedWalls;
      // Don't allow deselecting the last wall
      if (current.includes(wall) && current.length === 1) return state;
      const next = current.includes(wall)
        ? current.filter((w) => w !== wall)
        : [...current, wall];
      return { ...state, allowedWalls: next, validated: false };
    }

    case 'MARK_VALIDATED':
      return { ...state, validated: true };

    case 'COPY_SHAPE': {
      const shape = state.shapes.find((s) => s.id === action.id) ?? null;
      return { ...state, clipboard: shape };
    }

    case 'PASTE_SHAPE': {
      if (!state.clipboard) return state;
      const OFFSET = 20;
      const pasted: Shape = { ...state.clipboard, id: uuidv4(), cx: state.clipboard.cx + OFFSET, cy: state.clipboard.cy + OFFSET };
      const newShapes = [...state.shapes, pasted];
      return {
        ...state,
        shapes: newShapes,
        selectedIds: [pasted.id],
        history: [...state.history, state.shapes],
        validated: false,
      };
    }

    case 'LOAD':
      return {
        ...initialState,
        board: action.payload.board,
        target: action.payload.target,
        maxRicochets: action.payload.maxRicochets,
        allowedWalls: action.payload.allowedWalls ?? [...DEFAULT_ALLOWED_WALLS],
        shapes: action.payload.shapes,
        validated: false,
      };

    default:
      return state;
  }
}

export interface CreatorStateApi {
  state: CreatorState;
  dispatch: React.Dispatch<CreatorAction>;
  getPayload: () => Payload;
}

export function useCreatorState(initialPayload?: Payload | null): CreatorStateApi {
  const [state, dispatch] = useReducer(reducer, initialState, (s) => {
    if (initialPayload) {
      return {
        ...s,
        board: initialPayload.board,
        target: initialPayload.target,
        maxRicochets: initialPayload.maxRicochets,
        allowedWalls: initialPayload.allowedWalls ?? [...DEFAULT_ALLOWED_WALLS],
        shapes: initialPayload.shapes,
      };
    }
    return s;
  });

  // S — Single Responsibility: keyboard handling delegated to dedicated hook
  useCreatorKeyboard(dispatch, state.selectedIds);

  const getPayload = useCallback(
    (): Payload => ({
      version: 1,
      board: state.board,
      target: state.target,
      maxRicochets: state.maxRicochets,
      allowedWalls: state.allowedWalls,
      shapes: state.shapes,
    }),
    [state.board, state.target, state.maxRicochets, state.allowedWalls, state.shapes]
  );

  return { state, dispatch, getPayload };
}
