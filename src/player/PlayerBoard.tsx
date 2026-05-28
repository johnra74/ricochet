import { useRef, useCallback } from 'react'
import Board from '../shared/Board.js'
import ShapeRenderer from '../shared/ShapeRenderer.js'
import Target from '../shared/Target.js'
import StartPointHandle from './StartPointHandle.js'
import AngleIndicator from './AngleIndicator.js'
import BallPath from './BallPath.js'
import PreviewPath from './PreviewPath.js'
import { clientToSvg } from '../hooks/useSvgCoords.js'
import type { Payload, Vec2, SimResult } from '../types/index.js'
import type { PlayerState } from '../hooks/usePlayerState.js'

interface PlayerBoardProps {
  payload: Payload;
  playerState: PlayerState;
  setStart: (pt: Vec2) => void;
  setAngle: (rad: number) => void;
  aimAt: (pt: Vec2) => void;
  previewResult?: SimResult | null;
}

export default function PlayerBoard({ payload, playerState, setStart, setAngle, aimAt, previewResult }: PlayerBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { board, target, shapes, allowedWalls } = payload;
  const { startPoint, angleRad, phase, result, animFrac, ballPos } = playerState;

  const handleBoardClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (phase !== 'aiming') return;
    // Any click on the board (that wasn't stopped by a handle) aims toward that point
    const pt = clientToSvg(e.clientX, e.clientY, svgRef);
    aimAt(pt);
  }, [phase, aimAt]);

  return (
    <div className="board-area">
      <Board
        board={board}
        svgRef={svgRef}
        onClick={handleBoardClick}
        allowedWalls={allowedWalls}
        style={{ boxShadow: '0 8px 32px #0008' }}
      >
        {shapes.map((s) => <ShapeRenderer key={s.id} shape={s} />)}
        <Target target={target} />

        {result && (
          <BallPath
            path={result.path}
            animFrac={animFrac}
            ballPos={ballPos}
            outcome={result.outcome}
          />
        )}

        {previewResult && phase === 'aiming' && (
          <PreviewPath path={previewResult.path} outcome={previewResult.outcome} />
        )}

        {previewResult && phase === 'aiming' && (
          <text
            x={board.width - 10}
            y={22}
            textAnchor="end"
            fontSize="13"
            fontFamily="monospace"
            fill={previewResult.outcome === 'win' ? '#ffd580' : '#e6e8ed'}
            opacity={0.85}
            style={{ pointerEvents: 'none' }}
          >
            {previewResult.ricochetCount} / {payload.maxRicochets}
          </text>
        )}

        {startPoint && phase === 'aiming' && (
          <>
            <StartPointHandle
              startPoint={startPoint}
              svgRef={svgRef}
              onMove={setStart}
            />
            <AngleIndicator
              startPoint={startPoint}
              angleRad={angleRad}
              svgRef={svgRef}
              onAngleChange={setAngle}
            />
          </>
        )}

        {startPoint && phase !== 'aiming' && (
          <StartPointHandle
            startPoint={startPoint}
            svgRef={svgRef}
            onMove={() => {}}
          />
        )}
      </Board>
    </div>
  );
}
