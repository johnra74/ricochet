import { describe, it, expect } from 'vitest';
import LZString from 'lz-string';
import { encode, decode } from '../../encoding/codec.js';
import type { Payload, Shape } from '../../types/index.js';

// IDs are stripped on encode and regenerated on decode — compare structural data only
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stripIds = (shapes: Shape[]) => shapes.map(({ id: _, ...rest }) => rest);

function samplePayload(): Payload {
  return {
    version: 1,
    board: { width: 800, height: 600 },
    target: { x: 400, y: 300, radius: 20 },
    maxRicochets: 5,
    shapes: [
      { id: 'r1', type: 'rect', cx: 200, cy: 200, width: 80, height: 60, rotation: 0 },
      { id: 'c1', type: 'circle', cx: 500, cy: 400, radius: 30 },
    ],
    allowedWalls: ['top', 'bottom', 'left', 'right'],
  };
}

describe('encode', () => {
  it('returns a non-empty string', () => {
    const encoded = encode(samplePayload());
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);
  });

  it('produces a URL-safe string (no raw spaces)', () => {
    const encoded = encode(samplePayload());
    expect(encoded).not.toContain(' ');
  });
});

describe('decode', () => {
  it('roundtrip encode → decode preserves all fields', () => {
    const original = samplePayload();
    const encoded = encode(original);
    const decoded = decode(encoded);
    expect(decoded.version).toBe(original.version);
    expect(decoded.board).toEqual(original.board);
    expect(decoded.target).toEqual(original.target);
    expect(decoded.maxRicochets).toBe(original.maxRicochets);
    expect(stripIds(decoded.shapes)).toEqual(stripIds(original.shapes));
    expect(decoded.allowedWalls).toEqual(original.allowedWalls);
  });

  it('roundtrip preserves a payload with triangle shapes and restricted walls', () => {
    const payload: Payload = {
      version: 1,
      board: { width: 390, height: 720 },
      target: { x: 195, y: 360, radius: 15 },
      maxRicochets: 3,
      shapes: [
        { id: 't1', type: 'triangle', cx: 100, cy: 200, base: 50, height: 70, rotation: 30 },
      ],
      allowedWalls: ['left', 'right'],
    };
    const decoded = decode(encode(payload));
    expect(stripIds(decoded.shapes)).toEqual(stripIds(payload.shapes));
    expect(decoded.allowedWalls).toEqual(['left', 'right']);
  });

  it('throws when given a corrupted string', () => {
    expect(() => decode('not-valid-lz-data!!!')).toThrow();
  });

  it('throws when given valid compression but non-JSON content', () => {
    const bad = LZString.compressToEncodedURIComponent('this is not json {{{');
    expect(() => decode(bad)).toThrow();
  });

  it('throws when decoded JSON has an invalid schema', () => {
    const invalidPayload = JSON.stringify({ version: 99, shapes: [] });
    const encoded = LZString.compressToEncodedURIComponent(invalidPayload);
    expect(() => decode(encoded)).toThrow();
  });

  it('throws when given an empty string', () => {
    expect(() => decode('')).toThrow();
  });
});
