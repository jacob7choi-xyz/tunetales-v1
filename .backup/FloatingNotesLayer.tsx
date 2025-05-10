'use client';

import { useMemo, useCallback } from 'react';
import FloatingNote from './FloatingNote';

// Pre-compute arrays to avoid runtime calculations
const musicSymbols = Object.freeze([
  '♪', '♫', '♬', '♩', '♭', '♮', '♯', '𝄞', '𝄢', '𝄡', '🎵', '🎶', '🎼', '🎹', '🎻', '🎺', '🎸', '🎷'
]);

const colors = Object.freeze([
  '#FF0000', // Red
  '#FF7F00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#9400D3'  // Violet
]);

// Pre-compute layer configurations
const LAYER_CONFIGS = {
  background: { sizeRange: [0.8, 1.2], opacityRange: [0.1, 0.3] },
  foreground: { sizeRange: [1.2, 1.6], opacityRange: [0.4, 0.6] },
  overlay: { sizeRange: [1.6, 2.0], opacityRange: [0.7, 0.9] }
};

interface FloatingNotesLayerProps {
  count: number;
  layer: 'background' | 'foreground' | 'overground';
}

export default function FloatingNotesLayer({ count, layer }: FloatingNotesLayerProps) {
  // Memoize the note generation function
  const generateNote = useCallback((index: number) => {
    const config = LAYER_CONFIGS[layer];
    const size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
    const opacity = config.opacityRange[0] + Math.random() * (config.opacityRange[1] - config.opacityRange[0]);
    
    return {
      id: index,
      symbol: musicSymbols[index % musicSymbols.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size,
      opacity,
      color: colors[index % colors.length],
      rotation: Math.random() * 360,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10
    };
  }, [layer]);

  // Memoize the notes array
  const notes = useMemo(() => 
    Array.from({ length: count }, (_, i) => generateNote(i)),
    [count, generateNote]
  );

  // Memoize the z-index class
  const zIndexClass = useMemo(() => {
    switch (layer) {
      case 'background': return 'z-0';
      case 'foreground': return 'z-10';
      case 'overground': return 'z-20';
      default: return 'z-0';
    }
  }, [layer]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${zIndexClass}`}>
      {notes.map((note) => (
        <FloatingNote
          key={note.id}
          {...note}
        />
      ))}
    </div>
  );
} 