'use client';

import { useMemo } from 'react';

const PARTICLE_COLORS = Object.freeze([
  '#c4b5fd', // soft purple
  '#93c5fd', // soft blue
  '#ddd6fe', // lavender
  '#67e8f9', // soft cyan
  '#f9a8d4', // soft pink
  '#6ee7b7', // soft mint
]);

type ParticleType = 'orb' | 'sparkle' | 'star' | 'note';

const LAYER_CONFIGS = Object.freeze({
  background: { size: [3, 6], opacity: [0.2, 0.4], zIndex: 'z-0' },
  foreground: { size: [4, 7], opacity: [0.35, 0.55], zIndex: 'z-10' },
  overlay: { size: [3, 5], opacity: [0.3, 0.5], zIndex: 'z-20' },
} as const);

interface Particle {
  id: number;
  type: ParticleType;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  duration: number;
  delay: number;
}

interface FloatingNotesLayerProps {
  count?: number;
  layer?: 'background' | 'foreground' | 'overlay';
}

// Module-level random pool -- shared across all instances
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

function pickParticleType(index: number): ParticleType {
  const bucket = index % 10;
  if (bucket < 3) return 'orb';
  if (bucket < 6) return 'sparkle';
  if (bucket < 8) return 'star';
  return 'note';
}

function generateParticle(
  index: number,
  layer: 'background' | 'foreground' | 'overlay'
): Particle {
  const config = LAYER_CONFIGS[layer];
  const [minSize, maxSize] = config.size;
  const [minOpacity, maxOpacity] = config.opacity;

  return {
    id: index,
    type: pickParticleType(index),
    x: getNextRandom() * 100,
    y: getNextRandom() * 100,
    size: minSize + getNextRandom() * (maxSize - minSize),
    color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
    opacity: minOpacity + getNextRandom() * (maxOpacity - minOpacity),
    duration: 6 + getNextRandom() * 8,
    delay: getNextRandom() * 6,
  };
}

function particleClassName(type: ParticleType): string {
  switch (type) {
    case 'star':
      return 'fairy-particle fairy-particle--star';
    case 'sparkle':
      return 'fairy-particle fairy-particle--twinkle';
    default:
      return 'fairy-particle';
  }
}

const FloatingNotesLayer = ({
  count = 10,
  layer = 'background',
}: FloatingNotesLayerProps) => {
  const particles = useMemo(
    () => Array.from({ length: count }, (_, i) => generateParticle(i, layer)),
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
        contain: 'layout style paint',
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className={`${particleClassName(p.type)} pointer-events-none select-none`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 1.5}px ${p.color}88, 0 0 ${p.size * 3}px ${p.color}44`,
            ['--duration' as string]: `${p.duration}s`,
            ['--delay' as string]: `${p.delay}s`,
            ['--peak-opacity' as string]: p.opacity,
            ['--scale-start' as string]: 0.5,
            ['--scale-end' as string]: p.type === 'sparkle' ? 0.3 : 0.8,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingNotesLayer;
