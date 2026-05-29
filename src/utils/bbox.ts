import type { Shape } from '../types/index.js'

export interface BBox { left: number; right: number; top: number; bottom: number }

export function shapeBBox(shape: Shape): BBox {
  if (shape.type === 'circle') {
    return {
      left: shape.cx - shape.radius,
      right: shape.cx + shape.radius,
      top: shape.cy - shape.radius,
      bottom: shape.cy + shape.radius,
    };
  }

  const rad = (shape.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const rot = (x: number, y: number) => ({ x: x * cos - y * sin + shape.cx, y: x * sin + y * cos + shape.cy });

  let pts: { x: number; y: number }[];
  if (shape.type === 'rect') {
    const hw = shape.width / 2;
    const hh = shape.height / 2;
    pts = [rot(-hw, -hh), rot(hw, -hh), rot(hw, hh), rot(-hw, hh)];
  } else {
    // triangle: centroid at (cx,cy); vertices match triangleToSegments in physics/shapes.ts
    pts = [rot(0, -(shape.height * 2) / 3), rot(shape.base / 2, shape.height / 3), rot(-shape.base / 2, shape.height / 3)];
  }

  return {
    left: Math.min(...pts.map((p) => p.x)),
    right: Math.max(...pts.map((p) => p.x)),
    top: Math.min(...pts.map((p) => p.y)),
    bottom: Math.max(...pts.map((p) => p.y)),
  };
}
