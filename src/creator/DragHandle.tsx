import { useRef } from 'react'
import type { RefObject } from 'react'
import { clientToSvg } from '../hooks/useSvgCoords.js'
import { HANDLE_RADIUS, TOUCH_HIT_RADIUS } from '../constants.js'
import type { Vec2 } from '../types/index.js'

interface DragHandleProps {
  x: number;
  y: number;
  svgRef: RefObject<SVGSVGElement | null>;
  onDrag: (pt: Vec2) => void;
  onDragEnd?: () => void;
  shape?: 'circle' | 'square';
  size?: number;
  fill?: string;
  stroke?: string;
  cursor?: string;
}

export default function DragHandle({
  x, y, svgRef, onDrag, onDragEnd,
  shape = 'circle',
  size = HANDLE_RADIUS,
  fill = '#fff',
  stroke = '#ff6b1a',
  cursor = 'grab',
}: DragHandleProps) {
  const dragging = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragging.current = true;

    const onMove = (me: PointerEvent) => {
      if (!dragging.current) return;
      const pt = clientToSvg(me.clientX, me.clientY, svgRef);
      onDrag(pt);
    };

    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      onDragEnd?.();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Transparent hit circle on top — 44 px minimum touch target
  const hitCircle = (
    <circle
      cx={x} cy={y}
      r={TOUCH_HIT_RADIUS}
      fill="transparent"
      stroke="none"
      style={{ cursor }}
      onPointerDown={handlePointerDown}
    />
  );

  if (shape === 'square') {
    return (
      <g>
        <rect
          x={x - size} y={y - size}
          width={size * 2} height={size * 2}
          fill={fill} stroke={stroke} strokeWidth={1.5}
          style={{ pointerEvents: 'none' }}
        />
        {hitCircle}
      </g>
    );
  }

  return (
    <g>
      <circle cx={x} cy={y} r={size} fill={fill} stroke={stroke} strokeWidth={1.5} style={{ pointerEvents: 'none' }} />
      {hitCircle}
    </g>
  );
}
