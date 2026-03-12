'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

const musicSymbols = [
  '\u266A', '\u266B', '\u266C', '\u2669', '\u266D', '\u266E', '\u266F',
  '\uD834\uDD1E', '\uD834\uDD22', '\uD834\uDD21'
];

const colors = Object.freeze([
  '#a78bfa', '#f87171', '#facc15', '#34d399', '#60a5fa', '#f472b6',
  '#a3e635', '#fb923c', '#c084fc', '#22d3ee', '#fbbf24', '#4ade80'
]);

const LAYER_CONFIGS = Object.freeze({
  background: { size: [0.8, 1.2], opacity: [0.3, 0.5], zIndex: 'z-0' },
  foreground: { size: [1.0, 1.5], opacity: [0.5, 0.7], zIndex: 'z-10' },
  overlay: { size: [0.9, 1.3], opacity: [0.4, 0.6], zIndex: 'z-20' }
} as const);

interface Note {
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

interface FloatingNotesLayerProps {
  count?: number;
  layer?: 'background' | 'foreground' | 'overlay';
}

const GLOW_STYLES = Object.freeze(
  colors.reduce((acc, color) => {
    acc[color] = `0 0 8px ${color}, 0 0 16px ${color}66`;
    return acc;
  }, {} as Record<string, string>)
);

// Module-level random pool -- shared across all instances, no refs needed
const RANDOM_POOL_SIZE = 1000;
const RANDOM_POOL = new Float32Array(RANDOM_POOL_SIZE);
for (let i = 0; i < RANDOM_POOL_SIZE; i++) {
  RANDOM_POOL[i] = Math.random();
}
let poolIndex = 0;

function getNextRandom(): number {
  const value = RANDOM_POOL[poolIndex];
  poolIndex = (poolIndex + 1) % RANDOM_POOL_SIZE;
  return value;
}

function generateNote(index: number, layer: 'background' | 'foreground' | 'overlay'): Note {
  const config = LAYER_CONFIGS[layer];
  const [minSize, maxSize] = config.size;
  const [minOpacity, maxOpacity] = config.opacity;

  return {
    id: index,
    symbol: musicSymbols[index % musicSymbols.length],
    delay: getNextRandom() * 1.5,
    duration: 4 + getNextRandom() * 4,
    x: getNextRandom() * 100,
    y: getNextRandom() * 100,
    size: minSize + getNextRandom() * (maxSize - minSize),
    color: colors[index % colors.length],
    speed: 0.8 + getNextRandom() * 0.8,
    rotation: getNextRandom() * 360,
    opacity: minOpacity + getNextRandom() * (maxOpacity - minOpacity)
  };
}

const FloatingNotesLayer = ({ count = 10, layer = 'background' }: FloatingNotesLayerProps) => {
  const notes = useMemo(
    () => Array.from({ length: count }, (_, i) => generateNote(i, layer)),
    [count, layer]
  );

  const zIndexClass = LAYER_CONFIGS[layer].zIndex;

  return (
    <div
      className={`pointer-events-none fixed inset-0 overflow-hidden ${zIndexClass}`}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        contain: 'layout style paint'
      }}
    >
      {notes.map((note) => (
        <motion.div
          key={note.id}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${note.x}%`,
            top: `${note.y}%`,
            fontSize: `${note.size}rem`,
            color: note.color,
            opacity: note.opacity,
            transform: `rotate(${note.rotation}deg)`,
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            textShadow: GLOW_STYLES[note.color],
            userSelect: 'none'
          }}
          initial={{
            y: 0,
            opacity: 0,
            scale: 0.8,
            rotate: note.rotation
          }}
          animate={{
            y: [-20, -60, -100],
            opacity: [0, note.opacity, 0],
            scale: [0.5, 1, 0.8],
            rotate: [note.rotation, note.rotation + 180, note.rotation + 360]
          }}
          transition={{
            duration: note.duration,
            delay: note.delay,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1]
          }}
        >
          {note.symbol}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingNotesLayer;
