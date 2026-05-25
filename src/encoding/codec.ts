import LZString from 'lz-string'
import { v4 as uuidv4 } from 'uuid'
import { validatePayload } from './schema.js'
import type { Payload } from '../types/index.js'

export function encode(payload: Payload): string {
  const compact = {
    ...payload,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shapes: payload.shapes.map(({ id: _id, ...rest }) => rest),
  };
  return LZString.compressToEncodedURIComponent(JSON.stringify(compact));
}

export function decode(str: string): Payload {
  let json: string | null;
  try {
    json = LZString.decompressFromEncodedURIComponent(str);
  } catch {
    throw new Error('Decompression failed');
  }
  if (!json) throw new Error('Invalid or corrupted game data');
  let obj: unknown;
  try {
    obj = JSON.parse(json);
  } catch {
    throw new Error('Failed to parse game data');
  }
  validatePayload(obj);
  const p = obj as Payload;
  return { ...p, shapes: p.shapes.map((s) => ({ ...s, id: uuidv4() })) };
}
