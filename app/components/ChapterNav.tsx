'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { StoryChapter } from '../lib/types';

interface ChapterNavProps {
  chapters: StoryChapter[];
  current: number; // 0-indexed
  onPrev: () => void;
  onNext: () => void;
  // "h, s%, l%" of the chapter being read, so the forward button belongs to
  // the same era as the page around it
  accentHsl?: string;
}

const DEFAULT_ACCENT = '271, 81%, 56%';

const navButtonStyle = (disabled: boolean, accent: boolean, hsl: string) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 28px',
  borderRadius: '9999px',
  fontSize: '15px',
  fontWeight: 600,
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.35 : 1,
  color: '#fff',
  background: accent && !disabled ? `hsla(${hsl}, 0.4)` : 'rgba(255, 255, 255, 0.1)',
  border:
    accent && !disabled
      ? `1px solid hsla(${hsl}, 0.55)`
      : '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: accent && !disabled ? `0 0 20px hsla(${hsl}, 0.2)` : 'none',
});

export default function ChapterNav({
  chapters,
  current,
  onPrev,
  onNext,
  accentHsl = DEFAULT_ACCENT,
}: ChapterNavProps) {
  const prevChapter = current > 0 ? chapters[current - 1] : null;
  const nextChapter = current < chapters.length - 1 ? chapters[current + 1] : null;

  return (
    <div className="flex items-center justify-between" style={{ width: '100%', gap: '16px' }}>
      <button
        onClick={onPrev}
        disabled={!prevChapter}
        className="transition-all duration-300 hover:scale-105 backdrop-blur-md"
        style={navButtonStyle(!prevChapter, false, accentHsl)}
      >
        <ArrowLeftIcon style={{ width: '18px', height: '18px' }} />
        <span>Previous</span>
      </button>

      <div className="text-center hidden sm:block" style={{ minWidth: 0, flex: 1 }}>
        {nextChapter && (
          <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)' }}>
            Up next: {nextChapter.title}
          </span>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!nextChapter}
        className="transition-all duration-300 hover:scale-105 backdrop-blur-md"
        style={navButtonStyle(!nextChapter, true, accentHsl)}
      >
        <span>{nextChapter ? 'Next Chapter' : 'The End'}</span>
        <ArrowRightIcon style={{ width: '18px', height: '18px' }} />
      </button>
    </div>
  );
}
