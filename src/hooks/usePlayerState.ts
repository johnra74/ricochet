import { useReducer, useCallback } from 'react'
import { angleTo } from '../physics/vector.js'
import { DEFAULT_ALLOWED_WALLS } from '../constants.js'
import type { Vec2, Board, Payload, WallName, SimResult } from '../types/index.js'

export type PlayerPhase = 'aiming' | 'animating' | 'result'

export interface StartPoint extends Vec2 {
  wall: WallName;
}

export interface PlayerState {
  startPoint: StartPoint | null;
  angleRad: number;
  phase: PlayerPhase;
  result: SimResult | null;
  animFrac: number;
  ballPos: Vec2 | null;
}

type PlayerAction =
  | { type: 'SET_START'; pt: Vec2; board: Board; allowedWalls: WallName[] }
  | { type: 'SET_ANGLE'; rad: number }
  | { type: 'AIM_AT'; pt: Vec2 }
  | { type: 'FIRE'; result: SimResult }
  | { type: 'ANIM_PROGRESS'; frac: number; ballPos: Vec2 }
  | { type: 'ANIM_DONE' }
  | { type: 'RESET' }

function clampToWall(pt: Vec2, board: Board, allowedWalls: WallName[] = DEFAULT_ALLOWED_WALLS): StartPoint {
  const { width, height } = board;
  const candidates: (StartPoint & { dist: number })[] = [];
  if (allowedWalls.includes('top'))
    candidates.push({ x: Math.max(0, Math.min(width, pt.x)), y: 0, wall: 'top', dist: pt.y });
  if (allowedWalls.includes('bottom'))
    candidates.push({ x: Math.max(0, Math.min(width, pt.x)), y: height, wall: 'bottom', dist: height - pt.y });
  if (allowedWalls.includes('left'))
    candidates.push({ x: 0, y: Math.max(0, Math.min(height, pt.y)), wall: 'left', dist: pt.x });
  if (allowedWalls.includes('right'))
    candidates.push({ x: width, y: Math.max(0, Math.min(height, pt.y)), wall: 'right', dist: width - pt.x });

  if (candidates.length === 0) return { x: 0, y: height / 2, wall: 'left' };
  candidates.sort((a, b) => a.dist - b.dist);
  const { dist: _dist, ...result } = candidates[0];
  return result;
}

function initialStartPoint(board: Board, allowedWalls: WallName[] = DEFAULT_ALLOWED_WALLS): StartPoint {
  // Pick the first allowed wall in preference order: left, top, right, bottom
  const preferred: WallName[] = ['left', 'top', 'right', 'bottom'];
  const wall = preferred.find((w) => allowedWalls.includes(w)) ?? allowedWalls[0];
  if (wall === 'left')   return { x: 0,            y: board.height / 2, wall };
  if (wall === 'top')    return { x: board.width / 2, y: 0,             wall };
  if (wall === 'right')  return { x: board.width,  y: board.height / 2, wall };
  if (wall === 'bottom') return { x: board.width / 2, y: board.height,  wall };
  return { x: 0, y: board.height / 2, wall: 'left' };
}

const baseInitialState: PlayerState = {
  startPoint: null,
  angleRad: Math.PI / 6,
  phase: 'aiming',
  result: null,
  animFrac: 0,
  ballPos: null,
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_START':
      return { ...state, startPoint: clampToWall(action.pt, action.board, action.allowedWalls) };

    case 'SET_ANGLE':
      return { ...state, angleRad: action.rad };

    case 'AIM_AT': {
      if (!state.startPoint) return state;
      const rad = angleTo(state.startPoint, action.pt);
      return { ...state, angleRad: rad };
    }

    case 'FIRE':
      return { ...state, phase: 'animating', result: action.result, animFrac: 0, ballPos: null };

    case 'ANIM_PROGRESS':
      return { ...state, animFrac: action.frac, ballPos: action.ballPos };

    case 'ANIM_DONE':
      return { ...state, phase: 'result' };

    case 'RESET':
      return { ...state, phase: 'aiming', result: null, animFrac: 0, ballPos: null };

    default:
      return state;
  }
}

export interface PlayerStateApi {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  setStart: (pt: Vec2) => void;
  setAngle: (rad: number) => void;
  aimAt: (pt: Vec2) => void;
}

export function usePlayerState(payload: Payload): PlayerStateApi {
  const allowedWalls = payload.allowedWalls ?? DEFAULT_ALLOWED_WALLS;

  const [state, dispatch] = useReducer(playerReducer, {
    ...baseInitialState,
    startPoint: initialStartPoint(payload.board, allowedWalls),
  });

  const setStart = useCallback(
    (pt: Vec2) => dispatch({ type: 'SET_START', pt, board: payload.board, allowedWalls }),
    [payload.board, allowedWalls]
  );

  const setAngle = useCallback((rad: number) => dispatch({ type: 'SET_ANGLE', rad }), []);

  const aimAt = useCallback((pt: Vec2) => dispatch({ type: 'AIM_AT', pt }), []);

  return { state, dispatch, setStart, setAngle, aimAt };
}

export { clampToWall };
