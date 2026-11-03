import { useState, useEffect, useRef } from 'react';

/**
 * Smoothly animates numbers from 0 (or previous value) to target value using ease-out cubic
 */
export function useCountUp(target: number | null | undefined, duration = 750): number | null {
  const [currentVal, setCurrentVal] = useState<number | null>(target ?? null);
  const prevTargetRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === null || target === undefined) {
      setCurrentVal(null);
      prevTargetRef.current = null;
      return;
    }

    const startVal = prevTargetRef.current ?? 0;
    const endVal = target;

    if (startVal === endVal) {
      setCurrentVal(endVal);
      return;
    }

    let animationFrameId: number;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.round(startVal + (endVal - startVal) * easeProgress);

      setCurrentVal(nextVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrentVal(endVal);
        prevTargetRef.current = endVal;
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration]);

  return currentVal;
}
