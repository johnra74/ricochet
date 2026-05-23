import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import BallPath from '../../player/BallPath.js';
import type { Vec2 } from '../../types/index.js';

// jsdom does not implement SVGPathElement or getTotalLength.
// BallPath calls pathRef.current.getTotalLength() only inside a useEffect (for stroke-dasharray animation).
// We stub the class globally so the effect can run without throwing.
beforeAll(() => {
  // jsdom does not implement SVG geometry methods — stub getTotalLength on SVGElement.
  if (!('getTotalLength' in SVGElement.prototype)) {
    Object.defineProperty(SVGElement.prototype, 'getTotalLength', {
      value: vi.fn(() => 100),
      writable: true,
      configurable: true,
    });
  }
});

describe('BallPath', () => {
  it('returns null when path has fewer than 2 points', () => {
    const { container } = render(
      <svg>
        <BallPath path={[{ x: 0, y: 0 }]} animFrac={0} ballPos={null} outcome="win" />
      </svg>
    );
    expect(container.querySelector('g')).not.toBeInTheDocument();
  });

  it('returns null when path is empty', () => {
    const { container } = render(
      <svg>
        <BallPath path={[]} animFrac={0} ballPos={null} outcome="win" />
      </svg>
    );
    expect(container.querySelector('g')).not.toBeInTheDocument();
  });

  it('renders path elements when path has 2 or more points', () => {
    const path: Vec2[] = [{ x: 0, y: 0 }, { x: 100, y: 100 }];
    const { container } = render(
      <svg>
        <BallPath path={path} animFrac={0} ballPos={null} outcome="win" />
      </svg>
    );
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the trail path (ghost + animated)', () => {
    const path: Vec2[] = [{ x: 0, y: 0 }, { x: 100, y: 100 }, { x: 200, y: 0 }];
    const { container } = render(
      <svg>
        <BallPath path={path} animFrac={1} ballPos={null} outcome="win" />
      </svg>
    );
    // Should have at least 2 path elements (ghost + revealed)
    expect(container.querySelectorAll('path').length).toBeGreaterThanOrEqual(2);
  });

  it('renders ricochet dots at bounce points (not first or last)', () => {
    const path: Vec2[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 }, // bounce point
      { x: 100, y: 100 }, // bounce point
      { x: 200, y: 100 },
    ];
    const { container } = render(
      <svg>
        <BallPath path={path} animFrac={1} ballPos={null} outcome="win" />
      </svg>
    );
    // path.slice(1, -1) has 2 elements → 2 ricochet circles
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
  });

  it('renders no ricochet dots when there are no bounce points', () => {
    const path: Vec2[] = [{ x: 0, y: 0 }, { x: 100, y: 100 }];
    const { container } = render(
      <svg>
        <BallPath path={path} animFrac={1} ballPos={null} outcome="win" />
      </svg>
    );
    // path.slice(1, -1) is empty → no ricochet circles
    expect(container.querySelectorAll('circle')).toHaveLength(0);
  });

  it('renders ball circles when ballPos is provided', () => {
    const path: Vec2[] = [{ x: 0, y: 0 }, { x: 100, y: 100 }];
    const ballPos: Vec2 = { x: 50, y: 50 };
    const { container } = render(
      <svg>
        <BallPath path={path} animFrac={0.5} ballPos={ballPos} outcome="win" />
      </svg>
    );
    // Ball renders as 2 circles (glow + solid)
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(2);
  });

  it('does not render ball circles when ballPos is null', () => {
    const path: Vec2[] = [{ x: 0, y: 0 }, { x: 100, y: 100 }];
    const { container } = render(
      <svg>
        <BallPath path={path} animFrac={0.5} ballPos={null} outcome="win" />
      </svg>
    );
    expect(container.querySelectorAll('circle')).toHaveLength(0);
  });

  it('uses gold trail color for win outcome', () => {
    const path: Vec2[] = [{ x: 0, y: 0 }, { x: 100, y: 100 }];
    const { container } = render(
      <svg>
        <BallPath path={path} animFrac={1} ballPos={null} outcome="win" />
      </svg>
    );
    const paths = Array.from(container.querySelectorAll('path'));
    const strokeColors = paths.map((p) => p.getAttribute('stroke'));
    expect(strokeColors).toContain('#ffd580');
  });

  it('uses orange trail color for lose outcome', () => {
    const path: Vec2[] = [{ x: 0, y: 0 }, { x: 100, y: 100 }];
    const { container } = render(
      <svg>
        <BallPath path={path} animFrac={1} ballPos={null} outcome="lose" />
      </svg>
    );
    const paths = Array.from(container.querySelectorAll('path'));
    const strokeColors = paths.map((p) => p.getAttribute('stroke'));
    expect(strokeColors).toContain('#ff6b1a');
  });
});
