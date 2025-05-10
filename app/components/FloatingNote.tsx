'use client';

import { motion } from 'framer-motion';

interface FloatingNoteProps {
  id: number;
  symbol: string;
  delay: number;
  duration: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  rotation: number;
  opacity: number;
}

export default function FloatingNote({
  symbol,
  delay,
  duration,
  x,
  y,
  size,
  color,
  speed,
  rotation,
  opacity
}: FloatingNoteProps) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        fontSize: `${size}rem`,
        color,
        opacity,
        rotate: rotation,
        willChange: 'transform',
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        rotate: [rotation, rotation + 15, rotation],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {symbol}
    </motion.div>
  );
} 