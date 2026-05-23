import { describe, it, expect } from 'vitest';
import { rectToSegments, triangleToSegments, wallSegments, shapeToSegments } from '../../physics/shapes.js';
import type { RectShape, TriShape, CircShape, Shape, Board } from '../../types/index.js';

describe('rectToSegments', () => {
  it('produces exactly 4 segments for an axis-aligned rect', () => {
    const shape: RectShape = { id: '1', type: 'rect', cx: 100, cy: 100, width: 80, height: 60, rotation: 0 };
    const segs = rectToSegments(shape);
    expect(segs).toHaveLength(4);
  });

  it('normals point outward from the rect center', () => {
    const shape: RectShape = { id: '1', type: 'rect', cx: 100, cy: 100, width: 80, height: 60, rotation: 0 };
    const segs = rectToSegments(shape);
    for (const seg of segs) {
      // Mid of segment
      const mx = (seg.p1.x + seg.p2.x) / 2;
      const my = (seg.p1.y + seg.p2.y) / 2;
      // Normal should point away from center
      const toCenterX = shape.cx - mx;
      const toCenterY = shape.cy - my;
      const dot = seg.normal.x * toCenterX + seg.normal.y * toCenterY;
      expect(dot).toBeLessThan(0); // outward = opposite to center direction
    }
  });

  it('produces segments with unit-length normals', () => {
    const shape: RectShape = { id: '1', type: 'rect', cx: 200, cy: 150, width: 60, height: 40, rotation: 0 };
    const segs = rectToSegments(shape);
    for (const seg of segs) {
      const l = Math.sqrt(seg.normal.x ** 2 + seg.normal.y ** 2);
      expect(l).toBeCloseTo(1, 5);
    }
  });

  it('rotated rect produces rotated normals', () => {
    const axis: RectShape = { id: '1', type: 'rect', cx: 100, cy: 100, width: 80, height: 60, rotation: 0 };
    const rotated: RectShape = { id: '2', type: 'rect', cx: 100, cy: 100, width: 80, height: 60, rotation: 45 };
    const axisSegs = rectToSegments(axis);
    const rotatedSegs = rectToSegments(rotated);
    // A 45° rotation should produce different normals
    expect(rotatedSegs[0].normal.x).not.toBeCloseTo(axisSegs[0].normal.x, 1);
  });
});

describe('triangleToSegments', () => {
  it('produces exactly 3 segments', () => {
    const shape: TriShape = { id: '1', type: 'triangle', cx: 100, cy: 100, base: 60, height: 80, rotation: 0 };
    const segs = triangleToSegments(shape);
    expect(segs).toHaveLength(3);
  });

  it('normals point outward from the triangle center', () => {
    const shape: TriShape = { id: '1', type: 'triangle', cx: 100, cy: 100, base: 60, height: 80, rotation: 0 };
    const segs = triangleToSegments(shape);
    for (const seg of segs) {
      const mx = (seg.p1.x + seg.p2.x) / 2;
      const my = (seg.p1.y + seg.p2.y) / 2;
      const toCenterX = shape.cx - mx;
      const toCenterY = shape.cy - my;
      const dot = seg.normal.x * toCenterX + seg.normal.y * toCenterY;
      expect(dot).toBeLessThan(0);
    }
  });

  it('segments are closed (each segment p2 connects to next segment p1)', () => {
    const shape: TriShape = { id: '1', type: 'triangle', cx: 0, cy: 0, base: 60, height: 80, rotation: 0 };
    const segs = triangleToSegments(shape);
    for (let i = 0; i < segs.length; i++) {
      const next = segs[(i + 1) % segs.length];
      expect(segs[i].p2.x).toBeCloseTo(next.p1.x, 5);
      expect(segs[i].p2.y).toBeCloseTo(next.p1.y, 5);
    }
  });
});

describe('wallSegments', () => {
  const board: Board = { width: 800, height: 600 };

  it('produces exactly 4 segments', () => {
    expect(wallSegments(board)).toHaveLength(4);
  });

  it('top wall has inward normal pointing down', () => {
    const segs = wallSegments(board);
    const top = segs[0]; // top
    expect(top.normal).toEqual({ x: 0, y: 1 });
  });

  it('right wall has inward normal pointing left', () => {
    const segs = wallSegments(board);
    const right = segs[1]; // right
    expect(right.normal).toEqual({ x: -1, y: 0 });
  });

  it('bottom wall has inward normal pointing up', () => {
    const segs = wallSegments(board);
    const bottom = segs[2]; // bottom
    expect(bottom.normal).toEqual({ x: 0, y: -1 });
  });

  it('left wall has inward normal pointing right', () => {
    const segs = wallSegments(board);
    const left = segs[3]; // left
    expect(left.normal).toEqual({ x: 1, y: 0 });
  });

  it('covers the full board perimeter', () => {
    const segs = wallSegments(board);
    // top-left corner should appear in segments
    const hasTopLeft = segs.some(
      (s) => (s.p1.x === 0 && s.p1.y === 0) || (s.p2.x === 0 && s.p2.y === 0)
    );
    expect(hasTopLeft).toBe(true);
  });
});

describe('shapeToSegments', () => {
  it('dispatches to rectToSegments for rect shapes', () => {
    const shape: Shape = { id: '1', type: 'rect', cx: 100, cy: 100, width: 50, height: 30, rotation: 0 };
    const segs = shapeToSegments(shape);
    expect(segs).toHaveLength(4);
  });

  it('dispatches to triangleToSegments for triangle shapes', () => {
    const shape: Shape = { id: '1', type: 'triangle', cx: 100, cy: 100, base: 60, height: 80, rotation: 0 };
    const segs = shapeToSegments(shape);
    expect(segs).toHaveLength(3);
  });

  it('returns empty array for circle shapes (handled via circleToGeom)', () => {
    const shape: Shape = { id: '1', type: 'circle', cx: 100, cy: 100, radius: 30 };
    const segs = shapeToSegments(shape);
    expect(segs).toHaveLength(0);
  });
});
