import { useRef } from 'react'
import type { RefObject } from 'react'
import { clientToSvg } from '../hooks/useSvgCoords.js'
import Target from '../shared/Target.js'
import type { Target as TargetType, Vec2 } from '../types/index.js'

interface TargetMarkerProps {
  target: TargetType;
  svgRef: RefObject<SVGSVGElement | null>;
  onMove: (pt: Vec2) => void;
}

export default function TargetMarker({ target, svgRef, onMove }: TargetMarkerProps) {
  const dragging = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragging.current = true;

    const onMoveEvt = (me: PointerEvent) => {
      if (!dragging.current) return;
      const pt = clientToSvg(me.clientX, me.clientY, svgRef);
      onMove({ x: pt.x, y: pt.y });
    };

    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('pointermove', onMoveEvt);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMoveEvt);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <g style={{ cursor: 'move' }} onPointerDown={handlePointerDown}>
      <Target target={target} />
    </g>
  );
}
