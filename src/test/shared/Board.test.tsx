import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import Board from '../../shared/Board.js';
import type { Board as BoardType } from '../../types/index.js';

describe('Board', () => {
  const board: BoardType = { width: 800, height: 600 };

  function renderBoard(overrides: Partial<Parameters<typeof Board>[0]> = {}) {
    const svgRef = createRef<SVGSVGElement>();
    return render(
      <Board board={board} svgRef={svgRef} {...overrides} />
    );
  }

  it('renders an SVG element', () => {
    const { container } = renderBoard();
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('sets the correct viewBox on the SVG', () => {
    const { container } = renderBoard();
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 800 600');
  });

  it('renders exactly 4 wall lines', () => {
    const { container } = renderBoard();
    const lines = container.querySelectorAll('line');
    expect(lines).toHaveLength(4);
  });

  it('all walls are orange when allowedWalls includes all walls', () => {
    const { container } = renderBoard({ allowedWalls: ['top', 'bottom', 'left', 'right'] });
    const lines = container.querySelectorAll('line');
    lines.forEach((line) => {
      expect(line).toHaveAttribute('stroke', '#ff6b1a');
    });
  });

  it('restricted walls have dim stroke when allowedWalls is partial', () => {
    const { container } = renderBoard({ allowedWalls: ['left'] });
    const lines = container.querySelectorAll('line');
    const strokes = Array.from(lines).map((l) => l.getAttribute('stroke'));
    // One orange (left), three dim (#252b38)
    expect(strokes.filter((s) => s === '#ff6b1a')).toHaveLength(1);
    expect(strokes.filter((s) => s === '#252b38')).toHaveLength(3);
  });

  it('renders children inside the SVG', () => {
    const svgRef = createRef<SVGSVGElement>();
    const { container } = render(
      <Board board={board} svgRef={svgRef}>
        <circle data-testid="test-child" cx={100} cy={100} r={10} />
      </Board>
    );
    expect(container.querySelector('[data-testid="test-child"]')).toBeInTheDocument();
  });

  it('renders with correct width and height attributes', () => {
    const { container } = renderBoard();
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '800');
    expect(svg).toHaveAttribute('height', '600');
  });
});
