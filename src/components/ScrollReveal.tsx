import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in milliseconds
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number; // Distance in pixels
  duration?: number; // Duration in milliseconds
  threshold?: number;
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 24,
  duration = 600,
  threshold = 0.1,
  once = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = domRef.current;
    if (!node) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            // When user scrolls past or away, smoothly reset so it re-animates on scroll
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0) scale(1)';
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0) scale(0.98)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0) scale(0.98)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0) scale(0.98)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0) scale(0.98)`;
      case 'none':
      default:
        return 'translate3d(0, 0, 0) scale(0.96)';
    }
  };

  return (
    <div
      ref={domRef}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
};
