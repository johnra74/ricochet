import type { RefObject } from 'react'
import type { Vec2 } from '../types/index.js'

export function clientToSvg(clientX: number, clientY: number, svgRef: RefObject<SVGSVGElement | null>): Vec2 {
  const svg = svgRef.current;
  if (!svg) return { x: 0, y: 0 };
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const transformed = pt.matrixTransform(ctm.inverse());
  return { x: transformed.x, y: transformed.y };
}
