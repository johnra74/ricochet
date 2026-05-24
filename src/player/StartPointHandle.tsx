import { useRef } from 'react'
import type { RefObject } from 'react'
import { clientToSvg } from '../hooks/useSvgCoords.js'
import { TOUCH_HIT_RADIUS } from '../constants.js'
import type { Vec2 } from '../types/index.js'

interface StartPointHandleProps {
  startPoint: Vec2;
  svgRef: RefObject<SVGSVGElement | null>;
  onMove: (pt: Vec2) => void;
}

export default function StartPointHandle({ startPoint, svgRef, onMove }: StartPointHandleProps) {
  const dragging = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragging.current = true;

    const onMoveEvt = (me: PointerEvent) => {
      if (!dragging.current) return;
      const pt = clientToSvg(me.clientX, me.clientY, svgRef);
      onMove(pt);
    };

    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('pointermove', onMoveEvt);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMoveEvt);
    window.addEventListener('pointerup', onUp);
  };

  const { x, y } = startPoint;

  return (
    <g style={{ cursor: 'grab' }}>
      {/* Outer glow ring */}
      <circle cx={x} cy={y} r={14} fill="none" stroke="#ff6b1a" strokeWidth="1" opacity="0.4" style={{ pointerEvents: 'none' }} />
      <circle cx={x} cy={y} r={10} fill="#ff6b1a" stroke="#fff" strokeWidth="2" style={{ pointerEvents: 'none' }} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fill="#0d0f14" fontWeight="bold" style={{ pointerEvents: 'none' }}>S</text>
      {/* Transparent hit target — 44 px touch area */}
      <circle cx={x} cy={y} r={TOUCH_HIT_RADIUS} fill="transparent" stroke="none" onPointerDown={handlePointerDown} />
    </g>
  );
}
