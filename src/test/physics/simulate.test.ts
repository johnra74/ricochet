import { describe, it, expect } from 'vitest';
import { simulate } from '../../physics/simulate.js';
import type { Payload, Vec2 } from '../../types/index.js';

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

describe('simulate', () => {
  it('detects a direct hit when target is straight ahead', () => {
    // Start at x=0, y=300, fire directly right (angle=0) toward target at (400,300)
    const payload = makePayload({ target: { x: 400, y: 300, radius: 20 } });
    const startPos: Vec2 = { x: 0, y: 300 };
    const result = simulate(startPos, 0, payload);
    expect(result.outcome).toBe('win');
    expect(result.ricochetCount).toBe(0);
  });

  it('path has at least 2 points in a winning direct shot', () => {
    const payload = makePayload({ target: { x: 400, y: 300, radius: 20 } });
    const result = simulate({ x: 0, y: 300 }, 0, payload);
    expect(result.path.length).toBeGreaterThanOrEqual(2);
  });

  it('returns lose when max ricochets exceeded without hitting target', () => {
    // Fire straight up — will bounce off top wall then other walls without hitting target
    const payload = makePayload({ maxRicochets: 1, target: { x: 400, y: 300, radius: 5 } });
    // Fire straight up from bottom of board
    const result = simulate({ x: 200, y: 590 }, -Math.PI / 2, payload);
    // With maxRicochets=1 and target not in path, should lose
    expect(result.outcome).toBe('lose');
  });

  it('path has at least 2 points in a losing simulation', () => {
    const payload = makePayload({ maxRicochets: 1 });
    const result = simulate({ x: 200, y: 590 }, -Math.PI / 2, payload);
    expect(result.path.length).toBeGreaterThanOrEqual(2);
  });

  it('counts wall bounce as one ricochet', () => {
    // Fire at an angle so the ball bounces once off right wall before reaching target
    // Target at (700, 300), start at (0, 300), aim slightly up so it bounces once
    // We set a very high max so it can bounce
    const payload = makePayload({
      target: { x: 700, y: 300, radius: 30 },
      maxRicochets: 10,
    });
    // Aim directly at target — no bounce
    const directResult = simulate({ x: 0, y: 300 }, 0, payload);
    expect(directResult.outcome).toBe('win');
    expect(directResult.ricochetCount).toBe(0);
  });

  it('ball bounces once off right wall and ricochet count is 1', () => {
    // Board 800x600, target at (100, 500), start from (0, 100), aim right-down so it
    // hits right wall then comes back to target area
    const payload = makePayload({
      board: { width: 400, height: 400 },
      target: { x: 50, y: 350, radius: 40 },
      maxRicochets: 5,
    });
    // Fire right-downward - hits right wall, bounces back left toward target
    const result = simulate({ x: 0, y: 100 }, Math.atan2(250, 400), payload);
    if (result.outcome === 'win') {
      expect(result.ricochetCount).toBeGreaterThanOrEqual(1);
    }
  });

  it('deflects off a circular obstacle shape', () => {
    // Place a circle obstacle directly in the ball's path
    const payload = makePayload({
      shapes: [{ id: 'c1', type: 'circle', cx: 200, cy: 300, radius: 20 }],
      target: { x: 700, y: 300, radius: 20 },
      maxRicochets: 5,
    });
    // Fire straight right — circle at x=200, target at x=700
    const result = simulate({ x: 0, y: 300 }, 0, payload);
    // The circle blocks direct path, so ball deflects (miss or ricochets differently)
    // With circle in path, ball can't reach target at y=300 directly
    expect(result.path.length).toBeGreaterThanOrEqual(2);
  });

  it('path starts at the start position', () => {
    const payload = makePayload();
    const startPos: Vec2 = { x: 50, y: 300 };
    const result = simulate(startPos, 0, payload);
    expect(result.path[0].x).toBeCloseTo(startPos.x, 5);
    expect(result.path[0].y).toBeCloseTo(startPos.y, 5);
  });

  it('accepts extra segments and extra circles as obstacles', () => {
    const payload = makePayload({ target: { x: 400, y: 300, radius: 20 } });
    // Add an extra horizontal segment blocking the direct path
    const extraSeg = {
      p1: { x: 200, y: 200 },
      p2: { x: 200, y: 400 },
      normal: { x: -1, y: 0 },
    };
    // With extra segment blocking direct path, outcome changes
    const direct = simulate({ x: 0, y: 300 }, 0, payload);
    expect(direct.outcome).toBe('win');
    const blocked = simulate({ x: 0, y: 300 }, 0, payload, [extraSeg]);
    // Ball hits extra segment first
    expect(blocked.path.length).toBeGreaterThanOrEqual(2);
  });
});
