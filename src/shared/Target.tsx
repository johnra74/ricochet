import type { Target as TargetType } from '../types/index.js'

interface TargetProps {
  target: TargetType;
}

export default function Target({ target }: TargetProps) {
  const { x, y, radius } = target;
  return (
    <g>
      <circle cx={x} cy={y} r={radius} fill="#ff6b6b33" stroke="#ff6b6b" strokeWidth="2" />
      <circle cx={x} cy={y} r={radius * 0.6} fill="#ff6b6b55" stroke="#ff6b6b" strokeWidth="1.5" />
      <circle cx={x} cy={y} r={radius * 0.25} fill="#ff6b6b" />
      {/* crosshair */}
      <line x1={x - radius - 5} y1={y} x2={x + radius + 5} y2={y} stroke="#ff6b6b" strokeWidth="1" opacity="0.7" />
      <line x1={x} y1={y - radius - 5} x2={x} y2={y + radius + 5} stroke="#ff6b6b" strokeWidth="1" opacity="0.7" />
    </g>
  );
}
