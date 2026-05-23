import { useRef } from 'react'
import Board from '../shared/Board.js'
import ShapeOverlay from './ShapeOverlay.js'
import GhostShape from './GhostShape.js'
import TargetMarker from './TargetMarker.js'
import { clientToSvg } from '../hooks/useSvgCoords.js'
import type { CreatorState, CreatorAction } from '../hooks/useCreatorState.js'
import type { Dispatch } from 'react'

const DRAW_TOOLS = ['rect', 'triangle', 'circle'] as const;
type DrawTool = typeof DRAW_TOOLS[number];

interface BoardCanvasProps {
  state: CreatorState;
  dispatch: Dispatch<CreatorAction>;
}

export default function BoardCanvas({ state, dispatch }: BoardCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { board, target, shapes, selectedId, activeTool, ghost, allowedWalls } = state;

  const getSvgPt = (e: React.PointerEvent) => clientToSvg(e.clientX, e.clientY, svgRef);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const pt = getSvgPt(e);

    if (activeTool === 'target') {
      dispatch({ type: 'SET_TARGET', updates: { x: pt.x, y: pt.y } });
      dispatch({ type: 'SET_TOOL', tool: 'select' });
      return;
    }

    if (DRAW_TOOLS.includes(activeTool as DrawTool)) {
      dispatch({ type: 'GHOST_START', shapeType: activeTool as DrawTool, pt });
      return;
    }

    dispatch({ type: 'DESELECT' });
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!ghost) return;
    const pt = getSvgPt(e);
    dispatch({ type: 'GHOST_MOVE', pt });
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!ghost) return;
    const pt = getSvgPt(e);
    dispatch({ type: 'GHOST_MOVE', pt });
    dispatch({ type: 'GHOST_COMMIT' });
  };

  const cursor =
    activeTool === 'target' || DRAW_TOOLS.includes(activeTool as DrawTool)
      ? 'crosshair'
      : 'default';

  return (
    <div className="board-area">
      <Board
        board={board}
        svgRef={svgRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        allowedWalls={allowedWalls}
        style={{ cursor, boxShadow: '0 8px 32px #0008' }}
      >
        <ShapeOverlay
          shapes={shapes}
          selectedId={selectedId}
          svgRef={svgRef}
          onSelect={(id) => dispatch({ type: 'SELECT', id })}
          onUpdate={(id, updates) => dispatch({ type: 'UPDATE_SHAPE', id, updates })}
        />
        <GhostShape ghost={ghost} />
        <TargetMarker
          target={target}
          svgRef={svgRef}
          onMove={(updates) => dispatch({ type: 'SET_TARGET', updates })}
        />
      </Board>
    </div>
  );
}
