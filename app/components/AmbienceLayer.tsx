'use client';

import { motion } from 'framer-motion';

interface AmbienceLayerProps {
  accentHsl: string; // "h, s%, l%" values, e.g. "260, 70%, 55%"
  // Scales the tint. Surfaces built on graded photography want a fraction
  // of the full wash, or the room's color repaints the frame.
  strength?: number;
  // 'soft-light' shifts the light in the room without laying hue over what
  // is underneath; the default paints color, which suits flat backgrounds.
  blend?: 'normal' | 'soft-light';
}

const CORE_ALPHA = 0.22;
const MID_ALPHA = 0.08;

// Fixed radial tint that colors the whole page to the current chapter's mood.
// Framer Motion cross-fades the gradient on chapter change (one-time
// transition); the continuous breathing pulse is pure CSS in globals.css.
export default function AmbienceLayer({
  accentHsl,
  strength = 1,
  blend = 'normal',
}: AmbienceLayerProps) {
  const core = (CORE_ALPHA * strength).toFixed(3);
  const mid = (MID_ALPHA * strength).toFixed(3);
  return (
    <motion.div
      aria-hidden="true"
      data-testid="ambience-layer"
      className="fixed inset-0 pointer-events-none chapter-ambience"
      initial={false}
      animate={{
        background: `radial-gradient(ellipse at 30% 40%, hsla(${accentHsl}, ${core}) 0%, hsla(${accentHsl}, ${mid}) 45%, transparent 70%)`,
      }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      style={{
        ['--chapter-hsl' as string]: accentHsl,
        zIndex: 1,
        mixBlendMode: blend,
      }}
    />
  );
}
