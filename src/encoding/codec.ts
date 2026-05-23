import LZString from 'lz-string'
import { validatePayload } from './schema.js'
import type { Payload } from '../types/index.js'

export function encode(payload: Payload): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
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
  return obj;
}
