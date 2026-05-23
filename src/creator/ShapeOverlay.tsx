import { useRef } from 'react'
import type { RefObject } from 'react'
import ShapeRenderer from '../shared/ShapeRenderer.js'
import DragHandle from './DragHandle.js'
import { clientToSvg } from '../hooks/useSvgCoords.js'
import { HANDLE_RADIUS, ROTATE_ARM_LENGTH, SHAPE_COLORS } from '../constants.js'
import { rotate as rotateVec } from '../physics/vector.js'
import type { Shape, RectShape, TriShape, CircShape, Vec2 } from '../types/index.js'

interface ResizeHandlesProps {
  shape: Shape;
  svgRef: RefObject<SVGSVGElement | null>;
  onUpdate: (updates: Partial<Shape>) => void;
}

function ResizeHandles({ shape, svgRef, onUpdate }: ResizeHandlesProps) {
  if (shape.type === 'rect') {
    const s = shape as RectShape;
    const rad = (s.rotation * Math.PI) / 180;
    const hw = s.width / 2;
    const hh = s.height / 2;
    const corners: { lx: number; ly: number; cursor: string }[] = [
      { lx: -hw, ly: -hh, cursor: 'nwse-resize' },
      { lx: hw, ly: -hh, cursor: 'nesw-resize' },
      { lx: hw, ly: hh, cursor: 'nwse-resize' },
      { lx: -hw, ly: hh, cursor: 'nesw-resize' },
    ];

    return <>{corners.map(({ lx, ly, cursor }, i) => {
      const world = rotateVec({ x: lx, y: ly }, rad);
      const wx = s.cx + world.x;
      const wy = s.cy + world.y;

      const onDrag = (pt: Vec2) => {
        // Rotate pt back to local space
        const local = rotateVec({ x: pt.x - s.cx, y: pt.y - s.cy }, -rad);
        const newHw = Math.max(10, Math.abs(local.x));
        const newHh = Math.max(10, Math.abs(local.y));
        onUpdate({ width: newHw * 2, height: newHh * 2 });
      };

      return (
        <DragHandle
          key={i}
          x={wx} y={wy}
          svgRef={svgRef}
          onDrag={onDrag}
          shape="square"
          cursor={cursor}
          fill={SHAPE_COLORS.rect}
          stroke="#fff"
        />
      );
    })}</>;
  }

  if (shape.type === 'triangle') {
    const s = shape as TriShape;
    const rad = (s.rotation * Math.PI) / 180;
    const baseHandleLocal: Vec2 = { x: s.base / 2, y: s.height / 3 };
    const topHandleLocal: Vec2 = { x: 0, y: -(s.height * 2) / 3 };

    const baseWorld = rotateVec(baseHandleLocal, rad);
    const topWorld = rotateVec(topHandleLocal, rad);

    return (
      <>
        <DragHandle
          x={s.cx + baseWorld.x} y={s.cy + baseWorld.y}
          svgRef={svgRef}
          onDrag={(pt) => {
            const local = rotateVec({ x: pt.x - s.cx, y: pt.y - s.cy }, -rad);
            onUpdate({ base: Math.max(20, Math.abs(local.x) * 2) });
          }}
          shape="square"
          cursor="ew-resize"
          fill={SHAPE_COLORS.triangle}
          stroke="#fff"
        />
        <DragHandle
          x={s.cx + topWorld.x} y={s.cy + topWorld.y}
          svgRef={svgRef}
          onDrag={(pt) => {
            const local = rotateVec({ x: pt.x - s.cx, y: pt.y - s.cy }, -rad);
            onUpdate({ height: Math.max(20, Math.abs(local.y) * (3 / 2)) });
          }}
          shape="square"
          cursor="ns-resize"
          fill={SHAPE_COLORS.triangle}
          stroke="#fff"
        />
      </>
    );
  }

  if (shape.type === 'circle') {
    const s = shape as CircShape;
    return (
      <DragHandle
        x={s.cx + s.radius} y={s.cy}
        svgRef={svgRef}
        onDrag={(pt) => {
          const dx = pt.x - s.cx;
          const dy = pt.y - s.cy;
          onUpdate({ radius: Math.max(10, Math.sqrt(dx * dx + dy * dy)) });
        }}
        cursor="ew-resize"
        fill={SHAPE_COLORS.circle}
        stroke="#fff"
      />
    );
  }

  return null;
}

