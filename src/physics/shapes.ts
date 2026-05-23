import { normalize, sub, perp, rotate } from './vector.js'
import type { Vec2, Segment, CircleGeom, Shape, Board, RectShape, TriShape } from '../types/index.js'

function outwardNormal(p1: Vec2, p2: Vec2, center: Vec2): Vec2 {
  const edge = sub(p2, p1);
  const n1 = normalize(perp(edge));
  // Flip if pointing toward center
  const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  const toCenter = sub(center, mid);
  const d = n1.x * toCenter.x + n1.y * toCenter.y;
  return d > 0 ? { x: -n1.x, y: -n1.y } : n1;
}

function makeSegments(vertices: Vec2[], center: Vec2): Segment[] {
  return vertices.map((v, i) => {
    const p1 = v;
    const p2 = vertices[(i + 1) % vertices.length];
    return { p1, p2, normal: outwardNormal(p1, p2, center) };
  });
}

export function rectToSegments(shape: RectShape): Segment[] {
  const { cx, cy, width, height, rotation } = shape;
  const rad = (rotation * Math.PI) / 180;
  const hw = width / 2;
  const hh = height / 2;
  const localCorners: Vec2[] = [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh },
  ];
  const vertices = localCorners.map((p) => {
    const r = rotate(p, rad);
    return { x: r.x + cx, y: r.y + cy };
  });
  return makeSegments(vertices, { x: cx, y: cy });
}

export function triangleToSegments(shape: TriShape): Segment[] {
  const { cx, cy, base, height, rotation } = shape;
  const rad = (rotation * Math.PI) / 180;
  // Tip at top (local -y), base at bottom (local +y)
  const localVerts: Vec2[] = [
    { x: 0, y: -height * (2 / 3) },
    { x: base / 2, y: height / 3 },
    { x: -base / 2, y: height / 3 },
  ];
  const vertices = localVerts.map((p) => {
    const r = rotate(p, rad);
    return { x: r.x + cx, y: r.y + cy };
  });
  return makeSegments(vertices, { x: cx, y: cy });
}

export function circleToGeom(shape: { cx: number; cy: number; radius: number }): CircleGeom {
  return { cx: shape.cx, cy: shape.cy, radius: shape.radius };
}

export function wallSegments(board: Board): Segment[] {
  const { width, height } = board;
  return [
    // Top wall - inward normal points down
    { p1: { x: 0, y: 0 }, p2: { x: width, y: 0 }, normal: { x: 0, y: 1 } },
    // Right wall - inward normal points left
    { p1: { x: width, y: 0 }, p2: { x: width, y: height }, normal: { x: -1, y: 0 } },
    // Bottom wall - inward normal points up
    { p1: { x: width, y: height }, p2: { x: 0, y: height }, normal: { x: 0, y: -1 } },
    // Left wall - inward normal points right
    { p1: { x: 0, y: height }, p2: { x: 0, y: 0 }, normal: { x: 1, y: 0 } },
  ];
}

// O — Open/Closed: dispatch table instead of switch
type GeomFn = (shape: Shape) => Segment[]

const shapeGeomRegistry: Record<string, GeomFn> = {
  rect: (s) => rectToSegments(s as RectShape),
  triangle: (s) => triangleToSegments(s as TriShape),
  circle: () => [],  // circles handled separately via circleToGeom
}

export function shapeToSegments(shape: Shape): Segment[] {
  return shapeGeomRegistry[shape.type]?.(shape) ?? []
}
