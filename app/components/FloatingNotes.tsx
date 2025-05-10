'use client';

import { useEffect, useState } from 'react';

interface Note {
  id: number;
  symbol: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  color: string;
  path: string;
}

const musicSymbols = [
  '♪', '♫', '♬', '♩', '♭', '♮', '♯', '𝄞', '𝄢', '𝄡', '🎵', '🎶', '🎼', '🎹', '🎻', '🎺', '🎸', '🎷'
];

const rainbowColors = [
  '#FF0000', // Red
  '#FF7F00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#9400D3'  // Violet
];

const generateRandomPath = () => {
  const points = [];
  const numPoints = 4 + Math.floor(Math.random() * 3); // 4-6 points
  
  for (let i = 0; i < numPoints; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    points.push(`${x}% ${y}%`);
  }
  
  return `path('M ${points.join(' L ')}')`;
};

export default function FloatingNotes({ count = 50 }: { count?: number }) {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const newNotes = Array.from({ length: count }, (_, i) => ({
      id: i,
      symbol: musicSymbols[i % musicSymbols.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 20, // Longer duration for more fluid movement
      rotation: Math.random() * 360,
      color: rainbowColors[i % rainbowColors.length],
      path: generateRandomPath(),
    }));
    setNotes(newNotes);
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {notes.map((note) => (
        <div
          key={note.id}
          className="absolute animate-note-float"
          style={{
            left: `${note.x}%`,
            top: `${note.y}%`,
            fontSize: `${note.size}rem`,
            animationDelay: `${note.delay}s`,
            animationDuration: `${note.duration}s`,
            transform: `rotate(${note.rotation}deg)`,
            transformStyle: 'preserve-3d',
            perspective: '2000px',
            willChange: 'transform, color, left, top',
            color: note.color,
            filter: 'drop-shadow(0 0 8px currentColor)',
            transition: 'color 2s ease-in-out',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            offsetPath: note.path,
            offsetDistance: '0%',
            animation: `note-float ${note.duration}s linear infinite`,
          }}
        >
          {note.symbol}
        </div>
      ))}
    </div>
  );
} 