'use client';

import { motion, type MotionStyle } from 'framer-motion';
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

// Pre-compute animation values for better performance
const ANIMATION_CONFIG = {
  horizontalDrift: 30, // Reduced for smoother movement
  verticalDrift: -80,  // Reduced for better visibility
  rotationAmount: 120, // Reduced for more natural movement
  scaleRange: [0.9, 1.1, 1.1, 0.9], // Smoother scale animation
  glowIntensity: 8,    // Increased for better visibility
  opacityRange: [0.8, 1, 1, 0.8]    // Smoother opacity transition
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
  // Memoize animation variants with optimized values
  const variants = useMemo(() => ({
    animate: {
      x: [0, Math.random() * ANIMATION_CONFIG.horizontalDrift - ANIMATION_CONFIG.horizontalDrift/2],
      y: [0, ANIMATION_CONFIG.verticalDrift],
      scale: ANIMATION_CONFIG.scaleRange,
      rotate: [rotation, rotation + ANIMATION_CONFIG.rotationAmount],
      opacity: ANIMATION_CONFIG.opacityRange.map(v => v * opacity),
      transition: {
        duration: duration * 0.8, // Slightly faster for better performance
        delay: delay * 0.8,      // Slightly faster for better performance
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.33, 0.66, 1] // Better timing distribution
      }
    }
  }), [rotation, opacity, delay, duration]);

  // Memoize styles with enhanced visual effects
  const styles = useMemo<MotionStyle>(() => ({
    fontSize: `${size}rem`,
    color,
    filter: `drop-shadow(0 0 ${size/ANIMATION_CONFIG.glowIntensity}px ${color}) 
             drop-shadow(0 0 ${size/ANIMATION_CONFIG.glowIntensity * 2}px ${color}40)`,
    willChange: 'transform, opacity, filter',
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    opacity,
    mixBlendMode: 'screen' as const, // Type assertion for mixBlendMode
    textShadow: `0 0 ${size/2}px ${color}80` // Additional glow
  }), [size, color, x, y, rotation, opacity]);

  return (
    <motion.div
      variants={variants}
      animate="animate"
      style={styles}
      className="pointer-events-none select-none"
    >
      {symbol}
    </motion.div>
  );
});

export default FloatingNote; 