import { useEffect, useRef, useCallback } from 'react'
import { ANIMATION_DURATION } from '../constants.js'
import { distance, lerp } from '../physics/vector.js'
import type { Vec2 } from '../types/index.js'

interface PathData {
  segLengths: number[];
  total: number;
}

interface ProgressInfo {
  frac: number;
  ballPos: Vec2;
}

function buildPathData(path: Vec2[]): PathData {
  // Precompute cumulative lengths along the path
  const segLengths: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const d = distance(path[i - 1], path[i]);
    segLengths.push(d);
    total += d;
  }
  return { segLengths, total };
}

function interpolatePath(path: Vec2[], segLengths: number[], totalLen: number, frac: number): Vec2 {
  const target = frac * totalLen;
  let cumulative = 0;
  for (let i = 0; i < segLengths.length; i++) {
    const segLen = segLengths[i];
    if (cumulative + segLen >= target || i === segLengths.length - 1) {
      const segFrac = segLen > 0 ? (target - cumulative) / segLen : 0;
      return lerp(path[i], path[i + 1], Math.min(1, Math.max(0, segFrac)));
    }
    cumulative += segLen;
  }
  return path[path.length - 1];
}

export function useAnimationLoop(
  path: Vec2[] | undefined,
  running: boolean,
  onProgress: (info: ProgressInfo) => void,
  onComplete: () => void
): void {
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pathDataRef = useRef<PathData | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    if (!running || !path || path.length < 2) {
      stop();
      return;
    }

    pathDataRef.current = buildPathData(path);

    const tick = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const frac = Math.min(elapsed / ANIMATION_DURATION, 1);

      const pathData = pathDataRef.current;
      if (!pathData) return;
      const { segLengths, total } = pathData;
      const ballPos = interpolatePath(path, segLengths, total, frac);

      onProgress({ frac, ballPos });

      if (frac < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        onComplete();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return stop;
  }, [running, path, onProgress, onComplete, stop]);
}
