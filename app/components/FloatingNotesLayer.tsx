'use client';

import { useMemo, useCallback, useRef, useEffect } from 'react';
import FloatingNote from './FloatingNote';

// Pre-compute symbol and color arrays to avoid runtime calculations
const musicSymbols = Object.freeze([
  '♪', '♫', '♬', '♩', '♭', '♮', '♯', '𝄞', '𝄢', '𝄡', '🎵', '🎶', '🎼', '🎹', '🎻', '🎺', '🎸', '🎷'
]);

const colors = Object.freeze([
  '#a78bfa', '#f87171', '#facc15', '#34d399', '#60a5fa', '#f472b6',
  '#a3e635', '#fb923c', '#c084fc', '#22d3ee', '#fbbf24', '#4ade80'
]);

// Pre-compute size and opacity ranges for each layer
const LAYER_CONFIGS = Object.freeze({
  background: { size: [8, 16], opacity: [0.2, 0.4], zIndex: 'z-0' },
  foreground: { size: [12, 24], opacity: [0.5, 0.8], zIndex: 'z-10' },
  overlay: { size: [10, 20], opacity: [0.4, 0.8], zIndex: 'z-20' }
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

// Create a pool of pre-computed random values
const createRandomPool = (size: number) => {
  const pool = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    pool[i] = Math.random();
  }
  return pool;
};

const FloatingNotesLayer = ({ count = 30, layer = 'background' }: FloatingNotesLayerProps) => {
  // Use refs to maintain values between renders
  const randomPoolRef = useRef<Float32Array | null>(null);
  const poolIndexRef = useRef(0);

  // Initialize random pool if not exists
  useEffect(() => {
    if (!randomPoolRef.current) {
      randomPoolRef.current = createRandomPool(1000);
    }
  }, []);

  // Get next random value from pool
  const getNextRandom = useCallback(() => {
    if (!randomPoolRef.current) return Math.random();
    const value = randomPoolRef.current[poolIndexRef.current];
    poolIndexRef.current = (poolIndexRef.current + 1) % randomPoolRef.current.length;
    return value;
  }, []);

  // Memoize the note generation function
  const generateNote = useCallback((index: number): Note => {
    const config = LAYER_CONFIGS[layer];
    const [minSize, maxSize] = config.size;
    const [minOpacity, maxOpacity] = config.opacity;
    
    // Distribute notes more evenly across the page
    const x = (index / count) * 100 + (getNextRandom() * 10 - 5);
    const y = getNextRandom() * 100;
    
    return {
      id: index,
      symbol: musicSymbols[index % musicSymbols.length],
      delay: getNextRandom() * 0.5, // Reduced delay for faster start
      duration: 6 + getNextRandom() * 8, // Slightly faster animations
      x,
      y,
      size: minSize + getNextRandom() * (maxSize - minSize),
      color: colors[index % colors.length],
      speed: 0.8 + getNextRandom() * 0.8,
      rotation: getNextRandom() * 360,
      opacity: minOpacity + getNextRandom() * (maxOpacity - minOpacity)
    };
  }, [layer, getNextRandom, count]);

  // Use useMemo to cache the notes array
  const notes = useMemo(() => 
    Array.from({ length: count }, (_, i) => generateNote(i)),
    [count, generateNote]
  );

  // Memoize the z-index class
  const zIndexClass = useMemo(() => 
    LAYER_CONFIGS[layer].zIndex,
    [layer]
  );

  return (
    <div 
      className={`pointer-events-none fixed inset-0 overflow-hidden ${zIndexClass}`}
      style={{ 
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
    >
      {notes.map((note) => (
        <FloatingNote
          key={note.id}
          {...note}
        />
      ))}
    </div>
  );
};

export default FloatingNotesLayer;