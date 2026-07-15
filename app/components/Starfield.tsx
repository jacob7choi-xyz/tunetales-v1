'use client';

import { useMemo } from 'react';

// A night-sky starfield. Each layer is ONE div whose box-shadow paints many
// tiny stars, so the entire sky costs 3 DOM nodes and 3 GPU animations --
// far under the particle budget while looking like actual stars.

interface StarLayerConfig {
  count: number;
  spread: number; // star radius via box-shadow spread, px
  color: string;
  duration: number; // twinkle period, s
  delay: number;
}

const LAYERS: readonly StarLayerConfig[] = [
  { count: 46, spread: 0, color: 'rgba(255, 255, 255, 0.85)', duration: 7, delay: 0 },
  { count: 24, spread: 0.6, color: 'rgba(221, 214, 254, 0.9)', duration: 10, delay: 3 },
  { count: 9, spread: 1.2, color: 'rgba(196, 181, 253, 0.95)', duration: 13, delay: 6 },
];

function generateShadows(count: number, spread: number, color: string): string {
  return Array.from({ length: count }, () => {
    const x = (Math.random() * 100).toFixed(2);
    const y = (Math.random() * 100).toFixed(2);
    return `${x}vw ${y}vh 0 ${spread}px ${color}`;
  }).join(', ');
}

export default function Starfield() {
  const layers = useMemo(
    () =>
      LAYERS.map((cfg) => ({
        ...cfg,
        shadows: generateShadows(cfg.count, cfg.spread, cfg.color),
      })),
    []
  );

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {layers.map((layer, i) => (
        <div
          key={i}
          className="star-layer"
          style={{
            boxShadow: layer.shadows,
            ['--duration' as string]: `${layer.duration}s`,
            ['--delay' as string]: `${layer.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
