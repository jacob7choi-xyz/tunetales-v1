'use client';

import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

interface FloatingNoteProps {
  id: number;
  symbol: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  rotation: number;
  delay: number;
  duration: number;
}

// Pre-compute animation values
const ANIMATION_CONFIG = {
  horizontalDrift: 50, // Reduced from 100
  rotationAmount: 180, // Reduced from 360
  scaleRange: [0.8, 1, 1, 0.8], // Simplified scale animation
  glowIntensity: 6 // Reduced from 4
};

const FloatingNote = memo(function FloatingNote({
  symbol,
  x,
  y,
  size,
  opacity,
  color,
  rotation,
  delay,
  duration
}: FloatingNoteProps) {
  // Memoize animation variants
  const variants = useMemo(() => ({
    animate: {
      x: [0, Math.random() * ANIMATION_CONFIG.horizontalDrift - ANIMATION_CONFIG.horizontalDrift/2],
      y: [0, -100],
      scale: ANIMATION_CONFIG.scaleRange,
      rotate: [rotation, rotation + ANIMATION_CONFIG.rotationAmount],
      opacity: [opacity, opacity * 0.8, opacity, opacity * 0.8],
      transition: {
        duration,
        delay,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }), [rotation, opacity, delay, duration]);

  // Memoize styles
  const styles = useMemo(() => ({
    fontSize: `${size}rem`,
    color,
    filter: `drop-shadow(0 0 ${size/ANIMATION_CONFIG.glowIntensity}px ${color})`,
    willChange: 'transform, opacity',
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    opacity
  }), [size, color, x, y, rotation, opacity]);

  return (
    <motion.div
      variants={variants}
      animate="animate"
      style={styles}
    >
      {symbol}
    </motion.div>
  );
});

export default FloatingNote; 