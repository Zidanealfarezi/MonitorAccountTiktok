import { useState, useEffect, useRef } from 'react';

/**
 * Smoothly animates numbers from 0 (or previous value) to target value using ease-out cubic
 */
export function useCountUp(target: number | null | undefined, duration = 850): number | null {
  const [currentVal, setCurrentVal] = useState<number | null>(0);
  const prevTargetRef = useRef<number>(0);

  useEffect(() => {
    if (target === null || target === undefined) {
      setCurrentVal(null);
      prevTargetRef.current = 0;
      return;
    }

    const startVal = prevTargetRef.current;
    const endVal = target;

    if (startVal === endVal && startVal !== 0) {
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
