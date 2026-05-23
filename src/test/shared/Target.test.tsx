import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Target from '../../shared/Target.js';
import type { Target as TargetType } from '../../types/index.js';

describe('Target', () => {
  const target: TargetType = { x: 400, y: 300, radius: 20 };

  it('renders a group element containing circles', () => {
    const { container } = render(<svg><Target target={target} /></svg>);
    const g = container.querySelector('g');
    expect(g).toBeInTheDocument();
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(3);
  });

  it('renders concentric circles all centered at the target position', () => {
    const { container } = render(<svg><Target target={target} /></svg>);
    const circles = container.querySelectorAll('circle');
    circles.forEach((circle) => {
      expect(circle).toHaveAttribute('cx', '400');
      expect(circle).toHaveAttribute('cy', '300');
    });
  });

  it('outermost circle has the full radius', () => {
    const { container } = render(<svg><Target target={target} /></svg>);
    const circles = Array.from(container.querySelectorAll('circle'));
    const radii = circles.map((c) => parseFloat(c.getAttribute('r') ?? '0'));
    expect(Math.max(...radii)).toBeCloseTo(target.radius, 5);
  });

  it('renders crosshair lines', () => {
    const { container } = render(<svg><Target target={target} /></svg>);
    const lines = container.querySelectorAll('line');
    expect(lines).toHaveLength(2);
  });

  it('crosshair lines are centered at the target position', () => {
    const { container } = render(<svg><Target target={target} /></svg>);
    const lines = Array.from(container.querySelectorAll('line'));
    // One horizontal (y1 === y2 === target.y) and one vertical (x1 === x2 === target.x)
    const hasHorizontal = lines.some(
      (l) => l.getAttribute('y1') === '300' && l.getAttribute('y2') === '300'
    );
    const hasVertical = lines.some(
      (l) => l.getAttribute('x1') === '400' && l.getAttribute('x2') === '400'
    );
    expect(hasHorizontal).toBe(true);
    expect(hasVertical).toBe(true);
  });
});