interface RotateHandleProps {
  shape: RectShape | TriShape;
  svgRef: RefObject<SVGSVGElement | null>;
  onUpdate: (updates: Partial<Shape>) => void;
}

function RotateHandle({ shape, svgRef, onUpdate }: RotateHandleProps) {
  const rad = (shape.rotation * Math.PI) / 180;
  const armOffset = shape.type === 'rect' ? shape.height / 2 : (shape.height * 2) / 3;
  const armLocal: Vec2 = { x: 0, y: -(ROTATE_ARM_LENGTH + armOffset) };
  const armWorld = rotateVec(armLocal, rad);
  const wx = shape.cx + armWorld.x;
  const wy = shape.cy + armWorld.y;

  const onDrag = (pt: Vec2) => {
    const dx = pt.x - shape.cx;
    const dy = pt.y - shape.cy;
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    onUpdate({ rotation: ((angleDeg % 360) + 360) % 360 });
  };

  return (
    <>
      <line
        x1={shape.cx} y1={shape.cy}
        x2={wx} y2={wy}
        stroke="#ffffff55" strokeWidth="1" strokeDasharray="3,3"
      />
      <DragHandle
        x={wx} y={wy}
        svgRef={svgRef}
        onDrag={onDrag}
        cursor="crosshair"
        fill="#ffe082"
        stroke="#fff"
        size={HANDLE_RADIUS - 1}
      />
    </>
  );
}

interface MoveStart {
  svgPt: Vec2;
  cx: number;
  cy: number;
  id: string;
}

interface ShapeOverlayProps {
  shapes: Shape[];
  selectedId: string | null;
  svgRef: RefObject<SVGSVGElement | null>;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Shape>) => void;
}

export default function ShapeOverlay({ shapes, selectedId, svgRef, onSelect, onUpdate }: ShapeOverlayProps) {
  const moveStart = useRef<MoveStart | null>(null);

  return (
    <>
      {shapes.map((shape) => {
        const isSelected = shape.id === selectedId;

        const handleBodyPointerDown = (e: React.PointerEvent<SVGGElement>) => {
          const tag = (e.target as Element).tagName;
          if (tag !== 'circle' && tag !== 'rect' && tag !== 'polygon') return;
          e.stopPropagation();
          onSelect(shape.id);
          const svgPt = clientToSvg(e.clientX, e.clientY, svgRef);
          moveStart.current = { svgPt, cx: shape.cx, cy: shape.cy, id: shape.id };

          const onMoveEvt = (me: PointerEvent) => {
            if (!moveStart.current || moveStart.current.id !== shape.id) return;
            const cur = clientToSvg(me.clientX, me.clientY, svgRef);
            const dx = cur.x - moveStart.current.svgPt.x;
            const dy = cur.y - moveStart.current.svgPt.y;
            onUpdate(shape.id, { cx: moveStart.current.cx + dx, cy: moveStart.current.cy + dy });
          };

          const onUp = () => {
            moveStart.current = null;
            window.removeEventListener('pointermove', onMoveEvt);
            window.removeEventListener('pointerup', onUp);
          };

          window.addEventListener('pointermove', onMoveEvt);
          window.addEventListener('pointerup', onUp);
        };

        return (
          <g key={shape.id} onPointerDown={handleBodyPointerDown}>
            <ShapeRenderer shape={shape} selected={isSelected} />
            {isSelected && (
              <>
                <ResizeHandles
                  shape={shape}
                  svgRef={svgRef}
                  onUpdate={(u) => onUpdate(shape.id, u)}
                />
                {shape.type !== 'circle' && (
                  <RotateHandle
                    shape={shape}
                    svgRef={svgRef}
                    onUpdate={(u) => onUpdate(shape.id, u)}
                  />
                )}
              </>
            )}
          </g>
        );
      })}
    </>
  );
}
