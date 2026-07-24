'use client';

import { type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

interface HeroMotionProps {
  // Server-rendered content passes through as children slots; no data
  // props cross this boundary, only already-rendered nodes
  portrait: ReactNode;
  title: ReactNode;
}

// Billboard parallax: the portrait recedes at half scroll speed while the
// title lifts and fades. MotionValues write straight to DOM style, so
// scrolling drives zero React re-renders. Reduced motion zeroes the ranges.
export default function HeroMotion({ portrait, title }: HeroMotionProps) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const portraitY = useTransform(scrollY, [0, 600], reduceMotion ? [0, 0] : [0, 300]);
  const titleY = useTransform(scrollY, [0, 400], reduceMotion ? [0, 0] : [0, -80]);
  const titleOpacity = useTransform(scrollY, [0, 350], reduceMotion ? [1, 1] : [1, 0]);

  return (
    <div className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
      <div className="absolute inset-0" style={{ minHeight: '100svh' }}>
        <motion.div
          data-testid="hero-portrait-slot"
          className="absolute inset-0"
          style={{ y: portraitY, willChange: 'transform' }}
        >
          {portrait}
        </motion.div>
      </div>
      <motion.div
        data-testid="hero-title-slot"
        className="relative flex min-h-screen flex-col justify-end"
        style={{ y: titleY, opacity: titleOpacity, minHeight: '100svh' }}
      >
        {title}
      </motion.div>
    </div>
  );
}
