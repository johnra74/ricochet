import type { Vec2 } from '../types/index.js'

export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (v: Vec2, s: number): Vec2 => ({ x: v.x * s, y: v.y * s });
export const dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;
export const len = (v: Vec2): number => Math.sqrt(v.x * v.x + v.y * v.y);
export const normalize = (v: Vec2): Vec2 => {
  const l = len(v);
  return l < 1e-12 ? { x: 0, y: 0 } : { x: v.x / l, y: v.y / l };
};
export const rotate = (v: Vec2, rad: number): Vec2 => ({
  x: v.x * Math.cos(rad) - v.y * Math.sin(rad),
  y: v.x * Math.sin(rad) + v.y * Math.cos(rad),
});
export const lerp = (a: Vec2, b: Vec2, t: number): Vec2 => add(a, scale(sub(b, a), t));
export const distance = (a: Vec2, b: Vec2): number => len(sub(a, b));
export const perp = (v: Vec2): Vec2 => ({ x: -v.y, y: v.x }); // 90° CCW
export const fromAngle = (rad: number): Vec2 => ({ x: Math.cos(rad), y: Math.sin(rad) });
export const angleTo = (from: Vec2, to: Vec2): number => Math.atan2(to.y - from.y, to.x - from.x);
