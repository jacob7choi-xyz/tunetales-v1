'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

interface SceneMotionProps {
  // Server-rendered slots; no data crosses this boundary
  art: ReactNode;
  children: ReactNode;
}

// Full-viewport journey scene: the art drifts vertically across the
// scene's own scroll progress while the content rises and settles over the
// first third. Transform and opacity only; reduced motion stills both.
export default function SceneMotion({ art, children }: SceneMotionProps) {
  const reduceMotion = useReducedMotion();
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start end', 'end start'],
  });

  const artY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ['0%', '0%'] : ['-15%', '15%']
  );
  const contentY = useTransform(
    scrollYProgress,
    [0, 0.3],
    reduceMotion ? [0, 0] : [48, 0]
  );
  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 0.3],
    reduceMotion ? [1, 1] : [0, 1]
  );

  return (
    <div
      ref={sceneRef}
      className="relative overflow-hidden"
      style={{ minHeight: '100vh' }}
    >
      <div className="absolute inset-0" style={{ minHeight: '100svh' }}>
        <motion.div
          data-testid="scene-art-slot"
          className="absolute"
          style={{ inset: '-16% 0', y: artY, willChange: 'transform' }}
          aria-hidden="true"
        >
          {art}
        </motion.div>
      </div>
      <motion.div
        data-testid="scene-content-slot"
        className="relative flex min-h-screen flex-col justify-end"
        style={{ y: contentY, opacity: contentOpacity, minHeight: '100svh' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
