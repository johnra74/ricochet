import type { Board, Target, WallName } from './types/index.js'

export const EPSILON = 1e-9;
export const NUDGE = 1e-6;
export const MAX_SIMULATION_STEPS = 300;
export const ANIMATION_DURATION = 1800; // ms

export const DEFAULT_BOARD: Board = { width: 800, height: 550 };
export const MOBILE_BOARD: Board  = { width: 390, height: 720 };
export const DEFAULT_TARGET: Target = { x: 600, y: 275, radius: 20 };
export const DEFAULT_MAX_RICOCHETS = 5;
export const ALL_WALLS: WallName[] = ['top', 'bottom', 'left', 'right'];
export const DEFAULT_ALLOWED_WALLS: WallName[] = ['top', 'bottom', 'left', 'right'];
export const MIN_SHAPE_SIZE = 10;
export const MIN_BOARD = 200;

export const SHAPE_COLORS: Record<string, string> = {
  rect: '#4a90d9',
  triangle: '#e67e22',
  circle: '#27ae60',
};

export const HANDLE_RADIUS = 7;
export const ROTATE_ARM_LENGTH = 36;
// Invisible touch target radius — 44 px minimum per Apple HIG / Material Design
export const TOUCH_HIT_RADIUS = 22;
