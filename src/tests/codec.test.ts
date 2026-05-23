import { describe, it, expect } from 'vitest'
import { encode, decode } from '../encoding/codec.js'
import { validatePayload } from '../encoding/schema.js'
import type { Payload } from '../types/index.js'

const VALID_PAYLOAD: Payload = {
  version: 1,
  board: { width: 800, height: 600 },
  target: { x: 400, y: 300, radius: 20 },
  maxRicochets: 5,
  shapes: [
    { id: 'r1', type: 'rect', cx: 200, cy: 150, width: 120, height: 60, rotation: 45 },
    { id: 't1', type: 'triangle', cx: 400, cy: 400, base: 100, height: 80, rotation: 0 },
    { id: 'c1', type: 'circle', cx: 600, cy: 200, radius: 40 },
  ],
  allowedWalls: ['left', 'top'],
}

describe('encode/decode round-trip', () => {
  it('round-trips a full payload exactly', () => {
    const encoded = encode(VALID_PAYLOAD)
    const decoded = decode(encoded)
    expect(decoded).toEqual(VALID_PAYLOAD)
  })

  it('round-trips an empty shapes array', () => {
    const payload: Payload = { ...VALID_PAYLOAD, shapes: [] }
    expect(decode(encode(payload))).toEqual(payload)
  })

  it('encoded string is a non-empty string', () => {
    const encoded = encode(VALID_PAYLOAD)
    expect(typeof encoded).toBe('string')
    expect(encoded.length).toBeGreaterThan(0)
  })

  it('encoded string changes when payload changes', () => {
    const a = encode(VALID_PAYLOAD)
    const b = encode({ ...VALID_PAYLOAD, maxRicochets: 10 })
    expect(a).not.toBe(b)
  })

  it('round-trip with all wall types', () => {
    const payload: Payload = { ...VALID_PAYLOAD, allowedWalls: ['top', 'bottom', 'left', 'right'] }
    expect(decode(encode(payload))).toEqual(payload)
  })
})

describe('decode — invalid inputs', () => {
  it('throws on empty string', () => {
    expect(() => decode('')).toThrow()
  })

  it('throws on random garbage', () => {
    expect(() => decode('zzzzzzzzz')).toThrow()
  })

  it('throws on valid compression but invalid schema', async () => {
    // Encode something that passes decompression but fails validation
    const LZString = (await import('lz-string')).default
    const bad = LZString.compressToEncodedURIComponent(JSON.stringify({ version: 99 }))
    expect(() => decode(bad)).toThrow()
  })
})

describe('validatePayload', () => {
  it('accepts a valid payload', () => {
    expect(() => validatePayload(VALID_PAYLOAD)).not.toThrow()
  })

  it('throws on null', () => {
    expect(() => validatePayload(null)).toThrow()
  })

  it('throws on wrong version', () => {
    expect(() => validatePayload({ ...VALID_PAYLOAD, version: 2 })).toThrow('version')
  })

  it('throws when board is missing', () => {
    const { board: _, ...noBoard } = VALID_PAYLOAD
    expect(() => validatePayload(noBoard)).toThrow()
  })

  it('throws when board dimensions are 0', () => {
    expect(() => validatePayload({ ...VALID_PAYLOAD, board: { width: 0, height: 600 } })).toThrow()
  })

  it('throws when target radius is 0', () => {
    expect(() => validatePayload({
      ...VALID_PAYLOAD,
      target: { x: 400, y: 300, radius: 0 },
    })).toThrow()
  })

  it('throws when maxRicochets is 0', () => {
    expect(() => validatePayload({ ...VALID_PAYLOAD, maxRicochets: 0 })).toThrow()
  })

  it('throws when maxRicochets is not an integer', () => {
    expect(() => validatePayload({ ...VALID_PAYLOAD, maxRicochets: 1.5 })).toThrow()
  })

  it('throws when shapes is not an array', () => {
    expect(() => validatePayload({ ...VALID_PAYLOAD, shapes: null })).toThrow()
  })

  it('throws on unknown shape type', () => {
    const badShape = { id: 'x1', type: 'hexagon', cx: 0, cy: 0 }
    expect(() => validatePayload({ ...VALID_PAYLOAD, shapes: [badShape] })).toThrow()
  })

  it('throws on rect with zero width', () => {
    const badRect = { id: 'r1', type: 'rect', cx: 0, cy: 0, width: 0, height: 10, rotation: 0 }
    expect(() => validatePayload({ ...VALID_PAYLOAD, shapes: [badRect] })).toThrow()
  })

  it('throws on triangle with zero base', () => {
    const badTri = { id: 't1', type: 'triangle', cx: 0, cy: 0, base: 0, height: 10, rotation: 0 }
    expect(() => validatePayload({ ...VALID_PAYLOAD, shapes: [badTri] })).toThrow()
  })

  it('throws on circle with zero radius', () => {
    const badCirc = { id: 'c1', type: 'circle', cx: 0, cy: 0, radius: 0 }
    expect(() => validatePayload({ ...VALID_PAYLOAD, shapes: [badCirc] })).toThrow()
  })

  it('throws when allowedWalls is empty array', () => {
    expect(() => validatePayload({ ...VALID_PAYLOAD, allowedWalls: [] })).toThrow()
  })

  it('throws when allowedWalls contains invalid name', () => {
    expect(() => validatePayload({ ...VALID_PAYLOAD, allowedWalls: ['diagonal' as never] })).toThrow()
  })

  it('accepts payload without allowedWalls (optional field)', () => {
    const { allowedWalls: _, ...noWalls } = VALID_PAYLOAD
    expect(() => validatePayload(noWalls)).not.toThrow()
  })

  it('throws when shape missing id', () => {
    const badShape = { type: 'circle', cx: 0, cy: 0, radius: 10 }
    expect(() => validatePayload({ ...VALID_PAYLOAD, shapes: [badShape] })).toThrow()
  })

  it('throws when shape missing cx', () => {
    const badShape = { id: 's1', type: 'circle', cy: 0, radius: 10 }
    expect(() => validatePayload({ ...VALID_PAYLOAD, shapes: [badShape] })).toThrow()
  })

  it('throws on NaN in board width', () => {
    expect(() => validatePayload({ ...VALID_PAYLOAD, board: { width: NaN, height: 600 } })).toThrow()
  })
})
