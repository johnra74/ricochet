import type { GhostState } from '../hooks/useCreatorState.js'

interface GhostShapeProps {
  ghost: GhostState | null;
}

export default function GhostShape({ ghost }: GhostShapeProps) {
  if (!ghost) return null;
  const { shapeType, startSvg, currentSvg } = ghost;
  const dx = currentSvg.x - startSvg.x;
  const dy = currentSvg.y - startSvg.y;

  const style: React.CSSProperties = { pointerEvents: 'none' };
  const commonProps = { fill: '#ffffff15', stroke: '#fff', strokeWidth: 1.5, strokeDasharray: '6,4', style };

  if (shapeType === 'rect') {
    const x = Math.min(startSvg.x, currentSvg.x);
    const y = Math.min(startSvg.y, currentSvg.y);
    const w = Math.max(20, Math.abs(dx));
    const h = Math.max(20, Math.abs(dy));
    return <rect x={x} y={y} width={w} height={h} {...commonProps} />;
  }

  if (shapeType === 'triangle') {
    const cx = (startSvg.x + currentSvg.x) / 2;
    const cy = (startSvg.y + currentSvg.y) / 2;
    const base = Math.max(20, Math.abs(dx));
    const height = Math.max(20, Math.abs(dy));
    const hw = base / 2;
    const h1 = height * (2 / 3);
    const h2 = height / 3;
    const points = `${cx},${cy - h1} ${cx + hw},${cy + h2} ${cx - hw},${cy + h2}`;
    return <polygon points={points} {...commonProps} />;
  }

  if (shapeType === 'circle') {
    const radius = Math.max(10, Math.sqrt(dx * dx + dy * dy) / 2);
    return <circle cx={startSvg.x} cy={startSvg.y} r={radius} {...commonProps} />;
  }

  return null;
}
