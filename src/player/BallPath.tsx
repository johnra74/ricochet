import { useRef, useEffect } from 'react'
import type { Vec2, Outcome } from '../types/index.js'

function pathD(points: Vec2[]): string {
  if (!points || points.length < 2) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
}

interface BallPathProps {
  path: Vec2[];
  animFrac: number;
  ballPos: Vec2 | null;
  outcome: Outcome;
}

export default function BallPath({ path, animFrac, ballPos, outcome }: BallPathProps) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    const totalLen = pathRef.current.getTotalLength();
    const revealedLength = animFrac * totalLen;
    pathRef.current.style.strokeDasharray = `${revealedLength} ${totalLen + 1}`;
  }, [animFrac]);

  if (!path || path.length < 2) return null;

  const trailColor = outcome === 'win' ? '#ffd580' : '#ff6b1a';
  const ballColor = outcome === 'win' ? '#ffd580' : '#e6e8ed';

  return (
    <g>
      {/* Full faint ghost path */}
      <path
        d={pathD(path)}
        fill="none"
        stroke="#ffffff15"
        strokeWidth="1.5"
        style={{ pointerEvents: 'none' }}
      />
      {/* Revealed animated portion */}
      <path
        ref={pathRef}
        d={pathD(path)}
        fill="none"
        stroke={trailColor}
        strokeWidth="2.5"
        strokeDasharray="0 99999"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pointerEvents: 'none' }}
      />
      {/* Ricochet dots at each bounce point */}
      {path.slice(1, -1).map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r={4} fill={trailColor} opacity={0.7} />
      ))}
      {/* Ball */}
      {ballPos && (
        <>
          <circle cx={ballPos.x} cy={ballPos.y} r={9} fill={ballColor} opacity={0.2} />
          <circle cx={ballPos.x} cy={ballPos.y} r={6} fill={ballColor} stroke="#fff" strokeWidth="1.5" />
        </>
      )}
    </g>
  );
}
