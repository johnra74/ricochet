import type { Payload, WallName } from '../types/index.js'

export const SHAPE_TYPES = ['rect', 'triangle', 'circle'] as const;
export const VALID_WALLS: WallName[] = ['top', 'bottom', 'left', 'right'];

function assert(cond: boolean, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function isNum(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v);
}

export function validatePayload(obj: unknown): asserts obj is Payload {
  assert(obj !== null && typeof obj === 'object', 'Payload must be an object');
  const o = obj as Record<string, unknown>;
  assert(o['version'] === 1, 'Unsupported payload version');

  // allowedWalls is optional - defaults to all walls if absent
  if (o['allowedWalls'] !== undefined) {
    const aw = o['allowedWalls'];
    assert(Array.isArray(aw) && aw.length >= 1, 'allowedWalls must be a non-empty array');
    assert((aw as unknown[]).every((w) => VALID_WALLS.includes(w as WallName)), 'allowedWalls contains invalid wall name');
  }

  const board = o['board'] as Record<string, unknown> | undefined;
  const target = o['target'] as Record<string, unknown> | undefined;
  const maxRicochets = o['maxRicochets'];
  const shapes = o['shapes'];

  assert(board != null && isNum(board['width']) && isNum(board['height']), 'Invalid board');
  assert((board['width'] as number) > 0 && (board['height'] as number) > 0, 'Board dimensions must be positive');

  assert(target != null && isNum(target['x']) && isNum(target['y']) && isNum(target['radius']), 'Invalid target');
  assert((target['radius'] as number) > 0, 'Target radius must be positive');

  assert(Number.isInteger(maxRicochets) && (maxRicochets as number) >= 1, 'maxRicochets must be integer >= 1');

  assert(Array.isArray(shapes), 'shapes must be an array');

  for (const s of shapes as Record<string, unknown>[]) {
    assert(SHAPE_TYPES.includes(s['type'] as typeof SHAPE_TYPES[number]), `Unknown shape type: ${String(s['type'])}`);
    assert(isNum(s['cx']) && isNum(s['cy']), `Shape missing cx/cy`);

    if (s['type'] === 'rect') {
      assert(isNum(s['width']) && (s['width'] as number) > 0, 'Rect invalid width');
      assert(isNum(s['height']) && (s['height'] as number) > 0, 'Rect invalid height');
      assert(isNum(s['rotation']), 'Rect invalid rotation');
    } else if (s['type'] === 'triangle') {
      assert(isNum(s['base']) && (s['base'] as number) > 0, 'Triangle invalid base');
      assert(isNum(s['height']) && (s['height'] as number) > 0, 'Triangle invalid height');
      assert(isNum(s['rotation']), 'Triangle invalid rotation');
    } else if (s['type'] === 'circle') {
      assert(isNum(s['radius']) && (s['radius'] as number) > 0, 'Circle invalid radius');
    }
  }
}
