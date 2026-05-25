import { describe, it, expect } from 'vitest';
import { validatePayload } from '../../encoding/schema.js';
import type { Payload } from '../../types/index.js';

function validPayload(): Payload {
  return {
    version: 1,
    board: { width: 800, height: 600 },
    target: { x: 400, y: 300, radius: 20 },
    maxRicochets: 5,
    shapes: [],
    allowedWalls: ['top', 'bottom', 'left', 'right'],
  };
}

describe('validatePayload', () => {
  it('accepts a fully valid payload without throwing', () => {
    expect(() => validatePayload(validPayload())).not.toThrow();
  });

  it('throws when payload is null', () => {
    expect(() => validatePayload(null)).toThrow();
  });

  it('throws when version is missing', () => {
    const p = { ...validPayload(), version: undefined };
    expect(() => validatePayload(p)).toThrow();
  });

  it('throws when version is not 1', () => {
    const p = { ...validPayload(), version: 2 };
    expect(() => validatePayload(p)).toThrow('Unsupported payload version');
  });

  it('throws when board is missing', () => {
    const p = { ...validPayload(), board: undefined };
    expect(() => validatePayload(p)).toThrow();
  });

  it('throws when board dimensions are not positive', () => {
    const p = { ...validPayload(), board: { width: 0, height: 600 } };
    expect(() => validatePayload(p)).toThrow();
  });

  it('throws when target is invalid', () => {
    const p = { ...validPayload(), target: { x: 'bad', y: 300, radius: 20 } };
    expect(() => validatePayload(p)).toThrow();
  });

  it('throws when target radius is not positive', () => {
    const p = { ...validPayload(), target: { x: 400, y: 300, radius: 0 } };
    expect(() => validatePayload(p)).toThrow();
  });

  it('throws when maxRicochets is not an integer', () => {
    const p = { ...validPayload(), maxRicochets: 1.5 };
    expect(() => validatePayload(p)).toThrow();
  });

  it('throws when maxRicochets is less than 1', () => {
    const p = { ...validPayload(), maxRicochets: 0 };
    expect(() => validatePayload(p)).toThrow();
  });

  it('throws when shapes is not an array', () => {
    const p = { ...validPayload(), shapes: 'not-an-array' };
    expect(() => validatePayload(p)).toThrow();
  });

  it('accepts an empty shapes array', () => {
    const p = { ...validPayload(), shapes: [] };
    expect(() => validatePayload(p)).not.toThrow();
  });

  it('accepts a payload without allowedWalls (defaults to all walls)', () => {
    const p = { ...validPayload() };
    delete (p as Partial<Payload>).allowedWalls;
    expect(() => validatePayload(p)).not.toThrow();
  });

  it('throws when allowedWalls contains an invalid wall name', () => {
    const p = { ...validPayload(), allowedWalls: ['top', 'invalid'] as ['top', 'invalid'] };
    expect(() => validatePayload(p)).toThrow();
  });

  it('throws when allowedWalls is an empty array', () => {
    const p = { ...validPayload(), allowedWalls: [] as never[] };
    expect(() => validatePayload(p)).toThrow();
  });

  it('validates a valid rect shape correctly', () => {
    const p = {
      ...validPayload(),
      shapes: [{ id: 'r1', type: 'rect', cx: 100, cy: 100, width: 50, height: 30, rotation: 0 }],
    };
    expect(() => validatePayload(p)).not.toThrow();
  });

  it('throws when shape type is invalid', () => {
    const p = {
      ...validPayload(),
      shapes: [{ id: 'x1', type: 'hexagon', cx: 100, cy: 100 }],
    };
    expect(() => validatePayload(p)).toThrow('Unknown shape type');
  });

  it('validates a valid triangle shape correctly', () => {
    const p = {
      ...validPayload(),
      shapes: [{ id: 't1', type: 'triangle', cx: 100, cy: 100, base: 60, height: 80, rotation: 0 }],
    };
    expect(() => validatePayload(p)).not.toThrow();
  });

  it('validates a valid circle shape correctly', () => {
    const p = {
      ...validPayload(),
      shapes: [{ id: 'c1', type: 'circle', cx: 100, cy: 100, radius: 30 }],
    };
    expect(() => validatePayload(p)).not.toThrow();
  });

  it('throws when a circle shape has an invalid radius', () => {
    const p = {
      ...validPayload(),
      shapes: [{ id: 'c1', type: 'circle', cx: 100, cy: 100, radius: 0 }],
    };
    expect(() => validatePayload(p)).toThrow();
  });
});
