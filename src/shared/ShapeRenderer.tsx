import type { MouseEventHandler, CSSProperties } from 'react'
import { SHAPE_COLORS } from '../constants.js'
import type { Shape } from '../types/index.js'

interface ShapeRendererProps {
  shape: Shape;
  selected?: boolean;
  dimmed?: boolean;
  onClick?: MouseEventHandler<SVGElement>;
}

export default function ShapeRenderer({ shape, selected, dimmed, onClick }: ShapeRendererProps) {
  const color = SHAPE_COLORS[shape.type];
  const fill = dimmed ? `${color}55` : `${color}99`;
  const stroke = selected ? '#fff' : color;
  const strokeWidth = selected ? 2.5 : 1.5;
  const style: CSSProperties = onClick ? { cursor: 'move' } : {};

  if (shape.type === 'rect') {
    return (
      <rect
        x={shape.cx - shape.width / 2}
        y={shape.cy - shape.height / 2}
        width={shape.width}
        height={shape.height}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        transform={`rotate(${shape.rotation}, ${shape.cx}, ${shape.cy})`}
        style={style}
        onClick={onClick as MouseEventHandler<SVGRectElement>}
      />
    );
  }

  if (shape.type === 'triangle') {
    const { cx, cy, base, height, rotation } = shape;
    const hw = base / 2;
    const h1 = height * (2 / 3);
    const h2 = height / 3;
    const points = `0,${-h1} ${hw},${h2} ${-hw},${h2}`;
    return (
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        transform={`translate(${cx},${cy}) rotate(${rotation})`}
        style={style}
        onClick={onClick as MouseEventHandler<SVGPolygonElement>}
      />
    );
  }

  if (shape.type === 'circle') {
    return (
      <circle
        cx={shape.cx}
        cy={shape.cy}
        r={shape.radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        style={style}
        onClick={onClick as MouseEventHandler<SVGCircleElement>}
      />
    );
  }

  return null;
}
