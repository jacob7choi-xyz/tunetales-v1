'use client';

import { motion } from 'framer-motion';

interface ChapterProgressProps {
  total: number;
  current: number; // 0-indexed
  onSelect: (index: number) => void;
}

export default function ChapterProgress({ total, current, onSelect }: ChapterProgressProps) {
  return (
    <div className="flex flex-col items-center" style={{ gap: '14px', width: '100%' }}>
      <div
        className="rounded-full overflow-hidden"
        style={{ width: '100%', maxWidth: '420px', height: '4px', background: 'rgba(255, 255, 255, 0.15)' }}
      >
        <motion.div
          className="rounded-full"
          style={{ height: '4px', background: 'linear-gradient(to right, #c4b5fd, #93c5fd)' }}
          initial={false}
          animate={{ width: `${((current + 1) / total) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className="flex items-center" style={{ gap: '12px' }}>
        {Array.from({ length: total }, (_, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            aria-label={`Go to chapter ${index + 1}`}
            aria-current={index === current ? 'step' : undefined}
            className="rounded-full transition-all duration-300 hover:scale-125"
            style={{
              width: index === current ? '10px' : '8px',
              height: index === current ? '10px' : '8px',
              background: index === current ? '#c4b5fd' : 'rgba(255, 255, 255, 0.3)',
              boxShadow: index === current ? '0 0 10px rgba(196, 181, 253, 0.7)' : 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  );
}
