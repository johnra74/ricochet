import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ShapeRenderer from '../../shared/ShapeRenderer.js';
import type { Shape } from '../../types/index.js';

describe('ShapeRenderer', () => {
  it('renders a <rect> element for a rect shape', () => {
    const shape: Shape = { id: '1', type: 'rect', cx: 100, cy: 100, width: 80, height: 60, rotation: 0 };
    const { container } = render(<svg><ShapeRenderer shape={shape} /></svg>);
    expect(container.querySelector('rect')).toBeInTheDocument();
  });

  it('positions the rect using cx, cy, width, height', () => {
    const shape: Shape = { id: '1', type: 'rect', cx: 100, cy: 100, width: 80, height: 60, rotation: 0 };
    const { container } = render(<svg><ShapeRenderer shape={shape} /></svg>);
    const rect = container.querySelector('rect');
    expect(rect).toHaveAttribute('x', '60'); // cx - width/2 = 100 - 40
    expect(rect).toHaveAttribute('y', '70'); // cy - height/2 = 100 - 30
    expect(rect).toHaveAttribute('width', '80');
    expect(rect).toHaveAttribute('height', '60');
  });

  it('renders a <polygon> element for a triangle shape', () => {
    const shape: Shape = { id: '1', type: 'triangle', cx: 100, cy: 100, base: 60, height: 80, rotation: 0 };
    const { container } = render(<svg><ShapeRenderer shape={shape} /></svg>);
    expect(container.querySelector('polygon')).toBeInTheDocument();
  });

  it('renders a <circle> element for a circle shape', () => {
    const shape: Shape = { id: '1', type: 'circle', cx: 150, cy: 150, radius: 30 };
    const { container } = render(<svg><ShapeRenderer shape={shape} /></svg>);
    expect(container.querySelector('circle')).toBeInTheDocument();
  });

  it('circle element has correct cx, cy, and r attributes', () => {
    const shape: Shape = { id: '1', type: 'circle', cx: 200, cy: 300, radius: 45 };
    const { container } = render(<svg><ShapeRenderer shape={shape} /></svg>);
    const circle = container.querySelector('circle');
    expect(circle).toHaveAttribute('cx', '200');
    expect(circle).toHaveAttribute('cy', '300');
    expect(circle).toHaveAttribute('r', '45');
  });

  it('unselected shape uses shape color for stroke', () => {
    const shape: Shape = { id: '1', type: 'circle', cx: 100, cy: 100, radius: 20 };
    const { container } = render(<svg><ShapeRenderer shape={shape} selected={false} /></svg>);
    const circle = container.querySelector('circle');
    // Unselected circle uses SHAPE_COLORS.circle = '#27ae60'
    expect(circle?.getAttribute('stroke')).toBe('#27ae60');
  });

  it('selected shape uses white (#fff) stroke', () => {
    const shape: Shape = { id: '1', type: 'circle', cx: 100, cy: 100, radius: 20 };
    const { container } = render(<svg><ShapeRenderer shape={shape} selected={true} /></svg>);
    const circle = container.querySelector('circle');
    expect(circle?.getAttribute('stroke')).toBe('#fff');
  });

  it('selected shape has a larger stroke width than unselected', () => {
    const shape: Shape = { id: '1', type: 'rect', cx: 100, cy: 100, width: 60, height: 40, rotation: 0 };
    const { container: selContainer } = render(<svg><ShapeRenderer shape={shape} selected={true} /></svg>);
    const { container: unselContainer } = render(<svg><ShapeRenderer shape={shape} selected={false} /></svg>);
    const selWidth = parseFloat(selContainer.querySelector('rect')!.getAttribute('stroke-width') ?? '0');
    const unselWidth = parseFloat(unselContainer.querySelector('rect')!.getAttribute('stroke-width') ?? '0');
    expect(selWidth).toBeGreaterThan(unselWidth);
  });

  it('dimmed shape uses a more transparent fill', () => {
    const shape: Shape = { id: '1', type: 'rect', cx: 100, cy: 100, width: 60, height: 40, rotation: 0 };
    const { container: dimContainer } = render(<svg><ShapeRenderer shape={shape} dimmed={true} /></svg>);
    const { container: normalContainer } = render(<svg><ShapeRenderer shape={shape} dimmed={false} /></svg>);
    const dimFill = dimContainer.querySelector('rect')!.getAttribute('fill');
    const normalFill = normalContainer.querySelector('rect')!.getAttribute('fill');
    expect(dimFill).not.toBe(normalFill);
  });
});
