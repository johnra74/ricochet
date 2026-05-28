import type { Vec2, Outcome } from '../types/index.js'

function pathD(points: Vec2[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
}

interface PreviewPathProps {
  path: Vec2[];
  outcome: Outcome;
}

export default function PreviewPath({ path, outcome }: PreviewPathProps) {
  if (!path || path.length < 2) return null;

  const color = outcome === 'win' ? '#ffd580' : '#e6e8ed';

  return (
    <g style={{ pointerEvents: 'none' }}>
      <path
        d={pathD(path)}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="8 5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.45}
      />
      {path.slice(1, -1).map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r={3} fill={color} opacity={0.5} style={{ pointerEvents: 'none' }} />
      ))}
    </g>
  );
}
