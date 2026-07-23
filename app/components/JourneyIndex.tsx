'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { ArtistStory, StoryChapter } from '../lib/types';
import { ACT_COVERS } from '../lib/covers';
import AmbienceLayer from './AmbienceLayer';
import JourneyClient from '../artists/frank-ocean/journey/JourneyClient';

interface JourneyIndexProps {
  story: ArtistStory;
}

// The album whose artwork sets each chapter's scene, via its paired song
const CHAPTER_ALBUMS: Record<string, string> = {
  origins: 'Channel Orange',
  katrina: 'Blonde',
  transformation: 'Nostalgia, Ultra',
  breakthrough: 'Channel Orange',
  boys_dont_cry: 'Blonde',
  legacy: 'Channel Orange',
};

const RESTING_HSL = '250, 60%, 45%';

function Frame({
  chapter,
  onHover,
  onOpen,
}: {
  chapter: StoryChapter;
  onHover: (hsl: string | null) => void;
  onOpen: () => void;
}) {
  const hsl = chapter.ambience.accentHsl;
  const cover = ACT_COVERS[CHAPTER_ALBUMS[chapter.id] ?? ''] ?? null;

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => onHover(hsl)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(hsl)}
      onBlur={() => onHover(null)}
      className="group relative block w-full overflow-hidden text-left transition-transform duration-500 hover:scale-[1.01]"
      style={{
        height: '148px',
        borderRadius: '16px',
        border: `1px solid hsla(${hsl}, 0.3)`,
        background: 'rgb(8, 4, 20)',
        cursor: 'pointer',
        padding: 0,
      }}
      aria-label={`Enter chapter ${chapter.order}: ${chapter.title}`}
    >
      {/* The scene: album art as texture, sharpening on approach */}
      {cover && (
        <span aria-hidden="true" className="absolute inset-0">
          <Image
            src={cover}
            alt=""
            fill
            sizes="760px"
            className="object-cover transition-all duration-700 opacity-35 blur-[2px] scale-105 group-hover:opacity-60 group-hover:blur-0 group-hover:scale-100"
          />
        </span>
      )}
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(100deg, rgba(6, 3, 16, 0.96) 0%, rgba(6, 3, 16, 0.82) 42%, hsla(${hsl}, 0.28) 100%)`,
        }}
      />
      {/* Chapter light rising on approach */}
      <span
        aria-hidden="true"
        className="absolute inset-0 transition-opacity duration-700 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at 12% 110%, hsla(${hsl}, 0.5) 0%, transparent 55%)`,
        }}
      />

      <span
        className="relative flex h-full items-center"
        style={{ gap: '26px', padding: '0 34px' }}
      >
        <span
          aria-hidden="true"
          className="transition-colors duration-500"
          style={{
            fontSize: '58px',
            fontWeight: 700,
            lineHeight: 1,
            fontFamily: 'var(--font-display)',
            color: `hsla(${hsl}, 0.55)`,
          }}
        >
          {chapter.order}
        </span>
        <span style={{ minWidth: 0 }}>
          <span
            className="block"
            style={{
              fontSize: 'clamp(19px, 2.4vw, 26px)',
              fontWeight: 700,
              lineHeight: 1.2,
              fontFamily: 'var(--font-display)',
              color: '#fff',
              textShadow: '0 2px 14px rgba(0, 0, 0, 0.7)',
            }}
          >
            {chapter.title}
          </span>
          {chapter.ambience.imageryHint && (
            <span
              className="block transition-all duration-500 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
              style={{
                marginTop: '7px',
                fontSize: '14px',
                fontStyle: 'italic',
                color: `hsla(${hsl}, 0.95)`,
                filter: 'brightness(1.5)',
                textShadow: '0 1px 10px rgba(0, 0, 0, 0.8)',
              }}
            >
              {chapter.ambience.imageryHint}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

export default function JourneyIndex({ story }: JourneyIndexProps) {
  const [hoverHsl, setHoverHsl] = useState<string | null>(null);
  const [openChapter, setOpenChapter] = useState<number | null>(null);
  const openAccent =
    openChapter !== null ? story.chapters[openChapter]?.ambience.accentHsl : null;

  // Freeze the page while inside the journey overlay
  useEffect(() => {
    if (openChapter !== null) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [openChapter]);

  return (
    <div className="relative z-10" style={{ maxWidth: '760px', margin: '0 auto' }}>
      <AmbienceLayer accentHsl={hoverHsl ?? RESTING_HSL} />

      <h2
        className="text-center"
        style={{
          fontSize: 'clamp(28px, 3.6vw, 38px)',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          color: '#fff',
          marginBottom: '34px',
        }}
      >
        Six chapters, one life
      </h2>

      <div className="relative flex flex-col" style={{ gap: '12px' }}>
        {story.chapters.map((chapter, i) => (
          <Frame
            key={chapter.id}
            chapter={chapter}
            onHover={setHoverHsl}
            onOpen={() => setOpenChapter(i)}
          />
        ))}
      </div>

      <AnimatePresence>
        {openChapter !== null && openAccent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="fixed inset-0 overflow-y-auto overscroll-contain"
            style={{ background: 'rgb(7, 4, 16)', zIndex: 200 }}
          >
            <JourneyClient
              story={story}
              initialChapter={openChapter}
              embedded
              onExit={() => setOpenChapter(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
