import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import GhostShape from '../../creator/GhostShape.js';
import type { GhostState } from '../../hooks/useCreatorState.js';

describe('GhostShape', () => {
  it('returns null when ghost is null', () => {
    const { container } = render(<svg><GhostShape ghost={null} /></svg>);
    // Only the SVG itself, nothing inside
    expect(container.querySelector('rect')).not.toBeInTheDocument();
    expect(container.querySelector('polygon')).not.toBeInTheDocument();
    expect(container.querySelector('circle')).not.toBeInTheDocument();
  });

  it('renders a <rect> SVG element for a rect ghost', () => {
    const ghost: GhostState = {
      shapeType: 'rect',
      startSvg: { x: 100, y: 100 },
      currentSvg: { x: 200, y: 180 },
    };
    const { container } = render(<svg><GhostShape ghost={ghost} /></svg>);
    expect(container.querySelector('rect')).toBeInTheDocument();
  });

  it('rect ghost has correct x, y position (min of start/current)', () => {
    const ghost: GhostState = {
      shapeType: 'rect',
      startSvg: { x: 200, y: 180 },
      currentSvg: { x: 100, y: 100 },
    };
    const { container } = render(<svg><GhostShape ghost={ghost} /></svg>);
    const rect = container.querySelector('rect');
    expect(rect).toHaveAttribute('x', '100');
    expect(rect).toHaveAttribute('y', '100');
  });

  it('renders a <polygon> SVG element for a triangle ghost', () => {
    const ghost: GhostState = {
      shapeType: 'triangle',
      startSvg: { x: 100, y: 100 },
      currentSvg: { x: 200, y: 200 },
    };
    const { container } = render(<svg><GhostShape ghost={ghost} /></svg>);
    expect(container.querySelector('polygon')).toBeInTheDocument();
  });

  it('renders a <circle> SVG element for a circle ghost', () => {
    const ghost: GhostState = {
      shapeType: 'circle',
      startSvg: { x: 150, y: 150 },
      currentSvg: { x: 200, y: 200 },
    };
    const { container } = render(<svg><GhostShape ghost={ghost} /></svg>);
    expect(container.querySelector('circle')).toBeInTheDocument();
  });

  it('circle ghost is centered at startSvg', () => {
    const ghost: GhostState = {
      shapeType: 'circle',
      startSvg: { x: 150, y: 150 },
      currentSvg: { x: 200, y: 200 },
    };
    const { container } = render(<svg><GhostShape ghost={ghost} /></svg>);
    const circle = container.querySelector('circle');
    expect(circle).toHaveAttribute('cx', '150');
    expect(circle).toHaveAttribute('cy', '150');
  });

  it('ghost shapes have pointer-events: none style', () => {
    const ghost: GhostState = {
      shapeType: 'rect',
      startSvg: { x: 100, y: 100 },
      currentSvg: { x: 200, y: 200 },
    };
    const { container } = render(<svg><GhostShape ghost={ghost} /></svg>);
    const rect = container.querySelector('rect');
    expect(rect?.style.pointerEvents).toBe('none');
  });

  it('ghost shapes use dashed stroke', () => {
    const ghost: GhostState = {
      shapeType: 'rect',
      startSvg: { x: 100, y: 100 },
      currentSvg: { x: 200, y: 200 },
    };
    const { container } = render(<svg><GhostShape ghost={ghost} /></svg>);
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('stroke-dasharray')).toBeTruthy();
  });

  it('rect ghost has minimum size of 20x20 even when drag is tiny', () => {
    const ghost: GhostState = {
      shapeType: 'rect',
      startSvg: { x: 100, y: 100 },
      currentSvg: { x: 101, y: 101 }, // 1px drag
    };
    const { container } = render(<svg><GhostShape ghost={ghost} /></svg>);
    const rect = container.querySelector('rect');
    expect(parseFloat(rect?.getAttribute('width') ?? '0')).toBeGreaterThanOrEqual(20);
    expect(parseFloat(rect?.getAttribute('height') ?? '0')).toBeGreaterThanOrEqual(20);
  });
});
