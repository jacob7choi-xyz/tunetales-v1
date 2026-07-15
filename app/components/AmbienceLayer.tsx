'use client';

import { motion } from 'framer-motion';

interface AmbienceLayerProps {
  accentHsl: string; // "h, s%, l%" values, e.g. "260, 70%, 55%"
}

// Fixed radial tint that colors the whole page to the current chapter's mood.
// Framer Motion cross-fades the gradient on chapter change (one-time
// transition); the continuous breathing pulse is pure CSS in globals.css.
export default function AmbienceLayer({ accentHsl }: AmbienceLayerProps) {
  return (
    <motion.div
      aria-hidden="true"
      data-testid="ambience-layer"
      className="fixed inset-0 pointer-events-none chapter-ambience"
      initial={false}
      animate={{
        background: `radial-gradient(ellipse at 30% 40%, hsla(${accentHsl}, 0.22) 0%, hsla(${accentHsl}, 0.08) 45%, transparent 70%)`,
      }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      style={{ ['--chapter-hsl' as string]: accentHsl, zIndex: 1 }}
    />
  );
}
