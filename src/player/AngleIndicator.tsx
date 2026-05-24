import { useRef } from 'react'
import type { RefObject } from 'react'
import { fromAngle, add, scale, angleTo } from '../physics/vector.js'
import { clientToSvg } from '../hooks/useSvgCoords.js'
import { TOUCH_HIT_RADIUS } from '../constants.js'
import type { Vec2 } from '../types/index.js'

const AIM_LENGTH = 60;

interface AngleIndicatorProps {
  startPoint: Vec2;
  angleRad: number;
  svgRef: RefObject<SVGSVGElement | null>;
  onAngleChange: (rad: number) => void;
}

export default function AngleIndicator({ startPoint, angleRad, svgRef, onAngleChange }: AngleIndicatorProps) {
  const dragging = useRef(false);

  const dir = fromAngle(angleRad);
  const tip = add(startPoint, scale(dir, AIM_LENGTH));

  // Arrowhead
  const arrowSize = 8;
  const perpDir: Vec2 = { x: -dir.y, y: dir.x };
  const arrowBase = add(startPoint, scale(dir, AIM_LENGTH - arrowSize * 1.5));
  const arrowL = add(arrowBase, scale(perpDir, arrowSize / 2));
  const arrowR = add(arrowBase, scale(perpDir, -arrowSize / 2));

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragging.current = true;

    const onMove = (me: PointerEvent) => {
      if (!dragging.current) return;
      const pt = clientToSvg(me.clientX, me.clientY, svgRef);
      onAngleChange(angleTo(startPoint, pt));
    };

    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <g>
      {/* Aim line */}
      <line
        x1={startPoint.x} y1={startPoint.y}
        x2={tip.x} y2={tip.y}
        stroke="#ff6b1a" strokeWidth="2" strokeDasharray="6,4"
        style={{ pointerEvents: 'none' }}
      />
      {/* Arrowhead (visual, non-interactive) */}
      <polygon
        points={`${tip.x},${tip.y} ${arrowL.x},${arrowL.y} ${arrowR.x},${arrowR.y}`}
        fill="#ff6b1a"
        stroke="#fff"
        strokeWidth="1"
        style={{ pointerEvents: 'none' }}
      />
      {/* Transparent hit target — 44 px touch area centered on tip */}
      <circle
        cx={tip.x} cy={tip.y}
        r={TOUCH_HIT_RADIUS}
        fill="transparent"
        stroke="none"
        style={{ cursor: 'grab' }}
        onPointerDown={handlePointerDown}
      />
    </g>
  );
}
