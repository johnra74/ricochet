import type { RefObject, ReactNode, PointerEventHandler, MouseEventHandler, CSSProperties } from 'react'
import type { Board as BoardType, WallName } from '../types/index.js'

interface WallSegDef { x1: number; y1: number; x2: number; y2: number }
type WallSegs = Record<WallName, WallSegDef>

const WALL_SEGMENTS = (w: number, h: number): WallSegs => ({
  top:    { x1: 0, y1: 0,  x2: w, y2: 0  },
  right:  { x1: w, y1: 0,  x2: w, y2: h  },
  bottom: { x1: w, y1: h,  x2: 0, y2: h  },
  left:   { x1: 0, y1: h,  x2: 0, y2: 0  },
});

const WALL_NAMES: WallName[] = ['top', 'right', 'bottom', 'left'];

interface BoardProps {
  board: BoardType;
  svgRef: RefObject<SVGSVGElement | null>;
  children?: ReactNode;
  onPointerDown?: PointerEventHandler<SVGSVGElement>;
  onPointerMove?: PointerEventHandler<SVGSVGElement>;
  onPointerUp?: PointerEventHandler<SVGSVGElement>;
  onClick?: MouseEventHandler<SVGSVGElement>;
  style?: CSSProperties;
  allowedWalls?: WallName[];
}

export default function Board({ board, svgRef, children, onPointerDown, onPointerMove, onPointerUp, onClick, style, allowedWalls }: BoardProps) {
  const { width, height } = board;
  const segs = WALL_SEGMENTS(width, height);
  const showWallStates = Array.isArray(allowedWalls);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ display: 'block', userSelect: 'none', touchAction: 'none', ...style }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={onClick}
    >
      <rect x={0} y={0} width={width} height={height} fill="#111418" />
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff08" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect x={0} y={0} width={width} height={height} fill="url(#grid)" />
      {children}
      {WALL_NAMES.map((wall) => {
        const seg = segs[wall];
        const allowed = !showWallStates || (allowedWalls?.includes(wall) ?? false);
        return (
          <line
            key={wall}
            x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
            stroke={allowed ? '#ff6b1a' : '#252b38'}
            strokeWidth={allowed ? 3 : 2}
            strokeDasharray={allowed ? undefined : '8,6'}
          />
        );
      })}
    </svg>
  );
}
